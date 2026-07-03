"use client";

import { ArrowRight, Building2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ClubContactCta } from "@/components/club-contact-modal";
import { CourtLinesSvg } from "./court-lines-svg";
import { TournamentTimeline } from "./tournament-timeline";

const TITLE_WORDS = ["Cada", "partido", "cuenta."];

export function Hero() {
  const reduced = useReducedMotion();

  // One-shot rise+fade for subhead, CTAs and calendar. Starts at opacity 0 but
  // in layout from first paint — no layout shift when it animates in.
  // `initial` must not depend on `reduced` (null during SSR) or the server and a
  // reduced-motion client render different inline styles → hydration mismatch.
  // Instead the transition collapses to 0s so reduced motion jumps to the final frame.
  function Rise({ delay, className, children }: { delay: number; className?: string; children: ReactNode }) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.6, ease: "easeOut", delay }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-court-night to-court-night-deep text-white">
      {/* Night-court signature: chalk lines draw themselves in behind the content. */}
      <CourtLinesSvg animate strokeWidth={2} className="pointer-events-none absolute inset-0 h-full w-full text-white/[0.13]" />
      <div aria-hidden className="floodlight pointer-events-none absolute -top-24 left-1/4 h-80 w-80" />
      <div aria-hidden className="floodlight pointer-events-none absolute -right-20 top-1/3 h-96 w-96" />

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-20 md:pb-28 md:pt-28">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
          <div>
            <h1 className="max-w-3xl font-display text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              {TITLE_WORDS.map((word, i) => (
                <span key={word}>
                  {/* Clip wrapper: word rises out of an overflow-hidden span; the
                      pb/-mb pair gives descenders room inside the vertical clip.
                      Spaces live outside the clip so words don't butt together. */}
                  <span className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
                    <motion.span
                      className={`inline-block ${i === TITLE_WORDS.length - 1 ? "text-ball-bright" : "text-white"}`}
                      initial={{ y: "110%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={
                        reduced
                          ? { duration: 0 }
                          : { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.35 + i * 0.12 }
                      }
                    >
                      {word}
                    </motion.span>
                  </span>
                  {i < TITLE_WORDS.length - 1 ? " " : null}
                </span>
              ))}
            </h1>
            <Rise delay={0.75}>
              <p className="mt-4 max-w-xl text-lg text-white/80">
                Torneos reales de clubes reales. Inscríbete, compite y sube en el ranking.
              </p>
            </Rise>
          </div>

          <Rise delay={0.9} className="flex flex-wrap items-center gap-3">
            <Link
              href="/tournaments"
              className="group inline-flex items-center gap-2 rounded-xl bg-ball-bright px-6 py-3 font-semibold text-court-ink shadow-sm transition-colors hover:bg-ball focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright"
            >
              Explorar torneos
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </Link>
            <ClubContactCta className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:border-white/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright">
              <Building2 className="h-4 w-4" />
              Para clubes
            </ClubContactCta>
          </Rise>
        </div>

        <Rise delay={1.05} className="mt-10">
          <TournamentTimeline />
        </Rise>
      </div>
    </section>
  );
}
