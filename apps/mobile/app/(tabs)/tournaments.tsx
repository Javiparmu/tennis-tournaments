import { normalizeSearch } from "@courtrank/core";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { EmptyState, Field, Hero, Skeleton } from "../../components/ui";
import { TournamentRow } from "../../components/tournament-row";
import { useTournamentsQuery } from "../../data/queries/tournaments";

export default function TournamentsScreen() {
  const router = useRouter();
  const { data, isLoading, isError } = useTournamentsQuery();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    const needle = normalizeSearch(query);
    if (!needle) return data;
    return data.filter((tournament) => normalizeSearch(tournament.name).includes(needle));
  }, [data, query]);

  return (
    <View className="flex-1 bg-ink">
      <Hero title="Torneos">
        <Field placeholder="Buscar torneo…" value={query} onChangeText={setQuery} autoCapitalize="none" />
      </Hero>
      <ScrollView contentContainerClassName="gap-3 px-5 py-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {isLoading ? (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : isError ? (
          <EmptyState title="No se pudieron cargar los torneos" description="Inténtalo de nuevo más tarde." />
        ) : filtered.length === 0 ? (
          <EmptyState title="Sin resultados" description="Prueba con otro término de búsqueda." />
        ) : (
          filtered.map((tournament) => (
            <TournamentRow
              key={tournament.id}
              tournament={tournament}
              onPress={() => router.push(`/tournament/${tournament.id}`)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
