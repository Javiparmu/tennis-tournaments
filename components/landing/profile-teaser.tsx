"use client";

import { useUser } from "@clerk/nextjs";
import { Award, TrendingUp, Trophy } from "lucide-react";
import Link from "next/link";
import { FadeContent } from "@/components/react-bits/FadeContent";
import { useMeQuery, useUserMatchActivityQuery } from "@/data/queries";

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
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <FadeContent>
          <p className="font-display text-sm font-bold uppercase tracking-wide text-court">Tu perfil</p>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-court-ink md:text-4xl">
            Cada partido construye tu historial.
          </h2>
          <p className="mt-4 max-w-md text-zinc-600">
            Gana y tu historial sube. Desbloquea logros, registra entrenamientos y raquetas, y sigue tu
            estado de forma en cada torneo que juegas — todo en un perfil gamificado.
          </p>
          <Link
            href="/profile"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-court/20 bg-white px-5 py-3 font-semibold text-court-ink transition-colors hover:bg-court/5"
          >
            {signedInUser ? "Abrir mi perfil" : "Ver mi perfil"}
          </Link>
        </FadeContent>

        <FadeContent delay={0.1}>
          <div className="rounded-2xl border border-court/10 bg-white p-6 shadow-md">
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
                  <p className="font-semibold text-court-ink">{name}</p>
                  <p className="text-sm text-zinc-500">@{handle}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-lg bg-court/5 px-2 py-1 text-sm font-bold text-court">
                <TrendingUp className="h-4 w-4" />
                {winRate}%
              </span>
            </div>

            {/* Win-rate meter (real data when signed in). */}
            <div className="mt-5">
              <div className="mb-1 flex justify-between text-xs font-medium text-zinc-500">
                <span>Ratio de victorias (90 días)</span>
                <span className="text-court">
                  {wins}/{played} ganados
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-court/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-court to-ball-bright"
                  style={{ width: `${winRate}%` }}
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              {[
                { icon: Trophy, value: wins, label: "Victorias" },
                { icon: Award, value: achievementCount, label: "Logros" },
                { icon: TrendingUp, value: played, label: "Jugados" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-court/5 py-3">
                  <s.icon className="mx-auto h-4 w-4 text-court" />
                  <p className="mt-1 font-display text-lg font-black text-court-ink">{s.value}</p>
                  <p className="text-[11px] text-zinc-500">{s.label}</p>
                </div>
              ))}
            </div>

            {achievements.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {achievements.slice(0, 4).map((a) => (
                  <span
                    key={a}
                    className="rounded-full border border-court/15 bg-court/5 px-3 py-1 text-xs font-medium text-court"
                  >
                    {a}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </FadeContent>
      </div>
    </section>
  );
}
