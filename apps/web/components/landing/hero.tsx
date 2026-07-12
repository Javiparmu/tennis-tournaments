import { ArrowRight, Building2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ClubContactCta } from "@/components/club-contact-modal";
import { FadeContent } from "@/components/react-bits/FadeContent";
import nightStadium from "@/public/landing/night-stadium.webp";
import { UpcomingAgenda } from "./upcoming-agenda";

// Full-bleed night-stadium hero: the giant display headline states plainly what
// the app does over the dark left of the photo, two real actions (browse
// tournaments / contact for clubs) below it, and the live agenda rail pinned to
// the bottom over the grass — the upcoming tournaments are the hook.
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-court-night-deep text-white">
      {/* bg-court-night-deep guarantees a dark first paint before the blur placeholder resolves */}
      <Image
        src={nightStadium}
        alt=""
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="object-cover object-[70%_50%] lg:object-right"
      />
      {/* Scrims: left column keeps the headline on near-black regardless of crop; the
          bottom band backs the rail over the bright grass. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-r from-court-night-deep/95 via-court-night-deep/55 via-45% to-transparent to-90% lg:from-court-night-deep/90 lg:via-court-night-deep/50 lg:via-35% lg:to-75%" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-linear-to-t from-court-night-deep/95 via-court-night-deep/55 to-transparent" />
      </div>
      <div className="relative mx-auto flex min-h-[680px] w-full max-w-6xl flex-col px-6 pb-20 pt-20 md:min-h-[780px] md:pb-28 md:pt-28 lg:min-h-[840px]">
        <FadeContent className="max-w-2xl">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <span
              aria-hidden
              className="h-2 w-2 rounded-full bg-ball-bright shadow-[0_0_8px_1px] shadow-ball-bright/60"
            />
            Ranking por Elo · Clubes verificados
          </span>
          {/* Capped at 7xl: 8xl re-wraps the two-line lockup into four lines and
              pushes the agenda rail below the fold on a 1440×900 desktop. */}
          <h1 className="font-display text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">
            Juega torneos
            <br />
            de clubes <span className="text-ball-bright">reales.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/75">
            Inscríbete en torneos de tu club, sigue tu Elo partido a partido y lleva el control de tus raquetas y
            entrenamientos.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/tournaments"
              className="group inline-flex items-center gap-2 rounded-2xl bg-ball-bright px-6 py-3 font-semibold text-court-ink shadow-sm transition-colors hover:bg-ball focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright"
            >
              Explorar torneos
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </Link>
            <ClubContactCta className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-ball-bright/50 hover:bg-ball-bright/10 hover:text-ball-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright">
              <Building2 className="h-4 w-4" />
              Para clubes
            </ClubContactCta>
          </div>
          <p className="mt-5 text-sm text-white/55">
            Gratis para jugadores · Los clubes publican y gestionan sus cuadros
          </p>
        </FadeContent>

        {/* No mt-auto: the rail follows the copy with a fixed gap so the hero's
            spare height falls as breathing room BELOW the calendar, not above it. */}
        <FadeContent delay={0.1} className="pt-16">
          <UpcomingAgenda />
        </FadeContent>
      </div>
    </section>
  );
}
