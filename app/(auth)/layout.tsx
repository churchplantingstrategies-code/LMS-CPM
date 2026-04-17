import Link from "next/link";
import { SiteLogo } from "@/components/branding/site-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid bg-white dark:bg-slate-950 md:grid-cols-2">
      {/* Left - Brand Panel */}
      <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-brand-900 via-brand-800 to-purple-900 p-12 text-white">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <SiteLogo className="size-9 ring-white/20" sizes="36px" priority />
          Church Planting Movement
        </Link>

        <div>
          <blockquote className="text-2xl font-medium leading-relaxed mb-6">
            "The journey of a thousand miles begins with a single step. Begin yours today."
          </blockquote>
          <p className="text-brand-300 text-sm">
            Join over 10,000 learners growing in faith, leadership, and purpose.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { value: "150+", label: "Courses" },
            { value: "10K+", label: "Students" },
            { value: "98%", label: "Satisfaction" },
            { value: "500+", label: "Daily Lessons" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-brand-300 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Auth Form */}
      <div className="flex items-center justify-center bg-white p-8 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
          {/* Mobile Logo */}
          <Link href="/" className="mb-8 flex items-center gap-2 text-xl font-bold md:hidden">
            <SiteLogo className="size-9 ring-brand-200" sizes="36px" priority />
              <span className="gradient-text max-w-[170px] text-sm leading-tight sm:max-w-none sm:text-base">Church Planting Movement</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
