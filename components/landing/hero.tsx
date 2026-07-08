import { ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";
import { ClubContactCta } from "@/components/club-contact-modal";
import { CourtLinesSvg } from "./court-lines-svg";
import { TournamentTimeline } from "./tournament-timeline";

// Functional hero: says plainly what the app does, points at the two real actions
// (browse tournaments / contact for clubs), and shows live upcoming tournaments right
// away — the tournaments are the hook, not a pitch.
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-court-night to-court-night-deep text-white">
      <CourtLinesSvg strokeWidth={2} className="pointer-events-none absolute inset-0 h-full w-full text-white/[0.10]" />
      <div aria-hidden className="floodlight pointer-events-none absolute -top-24 left-1/4 h-80 w-80" />

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-16 md:pb-20 md:pt-20">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-white/80 backdrop-blur-sm">
          <span
            aria-hidden
            className="h-2 w-2 rounded-full bg-ball-bright shadow-[0_0_8px_1px] shadow-ball-bright/60"
          />
          Ranking por elo · Clubes verificados
        </span>
        <h1 className="max-w-3xl font-display text-4xl font-black leading-[1] tracking-tight md:text-6xl">
          Torneos de tenis de <span className="text-ball-bright">clubes reales.</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/80">
          Inscríbete, compite y sigue tu progreso: ranking, logros, raquetas y entrenamientos, todo en un sitio.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="/tournaments"
            className="group inline-flex items-center gap-2 rounded-xl bg-ball-bright px-6 py-3 font-semibold text-court-ink shadow-sm transition-colors hover:bg-ball focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright"
          >
            Explorar torneos
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </Link>
          <ClubContactCta className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright">
            <Building2 className="h-4 w-4" />
            Para clubes
          </ClubContactCta>
        </div>

        <div className="mt-10">
          <TournamentTimeline />
        </div>
      </div>
    </section>
  );
}
