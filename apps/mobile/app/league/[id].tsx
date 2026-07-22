import { errorMessage, type LeagueMatch, type LeagueMember, type TennisScore } from "@courtrank/core";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CircleAlert, ListOrdered, Plus, Swords, Trash2, Trophy, UserPlus, Users } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, type TextStyle, View } from "react-native";
import { RecordMatchSheet } from "../../components/league/record-match-sheet";
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Field,
  FormError,
  Hero,
  Screen,
  SegmentedTabs,
  Sheet,
  Skeleton,
} from "../../components/ui";
import {
  useAddLeagueMemberMutation,
  useDeleteLeagueMatchMutation,
  useLeagueMatchesQuery,
  useLeagueMembersQuery,
  useLeagueQuery,
} from "../../data/queries/leagues";
import { useMeQuery } from "../../data/queries/users";
import { colors } from "../../theme/tokens";

const TABS = [
  { key: "ranking" as const, label: "Ranking", icon: ListOrdered },
  { key: "matches" as const, label: "Partidos", icon: Swords },
  { key: "members" as const, label: "Miembros", icon: Users },
];

const TABULAR: TextStyle = { fontVariant: ["tabular-nums"] };
const MICRO = "font-mono text-[10px] uppercase tracking-[1.8px]";
const HEAD = "font-mono text-[11px] uppercase tracking-[2px] text-ink-faint";

function formatScore(score: TennisScore | null): string {
  if (!score || score.sets.length === 0) return "Sin marcador";
  return score.sets.map((set) => `${set.player1Games}-${set.player2Games}`).join("  ");
}

function nameFor(members: Map<number, LeagueMember>, playerId: number) {
  return members.get(playerId)?.name ?? `Jugador ${playerId}`;
}

function record(member: LeagueMember): string {
  return `${member.wins}-${member.losses} · ${member.ratedMatches} partidos`;
}

// The league leader gets the same scoreboard strip as the global ranking — one
// pattern for "who is on top", wherever the table appears. Rows route to the
// player profile for the same reason: two tables that look alike must behave alike.
function LeaderRow({ member, onPress }: { member: LeagueMember; onPress: () => void }) {
  return (
    <Pressable className="flex-row items-center gap-3 bg-lime px-4 py-4 active:opacity-90" onPress={onPress}>
      <Text className="w-8 text-center font-display-black text-3xl text-canvas">1</Text>
      <Avatar name={member.name} size={44} />
      <View className="flex-1 gap-0.5">
        <Text className="font-display text-lg tracking-tight text-canvas" numberOfLines={1}>
          {member.name}
        </Text>
        <Text className="font-mono text-xs text-canvas/70" numberOfLines={1}>
          {record(member)}
        </Text>
      </View>
      <View className="items-end gap-0.5">
        <Text className="font-mono-bold text-2xl text-canvas" style={TABULAR}>
          {member.rating}
        </Text>
        <Text className={`${MICRO} text-canvas/60`}>Puntos</Text>
      </View>
    </Pressable>
  );
}

function MemberRankRow({ member, rank, onPress }: { member: LeagueMember; rank: number; onPress: () => void }) {
  const podium = rank <= 3;

  return (
    <Pressable
      onPress={onPress}
      className={`h-16 flex-row items-center gap-3 border-t border-line px-4 active:bg-surface-2 ${
        podium ? "bg-lime/[0.04]" : ""
      }`}
    >
      <Text className={`w-8 text-center font-display text-xl ${podium ? "text-lime" : "text-ink-faint"}`}>{rank}</Text>
      <Avatar name={member.name} size={36} />
      <View className="flex-1">
        <Text className="font-sans-semibold text-ink" numberOfLines={1}>
          {member.name}
        </Text>
        <Text className="font-mono text-xs text-ink-muted" numberOfLines={1}>
          {record(member)}
        </Text>
      </View>
      <View className="items-end">
        <Text className="font-mono-bold text-lg text-ink" style={TABULAR}>
          {member.rating}
        </Text>
        <Text className={`${MICRO} text-ink-faint`}>Puntos</Text>
      </View>
    </Pressable>
  );
}

// Rows at the real 64px height so the table never jumps when the roster lands.
function RankingSkeleton() {
  return (
    <>
      {[0, 1, 2, 3].map((row) => (
        <View key={row} className="h-16 flex-row items-center gap-3 border-t border-line px-4">
          <Skeleton className="h-5 w-8 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-xl" />
          <View className="flex-1 gap-1.5">
            <Skeleton className="h-4 w-2/5 rounded-md" />
            <Skeleton className="h-3 w-1/3 rounded-md" />
          </View>
          <Skeleton className="h-5 w-10 rounded-md" />
        </View>
      ))}
    </>
  );
}

