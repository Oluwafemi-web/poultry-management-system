import type { Metadata } from "next";
import { Syne, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "./utils/provider";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-as-display",
  weight: ["500", "600", "700", "800"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-as-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AgroSolve — Livestock Farm Management",
  description:
    "Configure once. Manage livestock, inventory, employees, and finances — then buy supplies and sell animals in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${sourceSans.variable} font-sans antialiased bg-[var(--as-paper)] text-[var(--as-ink)]`}
      >
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
