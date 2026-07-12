import { normalizeSearch } from "@courtrank/core";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Card, EmptyState, Field, Hero, Skeleton } from "../../components/ui";
import { useUsersQuery } from "../../data/queries/users";

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
    return sorted.filter(({ user }) => normalizeSearch(user.name ?? user.username).includes(needle));
  }, [data, query]);

  return (
    <View className="flex-1 bg-ink">
      <Hero title="Ranking">
        <Field placeholder="Buscar jugador…" value={query} onChangeText={setQuery} autoCapitalize="none" />
      </Hero>
      <ScrollView contentContainerClassName="gap-2 px-5 py-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {isLoading ? (
          [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)
        ) : isError ? (
          <EmptyState title="No se pudo cargar el ranking" description="Inténtalo de nuevo más tarde." />
        ) : ranked.length === 0 ? (
          <EmptyState title="Sin jugadores" />
        ) : (
          ranked.map(({ user, rank }) => (
            <Card key={user.id} onPress={() => router.push(`/players/${user.username}`)}>
              <View className="flex-row items-center gap-3">
                <Text className="w-7 text-center text-base font-bold text-paper/40">{rank}</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-paper" numberOfLines={1}>
                    {user.name ?? user.username}
                  </Text>
                  <Text className="text-xs text-paper/50">
                    {user.matchWins ?? 0} victorias
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-base font-bold text-clay">{user.rating ?? 1000}</Text>
                  <Text className="text-xs text-paper/40">puntos</Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}
