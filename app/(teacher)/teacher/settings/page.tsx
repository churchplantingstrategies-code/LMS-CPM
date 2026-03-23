"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type UserListItem = {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
  createdAt: string;
  _count: { enrollments: number };
};

export default function TeacherSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [currentName, setCurrentName] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "INSTRUCTOR") {
      router.push("/dashboard");
    } else if (status === "authenticated") {
      setLoading(false);
      if (session?.user) {
        setCurrentName(session.user.name || "");
        setCurrentEmail(session.user.email || "");
      }
    }
  }, [status, session, router]);

  async function handleUpdateProfile() {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload: { name?: string; email?: string; password?: string } = {};

      if (currentName !== session?.user?.name) {
        payload.name = currentName;
      }
      if (currentEmail !== session?.user?.email) {
        payload.email = currentEmail;
      }
      if (newPassword && newPassword === confirmPassword && newPassword.length >= 8) {
        payload.password = newPassword;
      } else if (newPassword) {
        setError("Passwords must match and be at least 8 characters");
        setSaving(false);
        return;
      }

      if (Object.keys(payload).length === 0) {
        setMessage("No changes to save");
        setSaving(false);
        return;
      }

      const res = await fetch(`/api/admin/users/${session?.user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to update profile");
        setSaving(false);
        return;
      }

      setMessage("Profile updated successfully");
      setNewPassword("");
      setConfirmPassword("");
      setSaving(false);
    } catch {
      setError("Failed to update profile");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Settings</h1>
        <p className="mt-1 text-sm text-gray-600">Manage your teacher account and profile</p>
      </div>

      {/* Profile Section */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Account Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={currentName}
              onChange={(e) => setCurrentName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Change Password</h2>
        <p className="mb-4 text-sm text-gray-600">Leave empty if you don't want to change your password</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">{message}</div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleUpdateProfile}
          disabled={saving}
          className="rounded-lg bg-emerald-600 px-6 py-2 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
