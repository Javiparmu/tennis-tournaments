import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ligas",
  description: "Tus ligas privadas y torneos por invitación en CourtRank.",
};

export default function CompetitionsLayout({ children }: LayoutProps<"/competitions">) {
  return children;
}
