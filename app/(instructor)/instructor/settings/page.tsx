"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function InstructorSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Instructor Settings</h1>
        <p className="mt-1 text-gray-600">Configure instructor and teacher management settings</p>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Current Role</p>
            <p className="text-lg font-medium text-gray-900">{session?.user?.role || "Unknown"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Permission Level</p>
            <p className="text-lg font-medium text-gray-900">
              {isAdmin ? "Administrator" : "Limited Access"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <p>
          <strong>Instructions:</strong> Use the <strong>Teachers & Students</strong> section to manage teacher
          accounts or adjust preferences here.
        </p>
      </div>
    </div>
  );
}
