import { ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";
import { ClubContactCta } from "@/components/club-contact-modal";
import { FadeContent } from "@/components/react-bits/FadeContent";
import { UpcomingAgenda } from "./upcoming-agenda";

// Light editorial hero: giant display headline states plainly what the app does,
// two real actions (browse tournaments / contact for clubs), and the live agenda
// panel as the right-hand asset — the upcoming tournaments are the hook.
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Single soft court-green glow behind the agenda, kept off the text so the
          headline stays high-contrast on the light background. */}
      <div aria-hidden className="glow-court pointer-events-none absolute -right-24 top-10 h-96 w-96" />

      {/* grid-cols-1 is load-bearing below lg: the agenda's horizontal strip is
          intrinsically wide, and an implicit auto track would grow to fit it
          instead of letting it scroll. minmax(0,1fr) caps the track. */}
      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 md:py-24 lg:grid-cols-12">
        <FadeContent className="lg:col-span-7">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-court/15 bg-court/5 px-3.5 py-1.5 text-sm font-medium text-court">
            <span
              aria-hidden
              className="h-2 w-2 rounded-full bg-ball-bright shadow-[0_0_8px_1px] shadow-ball-bright/60"
            />
            Ranking por Elo · Clubes verificados
          </span>
          <h1 className="font-display text-5xl font-black leading-[0.95] tracking-tight text-court-ink md:text-7xl xl:text-8xl">
            Juega torneos
            <br />
            de clubes <span className="text-court">reales.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-stone-600">
            Inscríbete en torneos de tu club, sigue tu Elo partido a partido y lleva el control de tus raquetas y
            entrenamientos.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/tournaments"
              className="group inline-flex items-center gap-2 rounded-2xl bg-court px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-court-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-court"
            >
              Explorar torneos
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </Link>
            <ClubContactCta className="inline-flex items-center gap-2 rounded-2xl border border-court/20 px-5 py-3 text-sm font-semibold text-court transition-colors hover:border-court/40 hover:bg-court/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-court">
              <Building2 className="h-4 w-4" />
              Para clubes
            </ClubContactCta>
          </div>
          <p className="mt-5 text-sm text-stone-500">
            Gratis para jugadores · Los clubes publican y gestionan sus cuadros
          </p>
        </FadeContent>

        <FadeContent delay={0.1} className="lg:col-span-5">
          <UpcomingAgenda />
        </FadeContent>
      </div>
    </section>
  );
}
