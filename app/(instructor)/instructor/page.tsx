"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

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

export default function InstructorDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<UserListItem[]>([]);
  const [students, setStudents] = useState<UserListItem[]>([]);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch("/api/admin/users", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load users");
        const data = (await res.json()) as UsersResponse;
        setTeachers(data.teachers);
        setStudents(data.students);
      } catch {
        console.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Administrator Dashboard</h1>
        <p className="mt-1 text-gray-600">Manage teacher and student accounts</p>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Teachers Card */}
          <div className="rounded-xl border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Teachers</h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                {teachers.length}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {teachers.length === 0
                ? "No teachers created yet"
                : `${teachers.length} teacher${teachers.length !== 1 ? "s" : ""} in the system`}
            </p>
          </div>

          {/* Students Card */}
          <div className="rounded-xl border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Students</h2>
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                {students.length}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {students.length === 0
                ? "No students enrolled yet"
                : `${students.length} student${students.length !== 1 ? "s" : ""} in the system`}
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <p>
          <strong>Tip:</strong> Go to <strong>Teachers & Students</strong> to manage accounts and deactivate users.
        </p>
      </div>
    </div>
  );
}
