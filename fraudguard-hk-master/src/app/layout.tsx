import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { I18nProvider } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SafeGuard Agent - AI-Powered Fraud Detection",
  description: "Protect yourself from scams and fraud with AI-powered detection. Voice-first interface for elderly users.",
  keywords: ["fraud detection", "scam protection", "AI assistant", "elderly friendly", "SafeGuard"],
  authors: [{ name: "SafeGuard Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "SafeGuard Agent",
    description: "AI-powered fraud detection assistant",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SafeGuard Agent",
    description: "AI-powered fraud detection assistant",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <I18nProvider>
          {children}
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
