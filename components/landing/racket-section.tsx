"use client";

import { motion, useInView, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Scroll-driven 3D showcase for the racket log. Desktop pins a full-screen
// stage across 300vh: the copy steps swap at thirds of the scroll and the
// racket rotates with the same progress. Mobile skips the pinning entirely
// (scroll-jacking on phones is hostile) and renders a stacked block with an
// idle slow spin instead.

const RacketCanvas = dynamic(() => import("./racket-canvas").then((m) => m.RacketCanvas), {
  ssr: false,
  loading: () => <RacketPlaceholder />,
});

const STEPS = [
  {
    title: "Registra tus raquetas",
    body: "Modelo, peso, grip: tu arsenal, ordenado.",
  },
  {
    title: "Apunta cada encordado",
    body: "Cuerda, tensión y fecha de cada montaje, siempre a mano.",
  },
  {
    title: "Compara sensaciones",
    body: "Notas de cómo jugó cada encordado, para repetir lo que funciona.",
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
    setStep(v < 1 / 3 ? 0 : v < 2 / 3 ? 1 : 2);
  });

  // Mount the heavy chunk only once the section approaches the viewport.
  const nearView = useInView(sectionRef, { once: true, margin: "600px 0px" });

  return (
    <section ref={sectionRef} aria-labelledby="rackets-heading" className="relative md:h-[300vh]">
      <div className="relative flex items-center overflow-hidden bg-linear-to-b from-court-night to-court-night-deep py-20 text-white md:sticky md:top-0 md:h-screen md:py-0">
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wide text-ball-bright/90">
              Raquetas y encordados
            </p>
            <h2
              id="rackets-heading"
              className="mt-2 font-display text-4xl font-black tracking-tight md:text-6xl"
            >
              Tu raqueta, con memoria.
            </h2>

            {/* Desktop: one step at a time, swapped by scroll progress. */}
            <div className="mt-8 hidden min-h-[120px] md:block">
              <motion.div
                key={step}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <h3 className="font-display text-xl font-bold text-white">{STEPS[step].title}</h3>
                <p className="mt-2 max-w-md text-white/70">{STEPS[step].body}</p>
              </motion.div>
            </div>
            <div className="mt-4 hidden items-center gap-2 md:flex">
              {STEPS.map((s, i) => (
                <span
                  key={s.title}
                  aria-hidden="true"
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? "w-6 bg-ball-bright" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>

            {/* Mobile: the three steps as a plain list — no pinning, no swaps. */}
            <ol className="mt-8 space-y-6 md:hidden">
              {STEPS.map((s) => (
                <li key={s.title}>
                  <h3 className="font-display text-lg font-bold text-white">{s.title}</h3>
                  <p className="mt-1 text-sm text-white/70">{s.body}</p>
                </li>
              ))}
            </ol>

            <Link
              href="/players"
              className="group mt-8 inline-flex items-center gap-1.5 rounded-md font-semibold text-ball-bright hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright"
            >
              Descubre tu perfil
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none">
                →
              </span>
            </Link>
          </div>

          {/* Fixed-size stage: space is reserved before the chunk/GLB load. */}
          <div className="h-[380px] md:h-[520px]">
            {nearView ? (
              <RacketCanvas progress={isDesktop ? scrollYProgress : undefined} reduced={reduced} />
            ) : (
              <RacketPlaceholder />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function RacketPlaceholder() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-white/[0.04]">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ball-bright/20 blur-3xl"
      />
    </div>
  );
}
