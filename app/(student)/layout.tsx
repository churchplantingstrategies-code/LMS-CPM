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

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <StudentSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <StudentMobileNav />
            <div className="relative hidden w-80 sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search courses, lessons..." className="border-0 bg-gray-50 pl-9" />
            </div>
          </div>

          <div className="relative w-full max-w-[220px] sm:hidden">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search..." className="border-0 bg-gray-50 pl-9" />
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
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
