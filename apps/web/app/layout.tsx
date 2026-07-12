import { esES } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "CourtRank — Torneos de tenis, organizados y jugados en un solo lugar",
    // Child segments set a short title (e.g. "Torneos") that composes into this.
    template: "%s · CourtRank",
  },
  description:
    "Los clubes publican torneos, los jugadores se inscriben y escalan en una clasificación por elo. Encuentra tu próximo partido y registra cada resultado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ClerkProvider localization={esES}>
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
