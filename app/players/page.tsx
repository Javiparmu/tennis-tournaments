"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { PlayersRanking } from "@/components/players/players-ranking";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
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
    <div className="mt-6 flex min-h-[68px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-4">
      {content}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-court-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8">
          <PageHero
            eyebrow="Jugadores"
            title="Ranking de jugadores"
            accent=" jugadores"
            subtitle="Los mejores jugadores de la plataforma. Abre un perfil para ver su historial."
          >
            <RankingCta />
          </PageHero>
        </div>

        <PlayersRanking />
      </main>
      <SiteFooter />
    </div>
  );
}
