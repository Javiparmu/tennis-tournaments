import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CtaBand() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-20">
      <div className="court-lines relative overflow-hidden rounded-3xl bg-court px-8 py-14 text-center shadow-lg">
        <div className="glow absolute -right-16 -top-16 h-64 w-64" />
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-black tracking-tight text-white md:text-5xl">
          Tu próximo torneo te está esperando.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/70">
          Apúntate a jugar o crea una cuenta de club para organizar el tuyo. Solo te llevará un minuto.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/tournaments"
            className="group inline-flex items-center gap-2 rounded-xl bg-ball-bright px-6 py-3 font-semibold text-court-ink transition-transform hover:-translate-y-0.5"
          >
            Explorar torneos
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
          >
            Organizar un torneo
          </Link>
        </div>
      </div>
    </section>
  );
}
