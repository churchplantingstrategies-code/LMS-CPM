import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "eDiscipleship – Learn, Grow, Transform",
    template: "%s | eDiscipleship",
  },
  description:
    "Transform your life with world-class online courses in discipleship, leadership, and spiritual growth. Join thousands of learners on their journey.",
  keywords: ["LMS", "online courses", "discipleship", "e-learning", "leadership training"],
  authors: [{ name: "eDiscipleship" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "eDiscipleship",
    title: "eDiscipleship – Learn, Grow, Transform",
    description: "Transform your life with world-class online courses.",
  },
  twitter: {
    card: "summary_large_image",
    title: "eDiscipleship",
    description: "Transform your life with world-class online courses.",
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
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
