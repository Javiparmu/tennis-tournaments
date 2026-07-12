import { useUser } from "@clerk/clerk-expo";
import {
  computeStandings,
  formatDateRange,
  JOIN_STATUS_LABEL,
  type Player,
  TOURNAMENT_STATUS_LABEL_PUBLIC,
  type Tournament,
  type TournamentJoinRequest,
} from "@courtrank/core";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Button, Card, Chip, EmptyState, Field, Hero, Skeleton, SurfaceBadge } from "../../components/ui";
import {
  useCreateJoinRequestMutation,
  useMyJoinRequestsQuery,
  useTournamentMatchesQuery,
  useTournamentPlayersQuery,
  useTournamentQuery,
  useWithdrawJoinRequestMutation,
} from "../../data/queries/tournaments";
import { joinStatusTone, statusTone } from "../../lib/status-tone";

const ENDED = new Set(["COMPLETED", "CANCELLED", "ABANDONED"]);
const STATUS_TONE = { champion: "clay", in: "grass", pending: "muted", out: "neutral" } as const;

export default function TournamentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tournamentId = Number(id);
  const validId = Number.isInteger(tournamentId) && tournamentId > 0;

  const { data: tournament, isLoading, isError } = useTournamentQuery(validId ? tournamentId : undefined);
  const { data: players } = useTournamentPlayersQuery(validId ? tournamentId : undefined);
  const { data: matches } = useTournamentMatchesQuery(validId ? tournamentId : undefined);

  const standings = useMemo(
    () => computeStandings(players ?? [], matches ?? [], tournament?.championPlayerId ?? null),
    [players, matches, tournament?.championPlayerId],
  );

  return (
    <View className="flex-1 bg-ink">
      <Hero title={tournament?.name ?? "Torneo"} onBack={() => router.back()} />
      <ScrollView contentContainerClassName="gap-4 px-5 py-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {!validId || isError ? (
          <EmptyState title="Torneo no disponible" description="No pudimos cargar este torneo." />
        ) : isLoading || !tournament ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </>
        ) : (
          <>
            <Card>
              <View className="flex-row items-center justify-between gap-3">
                <SurfaceBadge surface={tournament.surface} />
                <Chip label={TOURNAMENT_STATUS_LABEL_PUBLIC[tournament.status]} tone={statusTone(tournament.status)} />
              </View>
              <Text className="mt-3 text-sm text-paper/60">
                {formatDateRange(tournament.startDate, tournament.endDate)}
              </Text>
              {tournament.description ? (
                <Text className="mt-3 text-sm leading-5 text-paper/80">{tournament.description}</Text>
              ) : null}
            </Card>

            <JoinSection tournament={tournament} />

            <View className="gap-2">
              <Text className="text-lg font-semibold text-paper">
                {matches && matches.length > 0 ? "Clasificación" : "Jugadores"}
              </Text>
              {matches && matches.length > 0 ? (
                standings.map((standing, index) => (
                  <Card key={standing.player.id}>
                    <View className="flex-row items-center gap-3">
                      <Text className="w-6 text-center text-sm font-bold text-paper/40">{index + 1}</Text>
                      <Text className="flex-1 text-base text-paper" numberOfLines={1}>
                        {standing.player.name}
                      </Text>
                      <Text className="text-sm text-paper/60">
                        {standing.wins}-{standing.losses}
                      </Text>
                      <Chip label={statusLabel(standing.status)} tone={STATUS_TONE[standing.status]} />
                    </View>
                  </Card>
                ))
              ) : (
                <RosterList players={players} />
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function statusLabel(status: "champion" | "in" | "out" | "pending"): string {
  switch (status) {
    case "champion":
      return "Campeón";
    case "in":
      return "En juego";
    case "out":
      return "Eliminado";
    default:
      return "Pendiente";
  }
}

function RosterList({ players }: { players?: Player[] }) {
  if (!players) return <Skeleton className="h-16 w-full" />;
  if (players.length === 0) return <EmptyState title="Sin jugadores todavía" />;
  return (
    <>
      {players.map((player) => (
        <Card key={player.id}>
          <Text className="text-base text-paper" numberOfLines={1}>
            {player.name}
          </Text>
        </Card>
      ))}
    </>
  );
}

// Player sign-up flow: mirrors web JoinTournament — inscribe / withdraw / status.
function JoinSection({ tournament }: { tournament: Tournament }) {
  const { user } = useUser();
  const { data: myRequests } = useMyJoinRequestsQuery();
  const createJoin = useCreateJoinRequestMutation();
  const withdrawJoin = useWithdrawJoinRequestMutation();
  const [note, setNote] = useState("");

  const myRequest = useMemo<TournamentJoinRequest | undefined>(() => {
    if (!myRequests) return undefined;
    return myRequests
      .filter((request) => request.tournamentId === tournament.id)
      .sort((a, b) => +new Date(b.requestedAt) - +new Date(a.requestedAt))[0];
  }, [myRequests, tournament.id]);

  if (ENDED.has(tournament.status)) return null;

  if (myRequest?.status === "PENDING") {
    return (
      <Card>
        <Text className="mb-2 text-base font-semibold text-paper">Solicitud enviada</Text>
        <Text className="mb-3 text-sm text-paper/60">Tu inscripción está pendiente de aprobación.</Text>
        <Button
          label="Retirar solicitud"
          variant="secondary"
          loading={withdrawJoin.isPending}
          onPress={() => withdrawJoin.mutate({ tournamentId: tournament.id, requestId: myRequest.id })}
        />
      </Card>
    );
  }

  if (myRequest?.status === "ACCEPTED") {
    return (
      <Card>
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-paper">Estás inscrito</Text>
          <Chip label={JOIN_STATUS_LABEL[myRequest.status]} tone={joinStatusTone(myRequest.status)} />
        </View>
      </Card>
    );
  }

  return (
    <Card>
      <Text className="mb-2 text-base font-semibold text-paper">Inscríbete</Text>
      {myRequest ? (
        <View className="mb-3 flex-row items-center gap-2">
          <Text className="text-sm text-paper/60">Estado anterior:</Text>
          <Chip label={JOIN_STATUS_LABEL[myRequest.status]} tone={joinStatusTone(myRequest.status)} />
        </View>
      ) : null}
      <Field placeholder="Nota para el organizador (opcional)" value={note} onChangeText={setNote} multiline />
      <View className="mt-3">
        <Button
          label="Inscribirse"
          loading={createJoin.isPending}
          onPress={() => {
            createJoin.mutate({
              tournamentId: tournament.id,
              payload: { playerName: user?.fullName ?? null, note: note.trim() || null },
            });
            setNote("");
          }}
        />
      </View>
    </Card>
  );
}
