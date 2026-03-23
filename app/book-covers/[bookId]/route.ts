import { getBookById } from "@/lib/book-store";

const palettes = [
  ["#0F172A", "#2563EB", "#7DD3FC", "#F8FAFC"],
  ["#052E16", "#10B981", "#99F6E4", "#ECFDF5"],
  ["#312E81", "#6366F1", "#BFDBFE", "#EEF2FF"],
  ["#7C2D12", "#F97316", "#FCD34D", "#FFF7ED"],
  ["#881337", "#EC4899", "#FBCFE8", "#FFF1F2"],
  ["#581C87", "#A855F7", "#E9D5FF", "#FAF5FF"],
  ["#111827", "#6B7280", "#D1D5DB", "#F9FAFB"],
  ["#7F1D1D", "#EF4444", "#FDBA74", "#FFF7ED"],
  ["#365314", "#84CC16", "#BEF264", "#F7FEE7"],
  ["#164E63", "#06B6D4", "#A5F3FC", "#ECFEFF"],
] as const;

function hashValue(input: string) {
  return input.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function splitTitle(title: string) {
  const words = title.split(" ");
  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint).join(" "), words.slice(midpoint).join(" ")].filter(Boolean);
}

async function buildCoverSvg(bookId: string) {
  const book = await getBookById(bookId);
  if (!book) return null;

  const palette = palettes[hashValue(book.id) % palettes.length];
  const [bgDark, bgBright, accent, paper] = palette;
  const lines = splitTitle(book.title);
  const seed = hashValue(`${book.id}-${book.author}`);
  const circleX = 120 + (seed % 180);
  const circleY = 110 + (seed % 70);
  const circleRadius = 90 + (seed % 24);
  const archInset = 36 + (seed % 18);
  const waveOne = 250 + (seed % 30);
  const waveTwo = 305 + (seed % 28);

  return `
    <svg width="800" height="1200" viewBox="0 0 800 1200" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(book.title)} book cover">
      <defs>
        <linearGradient id="bg" x1="90" y1="40" x2="760" y2="1140" gradientUnits="userSpaceOnUse">
          <stop stop-color="${bgDark}" />
          <stop offset="1" stop-color="${bgBright}" />
        </linearGradient>
        <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${circleX} ${circleY}) rotate(90) scale(${circleRadius} ${circleRadius})">
          <stop stop-color="${accent}" stop-opacity="0.95" />
          <stop offset="1" stop-color="${accent}" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="panel" x1="152" y1="290" x2="640" y2="920" gradientUnits="userSpaceOnUse">
          <stop stop-color="rgba(255,255,255,0.22)" />
          <stop offset="1" stop-color="rgba(255,255,255,0.08)" />
        </linearGradient>
      </defs>

      <rect width="800" height="1200" rx="44" fill="url(#bg)" />
      <circle cx="${circleX}" cy="${circleY}" r="${circleRadius}" fill="url(#glow)" />
      <circle cx="650" cy="1010" r="180" fill="${accent}" fill-opacity="0.16" />
      <path d="M0 ${waveOne}C92 ${waveOne - 38} 188 ${waveOne + 58} 290 ${waveOne + 18}C410 ${waveOne - 28} 500 ${waveOne + 44} 604 ${waveOne + 10}C680 ${waveOne - 12} 746 ${waveOne - 4} 800 ${waveOne + 36}V1200H0V${waveOne}Z" fill="${paper}" fill-opacity="0.08" />
      <path d="M0 ${waveTwo}C110 ${waveTwo - 54} 214 ${waveTwo + 46} 328 ${waveTwo + 8}C454 ${waveTwo - 34} 586 ${waveTwo + 28} 800 ${waveTwo - 24}V1200H0V${waveTwo}Z" fill="${paper}" fill-opacity="0.13" />

      <g opacity="0.72">
        <path d="M${archInset} 934C${archInset} 744 ${archInset + 118} 566 400 430C${682 - archInset} 566 ${800 - archInset} 744 ${800 - archInset} 934V1084H${archInset}V934Z" stroke="${paper}" stroke-opacity="0.26" stroke-width="2" />
        <path d="M${archInset + 58} 920C${archInset + 58} 770 ${archInset + 148} 644 400 536C${652 - archInset} 644 ${742 - archInset} 770 ${742 - archInset} 920V1032H${archInset + 58}V920Z" stroke="${paper}" stroke-opacity="0.22" stroke-width="2" />
      </g>

      <rect x="86" y="84" width="628" height="1032" rx="32" fill="url(#panel)" stroke="rgba(255,255,255,0.18)" stroke-width="2" />

      <text x="126" y="160" fill="${paper}" fill-opacity="0.78" font-size="28" font-family="Arial, Helvetica, sans-serif" letter-spacing="8">${escapeXml(book.category.toUpperCase())}</text>
      <text x="126" y="220" fill="${paper}" fill-opacity="0.92" font-size="22" font-family="Arial, Helvetica, sans-serif">eDiscipleship Library</text>

      <g>
        <text x="126" y="690" fill="${paper}" font-size="74" font-weight="700" font-family="Arial, Helvetica, sans-serif">${escapeXml(lines[0] ?? "")}</text>
        ${lines[1] ? `<text x="126" y="772" fill="${paper}" font-size="74" font-weight="700" font-family="Arial, Helvetica, sans-serif">${escapeXml(lines[1])}</text>` : ""}
      </g>

      <text x="126" y="840" fill="${paper}" fill-opacity="0.84" font-size="30" font-family="Arial, Helvetica, sans-serif">${escapeXml(book.tagline)}</text>
      <text x="126" y="1040" fill="${paper}" fill-opacity="0.8" font-size="28" font-family="Arial, Helvetica, sans-serif">${escapeXml(book.author)}</text>
      <text x="126" y="1084" fill="${paper}" fill-opacity="0.68" font-size="24" font-family="Arial, Helvetica, sans-serif">${book.pages} pages</text>

      <rect x="574" y="998" width="108" height="44" rx="22" fill="${accent}" fill-opacity="0.85" />
      <text x="607" y="1028" fill="${bgDark}" font-size="22" font-weight="700" font-family="Arial, Helvetica, sans-serif">BOOK</text>
    </svg>
  `.trim();
}

export async function GET(_: Request, { params }: { params: { bookId: string } }) {
  const svg = await buildCoverSvg(params.bookId);

  if (!svg) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}