import Link from "next/link";
import { auth } from "../../../lib/auth";
import { redirect } from "next/navigation";
import { db } from "../../../lib/db";
import { MessageSquare, Pin, Clock, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { formatRelativeTime } from "../../../lib/utils";

type DiscussionItem = {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: Date;
  user: {
    name: string | null;
  };
  course: {
    title: string;
    slug: string;
  };
  _count: {
    replies: number;
  };
};

async function getDiscussions(userId: string): Promise<DiscussionItem[]> {
  const enrollments = await db.enrollment.findMany({
    where: { userId },
    select: { courseId: true },
  });

  const courseIds = enrollments.map((e: { courseId: string }) => e.courseId);

  if (courseIds.length === 0) {
    return [];
  }

  return db.discussion.findMany({
    where: {
      courseId: { in: courseIds },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 30,
  });
}

export default async function DiscussionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const discussions = await getDiscussions(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discussions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Join conversations from your enrolled courses.
          </p>
        </div>
        <Button asChild>
          <Link href="/courses">
            <PlusCircle className="mr-2 h-4 w-4" />
            Browse Courses
          </Link>
        </Button>
      </div>

      {discussions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-10 w-10 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">No discussions yet</h2>
            <p className="mt-1 text-sm text-gray-600">
              Enroll in a course and start the first discussion thread.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {discussions.map((discussion: DiscussionItem) => (
            <Card key={discussion.id} className="transition hover:shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <CardTitle className="text-lg leading-tight">
                      {discussion.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <Badge variant="secondary">{discussion.course.title}</Badge>
                      <span>by {discussion.user.name || "Anonymous"}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(discussion.createdAt)}
                      </span>
                    </div>
                  </div>
                  {discussion.isPinned ? (
                    <Badge className="inline-flex items-center gap-1" variant="outline">
                      <Pin className="h-3 w-3" />
                      Pinned
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-gray-700">{discussion.content}</p>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                  <span>{discussion._count.replies} replies</span>
                  <Link
                    href={`/courses/${discussion.course.slug}`}
                    className="font-medium text-brand-600 hover:underline"
                  >
                    Open course
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
