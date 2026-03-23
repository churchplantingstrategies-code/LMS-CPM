import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TeacherSidebar } from "@/components/layout/teacher-sidebar";
import { TeacherMobileNav } from "@/components/layout/teacher-mobile-nav";
import { HeaderUserActions } from "@/components/layout/header-user-actions";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/teacher");
  }

  const role = session.user.role;
  if (role !== "INSTRUCTOR" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="teacher-theme-scope flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
      <TeacherSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-emerald-200 bg-gradient-to-r from-emerald-500 to-teal-500 px-4 shadow-sm sm:px-6 dark:border-emerald-700/70 dark:from-slate-900 dark:to-emerald-950">
          <div className="flex items-center gap-3">
            <TeacherMobileNav />
            <h1 className="text-sm font-semibold text-white dark:text-emerald-100">Teacher Workspace</h1>
          </div>
          <HeaderUserActions
            name={session.user.name}
            email={session.user.email}
            image={session.user.image}
            showAvatar
            showBell={false}
          />
        </header>
        <main className="flex-1 overflow-auto bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">{children}</main>
      </div>
    </div>
  );
}
