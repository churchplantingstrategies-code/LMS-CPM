import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export default async function AdminStudentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") redirect("/dashboard");

  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { enrollments: true } },
      subscriptions: {
        include: { plans: { select: { name: true } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <p className="text-sm text-gray-500 mt-1">{students.length} total students</p>
      </div>

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Enrollments</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  No students yet.
                </TableCell>
              </TableRow>
            )}
            {students.map((student) => {
              const activePlan = student.subscriptions?.status === "ACTIVE"
                ? student.subscriptions?.plans?.name
                : undefined;
              return (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.image ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(student.name ?? student.email ?? "?")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-900">
                        {student.name ?? "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{student.email}</TableCell>
                  <TableCell className="text-center">
                    {student._count.enrollments}
                  </TableCell>
                  <TableCell>
                    {activePlan ? (
                      <Badge variant="brand">{activePlan}</Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">Free</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {formatDate(student.createdAt)}
                  </TableCell>
                  <TableCell>
                    {student.emailVerified ? (
                      <Badge variant="success">Verified</Badge>
                    ) : (
                      <Badge variant="warning">Unverified</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
