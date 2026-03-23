"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard, BookOpen, Award, MessageSquare,
  Settings, CreditCard, Bell, ChevronRight, GraduationCap, ShoppingCart, Receipt, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/courses", icon: BookOpen },
  { label: "Certificates", href: "/certificates", icon: Award },
  { label: "Discussions", href: "/discussions", icon: MessageSquare },
  { label: "Checkout Cart", href: "/cart", icon: ShoppingCart },
  { label: "Order History", href: "/orders", icon: Receipt },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  return (
    <aside className="hidden h-full w-64 flex-col border-r bg-white md:flex">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 px-6 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-lg gradient-text">eDiscipleship</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const isPending = pendingHref === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => {
                    if (!isActive) {
                      setPendingHref(item.href);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    isPending && "opacity-80"
                  )}
                >
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
                  ) : (
                    <Icon className={cn("h-5 w-5", isActive ? "text-brand-600" : "text-gray-400")} />
                  )}
                  {item.label}
                  {isPending ? <Loader2 className="ml-auto h-4 w-4 animate-spin text-brand-400" /> : null}
                  {isActive && !isPending ? <ChevronRight className="ml-auto h-4 w-4 text-brand-400" /> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      {session?.user && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback className="bg-brand-100 text-brand-700 text-xs">
                {getInitials(session.user.name || session.user.email || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
