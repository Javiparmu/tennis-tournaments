import { formatScore, type Match, MATCH_STATUS_LABEL, PHASE_FORMAT_LABEL, type Player, type TournamentBracket } from "@courtrank/core";
import { Text, View } from "react-native";
import { Card } from "../ui";

// Mobile bracket: phase → round → match cards. A vertical, scannable layout
// (an SVG connector tree reads poorly on a phone); winners are highlighted.
export function Bracket({ bracket }: { bracket: TournamentBracket }) {
  if (bracket.phases.every((phase) => phase.rounds.every((round) => round.matches.length === 0))) {
    return <Text className="text-sm text-paper/50">El cuadro aún no está disponible.</Text>;
  }
  return (
    <View className="gap-5">
      {bracket.phases.map((phase) => (
        <View key={phase.id} className="gap-3">
          <Text className="text-base font-semibold text-paper">{PHASE_FORMAT_LABEL[phase.format]}</Text>
          {phase.rounds.map((round) => (
            <View key={round.round} className="gap-2">
              <Text className="text-xs font-medium uppercase tracking-wide text-paper/40">Ronda {round.round}</Text>
              {round.matches.map((match) => (
                <BracketMatch key={match.id} match={match} />
              ))}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function BracketMatch({ match }: { match: Match }) {
  const p1Wins = match.winnerId != null && match.player1?.id === match.winnerId;
  const p2Wins = match.winnerId != null && match.player2?.id === match.winnerId;
  const score = match.score ? formatScore(match.score, match.status) : null;
  return (
    <Card>
      <PlayerLine player={match.player1} winner={p1Wins} />
      <View className="my-2 h-px bg-paper/10" />
      <PlayerLine player={match.player2} winner={p2Wins} />
      <Text className="mt-2 text-xs text-paper/50">{score ?? MATCH_STATUS_LABEL[match.status]}</Text>
    </Card>
  );
}

function PlayerLine({ player, winner }: { player: Player | null; winner: boolean }) {
  return (
    <Text
      className={`text-base ${winner ? "font-bold text-clay" : "text-paper"}`}
      numberOfLines={1}
    >
      {player?.name ?? "Por definir"}
    </Text>
  );
}
