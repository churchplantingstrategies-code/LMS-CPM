"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  ReceiptText,
  Workflow,
  Settings,
  LibraryBig,
  ScrollText,
  Loader2,
  PanelsTopLeft,
} from "lucide-react";
import { cn } from "../../lib/utils";

export function AdminMobileNav({ role }: { role?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
    setOpen(false);
  }, [pathname]);

  const canManageBooks = role === "ADMIN" || role === "SUPER_ADMIN";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ...(canManageBooks ? [{ label: "Books", href: "/admin/books", icon: LibraryBig }] : []),
    { label: "Courses", href: "/admin/courses", icon: BookOpen },
    { label: "Billing Setup", href: "/admin/billing", icon: ReceiptText },
    ...(isSuperAdmin ? [{ label: "Page Builder", href: "/admin/settings/page-builder", icon: PanelsTopLeft }] : []),
    ...(canManageBooks ? [{ label: "Book Orders", href: "/admin/books/orders", icon: ScrollText }] : []),
    { label: "Settings", href: "/admin/settings", icon: Settings },
    { label: "CRM", href: "/admin/crm", icon: Workflow },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden"
        aria-label="Open admin navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close admin navigation overlay"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 overflow-auto bg-gray-950 text-white shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-gray-800 px-4">
              <p className="text-sm font-semibold">Admin Menu</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-gray-300 hover:bg-gray-800"
                aria-label="Close admin navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-3">
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
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                          isActive
                            ? "bg-brand-600 text-white"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white",
                          isPending && "opacity-80"
                        )}
                      >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                        {item.label}
                        {isPending ? <Loader2 className="ml-auto h-4 w-4 animate-spin text-brand-300" /> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}
