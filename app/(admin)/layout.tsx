import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";
import { HeaderUserActions } from "@/components/layout/header-user-actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) redirect("/login?callbackUrl=/admin");

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <AdminSidebar role={role} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Admin Header */}
        <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <AdminMobileNav role={role} />
            <h1 className="text-sm font-semibold text-slate-200">Admin Backend</h1>
          </div>
          <HeaderUserActions
            name={session.user.name}
            email={session.user.email}
            image={session.user.image}
            showAvatar
            showBell={false}
          />
        </header>

        <main className="flex-1 overflow-auto bg-slate-950 text-slate-100">{children}</main>
      </div>
    </div>
  );
}
