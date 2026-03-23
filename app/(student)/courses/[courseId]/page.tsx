import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  BookOpen, Clock, Users, Award, ChevronRight, Lock,
  CheckCircle, Play, FileText, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDuration, calculateProgress } from "@/lib/utils";

async function getCourseDetails(courseId: string, userId: string) {
  const course = await db.courses.findFirst({
    where: { id: courseId, isPublished: true },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) return null;

  const enrollment = await db.enrollments.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  const lessonProgress = enrollment
    ? await db.lesson_progress.findMany({
        where: { userId, lessons: { modules: { courseId } } },
      })
    : [];

  const completedIds = new Set(lessonProgress.filter((p) => p.completed).map((p) => p.lessonId));
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return {
    course,
    enrollment,
    completedIds,
    totalLessons,
    progressPct: calculateProgress(completedIds.size, totalLessons),
  };
}

export default async function CoursePage({ params }: { params: { courseId: string } }) {
  const session = await auth();
  if (!session) redirect("/login");

  const data = await getCourseDetails(params.courseId, session.user.id);
  if (!data) notFound();

  const { course, enrollment, completedIds, totalLessons, progressPct } = data;

  // Find first incomplete lesson for "Continue" button
  let continueLesson: { id: string; moduleId: string } | null = null;
  for (const module of course.modules) {
    for (const lesson of module.lessons) {
      if (!completedIds.has(lesson.id)) {
        continueLesson = lesson;
        break;
      }
    }
    if (continueLesson) break;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/courses" className="hover:text-brand-600">Courses</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium truncate">{course.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2">
          {/* Course Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              {course.category && <Badge variant="brand">{course.category}</Badge>}
              <Badge variant="outline">{course.level}</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{course.title}</h1>
            {course.description && (
              <p className="text-gray-600 leading-relaxed">{course.description}</p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {totalLessons} lessons</span>
              {course.duration && (
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatDuration(course.duration)}</span>
              )}
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course._count.enrollments} students</span>
            </div>
          </div>

          {/* Progress (if enrolled) */}
          {enrollment && (
            <Card className="border-0 shadow-sm mb-6 bg-brand-50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-brand-800">Your Progress</span>
                  <span className="text-sm font-semibold text-brand-700">{progressPct}%</span>
                </div>
                <Progress value={progressPct} className="h-2 mb-2" />
                <div className="flex items-center justify-between text-xs text-brand-600">
                  <span>{completedIds.size} of {totalLessons} lessons completed</span>
                  {progressPct === 100 && (
                    <span className="font-medium flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" /> Course Complete!
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Curriculum */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Curriculum</h2>
            <div className="space-y-3">
              {course.modules.map((module, moduleIndex) => (
                <div key={module.id} className="border rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
                        {moduleIndex + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{module.title}</h3>
                        <p className="text-xs text-gray-500">{module.lessons.length} lessons</p>
                      </div>
                    </div>
                    {/* Module progress */}
                    {enrollment && (
                      <span className="text-xs text-gray-400">
                        {module.lessons.filter((l) => completedIds.has(l.id)).length}/{module.lessons.length}
                      </span>
                    )}
                  </div>

                  <div className="divide-y">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isCompleted = completedIds.has(lesson.id);
                      const canAccess = enrollment || lesson.isFree;
                      return (
                        <div
                          key={lesson.id}
                          className={`flex items-center gap-3 px-4 py-3 ${canAccess ? "hover:bg-gray-50" : "opacity-60"} transition-colors`}
                        >
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                            ) : canAccess ? (
                              <Play className="h-5 w-5 text-brand-500" />
                            ) : (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {canAccess ? (
                              <Link
                                href={`/courses/${course.id}/lessons/${lesson.id}`}
                                className="text-sm font-medium text-gray-700 hover:text-brand-600 truncate block"
                              >
                                {lesson.title}
                              </Link>
                            ) : (
                              <span className="text-sm font-medium text-gray-600 truncate block">{lesson.title}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {lesson.isFree && !enrollment && (
                              <Badge variant="success" className="text-xs">Free</Badge>
                            )}
                            {lesson.duration && (
                              <span className="text-xs text-gray-400">{lesson.duration}m</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-md sticky top-6">
            {/* Preview/Thumbnail */}
            <div className="h-48 bg-gradient-to-br from-brand-500 to-purple-700 rounded-t-xl relative overflow-hidden">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <BookOpen className="h-16 w-16 text-white/40" />
                </div>
              )}
              {course.previewVideo && (
                <button className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                  <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="h-6 w-6 text-brand-600 ml-1" />
                  </div>
                </button>
              )}
            </div>

            <CardContent className="pt-4">
              {/* Price */}
              <div className="mb-4">
                {course.price ? (
                  <div className="text-3xl font-bold text-gray-900">${course.price}</div>
                ) : (
                  <div className="text-3xl font-bold text-emerald-600">Free</div>
                )}
              </div>

              {/* CTA Button */}
              {enrollment ? (
                <Button className="w-full mb-3" variant="brand" size="lg" asChild>
                  <Link href={continueLesson ? `/courses/${course.id}/lessons/${continueLesson.id}` : "#"}>
                    {progressPct === 100 ? "Review Course" : "Continue Learning"}
                  </Link>
                </Button>
              ) : (
                <Button className="w-full mb-3" variant="brand" size="lg" asChild>
                  <Link href={`/api/enroll?courseId=${course.id}`}>
                    {course.price ? "Buy Now" : "Enroll Free"}
                  </Link>
                </Button>
              )}

              {/* Course Includes */}
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p className="font-semibold text-gray-800 mb-2">This course includes:</p>
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-gray-400" />
                  <span>{totalLessons} on-demand video lessons</span>
                </div>
                {course.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{formatDuration(course.duration)} of content</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span>Downloadable resources</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <span>Interactive lesson quizzes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-gray-400" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>Community discussions</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
