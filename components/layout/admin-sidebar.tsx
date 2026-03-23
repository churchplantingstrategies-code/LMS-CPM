"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  GraduationCap,
  LogOut,
  ReceiptText,
  Workflow,
  LibraryBig,
  ScrollText,
  Loader2,
  PanelsTopLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const navGroups = [
  {
    label: "Core",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Learning",
    items: [
      { label: "Courses", href: "/admin/courses", icon: BookOpen },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Billing Setup", href: "/admin/billing", icon: ReceiptText },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
  {
    label: "Growth",
    items: [
      { label: "CRM", href: "/admin/crm", icon: Workflow },
    ],
  },
];

export function AdminSidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const canManageBooks = role === "ADMIN" || role === "SUPER_ADMIN";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const groups = navGroups.map((group) => {
    if (group.label === "Learning" && canManageBooks) {
      return {
        ...group,
        items: [{ label: "Books", href: "/admin/books", icon: LibraryBig }, ...group.items],
      };
    }

    if (group.label === "Commerce" && canManageBooks) {
      return {
        ...group,
        items: [...group.items, { label: "Book Orders", href: "/admin/books/orders", icon: ScrollText }],
      };
    }

    if (group.label === "Platform" && isSuperAdmin) {
      return {
        ...group,
        items: [...group.items, { label: "Page Builder", href: "/admin/settings/page-builder", icon: PanelsTopLeft }],
      };
    }

    return group;
  });

  return (
    <aside className="hidden h-full w-64 flex-col bg-gray-950 text-white md:flex">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-lg text-white">eDiscipleship</span>
          <span className="ml-2 text-xs bg-brand-600 text-white px-1.5 py-0.5 rounded font-medium">Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
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
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                        isActive
                          ? "bg-brand-600 text-white"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white",
                        isPending && "opacity-80"
                      )}
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                      ) : (
                        <Icon className="h-4 w-4 flex-shrink-0" />
                      )}
                      {item.label}
                      {isPending ? <Loader2 className="ml-auto h-4 w-4 animate-spin text-brand-300" /> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Info */}
      {session?.user && (
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback className="bg-brand-700 text-white text-xs">
                {getInitials(session.user.name || session.user.email || "A")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden text-sm">
              <p className="font-medium text-white truncate">{session.user.name}</p>
              <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-1.5 rounded hover:bg-gray-800 text-gray-400"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
