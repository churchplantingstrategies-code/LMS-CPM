import { PageLoadingShell } from "@/components/layout/page-loading-shell";

export default function MarketingLoading() {
  return (
    <PageLoadingShell
      tone="marketing"
      title="Loading storefront"
      subtitle="Preparing pages, catalog highlights, and pricing details."
    />
  );
}