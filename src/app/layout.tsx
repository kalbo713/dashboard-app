// Copyright 2026 Ralph Burgos - All Rights Reserved.
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Personal Dashboard",
  description: "A modern minimalist personal dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`bg-mesh-animated ${outfit.variable} font-sans antialiased min-h-screen text-slate-50`}
      >
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}

