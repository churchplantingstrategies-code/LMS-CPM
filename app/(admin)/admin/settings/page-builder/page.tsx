import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageBuilderPagesList } from "@/components/admin/page-builder-pages-list";

export default async function AdminPageBuilderPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/settings/page-builder");
  }

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/admin/settings");
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Page Builder</h1>
        <p className="mt-1 text-sm text-slate-400">
          Choose an existing page and open it in a dedicated real-time editor tab.
        </p>
      </div>

      <PageBuilderPagesList />
    </div>
  );
}
