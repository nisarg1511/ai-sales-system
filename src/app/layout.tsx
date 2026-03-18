import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Sales System — Onboarding",
  description:
    "Configure your AI sales agent in minutes. Extract business intelligence automatically and deploy a fully-configured sales agent.",
  keywords: ["AI sales", "sales automation", "lead qualification", "AI agent"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-zinc-900">{children}</body>
    </html>
  );
}
