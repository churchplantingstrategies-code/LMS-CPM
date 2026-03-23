"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, LayoutDashboard, BookOpen, Award, MessageSquare, CreditCard, Settings, ShoppingCart, Receipt, Loader2 } from "lucide-react";
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
        className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden"
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
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <p className="text-sm font-semibold text-gray-900">Student Menu</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
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
                            ? "bg-brand-50 text-brand-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                          isPending && "opacity-80"
                        )}
                      >
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
                        ) : (
                          <Icon className={cn("h-4 w-4", isActive ? "text-brand-600" : "text-gray-400")} />
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
