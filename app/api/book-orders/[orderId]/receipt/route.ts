import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { auth } from "@/lib/auth";
import { findBookOrderById } from "@/lib/book-orders";
import { readBookStore } from "@/lib/book-store";
import { formatCurrency, formatDate } from "@/lib/utils";

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

function wrapText(text: string, maxChars = 82) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized;
  const parsed = Number.parseInt(value, 16);

  return rgb(
    ((parsed >> 16) & 255) / 255,
    ((parsed >> 8) & 255) / 255,
    (parsed & 255) / 255
  );
}

function drawBrandMark(page: Parameters<PDFDocument["addPage"]>[0] extends never ? never : any, x: number, y: number, size: number, brandColor: ReturnType<typeof rgb>) {
  page.drawCircle({ x, y, size: size / 2, color: rgb(1, 1, 1), opacity: 0.18 });
  page.drawCircle({ x, y, size: size / 2 - 4, borderColor: rgb(1, 1, 1), borderWidth: 1.5, color: rgb(1, 1, 1), opacity: 0.08 });
  page.drawText("ED", {
    x: x - size / 3.1,
    y: y - size / 7,
    size: size / 2.4,
    color: rgb(1, 1, 1),
  });
  page.drawRectangle({ x: x - size / 4, y: y + size / 5, width: size / 2, height: 2.5, color: brandColor, opacity: 0.95 });
}

