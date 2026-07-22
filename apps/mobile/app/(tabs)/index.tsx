import { countdown, dayMonth, upcomingCalendar } from "@courtrank/core";
import { useRouter } from "expo-router";
import { CalendarDays, CalendarX, CircleAlert, Clock, TrendingDown, TrendingUp } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, type TextStyle, View } from "react-native";
import { TournamentRow, TournamentRowSkeleton } from "../../components/tournament-row";
import { Avatar, Button, Card, EmptyState, Screen, Section, Skeleton, Sparkline, Stat } from "../../components/ui";
import { useMyTournamentsQuery, useUpcomingCalendarQuery } from "../../data/queries/tournaments";
import { useMeQuery, useUserRatingHistoryQuery } from "../../data/queries/users";
import { colors, surfaceColor } from "../../theme/tokens";

// Enough points to show a shape without the line turning to noise at CHART_H tall.
const HISTORY_LIMIT = 20;
// The same threshold the web league table uses for its "Provisional" badge
// (apps/web/app/leagues/[id]/_components/league-page-client.tsx). Kept in step by
// hand — there is no shared constant for it yet.
const PROVISIONAL_MATCHES = 10;
// Typed as TextStyle rather than `as const`: RN's fontVariant is a mutable
// FontVariant[], so a const-asserted readonly tuple will not assign to it.
const TABULAR: TextStyle = { fontVariant: ["tabular-nums"] };
// Named because the skeleton has to reserve exactly this: the sparkline is measured
// at runtime, so its box is the one thing that would otherwise pop in.
const CHART_H = "h-16";

function RatingCard({ rating, ratedMatches, series }: { rating: number; ratedMatches: number; series: number[] }) {
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(0);
  // The delta describes the curve actually drawn — first to last point of the same
  // window — so the number and the shape can never disagree.
  const delta = series.length >= 2 ? series[series.length - 1] - series[0] : 0;
  const up = delta >= 0;
  const provisional = ratedMatches < PROVISIONAL_MATCHES;

  return (
    <Card className="gap-2">
      <View className="flex-row items-start justify-between">
        <Text className="font-mono text-[11px] uppercase tracking-[2px] text-ink-faint">Tu elo</Text>
        {delta !== 0 ? (
          <View className={`flex-row items-center gap-1 rounded-full px-2 py-1 ${up ? "bg-lime/15" : "bg-danger/15"}`}>
            {up ? <TrendingUp color={colors.lime} size={12} /> : <TrendingDown color={colors.danger} size={12} />}
            <Text className={`font-mono-medium text-[11px] ${up ? "text-lime" : "text-danger"}`} style={TABULAR}>
              {up ? "+" : ""}
              {delta}
            </Text>
          </View>
        ) : null}
      </View>

      <Text className="font-display-black text-5xl tracking-tight text-ink" style={TABULAR}>
        {rating}
      </Text>

      <View
        className={CHART_H}
        onLayout={(event) => {
          setChartWidth(event.nativeEvent.layout.width);
          setChartHeight(event.nativeEvent.layout.height);
        }}
      >
        {chartWidth > 0 ? (
          <Sparkline values={series} width={chartWidth} height={chartHeight} color={up ? colors.lime : colors.danger} />
        ) : null}
      </View>

      <Text className="font-mono text-[11px] uppercase tracking-[1.5px] text-ink-faint">
        {provisional ? `${ratedMatches}/${PROVISIONAL_MATCHES} partidos · provisional` : `${ratedMatches} partidos`}
      </Text>
    </Card>
  );
}

function RatingCardSkeleton() {
  return (
    <Card className="gap-2">
      <Skeleton className="h-3 w-16 rounded-md" />
      <Skeleton className="h-12 w-32 rounded-lg" />
      <Skeleton className={`${CHART_H} w-full rounded-lg`} />
      <Skeleton className="h-3 w-24 rounded-md" />
    </Card>
  );
}

