"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, BarChart3, ClipboardCheck, MessageSquare, Settings } from "lucide-react";
import { SiteLogo } from "@/components/branding/site-logo";
import { cn } from "@/lib/utils";
import { useState } from "react";

const mainItems = [
  { label: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { label: "Courses", href: "/teacher/courses", icon: BookOpen },
  { label: "Performance", href: "/teacher/performance", icon: BarChart3 },
  { label: "Grading", href: "/teacher/grading", icon: ClipboardCheck },
  { label: "Discussions", href: "/teacher/discussions", icon: MessageSquare },
];

export function TeacherSidebar() {
  const pathname = usePathname();
  const [platformOpen, setPlatformOpen] = useState(true);

  return (
    <aside className="hidden h-full w-64 flex-col border-r border-emerald-200 bg-gradient-to-b from-emerald-50 to-emerald-100 md:flex dark:border-emerald-800/70 dark:from-slate-950 dark:to-emerald-950/50">
      <div className="border-b border-emerald-200 bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 dark:border-emerald-800/70 dark:from-slate-900 dark:to-emerald-950">
        <div className="flex items-center gap-3">
          <SiteLogo className="size-10 ring-white/25" sizes="40px" priority />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white">Teacher Panel</p>
            <h2 className="mt-1 max-w-[170px] text-sm font-bold leading-tight text-white">Church Planting Movement</h2>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {/* Main Items */}
        {mainItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/teacher"
            ? pathname === "/teacher"
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                active 
                  ? "bg-emerald-500 text-white shadow-md" 
                  : "text-emerald-700 hover:bg-emerald-200 hover:text-emerald-900 dark:text-emerald-200 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        {/* Platform Section */}
        <div className="mt-4 space-y-1">
          <button
            onClick={() => setPlatformOpen(!platformOpen)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-100"
          >
            <span>Platform</span>
            <span className={cn("transition-transform", platformOpen ? "rotate-180" : "")}> ▾</span>
          </button>

          {platformOpen && (
            <div className="space-y-1 pl-2">
              {/* Teacher Submenu */}
              <div className="space-y-1">
                <p className="px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">Teacher</p>
                <Link
                  href="/teacher/settings"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    pathname === "/teacher/settings" || pathname.startsWith("/teacher/settings/")
                      ? "bg-emerald-500 text-white shadow-md"
                      : "text-emerald-700 hover:bg-emerald-200 hover:text-emerald-900 dark:text-emerald-200 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-100"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  Teacher Settings
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
