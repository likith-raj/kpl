import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Oswald } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "KSL Cricket Auction 2026 | St. John's English Medium School",
  description:
    "KSL Cricket Auction 2026 — Eight franchises. One stage. A battle for the ultimate squad. St. John's English Medium School, Subedarpet, Nellore.",
  keywords: ["KSL", "Cricket", "Auction", "St Johns", "Nellore", "2026"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#050505]">
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
