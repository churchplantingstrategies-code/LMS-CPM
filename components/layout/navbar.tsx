"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  BookOpen, Menu, X, ChevronDown, User, LogOut, Settings,
  LayoutDashboard, Bell, GraduationCap, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const navLinks = [
  { label: "Courses", href: "/courses" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="section-container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="gradient-text">eDiscipleship</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setPendingHref(link.href)}
                className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  {link.label}
                  {pendingHref === link.href ? <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-500" /> : null}
                </span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-full pr-2 hover:bg-gray-50 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || ""} />
                    <AvatarFallback className="bg-brand-100 text-brand-700 text-xs">
                      {getInitials(session.user.name || session.user.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{session.user.name?.split(" ")[0]}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-10 w-52 rounded-xl border bg-white shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                    </div>
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                      {pendingHref === "/dashboard" ? <Loader2 className="h-4 w-4 animate-spin text-brand-500" /> : <LayoutDashboard className="h-4 w-4" />} Dashboard
                    </Link>
                    <Link href="/courses" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setPendingHref("/courses")}>
                      {pendingHref === "/courses" ? <Loader2 className="h-4 w-4 animate-spin text-brand-500" /> : <BookOpen className="h-4 w-4" />} My Courses
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setPendingHref("/settings")}>
                      {pendingHref === "/settings" ? <Loader2 className="h-4 w-4 animate-spin text-brand-500" /> : <Settings className="h-4 w-4" />} Settings
                    </Link>
                    {(session.user as { role?: string }).role === "ADMIN" || (session.user as { role?: string }).role === "SUPER_ADMIN" ? (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-brand-600" onClick={() => setPendingHref("/admin")}>
                        {pendingHref === "/admin" ? <Loader2 className="h-4 w-4 animate-spin text-brand-500" /> : <LayoutDashboard className="h-4 w-4" />} Admin Panel
                      </Link>
                    ) : null}
                    <hr className="my-1" />
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login" onClick={() => setPendingHref("/login")}>Sign In {pendingHref === "/login" ? <Loader2 className="ml-2 h-3.5 w-3.5 animate-spin" /> : null}</Link>
                </Button>
                <Button variant="brand" size="sm" asChild>
                  <Link href="/register" onClick={() => setPendingHref("/register")}>Get Started Free {pendingHref === "/register" ? <Loader2 className="ml-2 h-3.5 w-3.5 animate-spin" /> : null}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t mt-2 pt-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-sm font-medium text-gray-600"
                onClick={() => setPendingHref(link.href)}
              >
                <span className="inline-flex items-center gap-2">
                  {link.label}
                  {pendingHref === link.href ? <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-500" /> : null}
                </span>
              </Link>
            ))}
            {session ? (
              <>
                <hr />
                <Link href="/dashboard" className="block py-2 text-sm font-medium" onClick={() => setPendingHref("/dashboard")}>
                  <span className="inline-flex items-center gap-2">
                    Dashboard
                    {pendingHref === "/dashboard" ? <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-500" /> : null}
                  </span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block py-2 text-sm font-medium text-red-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <hr />
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/login" onClick={() => setPendingHref("/login")}>Sign In {pendingHref === "/login" ? <Loader2 className="ml-2 h-3.5 w-3.5 animate-spin" /> : null}</Link>
                </Button>
                <Button variant="brand" className="w-full" asChild>
                  <Link href="/register" onClick={() => setPendingHref("/register")}>Get Started Free {pendingHref === "/register" ? <Loader2 className="ml-2 h-3.5 w-3.5 animate-spin" /> : null}</Link>
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
