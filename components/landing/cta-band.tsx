import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ClubContactCta } from "@/components/club-contact-modal";
import { CourtLinesSvg } from "./court-lines-svg";

export function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-court-night to-court-night-deep text-white">
      <CourtLinesSvg strokeWidth={2} className="pointer-events-none absolute inset-0 h-full w-full text-white/[0.10]" />
      <div aria-hidden className="floodlight pointer-events-none absolute -top-16 left-1/3 h-80 w-80" />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-24 md:py-32 text-center">
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-black tracking-tight text-white md:text-5xl">
          Deja de pelotear: <span className="text-ball-bright">compite.</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/70">
          Inscríbete en un torneo con cuadro, rivales y resultados que cuentan. ¿Gestionas un club? Escríbenos y
          publica los tuyos.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/tournaments"
            className="group inline-flex items-center gap-2 rounded-xl bg-ball-bright px-6 py-3 font-semibold text-court-ink transition-colors hover:bg-ball focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright"
          >
            Explorar torneos
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </Link>
          <ClubContactCta className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-semibold text-white/80 transition-colors hover:border-white/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright">
            Contacta con nosotros
          </ClubContactCta>
        </div>
      </div>
    </section>
  );
}
