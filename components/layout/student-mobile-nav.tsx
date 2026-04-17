"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, LayoutDashboard, BookOpen, Award, MessageSquare, CreditCard, Settings, ShoppingCart, Receipt, Loader2 } from "lucide-react";
import { SiteLogo } from "@/components/branding/site-logo";
import { cn } from "../../lib/utils";

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

export function StudentMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md p-2 text-brand-700 hover:bg-brand-50 md:hidden dark:text-slate-200 dark:hover:bg-slate-800"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close navigation overlay"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-brand-100/80 bg-gradient-to-b from-white via-brand-50/40 to-purple-50/50 shadow-xl dark:border-slate-700/80 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/70">
            <div className="flex h-14 items-center justify-between border-b border-brand-100/80 px-4 dark:border-slate-700/80">
              <div className="flex items-center gap-3">
                <SiteLogo className="size-8 ring-brand-200 dark:ring-slate-700" sizes="32px" priority />
                <div>
                  <p className="text-sm font-semibold text-brand-800 dark:text-slate-100">Church Planting Movement</p>
                  <p className="text-xs text-brand-600 dark:text-slate-400">Student Menu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Close navigation"
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
                            ? "bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-white hover:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-brand-300",
                          isPending && "opacity-80"
                        )}
                      >
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
                        ) : (
                          <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-gray-400 dark:text-slate-500")} />
                        )}
                        {item.label}
                        {isPending ? <Loader2 className="ml-auto h-4 w-4 animate-spin text-brand-400" /> : null}
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
