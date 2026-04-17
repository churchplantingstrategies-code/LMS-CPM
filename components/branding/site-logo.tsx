import Image from "next/image";
import { SITE_LOGO_SRC, SITE_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

type SiteLogoProps = {
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
};

export function SiteLogo({
  className,
  imageClassName,
  sizes = "40px",
  priority = false,
}: SiteLogoProps) {
  return (
    <span
      className={cn(
        "relative inline-flex size-10 shrink-0 overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-black/10",
        className
      )}
    >
      <Image
        src={SITE_LOGO_SRC}
        alt={`${SITE_NAME} logo`}
        fill
        priority={priority}
        sizes={sizes}
        className={cn("object-cover object-center scale-[1.08]", imageClassName)}
      />
    </span>
  );
}
