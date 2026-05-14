import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { SiteHeader } from "@/components/nav/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Bitcoin Podcast Summarizer",
    template: "%s · Bitcoin Podcast Summarizer",
  },
  description:
    "AI-generated summaries of your favorite Bitcoin podcasts, delivered to your inbox.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <PostHogProvider>
          <SiteHeader />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
