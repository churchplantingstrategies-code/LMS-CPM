import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPageBuilderEditorPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/admin/settings/page-builder/${pageId}`);
  }

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/admin/settings");
  }

  redirect(`/builder/${pageId}`);
}
