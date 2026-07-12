import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { EmptyState, Hero, Skeleton } from "../../components/ui";
import { TournamentRow } from "../../components/tournament-row";
import { useUpcomingCalendarQuery } from "../../data/queries/tournaments";

export default function HomeScreen() {
  const router = useRouter();
  const { data, isLoading, isError } = useUpcomingCalendarQuery(8);

  return (
    <View className="flex-1 bg-ink">
      <Hero title="Próximos torneos" subtitle="Inscríbete y sigue tu progreso." />
      <ScrollView contentContainerClassName="gap-3 px-5 py-4" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : isError ? (
          <EmptyState title="No se pudieron cargar los torneos" description="Inténtalo de nuevo más tarde." />
        ) : !data || data.length === 0 ? (
          <EmptyState title="Sin torneos próximos" description="Vuelve pronto para ver nuevos torneos." />
        ) : (
          data.map((tournament) => (
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
