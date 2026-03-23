import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPageBuilderEditorPage({
  params,
}: {
  params: { pageId: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/admin/settings/page-builder/${params.pageId}`);
  }

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/admin/settings");
  }

  redirect(`/builder/${params.pageId}`);
}
