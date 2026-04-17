import { readFileSync } from "fs";
import path from "path";

let cachedBrandLogoDataUri: string | null = null;

export function getBrandLogoDataUri() {
  if (cachedBrandLogoDataUri) {
    return cachedBrandLogoDataUri;
  }

  const logoPath = path.join(process.cwd(), "public", "branding", "cpm-logo2.png");
  const logoBase64 = readFileSync(logoPath).toString("base64");

  cachedBrandLogoDataUri = `data:image/png;base64,${logoBase64}`;
  return cachedBrandLogoDataUri;
}
