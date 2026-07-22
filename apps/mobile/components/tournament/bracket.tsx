import {
  MATCH_STATUS_LABEL,
  type Match,
  PHASE_FORMAT_LABEL,
  type Player,
  type SetScore,
  type TournamentBracket,
} from "@courtrank/core";
import { Check, GitFork } from "lucide-react-native";
import { Text, type TextStyle, View } from "react-native";
import { colors } from "../../theme/tokens";
import { Chip, type ChipTone, ListCard, SectionHeader } from "../ui";

const TABULAR: TextStyle = { fontVariant: ["tabular-nums"] };

type IdentifiedSet = SetScore & { id: string };

// Mobile bracket: phase → round → match rows. A vertical, scannable layout (an SVG
// connector tree reads poorly on a phone); each round is one card whose header row
// names it and whose matches follow as hairline-divided rows, so the grouping reads
// without a rail pretending to be a tree.
export function Bracket({ bracket }: { bracket: TournamentBracket }) {
  if (bracket.phases.every((phase) => phase.rounds.every((round) => round.matches.length === 0))) {
    return <Text className="font-sans text-sm text-ink-muted">El cuadro aún no está disponible.</Text>;
  }
  return (
    <View className="gap-4">
      {bracket.phases.map((phase) => (
        <View key={phase.id} className="gap-2">
          <SectionHeader icon={GitFork} eyebrow="FASE" title={PHASE_FORMAT_LABEL[phase.format]} />
          {phase.rounds.map((round) => (
            <ListCard key={round.round}>
              <Text className="bg-surface-2 px-4 py-2 font-mono text-[11px] uppercase tracking-[1px] text-ink-muted">
                Ronda {round.round}
              </Text>
              {round.matches.map((match) => (
                <BracketMatch key={match.id} match={match} />
              ))}
            </ListCard>
          ))}
        </View>
      ))}
    </View>
  );
}

function BracketMatch({ match }: { match: Match }) {
  const p1Wins = match.winnerId != null && match.player1?.id === match.winnerId;
  const p2Wins = match.winnerId != null && match.player2?.id === match.winnerId;
  const live = match.status === "LIVE";
  // A walkover has no games worth showing even when the backend records sets —
  // the chip says everything.
  const raw = match.status === "WALKOVER" ? [] : (match.score?.sets ?? []);
  // The payload gives sets no id, but a set has a real identity: it is the nth set
  // of this match. Pinning that here keeps both player rows keyed off the same
  // ordinal instead of a bare array position.
  const sets: IdentifiedSet[] = raw.map((set, index) => ({ ...set, id: `${match.id}-set-${index + 1}` }));

  // The chip is the fallback for everything the set columns cannot say: a match
  // with no games yet, a retirement, or the fact that these games are still moving.
  const tone: ChipTone | null = live ? "live" : sets.length === 0 ? "neutral" : null;

  return (
    <View className={`gap-2 p-3 ${live ? "bg-live/5" : ""}`}>
      {tone ? <Chip label={MATCH_STATUS_LABEL[match.status]} tone={tone} /> : null}
      <PlayerLine player={match.player1} winner={p1Wins} sets={sets} side="player1" />
      <View className="h-px bg-lime/10" />
      <PlayerLine player={match.player2} winner={p2Wins} sets={sets} side="player2" />
    </View>
  );
}

function PlayerLine({
  player,
  winner,
  sets,
  side,
}: {
  player: Player | null;
  winner: boolean;
  sets: IdentifiedSet[];
  side: "player1" | "player2";
}) {
  const nameClass = !player
    ? "font-sans italic text-ink-faint"
    : winner
      ? "font-sans-semibold text-ink"
      : "font-sans text-ink-muted";

  return (
    <View className="flex-row items-center gap-2">
      {/* The accent rail keeps its width on losing rows so both names start on the
          same x — only its colour changes. */}
      <View className={`h-5 w-[3px] rounded-full ${winner ? "bg-lime" : "bg-transparent"}`} />
      <Text className={`flex-1 ${nameClass}`} numberOfLines={1}>
        {player?.name ?? "Por definir"}
      </Text>
      {winner ? <Check color={colors.lime} size={14} /> : null}
      {sets.map((set) => (
        <Text
          key={set.id}
          className={`w-7 text-right font-mono-medium text-sm ${winner ? "text-ink" : "text-ink-faint"}`}
          style={TABULAR}
        >
          {side === "player1" ? set.player1Games : set.player2Games}
          {set.tiebreak ? (
            <Text className="font-mono text-[9px]">
              {side === "player1" ? set.tiebreak.player1Points : set.tiebreak.player2Points}
            </Text>
          ) : null}
        </Text>
      ))}
    </View>
  );
}
