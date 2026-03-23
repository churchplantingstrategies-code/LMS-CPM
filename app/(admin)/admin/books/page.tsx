import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BooksAdminManager } from "@/components/admin/books-admin-manager";

export default async function AdminBooksPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Books</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage catalog CRUD, publishing, sales analytics, and bookstore settings from one place.
          </p>
        </div>
        <Button variant="outline" className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800 disabled:opacity-100 disabled:border-slate-800 disabled:bg-slate-900 disabled:text-slate-500" asChild>
          <Link href="/admin/books/orders">View Book Orders</Link>
        </Button>
      </div>

      <BooksAdminManager />
    </div>
  );
}