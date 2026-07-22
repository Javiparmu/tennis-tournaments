import {
  countdown,
  dayMonth,
  formatDateRange,
  TOURNAMENT_STATUS_LABEL_PUBLIC,
  type TournamentBasic,
  type TournamentStatus,
} from "@courtrank/core";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, Clock, Trophy } from "lucide-react-native";
import { useEffect } from "react";
import { StyleSheet, Text, type TextStyle, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { statusTone } from "../lib/status-tone";
import { colors, surfaceColor } from "../theme/tokens";
import { Card } from "./ui/card";
import { Chip } from "./ui/chip";
import { Skeleton } from "./ui/skeleton";
import { SurfaceBadge } from "./ui/surface-badge";

// RN's fontVariant is a mutable FontVariant[], so a const-asserted tuple won't assign.
const TABULAR: TextStyle = { fontVariant: ["tabular-nums"] };

// Shared tournament list row (Inicio + Torneos + player profile). A calendar-style
// date tile anchors the row, tinted by the court surface so clay/hard/grass each read
// distinct; the right rail carries the status (a pulsing "en juego" for live, a trophy
// for finished). Surface colour comes from the dark-canvas lift in theme/tokens, not
// core's SURFACE_HEX, which is tuned for white and dulls here.
export function TournamentRow({ tournament, onPress }: { tournament: TournamentBasic; onPress: () => void }) {
  const { day, month } = dayMonth(tournament.startDate);
  const surf = surfaceColor(tournament.surface);

  return (
    <Card onPress={onPress} padded={false} className="p-3">
      <View className="flex-row items-stretch gap-3">
        {/* Date tile — the hero anchor. The gradient wash rides `style` because
            NativeWind drops `className` on LinearGradient with no type error. */}
        <View className="h-12 w-12 overflow-hidden rounded-xl border border-line bg-surface-2">
          <LinearGradient
            colors={[`${surf}33`, `${surf}0A`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View className="flex-1 items-center justify-center">
            <Text className="font-display-black text-xl leading-none text-ink" style={TABULAR}>
              {day}
            </Text>
            <Text className="mt-0.5 font-mono text-[10px] uppercase tracking-[1px] text-ink-muted">{month}</Text>
          </View>
        </View>

        {/* Body */}
        <View className="flex-1 justify-center gap-1.5">
          <Text className="font-display text-base leading-tight text-ink" numberOfLines={1}>
            {tournament.name}
          </Text>
          <View className="flex-row items-center gap-2">
            <SurfaceBadge surface={tournament.surface} />
            <TimeSignal tournament={tournament} />
          </View>
        </View>

        {/* Right rail: tap affordance up top, status pill anchored to the bottom.
            The inner flex-row overrides the pills' own `self-start` so they hug the
            right edge regardless. */}
        <View className="justify-between">
          <View className="flex-row justify-end">
            <ChevronRight color={colors.inkFaint} size={18} />
          </View>
          <View className="flex-row justify-end">
            <StatusPill status={tournament.status} />
          </View>
        </View>
      </View>
    </Card>
  );
}

// Secondary detail under the name: a lime countdown while a tournament is still
// upcoming, the muted date range once it has finished, nothing while it is live (the
// pulsing pill carries that) or cancelled (the danger chip does).
function TimeSignal({ tournament }: { tournament: TournamentBasic }) {
  if (tournament.status === "DRAFT") {
    return (
      <View className="flex-row items-center gap-1">
        <Clock color={colors.lime} size={12} />
        <Text className="font-mono text-xs uppercase text-lime">{countdown(tournament.startDate)}</Text>
      </View>
    );
  }
  if (tournament.status === "COMPLETED") {
    return (
      <Text className="font-mono text-xs uppercase text-ink-faint">
        {formatDateRange(tournament.startDate, tournament.endDate)}
      </Text>
    );
  }
  return null;
}

// Status uses the shared Chip for the quiet states; STARTED and COMPLETED get louder
// custom pills (live pulse / trophy) that the flat Chip can't express.
function StatusPill({ status }: { status: TournamentStatus }) {
  const label = TOURNAMENT_STATUS_LABEL_PUBLIC[status];

  if (status === "STARTED") {
    return (
      <View className="flex-row items-center gap-1.5 self-start rounded-full bg-live/15 px-2.5 py-1">
        <LivePulseDot />
        <Text className="font-mono-medium text-[11px] uppercase tracking-[1px] text-live">{label}</Text>
      </View>
    );
  }

  if (status === "COMPLETED") {
    return (
      <View className="flex-row items-center gap-1.5 self-start rounded-full bg-lime/15 px-2.5 py-1">
        <Trophy color={colors.lime} size={12} />
        <Text className="font-mono-medium text-[11px] uppercase tracking-[1px] text-lime">{label}</Text>
      </View>
    );
  }

  return <Chip label={label} tone={statusTone(status)} />;
}

// "Live" beacon: a solid amber dot under an expanding ring that fades as it grows.
// The ring animates through `style` only — NativeWind drops `className` on Animated.*.
// Reduced-motion renders the bare dot with no ring.
function LivePulseDot() {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    t.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.ease) }), -1, false);
  }, [reduced, t]);

  const ring = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + t.value * 1.6 }],
    opacity: 0.5 * (1 - t.value),
  }));

  return (
    <View className="h-2 w-2 items-center justify-center">
      {reduced ? null : (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              height: 8,
              width: 8,
              borderRadius: 4,
              backgroundColor: colors.live,
            },
            ring,
          ]}
        />
      )}
      <View style={{ height: 8, width: 8, borderRadius: 4, backgroundColor: colors.live }} />
    </View>
  );
}

// Space-reserving loader that matches the row's height exactly, so lists never shift
// when data resolves. Both list screens import this instead of re-declaring a height.
export function TournamentRowSkeleton() {
  return <Skeleton className="h-[76px] w-full rounded-2xl" />;
}
