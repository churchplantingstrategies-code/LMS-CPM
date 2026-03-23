import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left - Brand Panel */}
      <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-brand-900 via-brand-800 to-purple-900 p-12 text-white">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          eDiscipleship
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
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link href="/" className="flex md:hidden items-center gap-2 font-bold text-xl mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="gradient-text">eDiscipleship</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
