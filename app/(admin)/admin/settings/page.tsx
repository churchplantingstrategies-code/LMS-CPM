import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "../../../../lib/auth";
import { redirect } from "next/navigation";
import { AdminSettingsForm } from "../../../../components/admin/admin-settings-form";

export default async function AdminSettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure payment setup, video-course defaults, and core platform controls.
        </p>
        {role === "SUPER_ADMIN" ? (
          <div className="mt-4">
            <Button variant="brand" asChild>
              <Link href="/admin/settings/page-builder" target="_blank">Open Page Builder in new tab</Link>
            </Button>
          </div>
        ) : null}
      </div>

      <AdminSettingsForm />
    </div>
  );
}
