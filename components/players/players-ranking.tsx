"use client";

import { Trophy } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { rankUsers } from "@/components/players/rank-users";
import { useUsersQuery } from "@/data/queries";
import type { User } from "@/models";

function initials(value: string) {
  return value
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

// Shared column template so the header and every row line up like a real table.
// Tighter rank column and gaps on small screens leave more room for player names.
const GRID =
  "grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-4";

function TableHeader() {
  return (
    <div
      aria-hidden
      className={`${GRID} border-b border-court/10 px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400 sm:px-5`}
    >
      <span>Pos</span>
      <span>Jugador</span>
      <span className="text-right">Puntos</span>
    </div>
  );
}

function Avatar({ imageUrl, name, dark }: { imageUrl: string | null; name: string; dark?: boolean }) {
  if (imageUrl) {
    return (
      // biome-ignore lint/performance/noImgElement: remote Clerk avatar, not a static asset
      <img
        src={imageUrl}
        alt=""
        className={`h-10 w-10 shrink-0 rounded-xl object-cover ring-2 ${dark ? "ring-ball-bright/40" : "ring-court/15"}`}
      />
    );
  }
  return (
    <span
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display text-sm font-black ${
        dark
          ? "bg-ball-bright/15 text-ball-bright ring-2 ring-ball-bright/40"
          : "bg-gradient-to-br from-court to-court-hover text-ball-bright ring-2 ring-court/15"
      }`}
    >
      {initials(name)}
    </span>
  );
}

function RankingRow({ user, position }: { user: User; position: number }) {
  const displayName = user.name ?? user.username;
  // Rating is the ranked value; wins ride along as a smaller secondary line.
  // Note: `matchWins` also counts walkover wins, whereas rating does not move on
  // a walkover (not a played match), so the two numbers can legitimately diverge.
  const rating = user.rating ?? 1000;
  const wins = user.matchWins ?? 0;
  const isFirst = position === 1;
  const isPodium = position <= 3;

  if (isFirst) {
    // Signature row: the leader gets a scoreboard strip — court green, ball-bright digits.
    return (
      <Link
        href={`/players/${encodeURIComponent(user.username)}`}
        prefetch={false}
        className={`${GRID} relative overflow-hidden bg-court px-4 py-4 transition-colors hover:bg-court-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ball-bright sm:px-5`}
      >
        <div aria-hidden className="glow absolute -right-8 -top-16 h-40 w-40" />
        <span className="font-display text-3xl font-black leading-none text-ball-bright">1</span>
        <span className="flex min-w-0 items-center gap-3">
          <Avatar imageUrl={user.imageUrl} name={displayName} dark />
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-black tracking-tight text-white">
              {displayName}
            </span>
            <span className="block truncate text-sm text-white/60">@{user.username}</span>
          </span>
        </span>
        <span className="text-right">
          <span className="block font-mono text-2xl font-bold tabular-nums leading-none text-ball-bright">
            {rating}
          </span>
          <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
            puntos
          </span>
          <span className="mt-1 block font-mono text-[11px] tabular-nums text-white/45">
            {wins} victorias
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={`/players/${encodeURIComponent(user.username)}`}
      prefetch={false}
      className={`${GRID} px-4 py-3 transition-colors hover:bg-court/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-court sm:px-5 ${
        isPodium ? "bg-court/[0.03]" : ""
      }`}
    >
      <span
        className={`font-display text-xl font-black leading-none ${isPodium ? "text-court" : "text-zinc-300"}`}
      >
        {position}
      </span>
      <span className="flex min-w-0 items-center gap-3">
        <Avatar imageUrl={user.imageUrl} name={displayName} />
        <span className="min-w-0">
          <span className="block truncate font-semibold text-court-ink">{displayName}</span>
          <span className="block truncate text-sm text-zinc-500">@{user.username}</span>
        </span>
      </span>
      <span className="text-right">
        <span className="block font-mono text-lg font-bold tabular-nums leading-none text-court-ink">
          {rating}
        </span>
        <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
          puntos
        </span>
        <span className="mt-1 block font-mono text-[11px] tabular-nums text-zinc-400">
          {wins} victorias
        </span>
      </span>
    </Link>
  );
}

function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-court/10 bg-white shadow-sm">
      <TableHeader />
      {children}
    </div>
  );
}

function SkeletonRows() {
  return (
    <TableShell>
      <div className="divide-y divide-court/5">
        {Array.from({ length: 6 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton, order never changes
          <div key={i} className={`${GRID} px-4 py-3 sm:px-5`}>
            <span className="h-6 w-6 animate-pulse rounded bg-court/10" />
            <span className="flex items-center gap-3">
              <span className="h-10 w-10 animate-pulse rounded-xl bg-court/10" />
              <span className="h-4 w-36 animate-pulse rounded bg-court/10" />
            </span>
            <span className="h-6 w-8 animate-pulse rounded bg-court/10" />
          </div>
        ))}
      </div>
    </TableShell>
  );
}

export function PlayersRanking() {
  const { data, isLoading, isError } = useUsersQuery();

  if (isLoading) {
    return <SkeletonRows />;
  }

  if (isError) {
    return <p className="text-rose-600">No se pudo cargar el ranking.</p>;
  }

  const ranked = rankUsers(data ?? []);

  if (ranked.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="Ranking vacío"
        description="Todavía no hay jugadores clasificados. Aparecerán al competir en torneos."
      />
    );
  }

  return (
    <TableShell>
      <ol className="divide-y divide-court/5">
        {ranked.map((user, index) => (
          <li key={user.id}>
            <RankingRow user={user} position={index + 1} />
          </li>
        ))}
      </ol>
    </TableShell>
  );
}
