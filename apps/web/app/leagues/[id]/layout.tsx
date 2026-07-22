import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liga",
  description: "Clasificación, partidos y miembros de una liga privada en CourtRank.",
};

export default function LeagueLayout({ children }: LayoutProps<"/leagues/[id]">) {
  return children;
}
