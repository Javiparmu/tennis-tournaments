import { useUser } from "@clerk/clerk-expo";
import {
  computeStandings,
  formatDateRange,
  JOIN_STATUS_LABEL,
  type Player,
  type PlayerStanding,
  TOURNAMENT_STATUS_LABEL_PUBLIC,
  type Tournament,
  type TournamentJoinRequest,
} from "@courtrank/core";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CircleAlert, CircleCheck, Clock, GitFork, ListOrdered, Ticket, Users } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Text, type TextStyle, View } from "react-native";
import { Bracket } from "../../components/tournament/bracket";
import {
  Avatar,
  Button,
  Card,
  Chip,
  EmptyState,
  Field,
  Hero,
  Screen,
  Section,
  SegmentedTabs,
  Skeleton,
  SurfaceBadge,
} from "../../components/ui";
import {
  useCreateJoinRequestMutation,
  useMyJoinRequestsQuery,
  useTournamentBracketQuery,
  useTournamentMatchesQuery,
  useTournamentPlayersQuery,
  useTournamentQuery,
  useWithdrawJoinRequestMutation,
} from "../../data/queries/tournaments";
import { joinStatusTone, statusTone } from "../../lib/status-tone";
import { colors } from "../../theme/tokens";

const ENDED = new Set(["COMPLETED", "CANCELLED", "ABANDONED"]);
// `champion` gets the solid lime scoreboard pill — the one row in the table that is
// a result rather than a state.
const STATUS_TONE = { champion: "champion", in: "success", pending: "neutral", out: "danger" } as const;
const VIEW_TABS = [
  { key: "clasificacion" as const, label: "Clasificación", icon: ListOrdered },
  { key: "cuadro" as const, label: "Cuadro", icon: GitFork },
];

const TABULAR: TextStyle = { fontVariant: ["tabular-nums"] };
const HEAD = "font-mono text-[11px] uppercase tracking-[2px] text-ink-faint";

