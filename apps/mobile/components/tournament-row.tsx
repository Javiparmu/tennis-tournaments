import { dayMonth, TOURNAMENT_STATUS_LABEL_PUBLIC, type TournamentBasic } from "@courtrank/core";
import { Text, View } from "react-native";
import { statusTone } from "../lib/status-tone";
import { Card } from "./ui/card";
import { Chip } from "./ui/chip";
import { SurfaceBadge } from "./ui/surface-badge";

// Shared tournament list row (Inicio + Torneos).
export function TournamentRow({ tournament, onPress }: { tournament: TournamentBasic; onPress: () => void }) {
  const start = dayMonth(tournament.startDate);
  return (
    <Card onPress={onPress}>
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 gap-2">
          <Text className="text-base font-semibold text-paper" numberOfLines={1}>
            {tournament.name}
          </Text>
          <View className="flex-row items-center gap-2">
            <SurfaceBadge surface={tournament.surface} />
            <Text className="text-xs text-paper/50">{`${start.day} ${start.month}`}</Text>
          </View>
        </View>
        <Chip label={TOURNAMENT_STATUS_LABEL_PUBLIC[tournament.status]} tone={statusTone(tournament.status)} />
      </View>
    </Card>
  );
}
