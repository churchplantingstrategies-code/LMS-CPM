import { PageLoadingShell } from "@/components/layout/page-loading-shell";

export default function StudentLoading() {
  return (
    <PageLoadingShell
      tone="student"
      title="Loading student portal"
      subtitle="Syncing courses, cart, and progress data."
    />
  );
}