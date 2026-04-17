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

export default async function AdminLeadsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") redirect("/dashboard");

  const leads = await db.leads.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      funnels: { select: { title: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <p className="text-sm text-gray-500 mt-1">{leads.length} total leads captured</p>
      </div>

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Source Funnel</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Converted</TableHead>
              <TableHead>Captured</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  No leads yet. Publish a funnel to start capturing leads.
                </TableCell>
              </TableRow>
            )}
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium text-gray-900">
                  {lead.name ?? "—"}
                </TableCell>
                <TableCell className="text-gray-600">{lead.email}</TableCell>
                <TableCell className="text-gray-600">
                  {lead.funnels?.title ?? "—"}
                </TableCell>
                <TableCell>
                  {lead.tags && (lead.tags as string[]).length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {(lead.tags as string[]).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {lead.userId ? (
                    <Badge variant="success">Converted</Badge>
                  ) : (
                    <Badge variant="outline">Lead</Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(lead.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
