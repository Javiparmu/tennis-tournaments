import { normalizeSearch, type User } from "@courtrank/core";
import { useRouter } from "expo-router";
import { CircleAlert, Search, SearchX } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, type TextStyle, View } from "react-native";
import { Avatar, Card, EmptyState, Field, Hero, PressableScale, Screen, Skeleton } from "../../components/ui";
import { useUsersQuery } from "../../data/queries/users";
import { colors } from "../../theme/tokens";

const TABULAR: TextStyle = { fontVariant: ["tabular-nums"] };
const MICRO = "font-mono text-[10px] uppercase tracking-[1.8px]";
const HEAD = "font-mono text-[11px] uppercase tracking-[2px] text-ink-faint";

function displayName(user: User): string {
  return user.name ?? user.username;
}

// The #1 spot gets the scoreboard treatment — the solid lime strip with ink
// numerals, the same "leader is a trophy, not a row" idea as the web table. On the
// dark canvas the inversion runs the other way round from the old court-green strip:
// lime is now the loud fill, so the leader is the one row that is not a surface.
function LeaderRow({ user, onPress }: { user: User; onPress: () => void }) {
  return (
    <PressableScale className="flex-row items-center gap-3 bg-lime px-4 py-4 active:opacity-90" onPress={onPress}>
      <Text className="w-8 text-center font-display-black text-3xl text-canvas">1</Text>
      <Avatar imageUrl={user.imageUrl} name={displayName(user)} size={44} />
      <View className="flex-1 gap-0.5">
        <Text className="font-display text-lg tracking-tight text-canvas" numberOfLines={1}>
          {displayName(user)}
        </Text>
        <Text className="font-sans text-sm text-canvas/70" numberOfLines={1}>
          @{user.username}
        </Text>
      </View>
      <View className="items-end gap-0.5">
        <Text className="font-mono-bold text-2xl text-canvas" style={TABULAR}>
          {user.rating ?? 1000}
        </Text>
        <Text className={`${MICRO} text-canvas/60`}>Puntos</Text>
        <Text className="font-mono text-[11px] text-canvas/50">{user.matchWins ?? 0} victorias</Text>
      </View>
    </PressableScale>
  );
}

function PlayerRow({ user, rank, onPress }: { user: User; rank: number; onPress: () => void }) {
  const podium = rank <= 3;

  return (
    <Pressable
      className={`h-16 flex-row items-center gap-3 border-t border-line px-4 active:bg-surface-2 ${
        podium ? "bg-lime/[0.04]" : ""
      }`}
      onPress={onPress}
    >
      <Text className={`w-8 text-center font-display text-xl ${podium ? "text-lime" : "text-ink-faint"}`}>{rank}</Text>
      <Avatar imageUrl={user.imageUrl} name={displayName(user)} size={36} />
      <View className="flex-1">
        <Text className="font-sans-semibold text-ink" numberOfLines={1}>
          {displayName(user)}
        </Text>
        <Text className="font-sans text-sm text-ink-muted" numberOfLines={1}>
          @{user.username}
        </Text>
      </View>
      <View className="items-end">
        <Text className="font-mono-bold text-lg text-ink" style={TABULAR}>
          {user.rating ?? 1000}
        </Text>
        <Text className={`${MICRO} text-ink-faint`}>Puntos</Text>
      </View>
    </Pressable>
  );
}

// Six rows at the real row height, so the table never jumps when data lands.
function RankingSkeleton() {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View key={i} className="h-16 flex-row items-center gap-3 border-t border-line px-4">
          <Skeleton className="h-5 w-8 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-xl" />
          <View className="flex-1 gap-1.5">
            <Skeleton className="h-4 w-2/5 rounded-md" />
            <Skeleton className="h-3 w-1/4 rounded-md" />
          </View>
          <Skeleton className="h-5 w-10 rounded-md" />
        </View>
      ))}
    </>
  );
}

export default function PlayersScreen() {
  const router = useRouter();
  const { data, isLoading, isError } = useUsersQuery();
  const [query, setQuery] = useState("");

  const ranked = useMemo(() => {
    if (!data) return [];
    const sorted = [...data]
      .sort((a, b) => (b.rating ?? 1000) - (a.rating ?? 1000))
      .map((user, index) => ({ user, rank: index + 1 }));
    const needle = normalizeSearch(query);
    if (!needle) return sorted;
    return sorted.filter(({ user }) => normalizeSearch(displayName(user)).includes(needle));
  }, [data, query]);

  return (
    <Screen
      tabBar
      hero={
        <Hero compact eyebrow="CLASIFICACIÓN" title="Ranking">
          <Field icon={Search} placeholder="Buscar jugador…" value={query} onChangeText={setQuery} autoCapitalize="none" />
        </Hero>
      }
    >
      {isError ? (
        <EmptyState
          icon={CircleAlert}
          title="No se pudo cargar el ranking"
          description="Inténtalo de nuevo más tarde."
        />
      ) : (
        <Card padded={false} className="overflow-hidden">
          <View className="flex-row items-center gap-3 border-b border-line px-4 py-2.5">
            <Text className={`w-8 text-center ${HEAD}`}>Pos</Text>
            <Text className={`flex-1 ${HEAD}`}>Jugador</Text>
            <Text className={HEAD}>Puntos</Text>
          </View>

          {isLoading ? (
            <RankingSkeleton />
          ) : ranked.length === 0 ? (
            <View className="items-center gap-2 px-4 py-10">
              <SearchX color={colors.inkFaint} size={22} />
              <Text className="text-center font-display text-base text-ink">Sin jugadores</Text>
              <Text className="text-center font-sans text-sm text-ink-muted">Prueba con otro término de búsqueda.</Text>
            </View>
          ) : (
            ranked.map(({ user, rank }) =>
              rank === 1 ? (
                <LeaderRow key={user.id} user={user} onPress={() => router.push(`/players/${user.username}`)} />
              ) : (
                <PlayerRow
                  key={user.id}
                  user={user}
                  rank={rank}
                  onPress={() => router.push(`/players/${user.username}`)}
                />
              ),
            )
          )}
        </Card>
      )}
    </Screen>
  );
}
