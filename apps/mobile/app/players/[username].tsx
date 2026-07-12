import { useLocalSearchParams, useRouter } from "expo-router";
import { Pencil } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { ProfileEditSheet } from "../../components/profile/profile-edit-sheet";
import { RacketsTab } from "../../components/profile/rackets-tab";
import { TrainingsTab } from "../../components/profile/trainings-tab";
import { RatingChart } from "../../components/rating-chart";
import { TournamentRow } from "../../components/tournament-row";
import { Card, EmptyState, Hero, SegmentedTabs, Skeleton } from "../../components/ui";
import {
  useMeQuery,
  useUserByUsernameQuery,
  useUserRatingHistoryQuery,
  useUserTournamentsQuery,
} from "../../data/queries/users";
import { colors } from "../../theme/tokens";

type Tab = "resumen" | "raquetas" | "entrenos";

export default function PlayerProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { username } = useLocalSearchParams<{ username: string }>();

  const { data: user, isLoading, isError } = useUserByUsernameQuery(username);
  const { data: me } = useMeQuery();
  const { data: ratingHistory } = useUserRatingHistoryQuery(user?.id);
  const { data: tournaments } = useUserTournamentsQuery(user?.id);

  const [tab, setTab] = useState<Tab>("resumen");
  const [editOpen, setEditOpen] = useState(false);

  const isOwner = Boolean(me && user && me.id === user.id);
  const chartWidth = width - 72;

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: "resumen", label: "Resumen" },
    { key: "raquetas", label: "Raquetas" },
    ...(isOwner ? [{ key: "entrenos" as const, label: "Entrenos" }] : []),
  ];

  return (
    <View className="flex-1 bg-ink">
      <Hero
        title={user?.name ?? user?.username ?? "Jugador"}
        onBack={() => router.back()}
        right={
          isOwner ? (
            <Pressable
              onPress={() => setEditOpen(true)}
              className="h-9 w-9 items-center justify-center rounded-full bg-paper/10 active:opacity-70"
            >
              <Pencil color={colors.paper} size={18} />
            </Pressable>
          ) : undefined
        }
      />
      <ScrollView contentContainerClassName="gap-4 px-5 py-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {isError ? (
          <EmptyState title="Perfil no disponible" description="No pudimos cargar este jugador." />
        ) : isLoading || !user ? (
          <>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-40 w-full" />
          </>
        ) : (
          <>
            <SegmentedTabs tabs={tabs} value={tab} onChange={setTab} />

            {tab === "resumen" ? (
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
            ) : null}

            {tab === "raquetas" ? <RacketsTab userId={user.id} isOwner={isOwner} /> : null}
            {tab === "entrenos" && isOwner ? <TrainingsTab /> : null}
          </>
        )}
      </ScrollView>

      {me && isOwner ? <ProfileEditSheet visible={editOpen} onClose={() => setEditOpen(false)} me={me} /> : null}
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
