import { PageLoadingShell } from "@/components/layout/page-loading-shell";

export default function AdminLoading() {
  return (
    <PageLoadingShell
      tone="admin"
      title="Loading admin workspace"
      subtitle="Preparing analytics, books, and platform controls."
    />
  );
}