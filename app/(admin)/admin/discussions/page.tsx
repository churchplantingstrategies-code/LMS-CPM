import { auth } from "../../../../lib/auth";
import { redirect } from "next/navigation";
import { db } from "../../../../lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";

export default async function AdminDiscussionsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const discussionsCount = await db.discussion.count();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Discussions</h1>
        <p className="mt-1 text-sm text-gray-600">Moderate and review community discussions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700">
          <p>Total discussion threads: <span className="font-semibold">{discussionsCount}</span></p>
        </CardContent>
      </Card>
    </div>
  );
}