function BentoCardSkeleton() {
  return (
    <Card className="flex-1 gap-3">
      <Skeleton className="h-3 w-16 rounded-md" />
      <Skeleton className="h-10 w-20 rounded-lg" />
      <Skeleton className="h-3 w-20 rounded-md" />
    </Card>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { data: me, isLoading: meLoading } = useMeQuery();
  const { data: history } = useUserRatingHistoryQuery(me?.id, HISTORY_LIMIT);
  const { data: myTournaments, isLoading: mineLoading } = useMyTournamentsQuery();
  const { data: upcoming, isLoading, isError } = useUpcomingCalendarQuery(5);

  // The endpoint documents newest-first, but sort on createdAt anyway — the same
  // thing rating-chart.tsx does, so the series cannot silently invert if that
  // ordering ever changes.
  const series = useMemo(() => {
    if (!history) return [];
    return [...history]
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
      .map((event) => event.ratingAfter);
  }, [history]);

  // Reuses core's pure upcoming filter rather than re-deriving "next" here: it
  // already drops ended/past tournaments and sorts soonest-first.
  const next = useMemo(() => upcomingCalendar(myTournaments ?? [], 1)[0], [myTournaments]);
  const nextStart = next ? dayMonth(next.startDate) : null;

  const ready = !meLoading && me != null;
  const name = me?.name ?? me?.username ?? "";

  return (
    <Screen tabBar>
      <View className="flex-row items-center gap-3">
        {ready ? (
          <Avatar size={44} imageUrl={me.imageUrl} name={name} />
        ) : (
          <Skeleton className="h-11 w-11 rounded-2xl" />
        )}
        <View className="flex-1 gap-1">
          <Text className="font-mono text-[11px] uppercase tracking-[2px] text-ink-faint">Inicio</Text>
          {ready ? (
            <Text className="font-display-black text-2xl tracking-tight text-ink" numberOfLines={1}>
              {name}
            </Text>
          ) : (
            <Skeleton className="h-7 flex-1 rounded-lg" />
          )}
        </View>
      </View>

      {ready ? (
        <RatingCard rating={me.rating ?? 1000} ratedMatches={me.ratedMatches ?? 0} series={series} />
      ) : (
        <RatingCardSkeleton />
      )}

      <View className="flex-row gap-4">
        {ready ? (
          <Card className="flex-1 justify-between gap-2">
            <Stat size="lg" accent value={me.matchWins ?? 0} label="Victorias" />
            <Text className="font-mono text-xs uppercase text-ink-faint">{`${me.achievements?.length ?? 0} logros`}</Text>
          </Card>
        ) : (
          <BentoCardSkeleton />
        )}

        {mineLoading ? (
          <BentoCardSkeleton />
        ) : next && nextStart ? (
          <Card
            onPress={() => router.push(`/tournament/${next.id}`)}
            accent={surfaceColor(next.surface)}
            className="flex-1 justify-between gap-3 pt-5"
          >
            <Text className="font-mono text-[11px] uppercase tracking-[2px] text-ink-faint">Próximo</Text>
            <Text className="font-display text-base leading-tight text-ink" numberOfLines={2}>
              {next.name}
            </Text>
            <View className="flex-row items-center gap-1.5">
              <CalendarDays color={colors.lime} size={12} />
              <Text className="font-mono text-xs uppercase text-lime">{`${nextStart.day} ${nextStart.month}`}</Text>
              <Clock color={colors.lime} size={12} />
              <Text className="font-mono text-xs uppercase text-lime">{countdown(next.startDate)}</Text>
            </View>
          </Card>
        ) : (
          <Card className="flex-1 justify-between gap-3">
            <Text className="font-mono text-[11px] uppercase tracking-[2px] text-ink-faint">Próximo</Text>
            <Text className="font-display text-base leading-tight text-ink-muted">Sin torneos</Text>
            <Text className="font-mono text-xs uppercase text-ink-faint">Inscríbete</Text>
          </Card>
        )}
      </View>

      <Section
        icon={CalendarDays}
        eyebrow="AGENDA"
        title="Siguientes en el calendario"
        action={
          <Pressable hitSlop={8} onPress={() => router.push("/tournaments")}>
            <Text className="font-mono text-[11px] uppercase tracking-[1px] text-lime">Ver todos</Text>
          </Pressable>
        }
      >
        {isLoading ? (
          [0, 1, 2].map((i) => <TournamentRowSkeleton key={i} />)
        ) : isError ? (
          <EmptyState
            icon={CircleAlert}
            title="No se pudieron cargar los torneos"
            description="Inténtalo de nuevo más tarde."
          />
        ) : !upcoming || upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title="Sin torneos próximos"
            description="Vuelve pronto para ver nuevos torneos."
            action={<Button label="Explorar torneos" variant="secondary" onPress={() => router.push("/tournaments")} />}
          />
        ) : (
          upcoming.map((tournament) => (
            <TournamentRow
              key={tournament.id}
              tournament={tournament}
              onPress={() => router.push(`/tournament/${tournament.id}`)}
            />
          ))
        )}
      </Section>
    </Screen>
  );
}
