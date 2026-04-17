import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, CheckCircle, Circle,
  MessageSquare, FileText, PlayCircle, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LessonQuizPanel, type LessonQuizItem } from "@/components/courses/lesson-quiz-panel";
import { calculateProgress } from "@/lib/utils";

type LessonAttachment =
  | { type: "resource"; name: string; url: string }
  | { type: "quiz"; question: string; options: string[]; answerIndex: number; explanation: string };

async function getLessonData(courseId: string, lessonId: string, userId: string) {
  const course = await db.course.findFirst({
    where: { id: courseId, isPublished: true },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, duration: true, isFree: true },
          },
        },
      },
    },
  });

  if (!course) return null;

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  const lesson = await db.lesson.findFirst({
    where: { id: lessonId, modules: { courseId } },
    include: {
      modules: true,
      assignments: true,
    },
  });

  if (!lesson) return null;

  // Check access
  if (!enrollment && !lesson.isFree) return null;

  const progress = await db.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Completed lesson IDs
  const lessonProgress = await db.lessonProgress.findMany({
    where: { userId, completed: true, lessons: { modules: { courseId } } },
    select: { lessonId: true },
  });
  const completedIds = new Set(lessonProgress.map((p) => p.lessonId));

  const firstIncompleteLesson = allLessons.find((item) => !completedIds.has(item.id)) ?? null;
  const unlockedLessonIds = new Set(
    allLessons
      .filter((item) => completedIds.has(item.id) || (firstIncompleteLesson ? item.id === firstIncompleteLesson.id : true))
      .map((item) => item.id)
  );

  return {
    course,
    lesson,
    enrollment,
    progress,
    prevLesson,
    nextLesson,
    allLessons,
    completedIds,
    unlockedLessonIds,
    firstIncompleteLesson,
    progressPct: calculateProgress(completedIds.size, allLessons.length),
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const data = await getLessonData(courseId, lessonId, session.user.id);
  if (!data) notFound();

  const {
    course,
    lesson,
    enrollment,
    progress,
    prevLesson,
    nextLesson,
    completedIds,
    unlockedLessonIds,
    firstIncompleteLesson,
    progressPct,
  } = data;

  if (enrollment && !unlockedLessonIds.has(lesson.id)) {
    if (firstIncompleteLesson) {
      redirect(`/courses/${course.id}/lessons/${firstIncompleteLesson.id}`);
    }
    redirect(`/courses/${course.id}`);
  }

  const attachments = Array.isArray(lesson.attachments) ? (lesson.attachments as LessonAttachment[]) : [];
  const resourceAttachments = attachments.filter((attachment): attachment is Extract<LessonAttachment, { type: "resource" }> => {
    return typeof attachment === "object" && attachment !== null && attachment.type === "resource" && "url" in attachment;
  });
  const quizItems = attachments.filter((attachment): attachment is Extract<LessonAttachment, { type: "quiz" }> => {
    return typeof attachment === "object" && attachment !== null && attachment.type === "quiz" && Array.isArray(attachment.options);
  });
  const quizPanelItems: LessonQuizItem[] = quizItems.map(q => ({ question: q.question, options: q.options, answerIndex: q.answerIndex, explanation: q.explanation }));
  const requiresKnowledgeCheck = Boolean(enrollment && !progress?.completed && quizItems.length > 0);
  const nextLocked = Boolean(enrollment && !progress?.completed);

  return (
    <div className="flex min-h-screen overflow-hidden bg-gradient-to-br from-brand-50 via-white to-purple-50 text-gray-900 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/60 dark:text-slate-100">
      {/* Sidebar – Curriculum */}
      <aside className="hidden lg:flex w-80 flex-col overflow-hidden border-r border-brand-100 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
        <div className="border-b border-brand-100 p-4 dark:border-slate-700">
          <Link href={`/courses/${course.id}`} className="mb-2 flex items-center gap-1 text-sm text-gray-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-300">
            <ChevronLeft className="h-4 w-4" /> Back to course
          </Link>
          <h2 className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-slate-100">{course.title}</h2>
          <div className="mt-2">
            <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-slate-400">
              <span>{completedIds.size} lessons done</span>
              <span>{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-1 bg-brand-100" />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {course.modules.map((module, i) => (
            <div key={module.id}>
              <div className="border-b border-brand-100 bg-gradient-to-r from-brand-50 to-purple-50 px-4 py-2.5 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                  Module {i + 1}: {module.title}
                </p>
              </div>
              {module.lessons.map((l) => {
                const isActive = l.id === lesson.id;
                const isCompleted = completedIds.has(l.id);
                const isLocked = enrollment
                  ? !unlockedLessonIds.has(l.id)
                  : !l.isFree;
                return (
                  isLocked ? (
                    <div
                      key={l.id}
                      className="flex items-start gap-3 px-4 py-3 text-sm opacity-70"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-gray-500">{l.title}</p>
                        {l.duration && <p className="mt-0.5 text-xs text-gray-400">{l.duration}m</p>}
                        <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-amber-500">Complete current lesson first</p>
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={l.id}
                      href={`/courses/${course.id}/lessons/${l.id}`}
                      className={`flex items-start gap-3 px-4 py-3 text-sm transition-colors ${
                        isActive ? "border-l-2 border-brand-500 bg-brand-50" : "hover:bg-brand-50/60"
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Circle className={`h-4 w-4 ${isActive ? "text-brand-500" : "text-gray-400"}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`truncate ${isActive ? "font-medium text-brand-900" : "text-gray-700"}`}>
                          {l.title}
                        </p>
                        {l.duration && (
                          <p className="mt-0.5 text-xs text-gray-500">{l.duration}m</p>
                        )}
                      </div>
                    </Link>
                  )
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-brand-100 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <Link href={`/courses/${course.id}`} className="text-gray-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-300 lg:hidden">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="text-sm">
              <p className="text-xs text-gray-500 dark:text-slate-400">{lesson.modules.title}</p>
              <p className="max-w-[180px] truncate font-medium text-gray-900 dark:text-slate-100 sm:max-w-xs">{lesson.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {progress?.completed && (
              <Badge variant="success" className="text-xs">Completed</Badge>
            )}
          </div>
        </div>

        {/* Video / Content Area */}
        <div className="flex-1 overflow-auto">
          {/* Video */}
          {lesson.videoUrl && (
            <div className="bg-black">
              {lesson.videoProvider === "YOUTUBE" ? (
                <div className="video-container max-w-5xl mx-auto">
                  <iframe
                    src={`https://www.youtube.com/embed/${lesson.videoUrl}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={lesson.title}
                  />
                </div>
              ) : lesson.videoProvider === "VIMEO" ? (
                <div className="video-container max-w-5xl mx-auto">
                  <iframe
                    src={`https://player.vimeo.com/video/${lesson.videoUrl}`}
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={lesson.title}
                  />
                </div>
              ) : (
                <div className="max-w-5xl mx-auto">
                  <video
                    controls
                    className="w-full max-h-[60vh]"
                    src={lesson.videoUrl}
                  />
                </div>
              )}
            </div>
          )}

          {/* Lesson Details */}
          <div className="max-w-4xl mx-auto p-6">
            <div className="mb-4 flex items-start justify-between">
              <h1 className="text-xl font-bold text-gray-900">{lesson.title}</h1>
            </div>

            <Tabs defaultValue="content" className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto whitespace-nowrap border border-brand-100 bg-white">
                <TabsTrigger value="content" className="data-[state=active]:bg-brand-50 data-[state=active]:text-brand-700">Overview</TabsTrigger>
                <TabsTrigger value="discussion" className="data-[state=active]:bg-brand-50 data-[state=active]:text-brand-700">
                  <MessageSquare className="h-4 w-4 mr-1" /> Discussion
                </TabsTrigger>
                {quizItems.length > 0 && (
                  <TabsTrigger value="quiz" className="data-[state=active]:bg-brand-50 data-[state=active]:text-brand-700">
                    Knowledge Check
                  </TabsTrigger>
                )}
                {lesson.assignments.length > 0 && (
                  <TabsTrigger value="assignment" className="data-[state=active]:bg-brand-50 data-[state=active]:text-brand-700">
                    <FileText className="h-4 w-4 mr-1" /> Assignment
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="content" className="mt-4">
                {lesson.description && (
                  <div className="prose max-w-none text-sm leading-relaxed text-gray-700">
                    <p>{lesson.description}</p>
                  </div>
                )}
                {lesson.content && (
                  <div className="prose mt-4 max-w-none text-sm leading-relaxed text-gray-700"
                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                  />
                )}
                {resourceAttachments.length > 0 && (
                  <div className="mt-6 rounded-xl border border-brand-100 bg-white p-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">Lesson Resources</h3>
                    <div className="space-y-2">
                      {resourceAttachments.map((file, i) => (
                        <a
                          key={i}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700"
                        >
                          <FileText className="h-4 w-4" />
                          {file.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {quizItems.length > 0 && (
                <TabsContent value="quiz" className="mt-4">
                  <LessonQuizPanel
                    items={quizPanelItems}
                    completion={
                      enrollment && !progress?.completed
                        ? {
                            lessonId: lesson.id,
                            courseId: course.id,
                            returnTo: `/courses/${course.id}/lessons/${lesson.id}`,
                          }
                        : undefined
                    }
                  />
                </TabsContent>
              )}

              <TabsContent value="discussion" className="mt-4">
                <div className="py-8 text-center text-gray-500">
                  <MessageSquare className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                  <p>Discussions are available once you&apos;re enrolled.</p>
                </div>
              </TabsContent>

              {lesson.assignments.length > 0 && (
                <TabsContent value="assignment" className="mt-4">
                  {lesson.assignments.map((assignment) => (
                    <div key={assignment.id} className="rounded-xl border border-brand-100 bg-white p-4">
                      <h3 className="mb-2 font-semibold text-gray-900">{assignment.title}</h3>
                      <p className="mb-4 text-sm text-gray-500">{assignment.description}</p>
                      <Button variant="brand" size="sm">Submit Assignment</Button>
                    </div>
                  ))}
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-100 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
          <Button
            variant="outline"
            size="sm"
            className="border-brand-200 bg-white text-gray-700 hover:border-brand-300 hover:text-brand-700 disabled:opacity-100 disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
            disabled={!prevLesson}
            asChild={!!prevLesson}
          >
            {prevLesson ? (
              <Link href={`/courses/${course.id}/lessons/${prevLesson.id}`}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Link>
            ) : (
              <span>
                <ChevronLeft className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </span>
            )}
          </Button>

          {enrollment && !progress?.completed && !requiresKnowledgeCheck && (
            <form action={`/api/progress`} method="POST">
              <input type="hidden" name="lessonId" value={lesson.id} />
              <input type="hidden" name="courseId" value={course.id} />
              <input type="hidden" name="returnTo" value={`/courses/${course.id}/lessons/${lesson.id}`} />
              <Button type="submit" size="sm" variant="success">
                <CheckCircle className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Mark Complete</span>
                <span className="sm:hidden">Complete</span>
              </Button>
            </form>
          )}

          {requiresKnowledgeCheck ? (
            <p className="text-xs uppercase tracking-[0.18em] text-amber-600">
              Pass the Knowledge Check tab to unlock lesson completion.
            </p>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            className="border-brand-200 bg-white text-gray-700 hover:border-brand-300 hover:text-brand-700 disabled:opacity-100 disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
            disabled={!nextLesson || nextLocked}
            asChild={!!nextLesson && !nextLocked}
          >
            {nextLesson && !nextLocked ? (
              <Link href={`/courses/${course.id}/lessons/${nextLesson.id}`}>
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            ) : (
              <span>
                <span className="hidden sm:inline">{nextLocked ? "Complete Lesson" : "Next"}</span>
                <span className="sm:hidden">{nextLocked ? "Complete" : "Next"}</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
