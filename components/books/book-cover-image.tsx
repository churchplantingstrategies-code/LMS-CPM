import { cn } from "@/lib/utils";

type BookCoverImageProps = {
  bookId: string;
  title: string;
  imageUrl?: string;
  className?: string;
  imageClassName?: string;
};

export function BookCoverImage({ bookId, title, imageUrl, className, imageClassName }: BookCoverImageProps) {
  const resolvedSrc = imageUrl || (bookId ? `/book-covers/${bookId}` : "");

  return (
    <div className={cn("relative overflow-hidden rounded-[22px] bg-slate-100", className)}>
      {resolvedSrc ? (
        <img
          src={resolvedSrc}
          alt={`${title} book cover`}
          className={cn("h-full w-full object-cover", imageClassName)}
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-brand-700 to-cyan-500 px-4 text-center text-sm font-semibold text-white">
          <span className="line-clamp-3">{title || "Book cover preview"}</span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(15,23,42,0.08)_100%)]" />
    </div>
  );
}