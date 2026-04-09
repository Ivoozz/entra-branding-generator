import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Entra ID Branding Generator - BrandingOS",
  description: "Advanced branding generator for Microsoft Entra ID",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-zinc-50 dark:bg-black text-black dark:text-white">
        <Suspense fallback={<div className="w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800" />}>
          <Sidebar />
        </Suspense>
        <div className="flex-1 pl-72 min-h-screen">
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading project...</div>}>
            {children}
          </Suspense>
        </div>
      </body>
    </html>
  );
}
