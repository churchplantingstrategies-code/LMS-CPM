import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { SITE_LOGO_SRC } from "@/lib/brand";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Church Planting Movement – Learn, Grow, Transform",
    template: "%s | Church Planting Movement",
  },
  description:
    "Transform your life with world-class online courses in discipleship, leadership, and spiritual growth. Join thousands of learners on their journey.",
  keywords: ["LMS", "online courses", "discipleship", "e-learning", "leadership training"],
  authors: [{ name: "Church Planting Movement" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Church Planting Movement",
    title: "Church Planting Movement – Learn, Grow, Transform",
    description: "Transform your life with world-class online courses.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Church Planting Movement",
    description: "Transform your life with world-class online courses.",
  },
  icons: {
    icon: SITE_LOGO_SRC,
    shortcut: SITE_LOGO_SRC,
    apple: SITE_LOGO_SRC,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var stored=localStorage.getItem('theme-mode')||'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var isDark=stored==='dark'||(stored==='auto'&&prefersDark);document.documentElement.classList.toggle('dark',isDark);}catch(e){}})();`}
        </Script>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
