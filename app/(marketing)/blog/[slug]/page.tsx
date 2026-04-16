import { notFound } from "next/navigation";
import { Calendar, Clock } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { blogPosts } from "../data";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-2">
        <Badge variant="secondary">{post.category}</Badge>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{post.title}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {new Date(post.date).toLocaleDateString()}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {post.readTime}
        </span>
        <span>By {post.author}</span>
      </div>

      <div className="prose prose-slate mt-8 max-w-none">
        <p>{post.content}</p>
      </div>
    </article>
  );
}