function RankingTab({
  members,
  isLoading,
  onOpenPlayer,
}: {
  members: LeagueMember[];
  isLoading: boolean;
  onOpenPlayer: (username: string) => void;
}) {
  return (
    <Card padded={false} className="overflow-hidden">
      <View className="flex-row items-center gap-3 border-b border-line px-4 py-2.5">
        <Text className={`w-8 text-center ${HEAD}`}>Pos</Text>
        <Text className={`flex-1 ${HEAD}`}>Jugador</Text>
        <Text className={HEAD}>Puntos</Text>
      </View>
      {isLoading ? (
        <RankingSkeleton />
      ) : members.length === 0 ? (
        <View className="items-center gap-2 px-4 py-10">
          <Users color={colors.inkFaint} size={22} />
          <Text className="text-center font-display text-base text-ink">Sin miembros</Text>
          <Text className="text-center font-sans text-sm text-ink-muted">Añade jugadores para abrir la tabla.</Text>
        </View>
      ) : (
        members.map((member, index) =>
          index === 0 ? (
            <LeaderRow key={member.playerId} member={member} onPress={() => onOpenPlayer(member.username)} />
          ) : (
            <MemberRankRow
              key={member.playerId}
              member={member}
              rank={index + 1}
              onPress={() => onOpenPlayer(member.username)}
            />
          ),
        )
      )}
    </Card>
  );
}

