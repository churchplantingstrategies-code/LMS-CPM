import { auth } from "../../../../lib/auth";
import { redirect } from "next/navigation";
import { db } from "../../../../lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";

export default async function AdminCertificatesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const certificatesCount = await db.certificate.count();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
        <p className="mt-1 text-sm text-gray-600">Track issued certificates across courses.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700">
          <p>Total certificates issued: <span className="font-semibold">{certificatesCount}</span></p>
        </CardContent>
      </Card>
    </div>
  );
}
