"use client";

import { useState } from "react";
import { CheckCircle2, HelpCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type LessonQuizItem = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export function LessonQuizPanel({
  items,
  completion,
}: {
  items: LessonQuizItem[];
  completion?: {
    lessonId: string;
    courseId: string;
    returnTo: string;
  };
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  const score = items.reduce((total, item, index) => {
    return total + (answers[index] === item.answerIndex ? 1 : 0);
  }, 0);
  const allQuestionsAnswered = items.every((_, index) => answers[index] !== undefined);
  const passed = submitted && allQuestionsAnswered && score === items.length;

  async function completeLesson() {
    if (!completion || !passed) return;
    setCompletionError(null);
    setIsCompleting(true);

    try {
      const orderedAnswers = items.map((_, index) => answers[index] ?? -1);
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: completion.lessonId,
          courseId: completion.courseId,
          completed: true,
          quizAnswers: orderedAnswers,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "Unable to mark lesson complete.");
      }

      window.location.assign(completion.returnTo);
    } catch (error) {
      setCompletionError(error instanceof Error ? error.message : "Unable to mark lesson complete.");
      setIsCompleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-brand-500/20 bg-brand-500/10 p-4 text-sm text-brand-100">
        <div className="flex items-center gap-2 font-semibold text-white">
          <HelpCircle className="h-4 w-4 text-brand-300" />
          Knowledge Check
        </div>
        <p className="mt-2 text-brand-100/90">Use these quick quizzes to reinforce the lesson before marking it complete.</p>
      </div>

      {items.map((item, itemIndex) => {
        const selected = answers[itemIndex];
        const isCorrect = submitted && selected === item.answerIndex;
        const isIncorrect = submitted && selected !== undefined && selected !== item.answerIndex;

        return (
          <div key={`${item.question}-${itemIndex}`} className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4">
            <p className="font-semibold text-white">{itemIndex + 1}. {item.question}</p>
            <div className="mt-4 space-y-2">
              {item.options.map((option, optionIndex) => {
                const revealCorrect = submitted && optionIndex === item.answerIndex;
                return (
                  <button
                    key={`${option}-${optionIndex}`}
                    type="button"
                    onClick={() => setAnswers((current) => ({ ...current, [itemIndex]: optionIndex }))}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                      selected === optionIndex
                        ? "border-brand-500 bg-brand-500/10 text-white"
                        : "border-gray-800 bg-gray-950 text-gray-300 hover:border-gray-700 hover:bg-gray-900",
                      revealCorrect && "border-emerald-500/60 bg-emerald-500/10",
                      submitted && selected === optionIndex && optionIndex !== item.answerIndex && "border-rose-500/60 bg-rose-500/10"
                    )}
                  >
                    <span>{option}</span>
                    {submitted && revealCorrect ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : null}
                    {submitted && selected === optionIndex && optionIndex !== item.answerIndex ? <XCircle className="h-4 w-4 text-rose-300" /> : null}
                  </button>
                );
              })}
            </div>
            {submitted && (isCorrect || isIncorrect) ? (
              <p className={cn("mt-3 text-sm", isCorrect ? "text-emerald-300" : "text-amber-200")}>
                {item.explanation}
              </p>
            ) : null}
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-800 bg-gray-900/70 p-4">
        <Button variant="brand" onClick={() => setSubmitted(true)}>Check Answers</Button>
        <Button
          variant="outline"
          className="border-gray-700 bg-transparent text-gray-200 hover:bg-gray-800"
          onClick={() => {
            setAnswers({});
            setSubmitted(false);
          }}
        >
          Reset Quiz
        </Button>
        {submitted ? (
          <p className="text-sm text-gray-300">Score: <span className="font-semibold text-white">{score}/{items.length}</span></p>
        ) : null}
      </div>

      {completion ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="success"
              onClick={() => void completeLesson()}
              disabled={!passed || isCompleting}
              className="disabled:opacity-100 disabled:bg-slate-800 disabled:text-slate-400"
            >
              {isCompleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Mark Complete
            </Button>
            {!passed ? (
              <p className="text-sm text-amber-200">Score 100% to unlock lesson completion.</p>
            ) : (
              <p className="text-sm text-emerald-300">Knowledge Check passed. You can now mark this lesson complete.</p>
            )}
          </div>
          {completionError ? <p className="mt-3 text-sm text-rose-300">{completionError}</p> : null}
        </div>
      ) : null}
    </div>
  );
}