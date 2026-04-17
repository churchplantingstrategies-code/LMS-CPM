"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Settings } from "lucide-react";
import { SiteLogo } from "@/components/branding/site-logo";
import { cn } from "@/lib/utils";
import { useState } from "react";

const mainItems = [
  { label: "Dashboard", href: "/instructor", icon: LayoutDashboard },
  { label: "Teachers & Students", href: "/instructor/teachers", icon: Users },
];

export function InstructorSidebar() {
  const pathname = usePathname();
  const [platformOpen, setPlatformOpen] = useState(true);

  return (
    <aside className="hidden h-full w-64 flex-col border-r border-slate-800 bg-slate-900 md:flex">
      <div className="border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <SiteLogo className="size-10 ring-white/15" sizes="40px" priority />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Admin Panel</p>
            <h2 className="mt-1 max-w-[170px] text-sm font-bold leading-tight text-slate-100">Church Planting Movement</h2>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {/* Main Items */}
        {mainItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                active ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
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
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200"
          >
            <span>Platform</span>
            <span className={cn("transition-transform", platformOpen ? "rotate-180" : "")}> ▾</span>
          </button>

          {platformOpen && (
            <div className="space-y-1 pl-2">
              <div className="space-y-1">
                <p className="px-3 py-1 text-xs font-medium text-slate-400">Admin</p>
                <Link
                  href="/instructor/settings"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                    pathname === "/instructor/settings" || pathname.startsWith("/instructor/settings/")
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
