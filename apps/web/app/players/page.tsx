"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { PageScaffold } from "@/components/page-scaffold";
import { PlayersRanking } from "@/components/players/players-ranking";
import { useMeQuery } from "@/data/queries";

/* The CTA shell always renders at full height and swaps its content once Clerk /
   the profile query resolve. Rendering nothing while loading (previous version)
   made the card pop in ~1s after mount, shifting the ranking list down under the
   cursor and killing the row hover state mid-hover. */
function RankingCta() {
  const { isLoaded, isSignedIn } = useUser();
  const { data: me } = useMeQuery();

  const btnClass =
    "rounded-lg bg-ball-bright px-4 py-2 text-sm font-semibold text-court-ink shadow-sm transition-colors hover:bg-ball focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright";

  let content: React.ReactNode;
  if (!isLoaded || (isSignedIn && !me)) {
    // Placeholder with the same height as the real button so the card never resizes.
    content = <div className="h-9 w-56 animate-pulse rounded-lg bg-white/10" />;
  } else if (isSignedIn && me) {
    content = (
      <>
        <p className="text-sm text-white/80">Consulta tu progreso, logros y torneos.</p>
        <Link href={`/players/${encodeURIComponent(me.username)}`} className={btnClass}>
          Abrir mi perfil
        </Link>
      </>
    );
  } else {
    content = (
      <>
        <p className="text-sm text-white/80">Crea tu perfil y aparece en el ranking.</p>
        <Link href="/sign-in" className={btnClass}>
          Empezar
        </Link>
      </>
    );
  }

  return (
    <div className="mt-4 flex min-h-[60px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-3">
      {content}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <PageScaffold>
      <div className="mb-6">
        <PageHero compact eyebrow="Jugadores" title="Ranking de jugadores" accent=" jugadores">
          <RankingCta />
        </PageHero>
      </div>

      <PlayersRanking />
    </PageScaffold>
  );
}
