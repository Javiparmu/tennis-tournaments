"use client";

import { useUser } from "@clerk/nextjs";
import { Award, TrendingUp, Trophy } from "lucide-react";
import Link from "next/link";
import { useMeQuery, useUserMatchActivityQuery } from "@/data/queries";
import { CourtLinesSvg } from "./court-lines-svg";
import { SectionHeading } from "./section-heading";

function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

// Sample shown to logged-out visitors.
const SAMPLE = {
  name: "Jordan Rivera",
  handle: "jordan",
  achievements: ["Primera victoria", "Racha de 5 partidos", "Especialista en tierra"],
  played: 24,
  wins: 16,
};

export function ProfileTeaser() {
  const { isSignedIn } = useUser();
  const me = useMeQuery();
  const activity = useUserMatchActivityQuery(me.data?.id, isoDaysAgo(90), new Date().toISOString());

  const signedInUser = isSignedIn && me.data;
  const matches = activity.data?.matches ?? [];
  const played = signedInUser ? matches.length : SAMPLE.played;
  const wins = signedInUser ? matches.filter((m) => m.result === "WIN").length : SAMPLE.wins;
  const winRate = played > 0 ? Math.round((wins / played) * 100) : 0;
  const name = signedInUser ? (me.data.name ?? me.data.username) : SAMPLE.name;
  const handle = signedInUser ? me.data.username : SAMPLE.handle;
  const imageUrl = signedInUser ? me.data.imageUrl : null;
  const achievements = signedInUser
    ? (me.data.achievements ?? []).map((a) => a.name)
    : SAMPLE.achievements;
  const achievementCount = achievements.length;

  return (
    <section
      aria-labelledby="ranking-heading"
      className="relative overflow-hidden bg-linear-to-b from-court-night to-court-night-deep text-white"
    >
      <CourtLinesSvg strokeWidth={2} className="pointer-events-none absolute inset-0 h-full w-full text-white/[0.05]" />
      <div aria-hidden className="floodlight pointer-events-none absolute -top-20 right-1/4 h-80 w-80" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-24 md:py-32 lg:grid-cols-2">
        <div>
          <SectionHeading
            id="ranking-heading"
            tone="dark"
            eyebrow="Tu ranking"
            title="Cada partido te sube en el ranking."
            accent="en el ranking."
          />
          <p className="mt-4 max-w-md text-white/80">
            Cada resultado mueve tu ranking, desbloquea logros y construye tu historial.
            Registra entrenamientos y raquetas, y llega a cada torneo sabiendo cómo estás de forma.
          </p>
          <Link
            href="/players"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ball-bright px-5 py-3 font-semibold text-court-ink transition-colors hover:bg-ball focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright"
          >
            {signedInUser ? "Abrir mi perfil" : "Ver mi perfil"}
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {imageUrl ? (
                // biome-ignore lint/performance/noImgElement: remote Clerk avatar, not a static asset
                <img src={imageUrl} alt={name} className="h-12 w-12 rounded-xl object-cover" />
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-court font-display text-lg font-black text-ball-bright">
                  {initials(name)}
                </span>
              )}
              <div>
                <p className="font-semibold text-white">{name}</p>
                <p className="text-sm text-white/60">@{handle}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-sm font-bold text-ball-bright">
              <TrendingUp className="h-4 w-4" />
              {winRate}%
            </span>
          </div>

          {/* Win-rate meter (real data when signed in) — glows like the floodlights. */}
          <div className="mt-5">
            <div className="mb-1 flex justify-between text-xs font-medium text-white/60">
              <span>Ratio de victorias (90 días)</span>
              <span className="text-ball-bright">
                {wins}/{played} ganados
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-court to-ball-bright"
                style={{ width: `${winRate}%`, boxShadow: "0 0 12px rgba(215, 255, 62, 0.45)" }}
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            {[
              { icon: Trophy, value: wins, label: "Victorias" },
              { icon: Award, value: achievementCount, label: "Logros" },
              { icon: TrendingUp, value: played, label: "Jugados" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.06] py-3">
                <s.icon className="mx-auto h-4 w-4 text-ball-bright" />
                <p className="mt-1 font-display text-lg font-black text-white">{s.value}</p>
                <p className="text-[11px] text-white/70">{s.label}</p>
              </div>
            ))}
          </div>

          {achievements.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {achievements.slice(0, 4).map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/80"
                >
                  {a}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
