import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ranking de jugadores",
  description: "Consulta la clasificación por elo y los perfiles de los jugadores de CourtRank.",
};

export default function PlayersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
