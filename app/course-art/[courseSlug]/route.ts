import { NextRequest, NextResponse } from "next/server";
import { getBrandLogoDataUri } from "@/lib/brand-logo-data";

const sceneConfig: Record<string, { from: string; to: string; label: string; accent: string }> = {
  hero: { from: "#1d4ed8", to: "#0f172a", label: "Demo Course", accent: "#fbbf24" },
  calling: { from: "#7c3aed", to: "#312e81", label: "The Call", accent: "#fde68a" },
  rhythm: { from: "#0f766e", to: "#134e4a", label: "Weekly Rhythm", accent: "#99f6e4" },
  scripture: { from: "#b45309", to: "#451a03", label: "Scripture", accent: "#fde68a" },
  care: { from: "#be185d", to: "#4a044e", label: "Pastoral Care", accent: "#f9a8d4" },
  practice: { from: "#2563eb", to: "#172554", label: "Practice", accent: "#bfdbfe" },
  commission: { from: "#15803d", to: "#14532d", label: "Commission", accent: "#bbf7d0" },
  "resource-rhythm": { from: "#0f766e", to: "#111827", label: "Rhythm Guide", accent: "#99f6e4" },
  "resource-scripture": { from: "#b45309", to: "#111827", label: "Scripture Guide", accent: "#fde68a" },
  "resource-plan": { from: "#15803d", to: "#111827", label: "30-Day Plan", accent: "#bbf7d0" },
};

function titleCase(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const scene = new URL(request.url).searchParams.get("scene") ?? "hero";
  const config = sceneConfig[scene] ?? sceneConfig.hero;
  const title = titleCase(courseSlug);
  const brandLogoDataUri = getBrandLogoDataUri();

  const svg = `
    <svg width="1200" height="675" viewBox="0 0 1200 675" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="675" gradientUnits="userSpaceOnUse">
          <stop stop-color="${config.from}" />
          <stop offset="1" stop-color="${config.to}" />
        </linearGradient>
        <clipPath id="brandLogoClip">
          <circle cx="124" cy="124" r="28" />
        </clipPath>
      </defs>
      <rect width="1200" height="675" rx="36" fill="url(#bg)" />
      <circle cx="1000" cy="120" r="180" fill="white" fill-opacity="0.08" />
      <circle cx="180" cy="540" r="220" fill="white" fill-opacity="0.05" />
      <circle cx="124" cy="124" r="31" fill="white" fill-opacity="0.96" />
      <image href="${brandLogoDataUri}" x="96" y="96" width="56" height="56" clip-path="url(#brandLogoClip)" preserveAspectRatio="xMidYMid slice" />
      <text x="170" y="130" fill="white" fill-opacity="0.92" font-size="18" font-family="Arial, Helvetica, sans-serif" font-weight="700">Church Planting Movement</text>
      <text x="84" y="248" fill="white" font-size="64" font-family="Arial, Helvetica, sans-serif" font-weight="700">${title}</text>
      <text x="84" y="310" fill="${config.accent}" font-size="28" font-family="Arial, Helvetica, sans-serif" font-weight="700">${config.label}</text>
      <text x="84" y="378" fill="white" fill-opacity="0.82" font-size="26" font-family="Arial, Helvetica, sans-serif">Images, quizzes, and progress-ready learning</text>
      <rect x="84" y="446" width="400" height="110" rx="24" fill="white" fill-opacity="0.1" />
      <text x="116" y="495" fill="white" font-size="26" font-family="Arial, Helvetica, sans-serif" font-weight="700">Student Demo Experience</text>
      <text x="116" y="534" fill="white" fill-opacity="0.8" font-size="20" font-family="Arial, Helvetica, sans-serif">Enroll free, take lesson quizzes, and track completion.</text>
      <path d="M923 228c0-55 45-100 100-100h57v232h-57c-55 0-100-45-100-100V228Z" fill="white" fill-opacity="0.12" />
      <path d="M919 434h169c16 0 29 13 29 29v75c0 16-13 29-29 29H919c-16 0-29-13-29-29v-75c0-16 13-29 29-29Z" fill="${config.accent}" fill-opacity="0.2" />
      <text x="947" y="494" fill="white" font-size="30" font-family="Arial, Helvetica, sans-serif" font-weight="700">Demo</text>
      <text x="947" y="529" fill="white" fill-opacity="0.82" font-size="18" font-family="Arial, Helvetica, sans-serif">Course Asset</text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}