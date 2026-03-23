"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { InstructorSidebar } from "@/components/layout/instructor-sidebar";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (session?.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <InstructorSidebar />
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  );
}
