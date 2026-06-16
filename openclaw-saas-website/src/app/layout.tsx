import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "FastClaw SaaS | Powerful Cloud Management",
  description: "Scale your business with FastClaw SaaS. Get comprehensive cloud management and automation tools for just $18/month.",
  keywords: "FastClaw, SaaS, Cloud Management, Business Automation, Tech Platform",
  openGraph: {
    title: "FastClaw SaaS | Powerful Cloud Management",
    description: "Scale your business with FastClaw SaaS. Get comprehensive cloud management and automation tools for just $18/month.",
    url: "https://claw.niyogen.com",
    siteName: "FastClaw",
    images: [
      {
        url: "https://claw.niyogen.com/og-image.jpg", // Placeholder
        width: 1200,
        height: 630,
        alt: "FastClaw SaaS Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
