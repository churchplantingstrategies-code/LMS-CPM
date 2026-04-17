import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createBookOrder, updateBookOrderCheckoutSession } from "@/lib/book-orders";
import { readPublishedBooks } from "@/lib/book-store";
import { createCheckoutSession, createOneTimeCheckout, createPaymongoCustomer } from "@/lib/paymongo";
import { db } from "@/lib/db";
import { z } from "zod";

const checkoutSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("subscription"),
    planId: z.string().min(1),
  }),
  z.object({
    mode: z.literal("payment"),
    courseId: z.string().min(1),
  }),
  z.object({
    mode: z.literal("books"),
    items: z.array(
      z.object({
        bookId: z.string().min(1),
        quantity: z.number().int().min(1),
      })
    ).min(1),
  }),
]);

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = checkoutSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const origin = request.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  
  try {
    const customerId = await createPaymongoCustomer(session.user.email!, session.user.name ?? undefined);

    let checkoutUrl: string;

    if (result.data.mode === "subscription") {
      const plan = await db.plan.findUnique({ where: { id: result.data.planId } });
      if (!plan?.paymongoProductId) {
        return NextResponse.json({ error: "Plan not found or not configured" }, { status: 404 });
      }

      const { checkoutUrl: url } = await createCheckoutSession({
        customerId,
        productId: plan.paymongoProductId,
        amount: Math.round(plan.price * 100),
        currency: "PHP",
        successUrl: `${origin}/dashboard/billing?subscription=success`,
        cancelUrl: `${origin}/pricing`,
        metadata: {
          userId: session.user.id,
          planId: plan.id,
        },
      });
      checkoutUrl = url;
    } else if (result.data.mode === "payment") {
      const course = await db.course.findUnique({ where: { id: result.data.courseId } });
      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      const { checkoutUrl: url, sessionId } = await createOneTimeCheckout({
        customerId,
        amount: Math.round((course.price ?? 0) * 100),
        currency: "PHP",
        description: course.title,
        successUrl: `${origin}/courses/${course.id}?purchase=success`,
        cancelUrl: `${origin}/courses/${course.id}`,
        metadata: {
          userId: session.user.id,
          courseId: course.id,
        },
      });

      await db.payment.create({
        data: {
          userId: session.user.id,
          amount: course.price ?? 0,
          currency: "PHP",
          status: "PENDING",
          type: "ONE_TIME",
          paymongoCheckoutSessionId: sessionId,
          description: `Course purchase: ${course.title}`,
          metadata: {
            courseId: course.id,
          },
        },
      });

      checkoutUrl = url;
    } else {
      const catalog = await readPublishedBooks();
      const selections = result.data.items
        .map((selection) => {
          const book = catalog.books.find((entry) => entry.id === selection.bookId);
          return book ? { selection, book } : null;
        })
        .filter((entry): entry is { selection: { bookId: string; quantity: number }; book: (typeof catalog.books)[number] } => entry !== null);

      if (selections.length === 0) {
        return NextResponse.json({ error: "No valid books selected" }, { status: 400 });
      }

      const order = await createBookOrder({
        userId: session.user.id,
        email: session.user.email!,
        name: session.user.name,
        currency: catalog.settings.currency,
        items: selections.map(({ selection, book }) => ({
          bookId: book.id,
          title: book.title,
          quantity: selection.quantity,
          unitPrice: book.price,
          lineTotal: book.price * selection.quantity,
          coverImageUrl: book.coverImageUrl,
        })),
      });

      const { checkoutUrl: url, sessionId } = await createOneTimeCheckout({
        customerId,
        currency: catalog.settings.currency,
        description: `Book order ${order.orderNumber}`,
        lineItems: selections.map(({ selection, book }) => ({
          amount: Math.round(book.price * 100),
          currency: catalog.settings.currency,
          name: book.title,
          quantity: selection.quantity,
        })),
        successUrl: `${origin}/cart?purchase=success&order=${order.id}`,
        cancelUrl: `${origin}/cart`,
        metadata: {
          userId: session.user.id,
          bookOrderId: order.id,
          orderNumber: order.orderNumber,
          checkoutType: "BOOKS",
        },
      });

      await updateBookOrderCheckoutSession(order.id, sessionId);
      await db.payment.create({
        data: {
          userId: session.user.id,
          amount: order.subtotal,
          currency: order.currency,
          status: "PENDING",
          type: "ONE_TIME",
          paymongoCheckoutSessionId: sessionId,
          description: `Book order ${order.orderNumber}`,
          metadata: {
            bookOrderId: order.id,
            items: order.items,
          },
        },
      });

      checkoutUrl = url;
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
