"use client";

import { useEffect, useState } from "react";

type UserListItem = {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
  createdAt: string;
  _count: { enrollments: number };
};

type UsersResponse = {
  teachers: UserListItem[];
  students: UserListItem[];
};

type BackfillResult = {
  dryRun: boolean;
  totalCourses: number;
  alreadyOwned: number;
  missingOwner: number;
  candidates: number;
  updated: number;
  preview: Array<{
    id: string;
    title: string;
    ownerId: string;
    ownerRole: string;
    source: string;
  }>;
};

export function UserRoleManagementPanel({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<UserListItem[]>([]);
  const [students, setStudents] = useState<UserListItem[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [backfilling, setBackfilling] = useState(false);
  const [backfillResult, setBackfillResult] = useState<BackfillResult | null>(null);
  const [backfillConfirmText, setBackfillConfirmText] = useState("");

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load users");
      const data = (await res.json()) as UsersResponse;
      setTeachers(data.teachers);
      setStudents(data.students);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function createTeacher() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to create teacher");
        return;
      }

      setMessage("Teacher account created successfully");
      setName("");
      setEmail("");
      setPassword("");
      await loadUsers();
    } catch {
      setError("Failed to create teacher");
    } finally {
      setSaving(false);
    }
  }

  function beginEditTeacher(teacher: UserListItem) {
    setEditingTeacherId(teacher.id);
    setEditName(teacher.name || "");
    setEditEmail(teacher.email);
    setEditPassword("");
    setError(null);
    setMessage(null);
  }

  function cancelEditTeacher() {
    setEditingTeacherId(null);
    setEditName("");
    setEditEmail("");
    setEditPassword("");
  }

  async function saveTeacherEdit() {
    if (!editingTeacherId) return;
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload: { name: string; email: string; password?: string } = {
        name: editName,
        email: editEmail,
      };
      if (editPassword.length >= 8) {
        payload.password = editPassword;
      }

      const res = await fetch(`/api/admin/users/${editingTeacherId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to update teacher");
        return;
      }

      setMessage("Teacher account updated");
      cancelEditTeacher();
      await loadUsers();
    } catch {
      setError("Failed to update teacher");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTeacherActive(teacher: UserListItem) {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${teacher.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !teacher.isActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to update teacher status");
        return;
      }
      setMessage(`Teacher ${teacher.isActive ? "deactivated" : "activated"}`);
      await loadUsers();
    } catch {
      setError("Failed to update teacher status");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTeacher(teacher: UserListItem) {
    const confirmed = window.confirm(`Delete teacher account for ${teacher.email}? This cannot be undone.`);
    if (!confirmed) return;

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${teacher.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to delete teacher");
        return;
      }
      setMessage("Teacher account deleted");
      if (editingTeacherId === teacher.id) {
        cancelEditTeacher();
      }
      await loadUsers();
    } catch {
      setError("Failed to delete teacher");
    } finally {
      setSaving(false);
    }
  }

  async function runCourseOwnershipBackfill(dryRun: boolean) {
    setBackfilling(true);
    setError(null);
    setMessage(null);
    setBackfillResult(null);

    try {
      const res = await fetch("/api/admin/courses/backfill-ownership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dryRun,
          confirmText: dryRun ? undefined : backfillConfirmText,
        }),
      });

      const data = (await res.json()) as BackfillResult & { error?: string };
      if (!res.ok) {
        setError(data.error || "Failed to run backfill");
        return;
      }

      setBackfillResult(data);
      setMessage(
        dryRun
          ? "Backfill dry-run completed"
          : `Backfill completed. Updated ${data.updated} course(s).`
      );
      if (!dryRun) {
        setBackfillConfirmText("");
      }
    } catch {
      setError("Failed to run backfill");
    } finally {
      setBackfilling(false);
    }
  }

  return (
    <div className="space-y-5 rounded-xl border bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Teacher Level Users</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage teacher-level accounts and review current teacher/student lists.
        </p>
      </div>

      {isSuperAdmin ? (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-indigo-900">Create Teacher Credentials</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Full Name</label>
              <input className="w-full rounded-md border px-3 py-2 text-sm text-gray-900" value={name} onChange={(e) => setName(e.target.value)} placeholder="Teacher Name" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Email</label>
              <input type="email" className="w-full rounded-md border px-3 py-2 text-sm text-gray-900" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@example.com" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Password</label>
              <input type="password" className="w-full rounded-md border px-3 py-2 text-sm text-gray-900" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
            </div>
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={createTeacher}
              disabled={saving || !name || !email || password.length < 8}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create Teacher"}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Only super admins can create teacher credentials.
        </div>
      )}

      {isSuperAdmin ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-blue-900">Legacy Course Ownership Backfill (One-time)</h3>
          <p className="mb-3 text-xs text-blue-800">
            Assign owner metadata to legacy courses that were created before teacher ownership was introduced.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => runCourseOwnershipBackfill(true)}
              disabled={backfilling}
              className="rounded-md border border-blue-300 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-60"
            >
              {backfilling ? "Running..." : "Dry Run"}
            </button>
            <input
              type="text"
              value={backfillConfirmText}
              onChange={(e) => setBackfillConfirmText(e.target.value)}
              placeholder="Type CONFIRM"
              className="min-w-[160px] rounded-md border border-blue-300 px-2 py-1.5 text-xs text-gray-900"
            />
            <button
              type="button"
              onClick={() => runCourseOwnershipBackfill(false)}
              disabled={backfilling || backfillConfirmText.toUpperCase() !== "CONFIRM"}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {backfilling ? "Running..." : "Run Backfill"}
            </button>
          </div>
          <p className="mt-2 text-xs text-blue-800">
            Safety lock: type <span className="font-semibold">CONFIRM</span> exactly to enable apply mode.
          </p>

          {backfillResult ? (
            <div className="mt-3 rounded-md border border-blue-200 bg-white p-3 text-xs text-gray-700">
              <p>
                <span className="font-semibold">Mode:</span> {backfillResult.dryRun ? "Dry Run" : "Apply"}
              </p>
              <p>
                <span className="font-semibold">Total:</span> {backfillResult.totalCourses} | <span className="font-semibold">Already Owned:</span> {backfillResult.alreadyOwned} | <span className="font-semibold">Candidates:</span> {backfillResult.candidates} | <span className="font-semibold">Updated:</span> {backfillResult.updated}
              </p>
              {backfillResult.preview.length > 0 ? (
                <div className="mt-2 max-h-36 overflow-auto rounded border">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 text-left uppercase text-gray-500">
                      <tr>
                        <th className="px-2 py-1">Course</th>
                        <th className="px-2 py-1">Owner Role</th>
                        <th className="px-2 py-1">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backfillResult.preview.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="px-2 py-1">{item.title}</td>
                          <td className="px-2 py-1">{item.ownerRole}</td>
                          <td className="px-2 py-1">{item.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-green-600">{message}</p> : null}

      {loading ? (
        <p className="text-sm text-gray-500">Loading users...</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-lg border">
            <div className="border-b bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-900">
              Teachers ({teachers.length})
            </div>
            <div className="max-h-80 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.length === 0 ? (
                    <tr>
                      <td className="px-3 py-4 text-gray-500" colSpan={4}>No teachers found.</td>
                    </tr>
                  ) : (
                    teachers.map((u) => (
                      <tr key={u.id} className="border-t">
                        <td className="px-3 py-2 text-gray-900 align-top">
                          {editingTeacherId === u.id ? (
                            <input
                              className="w-full rounded-md border px-2 py-1 text-xs text-gray-900"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                          ) : (
                            u.name || "Unnamed"
                          )}
                        </td>
                        <td className="px-3 py-2 text-gray-600 align-top">
                          {editingTeacherId === u.id ? (
                            <div className="space-y-1">
                              <input
                                type="email"
                                className="w-full rounded-md border px-2 py-1 text-xs text-gray-900"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                              />
                              <input
                                type="password"
                                placeholder="New password (optional)"
                                className="w-full rounded-md border px-2 py-1 text-xs text-gray-900"
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                              />
                            </div>
                          ) : (
                            u.email
                          )}
                        </td>
                        <td className="px-3 py-2 align-top">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-700"}`}>
                            {u.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-3 py-2 align-top">
                          {!isSuperAdmin ? (
                            <span className="text-xs text-gray-400">Super admin only</span>
                          ) : editingTeacherId === u.id ? (
                            <div className="flex flex-wrap gap-1">
                              <button
                                type="button"
                                onClick={saveTeacherEdit}
                                disabled={saving || !editName || !editEmail || (editPassword.length > 0 && editPassword.length < 8)}
                                className="rounded border border-indigo-200 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditTeacher}
                                disabled={saving}
                                className="rounded border px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              <button
                                type="button"
                                onClick={() => beginEditTeacher(u)}
                                disabled={saving}
                                className="rounded border px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleTeacherActive(u)}
                                disabled={saving}
                                className="rounded border border-amber-200 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                              >
                                {u.isActive ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteTeacher(u)}
                                disabled={saving}
                                className="rounded border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <div className="border-b bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-900">
              Students ({students.length})
            </div>
            <div className="max-h-80 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Enrollments</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td className="px-3 py-4 text-gray-500" colSpan={3}>No students found.</td>
                    </tr>
                  ) : (
                    students.map((u) => (
                      <tr key={u.id} className="border-t">
                        <td className="px-3 py-2 text-gray-900">{u.name || "Unnamed"}</td>
                        <td className="px-3 py-2 text-gray-600">{u.email}</td>
                        <td className="px-3 py-2 text-gray-700">{u._count.enrollments}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
