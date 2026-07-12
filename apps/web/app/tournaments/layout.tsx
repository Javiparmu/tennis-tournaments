import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Torneos",
  description: "Explora los torneos de tenis publicados por los clubes e inscríbete para competir.",
};

export default function TournamentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
