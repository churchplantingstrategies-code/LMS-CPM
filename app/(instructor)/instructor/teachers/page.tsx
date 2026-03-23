"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRoleManagementPanel } from "@/components/admin/user-role-management-panel";

export default function TeachersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      // ADMIN users don't get super admin powers
      setIsSuperAdmin(false);
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teachers & Students Management</h1>
        <p className="mt-1 text-gray-600">Create, edit, deactivate, and delete teacher accounts</p>
      </div>

      <UserRoleManagementPanel isSuperAdmin={isSuperAdmin} />
    </div>
  );
}
