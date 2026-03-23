import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StudentSidebar } from "@/components/layout/student-sidebar";
import { StudentMobileNav } from "@/components/layout/student-mobile-nav";
import { HeaderUserActions } from "@/components/layout/header-user-actions";
import { StudentCartLink } from "@/components/books/student-cart-link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN") {
    redirect("/admin");
  }

  if (session.user.role === "INSTRUCTOR") {
    redirect("/teacher");
  }

  return (
    <div className="student-theme-scope flex h-screen overflow-hidden bg-gradient-to-br from-brand-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/60">
      <StudentSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-brand-100/80 bg-white/85 px-4 backdrop-blur sm:px-6 dark:border-slate-700/70 dark:bg-slate-900/85">
          <div className="flex items-center gap-3">
            <StudentMobileNav />
            <div className="relative hidden w-80 sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400 dark:text-slate-400" />
              <Input
                placeholder="Search courses, lessons..."
                className="border border-brand-100 bg-white pl-9 shadow-sm focus-visible:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="relative w-full max-w-[220px] sm:hidden">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400 dark:text-slate-400" />
            <Input
              placeholder="Search..."
              className="border border-brand-100 bg-white pl-9 shadow-sm focus-visible:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-3">
            <StudentCartLink />
            <HeaderUserActions
              name={session.user.name}
              email={session.user.email}
              image={session.user.image}
              showAvatar
              showBell
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="relative flex-1 overflow-auto">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.12),transparent_42%),radial-gradient(circle_at_75%_12%,rgba(168,85,247,0.12),transparent_36%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_42%),radial-gradient(circle_at_75%_12%,rgba(56,189,248,0.16),transparent_34%)]" />
          <div className="relative">{children}</div>
        </main>
      </div>
    </div>
  );
}