export default function TournamentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tournamentId = Number(id);
  const validId = Number.isInteger(tournamentId) && tournamentId > 0;

  const { data: tournament, isLoading, isError } = useTournamentQuery(validId ? tournamentId : undefined);
  const { data: players } = useTournamentPlayersQuery(validId ? tournamentId : undefined);
  const { data: matches } = useTournamentMatchesQuery(validId ? tournamentId : undefined);
  const { data: bracket } = useTournamentBracketQuery(validId ? tournamentId : undefined);
  const [view, setView] = useState<"clasificacion" | "cuadro">("clasificacion");

  const hasMatches = Boolean(matches && matches.length > 0);
  const standings = useMemo(
    () => computeStandings(players ?? [], matches ?? [], tournament?.championPlayerId ?? null),
    [players, matches, tournament?.championPlayerId],
  );

  return (
    <Screen
      hero={
        <Hero
          onBack={() => router.back()}
          // A non-breaking space rather than a conditional: the eyebrow line has to
          // hold its height while the dates load, or the title jumps.
          eyebrow={tournament ? formatDateRange(tournament.startDate, tournament.endDate).toUpperCase() : " "}
          title={tournament?.name ?? "Torneo"}
        >
          {tournament ? (
            <View className="flex-row items-center gap-2">
              <SurfaceBadge surface={tournament.surface} />
              {/* No status special-case any more: the old night band muddied the
                  amber `live` tone, so a running tournament had to borrow the lime.
                  The band is gone and `live` is picked for the dark canvas, so the
                  shared mapping now holds here like everywhere else. */}
              <Chip
                label={TOURNAMENT_STATUS_LABEL_PUBLIC[tournament.status]}
                tone={statusTone(tournament.status)}
              />
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </View>
          )}
        </Hero>
      }
    >
      {!validId || isError ? (
        <EmptyState icon={CircleAlert} title="Torneo no disponible" description="No pudimos cargar este torneo." />
      ) : isLoading || !tournament ? (
        <>
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </>
      ) : (
        <>
          {tournament.description ? (
            <Card>
              <Text className="font-sans text-sm leading-5 text-ink-muted">{tournament.description}</Text>
            </Card>
          ) : null}

          {tournament.visibility === "PUBLIC" ? <JoinSection tournament={tournament} /> : null}

          {hasMatches ? (
            <>
              <SegmentedTabs tabs={VIEW_TABS} value={view} onChange={setView} />
              {view === "clasificacion" ? (
                <StandingsTable standings={standings} />
              ) : bracket ? (
                <Bracket bracket={bracket} />
              ) : (
                <Skeleton className="h-40 w-full rounded-2xl" />
              )}
            </>
          ) : (
            <Section icon={Users} eyebrow="INSCRITOS" title="Jugadores">
              <RosterList players={players} />
            </Section>
          )}
        </>
      )}
    </Screen>
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

// Same table shell as the ranking tab: one card, a mono header row, and fixed-height
// rows so the standings read as a scoreboard rather than a stack of cards.
function StandingsTable({ standings }: { standings: PlayerStanding[] }) {
  return (
    <Card padded={false} className="overflow-hidden">
      <View className="flex-row items-center gap-2 border-b border-line px-4 py-2.5">
        <Text className={`w-8 text-center ${HEAD}`}>Pos</Text>
        <Text className={`flex-1 ${HEAD}`}>Jugador</Text>
        <Text className={`w-12 text-right ${HEAD}`}>V-D</Text>
        <Text className={`w-24 text-right ${HEAD}`}>Estado</Text>
      </View>
      {standings.map((standing, index) => (
        <View key={standing.player.id} className="h-14 flex-row items-center gap-2 border-t border-line px-4">
          <Text className={`w-8 text-center font-display text-xl ${index < 3 ? "text-lime" : "text-ink-faint"}`}>
            {index + 1}
          </Text>
          <Text className="flex-1 font-sans-semibold text-ink" numberOfLines={1}>
            {standing.player.name}
          </Text>
          {/* Wins over losses: the loss count is the quieter half, so it drops to
              ink-faint. Both parts inherit the parent's mono + tabular figures. */}
          <Text className="w-12 text-right font-mono" style={TABULAR}>
            <Text className="text-ink">{standing.wins}</Text>
            <Text className="text-ink-faint">-{standing.losses}</Text>
          </Text>
          <View className="w-24 items-end">
            <Chip label={statusLabel(standing.status)} tone={STATUS_TONE[standing.status]} />
          </View>
        </View>
      ))}
    </Card>
  );
}

function RosterList({ players }: { players?: Player[] }) {
  if (!players) return <Skeleton className="h-16 w-full rounded-2xl" />;
  if (players.length === 0) return <EmptyState icon={Users} title="Sin jugadores todavía" />;
  return (
    <Card padded={false} className="overflow-hidden">
      {players.map((player, index) => (
        <View
          key={player.id}
          className={`h-14 flex-row items-center gap-3 px-4 ${index > 0 ? "border-t border-line" : ""}`}
        >
          <Avatar name={player.name} size={36} />
          <Text className="flex-1 font-sans-semibold text-ink" numberOfLines={1}>
            {player.name}
          </Text>
        </View>
      ))}
    </Card>
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
      <Card accent={colors.live} className="gap-3 pt-5">
        <View className="gap-1">
          <View className="flex-row items-center gap-2">
            <Clock color={colors.live} size={18} />
            <Text className="font-sans-semibold text-base text-ink">Solicitud enviada</Text>
          </View>
          <Text className="font-sans text-sm text-ink-muted">Tu inscripción está pendiente de aprobación.</Text>
        </View>
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
      <Card className="border-line-strong bg-lime/10">
        <View className="flex-row items-center gap-3">
          <CircleCheck color={colors.lime} size={22} />
          <Text className="flex-1 font-sans-semibold text-base text-ink">Estás inscrito</Text>
          <Chip label={JOIN_STATUS_LABEL[myRequest.status]} tone={joinStatusTone(myRequest.status)} />
        </View>
      </Card>
    );
  }

  return (
    <Card className="gap-3">
      <View className="gap-2">
        <Text className="font-sans-semibold text-base text-ink">Inscríbete</Text>
        {myRequest ? (
          <View className="flex-row items-center gap-2">
            <Text className="font-sans text-sm text-ink-muted">Estado anterior:</Text>
            <Chip label={JOIN_STATUS_LABEL[myRequest.status]} tone={joinStatusTone(myRequest.status)} />
          </View>
        ) : null}
      </View>
      <Field placeholder="Nota para el organizador (opcional)" value={note} onChangeText={setNote} multiline />
      <Button
        label="Inscribirse"
        icon={<Ticket color={colors.canvas} size={18} />}
        loading={createJoin.isPending}
        onPress={() => {
          createJoin.mutate({
            tournamentId: tournament.id,
            payload: { playerName: user?.fullName ?? null, note: note.trim() || null },
          });
          setNote("");
        }}
      />
    </Card>
  );
}
