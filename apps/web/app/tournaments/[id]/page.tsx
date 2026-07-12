import type { Metadata } from "next";
import { requestForMetadata } from "@courtrank/core/api/client";
import "@/lib/api-init";
import type { Tournament } from "@courtrank/core/models";
import TournamentDetailPage from "./_components/tournament-page-client";

// Segment default when the id is invalid or the metadata fetch fails; composes
// with the root layout's title.template.
const FALLBACK_METADATA: Metadata = {
  title: "Torneo",
  description: "Detalle del torneo: cuadro, jugadores y fases.",
};

export async function generateMetadata({ params }: PageProps<"/tournaments/[id]">): Promise<Metadata> {
  const { id } = await params;
  const tournamentId = Number(id);
  if (!Number.isInteger(tournamentId) || tournamentId <= 0) {
    return FALLBACK_METADATA;
  }

  try {
    const tournament = await requestForMetadata<Tournament>(`/tournaments/${tournamentId}`);
    return {
      title: tournament.name,
      description: tournament.description ?? FALLBACK_METADATA.description,
    };
  } catch {
    // Metadata must never crash the page; the client page reports fetch errors.
    return FALLBACK_METADATA;
  }
}

// Thin server wrapper: data flow stays in the client page via React Query.
export default function Page() {
  return <TournamentDetailPage />;
}
