import { normalizeSearch } from "@courtrank/core";
import { useRouter } from "expo-router";
import { CircleAlert, Search, SearchX } from "lucide-react-native";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { TournamentRow, TournamentRowSkeleton } from "../../components/tournament-row";
import { EmptyState, Field, Hero, Screen } from "../../components/ui";
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
    <Screen
      tabBar
      hero={
        <Hero compact eyebrow="COMPETICIÓN" title="Torneos">
          <Field
            icon={Search}
            placeholder="Buscar torneo…"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
        </Hero>
      }
    >
      {/* Rows hug at gap-2 like every Section list — Screen's gap-4 is the group gap. */}
      <View className="gap-2">
        {isLoading ? (
          [0, 1, 2, 3].map((i) => <TournamentRowSkeleton key={i} />)
        ) : isError ? (
          <EmptyState
            icon={CircleAlert}
            title="No se pudieron cargar los torneos"
            description="Inténtalo de nuevo más tarde."
          />
        ) : filtered.length === 0 ? (
          <EmptyState icon={SearchX} title="Sin resultados" description="Prueba con otro término de búsqueda." />
        ) : (
          filtered.map((tournament) => (
            <TournamentRow
              key={tournament.id}
              tournament={tournament}
              onPress={() => router.push(`/tournament/${tournament.id}`)}
            />
          ))
        )}
      </View>
    </Screen>
  );
}
