import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageBuilderEditor } from "@/components/admin/page-builder-editor";

export default async function StandalonePageBuilderEditorPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/builder/${pageId}`);
  }

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/admin/settings");
  }

  return (
    <main className="min-h-screen bg-slate-950 p-3 sm:p-5 lg:p-6">
      <PageBuilderEditor pageId={pageId} />
    </main>
  );
}
