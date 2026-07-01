"use client";

import { Building2, Gamepad2, Trophy } from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";
import { FadeContent } from "@/components/react-bits/FadeContent";
import { RotatingText } from "@/components/react-bits/RotatingText";

type Highlight = { icon: ComponentType<{ className?: string }>; label: string };

type AuthBrandPanelProps = {
  // Headline above the rotating word (Spanish, inline per app convention).
  heading: string;
  // Short supporting pitch line shown under the headline.
  pitch: string;
  // Words the RotatingText cycles through. Defaults to the court surfaces.
  words?: string[];
  // Feature bullets shown under the pitch. Defaults to the product pillars.
  highlights?: Highlight[];
};

const SURFACE_WORDS = ["tierra batida.", "pista dura.", "hierba.", "tu pista."];

const DEFAULT_HIGHLIGHTS: Highlight[] = [
  { icon: Trophy, label: "Clasificación estilo Elo" },
  { icon: Gamepad2, label: "Perfil de jugador gamificado" },
  { icon: Building2, label: "Torneos organizados por clubes" },
];

// Shared left-hand brand panel for the auth screens (sign-in / sign-up).
// Reuses the landing visual idioms: court-line texture, glow blobs, the
// CourtRank logo lockup, an Archivo display headline, and a rotating word.
export function AuthBrandPanel({
  heading,
  pitch,
  words = SURFACE_WORDS,
  highlights = DEFAULT_HIGHLIGHTS,
}: AuthBrandPanelProps) {
  return (
    <section className="relative hidden overflow-hidden bg-court p-12 text-white lg:flex lg:flex-col lg:justify-between">
      {/* Court texture + glow blobs behind the content. */}
      <div className="court-lines absolute inset-0 -z-10 opacity-40" />
      <div className="glow absolute -left-24 -top-24 -z-10 h-72 w-72" />
      <div className="glow-court absolute -right-32 bottom-10 -z-10 h-96 w-96" />

      <FadeContent>
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ball-bright text-court">
            <span className="font-display text-base font-black">C</span>
          </span>
          <span className="font-display text-2xl font-extrabold tracking-tight text-white">
            Court<span className="text-ball-bright">Rank</span>
          </span>
        </Link>
      </FadeContent>

      <FadeContent delay={0.1} className="max-w-md">
        <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight md:text-5xl">
          {heading}{" "}
          <RotatingText words={words} className="text-ball-bright" />
        </h1>
        <p className="mt-5 text-lg text-white/70">{pitch}</p>

        <ul className="mt-8 space-y-3">
          {highlights.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm text-white/85">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ball-bright/15 text-ball-bright">
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </FadeContent>

      <FadeContent delay={0.2}>
        <p className="text-sm text-white/50">
          Miles de partidos jugados · Clubes de toda España · Sube en el ranking
        </p>
      </FadeContent>
    </section>
  );
}
