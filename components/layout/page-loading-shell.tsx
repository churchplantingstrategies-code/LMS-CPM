import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingTone = "admin" | "student" | "marketing";

const toneClass: Record<LoadingTone, string> = {
  admin: "bg-slate-950 text-slate-100",
  student: "bg-gray-50 text-gray-900",
  marketing: "bg-white text-gray-900",
};

const cardClass: Record<LoadingTone, string> = {
  admin: "border border-slate-800 bg-slate-900/70",
  student: "border border-gray-200 bg-white",
  marketing: "border border-gray-200 bg-white",
};

const lineClass: Record<LoadingTone, string> = {
  admin: "bg-slate-800",
  student: "bg-gray-200",
  marketing: "bg-gray-200",
};

const spinnerClass: Record<LoadingTone, string> = {
  admin: "text-brand-300",
  student: "text-brand-600",
  marketing: "text-brand-600",
};

export function PageLoadingShell({
  tone,
  title,
  subtitle,
}: {
  tone: LoadingTone;
  title: string;
  subtitle: string;
}) {
  return (
    <div className={cn("min-h-[60vh] animate-in fade-in-50 p-6", toneClass[tone])}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <Loader2 className={cn("h-5 w-5 animate-spin", spinnerClass[tone])} />
          <div>
            <p className="text-base font-semibold">{title}</p>
            <p className={cn("text-sm", tone === "admin" ? "text-slate-400" : "text-gray-500")}>{subtitle}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className={cn("h-24 rounded-2xl", cardClass[tone])} />
          <div className={cn("h-24 rounded-2xl", cardClass[tone])} />
          <div className={cn("h-24 rounded-2xl", cardClass[tone])} />
        </div>

        <div className={cn("mt-4 rounded-2xl p-5", cardClass[tone])}>
          <div className={cn("h-4 w-1/3 animate-pulse rounded", lineClass[tone])} />
          <div className={cn("mt-4 h-3 w-full animate-pulse rounded", lineClass[tone])} />
          <div className={cn("mt-2 h-3 w-5/6 animate-pulse rounded", lineClass[tone])} />
          <div className={cn("mt-2 h-3 w-2/3 animate-pulse rounded", lineClass[tone])} />
        </div>
      </div>
    </div>
  );
}