"use client";

import { Button, Card, Chip } from "@heroui/react";
import type { UserProfileMatchEntry } from "@/lib/types";

type MatchModalProps = {
  match: UserProfileMatchEntry | null;
  onClose: () => void;
};

function formatScore(match: UserProfileMatchEntry) {
  if (!match.score) {
    return match.status === "WALKOVER" ? "Walkover" : "No score recorded";
  }

  return match.score.sets
    .map((set) => {
      const tiebreak = set.tiebreak ? ` (${set.tiebreak.player1Points}-${set.tiebreak.player2Points})` : "";
      return `${set.player1Games}-${set.player2Games}${tiebreak}`;
    })
    .join("  ");
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function MatchModal({ match, onClose }: MatchModalProps) {
  if (!match) {
    return null;
  }

  const primaryTime = match.completedAt ?? match.scheduledTime;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 px-4 py-8"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <Card className="w-full max-w-xl border border-zinc-200 bg-white shadow-2xl">
        <Card.Header className="flex items-start justify-between gap-4 p-5 pb-0">
          <div>
            <p className="text-lg font-semibold">{match.tournament.name}</p>
            <p className="text-sm text-zinc-500">
              {match.phase.format} phase · round {match.phase.round}
            </p>
          </div>
          <Button variant="ghost" className="text-zinc-700" onPress={onClose}>
            Close
          </Button>
        </Card.Header>
        <Card.Content className="gap-5 p-5">
          <div className="flex flex-wrap items-center gap-2">
            {match.result ? (
              <Chip color={match.result === "WIN" ? "success" : "danger"} variant="soft">
                {match.result}
              </Chip>
            ) : null}
            <Chip
              variant="soft"
              color={
                match.status === "WALKOVER"
                  ? "warning"
                  : match.status === "LIVE"
                    ? "warning"
                    : "default"
              }
            >
              {match.status}
            </Chip>
          </div>

          <div className="grid gap-4 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Opponent</p>
              <p className="mt-1 font-medium text-zinc-900">{match.opponent?.name ?? "No opponent recorded"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {match.completedAt ? "Completed" : "Scheduled"}
              </p>
              <p className="mt-1 font-medium text-zinc-900">{primaryTime ? formatDateTime(primaryTime) : "Not set"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Court</p>
              <p className="mt-1 font-medium text-zinc-900">{match.court ?? "Not assigned"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Score</p>
              <p className="mt-1 font-medium text-zinc-900">{formatScore(match)}</p>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
