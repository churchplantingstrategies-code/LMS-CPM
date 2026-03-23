import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Mail, Users, BarChart2 } from "lucide-react";

const statusVariant: Record<string, "success" | "outline" | "secondary" | "warning"> = {
  SENT: "success",
  DRAFT: "outline",
  SCHEDULED: "secondary",
  SENDING: "warning",
};

export default async function AdminEmailPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") redirect("/dashboard");

  const [campaigns, totalLeads] = await Promise.all([
    db.emailCampaign.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { logs: true } } },
    }),
    db.lead.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">
            {campaigns.length} campaigns · {totalLeads} contacts
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/email/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Campaign
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-5 shadow-sm flex gap-3 items-center">
          <div className="rounded-full bg-brand-100 p-2">
            <Mail className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Campaigns</p>
            <p className="text-xl font-bold text-gray-900">{campaigns.length}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5 shadow-sm flex gap-3 items-center">
          <div className="rounded-full bg-green-100 p-2">
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Contacts</p>
            <p className="text-xl font-bold text-gray-900">{totalLeads}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5 shadow-sm flex gap-3 items-center">
          <div className="rounded-full bg-purple-100 p-2">
            <BarChart2 className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Emails Sent</p>
            <p className="text-xl font-bold text-gray-900">
              {campaigns.reduce((sum, c) => sum + c._count.logs, 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                  No campaigns yet. Create your first email campaign.
                </TableCell>
              </TableRow>
            )}
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <div className="font-medium text-gray-900">{campaign.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">
                    {campaign.subject}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {campaign.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[campaign.status] ?? "outline"}>
                    {campaign.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{campaign._count.logs}</TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(campaign.createdAt)}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {campaign.scheduledAt ? formatDate(campaign.scheduledAt) : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/email/${campaign.id}`}>View</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
