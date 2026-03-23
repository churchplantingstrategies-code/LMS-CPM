import { notFound } from "next/navigation";
import { BuilderPageRenderer } from "@/components/page-builder/builder-page-renderer";
import { getPublishedBuilderPageByPath } from "@/lib/page-builder-store";

export default async function DynamicMarketingPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const path = `/${(params.slug ?? []).join("/")}`;
  const page = await getPublishedBuilderPageByPath(path);

  if (!page) {
    notFound();
  }

  return <BuilderPageRenderer page={page} />;
}