export async function GET(_: NextRequest, { params }: RouteContext) {
  const { orderId } = await params;
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const order = await findBookOrderById(orderId);
  if (!order) {
    return new NextResponse("Order not found", { status: 404 });
  }

  const isPrivileged = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
  if (!isPrivileged && order.userId !== session.user.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const store = await readBookStore();
  const statusLabel = order.status === "COMPLETED" ? "Receipt" : "Invoice";
  const pdf = await PDFDocument.create();
  const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageSize: [number, number] = [612, 792];
  const margin = 48;
  const lineHeight = 16;
  const brandColor = hexToRgb("#2563eb");
  const brandMuted = hexToRgb("#dbeafe");
  const slate = hexToRgb("#0f172a");
  const slateMuted = hexToRgb("#64748b");
  const border = hexToRgb("#e2e8f0");
  let page = pdf.addPage(pageSize);
  let y = page.getHeight() - margin;

  const ensureSpace = (requiredHeight = lineHeight) => {
    if (y - requiredHeight > margin) return;
    page = pdf.addPage(pageSize);
    y = page.getHeight() - margin;
  };

  const drawText = (text: string, options?: { x?: number; size?: number; bold?: boolean; color?: { r: number; g: number; b: number } }) => {
    ensureSpace((options?.size ?? 12) + 6);
    page.drawText(text, {
      x: options?.x ?? margin,
      y,
      size: options?.size ?? 12,
      font: options?.bold ? boldFont : regularFont,
      color: options?.color ? rgb(options.color.r, options.color.g, options.color.b) : rgb(0.06, 0.09, 0.16),
    });
    y -= (options?.size ?? 12) + 6;
  };

  const drawWrappedBlock = (text: string, opts?: { x?: number; size?: number; color?: { r: number; g: number; b: number } }) => {
    for (const line of wrapText(text, 76)) {
      drawText(line, { x: opts?.x, size: opts?.size, color: opts?.color });
    }
  };

  const drawCard = ({ top, title, lines, x, width }: { top: number; title: string; lines: string[]; x: number; width: number }) => {
    const height = 26 + lines.length * 16 + 22;
    page.drawRectangle({ x, y: top - height, width, height, color: rgb(1, 1, 1), borderColor: border, borderWidth: 1 });
    page.drawText(title.toUpperCase(), { x: x + 14, y: top - 20, size: 9, font: boldFont, color: slateMuted });
    let cardY = top - 40;
    for (const line of lines) {
      page.drawText(line, { x: x + 14, y: cardY, size: 11, font: regularFont, color: slate });
      cardY -= 15;
    }
    return height;
  };

  const drawTableRow = ({ top, columns, bold = false, shaded = false }: { top: number; columns: string[]; bold?: boolean; shaded?: boolean }) => {
    const rowHeight = 24;
    if (shaded) {
      page.drawRectangle({ x: margin, y: top - rowHeight + 4, width: page.getWidth() - margin * 2, height: rowHeight, color: rgb(0.98, 0.99, 1) });
    }

    const widths = [250, 60, 110, 110];
    let cursor = margin + 8;
    columns.forEach((column, index) => {
      page.drawText(column, {
        x: cursor,
        y: top - 12,
        size: 10,
        font: bold ? boldFont : regularFont,
        color: bold ? slateMuted : slate,
      });
      cursor += widths[index];
    });
    page.drawLine({ start: { x: margin, y: top - rowHeight + 3 }, end: { x: page.getWidth() - margin, y: top - rowHeight + 3 }, thickness: 1, color: border });
    return rowHeight;
  };

  page.drawRectangle({ x: 0, y: page.getHeight() - 110, width: page.getWidth(), height: 110, color: brandColor });
  page.drawRectangle({ x: 0, y: page.getHeight() - 120, width: page.getWidth(), height: 10, color: brandMuted });
  y = page.getHeight() - 56;
  drawBrandMark(page, margin + 22, y + 8, 42, brandMuted);
  page.drawText(store.settings.storeName, { x: margin + 54, y, size: 24, font: boldFont, color: rgb(1, 1, 1) });
  page.drawText(statusLabel.toUpperCase(), { x: page.getWidth() - 150, y: y + 2, size: 12, font: boldFont, color: rgb(1, 1, 1) });
  y -= 22;
  page.drawText("Digital bookstore receipt and fulfillment summary", { x: margin + 54, y, size: 11, font: regularFont, color: rgb(0.9, 0.95, 1) });
  page.drawText(`${order.orderNumber} · ${order.status}`, { x: margin, y: y - 18, size: 11, font: regularFont, color: rgb(0.9, 0.95, 1) });
  page.drawText(`Issued ${formatDate(order.completedAt ?? order.createdAt)}`, { x: page.getWidth() - 190, y, size: 10, font: regularFont, color: rgb(0.9, 0.95, 1) });
  y = page.getHeight() - 168;

  const cardTop = y;
  const leftCardHeight = drawCard({
    top: cardTop,
    title: "Customer",
    lines: [order.name, order.email],
    x: margin,
    width: 248,
  });
  const rightCardHeight = drawCard({
    top: cardTop,
    title: "Store Support",
    lines: [store.settings.supportEmail, store.settings.shippingMessage],
    x: margin + 268,
    width: 248,
  });
  y = cardTop - Math.max(leftCardHeight, rightCardHeight) - 24;

  drawText("Items", { size: 16, bold: true });
  const headerTop = y;
  drawTableRow({ top: headerTop, columns: ["BOOK", "QTY", "UNIT PRICE", "LINE TOTAL"], bold: true, shaded: true });
  y = headerTop - 28;

  order.items.forEach((item, index) => {
    ensureSpace(34);
    const rowTop = y;
    drawTableRow({
      top: rowTop,
      columns: [
        item.title.length > 42 ? `${item.title.slice(0, 39)}...` : item.title,
        String(item.quantity),
        formatCurrency(item.unitPrice, order.currency),
        formatCurrency(item.lineTotal, order.currency),
      ],
      shaded: index % 2 === 0,
    });
    y = rowTop - 28;
  });

  ensureSpace(110);
  page.drawRectangle({ x: margin, y: y - 84, width: page.getWidth() - margin * 2, height: 84, color: rgb(0.98, 0.99, 1), borderColor: border, borderWidth: 1 });
  page.drawText("ORDER TOTAL", { x: margin + 18, y: y - 22, size: 10, font: boldFont, color: slateMuted });
  page.drawText(formatCurrency(order.subtotal, order.currency), { x: margin + 18, y: y - 48, size: 22, font: boldFont, color: brandColor });
  page.drawText(order.status === "COMPLETED" ? "Payment confirmed" : "Awaiting payment confirmation", { x: margin + 250, y: y - 28, size: 11, font: regularFont, color: slate });
  page.drawText(`Status: ${order.status}`, { x: margin + 250, y: y - 46, size: 10, font: boldFont, color: order.status === "COMPLETED" ? rgb(0.02, 0.6, 0.36) : slateMuted });
  y -= 110;

  drawText("Policy & Support", { size: 14, bold: true });
  drawWrappedBlock(store.settings.returnPolicy, { size: 10, color: { r: 0.39, g: 0.45, b: 0.55 } });
  y -= 6;
  drawWrappedBlock("Generated automatically by Church Planting Movement bookstore receipts.", { size: 10, color: { r: 0.39, g: 0.45, b: 0.55 } });

  const footerY = 28;
  page.drawLine({ start: { x: margin, y: footerY + 14 }, end: { x: page.getWidth() - margin, y: footerY + 14 }, thickness: 1, color: border });
  page.drawText(store.settings.storeName, { x: margin, y: footerY, size: 9, font: boldFont, color: slateMuted });
  page.drawText(store.settings.supportEmail, { x: page.getWidth() - 190, y: footerY, size: 9, font: regularFont, color: slateMuted });

  const bytes = await pdf.save();

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${order.orderNumber.toLowerCase()}-${statusLabel.toLowerCase()}.pdf"`,
    },
  });
}