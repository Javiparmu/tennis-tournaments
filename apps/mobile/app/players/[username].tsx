import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { RatingChart } from "../../components/rating-chart";
import { Card, EmptyState, Hero, Skeleton } from "../../components/ui";
import { TournamentRow } from "../../components/tournament-row";
import { useUserByUsernameQuery, useUserRatingHistoryQuery, useUserTournamentsQuery } from "../../data/queries/users";

export default function PlayerProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { username } = useLocalSearchParams<{ username: string }>();

  const { data: user, isLoading, isError } = useUserByUsernameQuery(username);
  const { data: ratingHistory } = useUserRatingHistoryQuery(user?.id);
  const { data: tournaments } = useUserTournamentsQuery(user?.id);

  const chartWidth = width - 72;

  return (
    <View className="flex-1 bg-ink">
      <Hero title={user?.name ?? user?.username ?? "Jugador"} onBack={() => router.back()} />
      <ScrollView contentContainerClassName="gap-4 px-5 py-4" showsVerticalScrollIndicator={false}>
        {isError ? (
          <EmptyState title="Perfil no disponible" description="No pudimos cargar este jugador." />
        ) : isLoading || !user ? (
          <>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-40 w-full" />
          </>
        ) : (
          <>
            <Card>
              <Text className="text-xl font-bold text-paper">{user.name ?? user.username}</Text>
              <Text className="mt-0.5 text-sm text-paper/50">@{user.username}</Text>
              <View className="mt-4 flex-row gap-6">
                <Stat value={user.rating ?? 1000} label="puntos" accent />
                <Stat value={user.matchWins ?? 0} label="victorias" />
                <Stat value={user.ratedMatches ?? 0} label="partidos" />
              </View>
            </Card>

            {ratingHistory && ratingHistory.length >= 2 ? (
              <Card>
                <Text className="mb-3 text-sm font-medium text-paper/70">Progreso de puntos</Text>
                <RatingChart events={ratingHistory} width={chartWidth} />
              </Card>
            ) : null}

            {user.achievements.length > 0 ? (
              <View className="gap-2">
                <Text className="text-lg font-semibold text-paper">Logros</Text>
                {user.achievements.map((achievement) => (
                  <Card key={achievement.id}>
                    <Text className="text-base font-medium text-paper">{achievement.name}</Text>
                    {achievement.description ? (
                      <Text className="mt-0.5 text-sm text-paper/60">{achievement.description}</Text>
                    ) : null}
                  </Card>
                ))}
              </View>
            ) : null}

            {tournaments && tournaments.length > 0 ? (
              <View className="gap-2">
                <Text className="text-lg font-semibold text-paper">Torneos</Text>
                {tournaments.map((tournament) => (
                  <TournamentRow
                    key={tournament.id}
                    tournament={tournament}
                    onPress={() => router.push(`/tournament/${tournament.id}`)}
                  />
                ))}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Stat({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <View>
      <Text className={`text-2xl font-bold ${accent ? "text-clay" : "text-paper"}`}>{value}</Text>
      <Text className="text-xs text-paper/40">{label}</Text>
    </View>
  );
}
