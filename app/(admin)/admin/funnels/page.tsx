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
import { PlusCircle, Layers } from "lucide-react";

export default async function AdminFunnelsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") redirect("/dashboard");

  const funnels = await db.funnel.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { steps: true, leads: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Funnels</h1>
          <p className="text-sm text-gray-500 mt-1">
            Build marketing funnels to capture leads and convert customers
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/funnels/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Funnel
          </Link>
        </Button>
      </div>

      {funnels.length === 0 ? (
        <div className="rounded-lg border bg-white shadow-sm p-12 text-center">
          <div className="mx-auto mb-4 rounded-full bg-brand-100 p-3 w-fit">
            <Layers className="h-7 w-7 text-brand-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No funnels yet</h3>
          <p className="text-sm text-gray-500 mt-2 mb-6">
            Create sales funnels with landing pages, opt-in forms, and upsell sequences.
          </p>
          <Button asChild>
            <Link href="/admin/funnels/new">Create First Funnel</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funnel</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funnels.map((funnel) => (
                <TableRow key={funnel.id}>
                  <TableCell>
                    <div className="font-medium text-gray-900">{funnel.name}</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">/{funnel.slug}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {funnel.type.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{funnel._count.steps}</TableCell>
                  <TableCell className="text-center">{funnel._count.leads}</TableCell>
                  <TableCell>
                    {funnel.isPublished ? (
                      <Badge variant="success">Published</Badge>
                    ) : (
                      <Badge variant="outline">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(funnel.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/funnels/${funnel.id}`}>Edit</Link>
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
