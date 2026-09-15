import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "CampusTunes | Official College Music & Student Audio Streaming",
  description: "Stream high-definition tracks, discover student bands, and broadcast campus productions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} dark`}>
      <body className="bg-[#07060e] text-white antialiased min-h-screen selection:bg-primary/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
