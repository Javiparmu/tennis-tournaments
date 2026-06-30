"use client";

import { ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";
import { RotatingText } from "@/components/react-bits/RotatingText";
import { TournamentTimeline } from "./tournament-timeline";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Court texture + glow blobs behind the content. */}
      <div className="court-lines absolute inset-0 -z-10" />
      <div className="glow absolute -left-24 -top-24 -z-10 h-72 w-72" />
      <div className="glow-court absolute -right-32 top-20 -z-10 h-96 w-96" />

      <div className="mx-auto w-full max-w-6xl px-6 pb-10 pt-14 md:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-court/20 bg-court/5 px-3 py-1 text-xs font-semibold text-court">
          <span className="h-2 w-2 rounded-full bg-ball-bright ring-2 ring-court/30" />
          Hecho para jugadores y clubes de tenis
        </span>

        <h1 className="mt-5 max-w-4xl font-display text-5xl font-black leading-[0.95] tracking-tight text-court-ink md:text-7xl">
          Encuentra tu próximo partido en{" "}
          <RotatingText
            words={["tierra batida.", "pista dura.", "hierba.", "tu pista."]}
            className="text-court"
          />
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-zinc-600">
          Los clubes publican torneos, te inscribes en segundos y escalas en una clasificación estilo
          Elo. Registra cada resultado en un perfil de jugador gamificado, hecho para quienes de verdad
          juegan.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="/tournaments"
            className="group inline-flex items-center gap-2 rounded-xl bg-court px-6 py-3 font-semibold text-ball-bright shadow-sm transition-colors hover:bg-court-hover"
          >
            Explorar torneos
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-xl border border-court/20 bg-white px-6 py-3 font-semibold text-court-ink transition-colors hover:bg-court/5"
          >
            Mi perfil
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-zinc-500 transition-colors hover:text-court"
          >
            <Building2 className="h-4 w-4" />
            Para clubes
          </Link>
        </div>

        <div className="mt-10">
          <TournamentTimeline />
        </div>
      </div>
    </section>
  );
}