function MatchCard({
  match,
  members,
  canDelete,
  deleting,
  onDelete,
}: {
  match: LeagueMatch;
  members: Map<number, LeagueMember>;
  canDelete: boolean;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <Card>
      <View className="flex-row items-start gap-3">
        <View className="flex-1 gap-1.5">
          <Text className="font-sans-semibold text-ink" numberOfLines={1}>
            {nameFor(members, match.player1Id)} vs {nameFor(members, match.player2Id)}
          </Text>
          <View className="flex-row items-center gap-2">
            <Trophy color={colors.lime} size={14} />
            <Text className="flex-1 font-sans text-sm text-ink" numberOfLines={1}>
              {nameFor(members, match.winnerId)}
            </Text>
          </View>
          <Text className="font-mono text-sm text-ink-muted" style={TABULAR}>
            {formatScore(match.score)}
          </Text>
        </View>
        {canDelete ? (
          // Negative margins keep the 44pt target without padding the card out.
          <Pressable
            onPress={onDelete}
            disabled={deleting}
            accessibilityRole="button"
            accessibilityLabel="Borrar partido"
            className={`-mr-2 -mt-2 h-11 w-11 items-center justify-center rounded-full active:opacity-70 ${
              deleting ? "opacity-40" : ""
            }`}
          >
            <Trash2 color={colors.danger} size={18} />
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

function MembersTab({
  members,
  isLoading,
  onOpenPlayer,
}: {
  members: LeagueMember[];
  isLoading: boolean;
  onOpenPlayer: (username: string) => void;
}) {
  if (isLoading) return <Skeleton className="h-48 w-full rounded-2xl" />;
  if (members.length === 0) {
    return <EmptyState icon={Users} title="Sin miembros" description="Añade jugadores con su correo." />;
  }

  return (
    <Card padded={false} className="overflow-hidden">
      {members.map((member, index) => (
        <Pressable
          key={member.playerId}
          onPress={() => onOpenPlayer(member.username)}
          className={`h-16 flex-row items-center gap-3 px-4 active:bg-lime/10 ${
            index > 0 ? "border-t border-line" : ""
          }`}
        >
          <Avatar name={member.name} size={36} />
          <View className="flex-1">
            <Text className="font-sans-semibold text-ink" numberOfLines={1}>
              {member.name}
            </Text>
            <Text className="font-sans text-sm text-ink-muted" numberOfLines={1}>
              @{member.username}
            </Text>
          </View>
          <Text className="font-mono-bold text-ink" style={TABULAR}>
            {member.rating}
          </Text>
        </Pressable>
      ))}
    </Card>
  );
}

export default function LeagueDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const leagueId = Number(id);
  const validId = Number.isInteger(leagueId) && leagueId > 0;
  const league = useLeagueQuery(validId ? leagueId : undefined);
  const members = useLeagueMembersQuery(validId ? leagueId : undefined);
  const matches = useLeagueMatchesQuery(validId ? leagueId : undefined);
  const me = useMeQuery();
  const addMember = useAddLeagueMemberMutation();
  const deleteMatch = useDeleteLeagueMatchMutation();
  const [tab, setTab] = useState<"ranking" | "matches" | "members">("ranking");
  const [addOpen, setAddOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const [email, setEmail] = useState("");

  const sortedMembers = [...(members.data ?? [])].sort((a, b) => b.rating - a.rating || b.wins - a.wins);
  const membersByPlayer = useMemo(
    () => new Map((members.data ?? []).map((member) => [member.playerId, member])),
    [members.data],
  );
  const isOwner = league.data != null && me.data?.id === league.data.ownerUserId;
  const unavailable = !validId || league.isError;
  const openPlayer = (username: string) => router.push(`/players/${username}`);

  return (
    <Screen
      hero={
        <Hero onBack={() => router.back()} eyebrow="LIGA" title={league.data?.name ?? "Liga"}>
          {unavailable ? null : (
            <View className="gap-3">
              {/* The invite code is the league's handle — mono, boxed, quotable. */}
              {league.data ? (
                <View className="h-7 flex-row items-center self-start rounded-md bg-lime/10 px-2.5">
                  <Text className="font-mono text-xs uppercase tracking-[1px] text-lime">{league.data.inviteCode}</Text>
                </View>
              ) : (
                <Skeleton className="h-7 w-28 rounded-md" />
              )}
              {/* PressableScale puts className on the inner Pressable, so the flex
                  has to live on a wrapper for the CTAs to share the row evenly. */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Button
                    label="Registrar resultado"
                    icon={<Plus color={colors.canvas} size={18} />}
                    onPress={() => setRecordOpen(true)}
                  />
                </View>
                {isOwner ? (
                  <View className="flex-1">
                    <Button
                      variant="secondary"
                      label="Añadir miembro"
                      icon={<UserPlus color={colors.ink} size={18} />}
                      onPress={() => setAddOpen(true)}
                    />
                  </View>
                ) : null}
              </View>
            </View>
          )}
        </Hero>
      }
    >
      {unavailable ? (
        <EmptyState icon={CircleAlert} title="Liga no disponible" description="No pudimos cargar esta liga." />
      ) : (
        <>
          <SegmentedTabs tabs={TABS} value={tab} onChange={setTab} />

          {tab === "ranking" ? (
            <RankingTab members={sortedMembers} isLoading={members.isLoading} onOpenPlayer={openPlayer} />
          ) : null}

          {tab === "matches" ? (
            <View className="gap-2">
              {matches.isLoading ? (
                [0, 1, 2].map((row) => <Skeleton key={row} className="h-[104px] w-full rounded-2xl" />)
              ) : (matches.data ?? []).length === 0 ? (
                <EmptyState icon={Trophy} title="Sin partidos" description="Registra el primer resultado." />
              ) : (
                (matches.data ?? []).map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    members={membersByPlayer}
                    canDelete={isOwner}
                    // Scoped to the row being deleted so one pending delete doesn't
                    // grey out every other match.
                    deleting={deleteMatch.isPending && deleteMatch.variables?.matchId === match.id}
                    onDelete={() => deleteMatch.mutate({ id: leagueId, matchId: match.id })}
                  />
                ))
              )}
            </View>
          ) : null}

          {tab === "members" ? (
            <MembersTab members={members.data ?? []} isLoading={members.isLoading} onOpenPlayer={openPlayer} />
          ) : null}
        </>
      )}

      <Sheet visible={addOpen} onClose={() => setAddOpen(false)} title="Añadir miembro">
        <View className="gap-3">
          <Field
            inSheet
            label="Correo"
            placeholder="jugador@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <FormError message={addMember.error ? errorMessage(addMember.error, "league.addMember") : null} />
          <Button
            label="Añadir"
            loading={addMember.isPending}
            onPress={async () => {
              await addMember.mutateAsync({ id: leagueId, payload: { email: email.trim() } });
              setEmail("");
              setAddOpen(false);
            }}
          />
        </View>
      </Sheet>

      <RecordMatchSheet
        visible={recordOpen}
        onClose={() => setRecordOpen(false)}
        leagueId={leagueId}
        members={members.data ?? []}
      />
    </Screen>
  );
}
