import type { Metadata } from "next";
import { requestForMetadata } from "@/data/api/client";
import type { User } from "@/models";
import UserPage from "./_components/player-page-client";

// Segment default when the username is invalid or the metadata fetch fails;
// composes with the root layout's title.template.
const FALLBACK_METADATA: Metadata = {
  title: "Perfil de jugador",
  description: "Perfil de jugador: estadísticas, calendario y logros.",
};

export async function generateMetadata({ params }: PageProps<"/players/[id]">): Promise<Metadata> {
  // The [id] segment carries the unique username, not the DB id.
  const { id } = await params;
  const username = id ? decodeURIComponent(id) : "";
  if (!username) {
    return FALLBACK_METADATA;
  }

  try {
    const user = await requestForMetadata<User>(`/users/by-username/${encodeURIComponent(username)}`);
    return {
      title: user.name ?? user.username,
      description: `Perfil de ${user.name ?? user.username} en CourtRank: estadísticas, calendario y logros.`,
    };
  } catch {
    // Metadata must never crash the page; the client page reports fetch errors.
    return FALLBACK_METADATA;
  }
}

// Thin server wrapper: data flow stays in the client page via React Query.
export default function Page() {
  return <UserPage />;
}
