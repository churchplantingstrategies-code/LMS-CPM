import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Search, Filter, BookOpen, Clock, Users, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDuration, calculateProgress } from "@/lib/utils";

async function getCourses(userId: string) {
  const [courses, enrollments] = await Promise.all([
    db.course.findMany({
      where: { isPublished: true },
      include: {
        modules: {
          include: { lessons: true },
        },
        enrollments: { where: { userId } },
        _count: { select: { enrollments: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    }),
    db.enrollment.findMany({
      where: { userId },
      select: { courseId: true },
    }),
  ]);

  const enrolledIds = new Set(enrollments.map((e) => e.courseId));

  return courses.map((course) => ({
    ...course,
    isEnrolled: enrolledIds.has(course.id),
    totalLessons: course.modules.reduce((acc, m) => acc + m.lessons.length, 0),
  }));
}

export default async function CoursesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const courses = await getCourses(session.user.id);

  const categories = [...new Set(courses.map((c) => c.category).filter(Boolean))];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Courses</h1>
        <p className="text-gray-500 mt-1">Explore and enroll in courses to begin your journey</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search courses..." className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-brand-600 text-white">
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className="px-4 py-1.5 rounded-full text-sm font-medium border hover:bg-gray-50 transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Course Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-24">
          <BookOpen className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No courses available yet</h2>
          <p className="text-gray-500">Check back soon — new content is being added regularly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card className="overflow-hidden border-0 shadow-sm card-hover h-full">
                {/* Thumbnail */}
                <div className="relative h-44 bg-gradient-to-br from-brand-500 to-purple-700">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="h-14 w-14 text-white/40" />
                    </div>
                  )}
                  {course.isFeatured && (
                    <Badge className="absolute top-3 left-3 bg-amber-400 text-amber-900 border-0">
                      ⭐ Featured
                    </Badge>
                  )}
                  {course.isEnrolled && (
                    <Badge className="absolute top-3 right-3 bg-emerald-500 text-white border-0">
                      Enrolled
                    </Badge>
                  )}
                </div>

                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    {course.category && (
                      <Badge variant="brand" className="text-xs">{course.category}</Badge>
                    )}
                    <Badge variant="outline" className="text-xs">{course.level}</Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                  {course.shortDesc && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.shortDesc}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {course.totalLessons} lessons
                    </span>
                    {course.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDuration(course.duration)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {course._count.enrollments}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    {course.price ? (
                      <span className="font-semibold text-gray-900">${course.price}</span>
                    ) : (
                      <Badge variant="success">Free</Badge>
                    )}
                    <Button
                      size="sm"
                      variant={course.isEnrolled ? "outline" : "brand"}
                      className="text-xs"
                    >
                      {course.isEnrolled ? "Continue" : "Enroll Now"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
