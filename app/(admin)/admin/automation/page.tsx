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
import { Button } from "@/components/ui/button";
import { PlusCircle, Zap } from "lucide-react";
import Link from "next/link";

export default async function AdminAutomationPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") redirect("/dashboard");

  const rules = await db.automation_rules.findMany({
    orderBy: { createdAt: "desc" },
  });

  const triggerLabels: Record<string, string> = {
    USER_REGISTERED: "User Registered",
    COURSE_ENROLLED: "Course Enrolled",
    LESSON_COMPLETED: "Lesson Completed",
    COURSE_COMPLETED: "Course Completed",
    SUBSCRIPTION_STARTED: "Subscription Started",
    SUBSCRIPTION_CANCELED: "Subscription Canceled",
    PAYMENT_FAILED: "Payment Failed",
    LEAD_CAPTURED: "Lead Captured",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automation Rules</h1>
          <p className="text-sm text-gray-500 mt-1">
            Trigger emails and actions automatically based on user behavior
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/automation/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Rule
          </Link>
        </Button>
      </div>

      {rules.length === 0 ? (
        <div className="rounded-lg border bg-white shadow-sm p-12 text-center">
          <div className="mx-auto mb-4 rounded-full bg-brand-100 p-3 w-fit">
            <Zap className="h-7 w-7 text-brand-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No automation rules yet</h3>
          <p className="text-sm text-gray-500 mt-2 mb-6">
            Create rules to automatically send emails and perform actions when users
            take specific actions on your platform.
          </p>
          <Button asChild>
            <Link href="/admin/automation/new">Create First Rule</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium text-gray-900">{rule.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {triggerLabels[rule.trigger] ?? rule.trigger}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm capitalize">
                    {Array.isArray(rule.actions)
                      ? (rule.actions as Array<{ type?: string }>)
                          .map((a) => (a.type ?? "").replace(/_/g, " ").toLowerCase())
                          .join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {rule.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(rule.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/automation/${rule.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
