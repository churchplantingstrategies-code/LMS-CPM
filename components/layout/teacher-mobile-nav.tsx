"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, LayoutDashboard, BookOpen, BarChart3, ClipboardCheck, MessageSquare } from "lucide-react";
import { SiteLogo } from "@/components/branding/site-logo";
import { cn } from "@/lib/utils";

const items = [
  { label: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { label: "Courses", href: "/teacher/courses", icon: BookOpen },
  { label: "Performance", href: "/teacher/performance", icon: BarChart3 },
  { label: "Grading", href: "/teacher/grading", icon: ClipboardCheck },
  { label: "Discussions", href: "/teacher/discussions", icon: MessageSquare },
];

export function TeacherMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md p-2 text-emerald-600 hover:bg-emerald-100 md:hidden dark:text-emerald-300 dark:hover:bg-emerald-900/50"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
            aria-label="Close teacher navigation"
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-gradient-to-b from-emerald-50 to-emerald-100 p-3 dark:from-slate-950 dark:to-emerald-950/60">
            <div className="mb-4 flex items-center justify-between border-b border-emerald-200 pb-3 dark:border-emerald-800/70">
              <div className="flex items-center gap-3">
                <SiteLogo className="size-8 ring-emerald-200 dark:ring-emerald-800/70" sizes="32px" priority />
                <div>
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Church Planting Movement</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">Teacher Menu</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1 text-emerald-600 hover:bg-emerald-200 dark:text-emerald-300 dark:hover:bg-emerald-900/50">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const active = item.href === "/teacher"
                  ? pathname === "/teacher"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      active ? "bg-emerald-500 text-white shadow-md" : "text-emerald-700 hover:bg-emerald-200 hover:text-emerald-900 dark:text-emerald-200 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-100"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
