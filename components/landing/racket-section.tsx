"use client";

import { motion, useInView, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";

// Scroll-driven showcase around the racket model. Each beat names a concrete
// in-tournament screen (bracket, standings, match detail, calendar, profiles)
// that the rest of the landing doesn't cover in detail. Mobile keeps the
// non-pinned path so scrolling stays native.

const RacketCanvas = dynamic(() => import("./racket-canvas").then((m) => m.RacketCanvas), {
  ssr: false,
  loading: () => <RacketPlaceholder />,
});

const BEATS = [
  {
    kicker: "Cuadro del torneo",
    headline: "Partidos y rondas en un solo sitio",
    body: "Eliminatoria, grupos o suizo: ves cada emparejamiento, la ronda y si el partido está programado, en juego, finalizado o por W.O.",
    meta: "Cuadro",
  },
  {
    kicker: "Clasificación",
    headline: "Victorias, derrotas y estado en el evento",
    body: "Mientras el torneo está en curso, consultas tu balance y si sigues en liza, has caído o ya has ganado.",
    meta: "Clasificación",
  },
  {
    kicker: "Detalle del partido",
    headline: "Rival, pista y marcador",
    body: "Cada cruce guarda la fase, la ronda, el rival, la pista y el resultado. Sets, tie-break y W.O. incluidos.",
    meta: "Partido",
  },
  {
    kicker: "Calendario",
    headline: "Tus partidos junto al resto de tu tenis",
    body: "Los partidos del torneo aparecen en tu calendario con tus entrenos y próximas inscripciones. Vista de mes o semana.",
    meta: "Calendario",
  },
  {
    kicker: "Perfiles públicos",
    headline: "Conoce a tu rival antes de jugar",
    body: "Desde el cuadro puedes abrir el perfil de cualquier jugador: @username, historial y raquetas públicas.",
    meta: "Perfiles",
  },
];

export function RacketSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const [step, setStep] = useState(0);
  // The scroll progress only drives the racket on the pinned desktop layout;
  // matchMedia (not CSS) because the canvas needs to know which mode it's in.
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setStep(Math.min(BEATS.length - 1, Math.floor(v * BEATS.length)));
  });

  // Mount the heavy chunk only once the section approaches the viewport.
  const nearView = useInView(sectionRef, { once: true, margin: "600px 0px" });

  return (
    <section ref={sectionRef} aria-labelledby="courtrank-heading" className="relative md:h-[400vh]">
      <div className="relative flex flex-col justify-center overflow-hidden bg-court-night px-6 py-20 text-white md:sticky md:top-0 md:h-screen md:py-0">
        <NightMatchBackdrop />

        <div className="relative mx-auto w-full max-w-6xl">
          <div className="grid gap-8 md:min-h-screen md:grid-cols-[minmax(0,0.92fr)_minmax(320px,440px)_minmax(0,0.78fr)] md:items-center md:gap-6">
            <div className="md:pb-16">
              <p className="font-display text-sm font-bold uppercase tracking-[0.32em] text-ball-bright/90">
                En competición
              </p>
              <h2
                id="courtrank-heading"
                className="mt-4 max-w-xl font-display text-5xl font-black leading-[0.88] tracking-tight text-white md:text-7xl"
              >
                Sigue el torneo desde la app.
              </h2>
              <p className="mt-6 max-w-md text-base leading-7 text-white/68">
                Cuando juegas un torneo en CourtRank, el cuadro, tus partidos, la clasificación y el historial viven en
                la misma ficha.
              </p>
            </div>

            {/* Fixed-size stage: space is reserved before the chunk/GLB load. */}
            <div className="relative order-first mx-auto h-[410px] w-full max-w-[380px] md:order-0 md:h-[560px] md:max-w-[440px]">
              <RacketStage>
                {nearView ? (
                  <RacketCanvas progress={isDesktop ? scrollYProgress : undefined} reduced={reduced} />
                ) : (
                  <RacketPlaceholder />
                )}
              </RacketStage>
            </div>

            <div className="hidden md:block">
              <motion.article
                key={`beat-${step}`}
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, ease: "easeOut" }}
                className="rounded-[2rem] border border-white/12 bg-white/[0.07] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <span className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-ball-bright">
                    Set {String(step + 1).padStart(2, "0")}
                  </span>
                  <span className="rounded-full bg-ball-bright px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-court-ink">
                    {BEATS[step].meta}
                  </span>
                </div>
                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-white/48">
                  {BEATS[step].kicker}
                </p>
                <h3 className="mt-3 font-display text-4xl font-black leading-[0.95] tracking-tight text-white">
                  {BEATS[step].headline}
                </h3>
                <p className="mt-5 text-base leading-7 text-white/70">{BEATS[step].body}</p>
              </motion.article>

              <div className="mt-6">
                <div className="flex items-center justify-between font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">
                  <span>Cuadro</span>
                  <span>Perfiles</span>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {BEATS.map((b, i) => (
                    <span
                      key={b.kicker}
                      aria-hidden="true"
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i <= step ? "bg-ball-bright shadow-[0_0_18px] shadow-ball-bright/40" : "bg-white/14"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <Link
                href="/players"
                className="group mt-8 inline-flex items-center gap-2 rounded-full border border-white/14 px-4 py-2.5 text-sm font-semibold text-ball-bright transition-colors hover:border-ball-bright/50 hover:bg-ball-bright/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright"
              >
                Descubre tu perfil
                <span
                  aria-hidden
                  className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                >
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Mobile: racket first, then a compact editorial stack. */}
          <div className="md:hidden">
            <div className="rounded-[2rem] border border-white/12 bg-white/[0.07] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-ball-bright">
                En competición
              </p>
              <ol className="mt-5 space-y-5">
                {BEATS.map((b, i) => (
                  <li key={b.kicker} className="border-t border-white/10 pt-5 first:border-t-0 first:pt-0">
                    <div className="flex items-start gap-4">
                      <span className="mt-1 font-mono text-xs font-bold text-ball-bright">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">{b.kicker}</p>
                        <h3 className="mt-1 font-display text-2xl font-black leading-tight text-white">{b.headline}</h3>
                        <p className="mt-2 text-sm leading-6 text-white/68">{b.body}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <Link
                href="/players"
                className="group mt-7 inline-flex items-center gap-2 rounded-full bg-ball-bright px-4 py-2.5 text-sm font-semibold text-court-ink transition-colors hover:bg-ball focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright"
              >
                Descubre tu perfil
                <span
                  aria-hidden
                  className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NightMatchBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-court-night via-[#082817] to-court-night-deep" />
      <div className="absolute left-1/2 top-0 h-136 w-136 -translate-x-1/2 rounded-full bg-ball-bright/10 blur-3xl" />
      <div className="absolute -left-24 bottom-10 h-80 w-80 rounded-full bg-court/35 blur-3xl" />
      <div className="absolute -right-28 top-28 h-96 w-96 rounded-full bg-ball-bright/12 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 border-t border-ball-bright/15 bg-[linear-gradient(90deg,transparent_0,transparent_18%,rgb(215_255_62/0.16)_18%,rgb(215_255_62/0.16)_18.3%,transparent_18.3%,transparent_81.7%,rgb(215_255_62/0.16)_81.7%,rgb(215_255_62/0.16)_82%,transparent_82%),linear-gradient(0deg,rgb(255_255_255/0.08)_0,rgb(255_255_255/0.08)_1px,transparent_1px)] bg-size-[100%_100%,100%_5rem] opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgb(255_255_255/0.08)_0_1px,transparent_1px)] bg-size-[26px_26px] opacity-[0.08]" />
    </div>
  );
}

function RacketStage({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full w-full">
      <div className="absolute left-1/2 top-1/2 h-[82%] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-ball-bright/16" />
      <div className="absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ball-bright/16 blur-3xl md:h-96 md:w-96" />
      <div className="absolute inset-x-10 bottom-8 h-8 rounded-full bg-black/30 blur-xl" />
      <div className="relative h-full w-full">{children}</div>
      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-3 rounded-full border border-white/12 bg-court-night-deep/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/55 backdrop-blur md:flex">
        <span className="h-2 w-2 rounded-full bg-ball-bright shadow-[0_0_10px] shadow-ball-bright/70" />
        Scroll para girar
      </div>
    </div>
  );
}

function RacketPlaceholder() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-white/3">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ball-bright/20 blur-3xl"
      />
      <div className="absolute left-1/2 top-1/2 h-72 w-24 -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-full border border-white/12" />
    </div>
  );
}
