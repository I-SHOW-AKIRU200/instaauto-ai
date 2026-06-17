import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InstaAuto AI",
  description: "Automate your Instagram content with AI-powered generation and publishing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
