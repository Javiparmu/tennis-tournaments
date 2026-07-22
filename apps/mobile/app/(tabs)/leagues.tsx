import { errorMessage } from "@courtrank/core";
import { useRouter } from "expo-router";
import { KeyRound, Lock, Plus, Ticket, Trophy } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";
import {
  Button,
  Card,
  EmptyState,
  Field,
  FormError,
  Hero,
  Screen,
  Section,
  Sheet,
  Skeleton,
} from "../../components/ui";
import { useCreateLeagueMutation, useJoinLeagueByCodeMutation, useMyLeaguesQuery } from "../../data/queries/leagues";
import { useJoinTournamentByCodeMutation, useMyTournamentsQuery } from "../../data/queries/tournaments";
import { colors } from "../../theme/tokens";

// Invite codes are the currency of this screen: mono, boxed, always copyable-looking.
function InviteCode({ code }: { code: string }) {
  return (
    <Text className="self-start rounded-md bg-lime/10 px-2 py-1 font-mono text-xs uppercase text-lime">{code}</Text>
  );
}

export default function LeaguesScreen() {
  const router = useRouter();
  const leagues = useMyLeaguesQuery();
  const tournaments = useMyTournamentsQuery();
  const createLeague = useCreateLeagueMutation();
  const joinLeague = useJoinLeagueByCodeMutation();
  const joinTournament = useJoinTournamentByCodeMutation();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState<"league" | "tournament" | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");

  const privateTournaments = (tournaments.data ?? []).filter((tournament) => tournament.visibility === "PRIVATE");

  return (
    <Screen
      tabBar
      hero={
        <Hero
          eyebrow="COMPETICIÓN PRIVADA"
          title="Tus ligas"
          accent="ligas"
          subtitle="Competiciones privadas con amigos."
        >
          {/* PressableScale puts className on the inner Pressable, so the flex has
              to live on a wrapper for the two CTAs to share the row evenly. */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                label="Crear liga"
                icon={<Plus color={colors.canvas} size={18} />}
                onPress={() => setCreateOpen(true)}
              />
            </View>
            <View className="flex-1">
              <Button
                variant="secondary"
                label="Unirse"
                icon={<KeyRound color={colors.ink} size={18} />}
                onPress={() => setJoinOpen("league")}
              />
            </View>
          </View>
        </Hero>
      }
    >
      <Section icon={Trophy} eyebrow="TUS COMPETICIONES" title="Ligas">
        {leagues.isLoading ? (
          [0, 1, 2].map((item) => <Skeleton key={item} className="h-[92px] w-full rounded-2xl" />)
        ) : (leagues.data ?? []).length === 0 ? (
          <EmptyState icon={Trophy} title="Sin ligas todavía" description="Crea una liga o únete con un código." />
        ) : (
          (leagues.data ?? []).map((league) => (
            <Card key={league.id} onPress={() => router.push(`/league/${league.id}`)}>
              <View className="gap-2">
                <Text className="font-display text-base text-ink" numberOfLines={1}>
                  {league.name}
                </Text>
                {league.description ? (
                  <Text className="font-sans text-sm text-ink-muted" numberOfLines={2}>
                    {league.description}
                  </Text>
                ) : null}
                <InviteCode code={league.inviteCode} />
              </View>
            </Card>
          ))
        )}
      </Section>

      <Section
        icon={Lock}
        title="Torneos privados"
        action={
          <Button
            variant="ghost"
            label="Código"
            icon={<KeyRound color={colors.lime} size={18} />}
            onPress={() => setJoinOpen("tournament")}
          />
        }
      >
        {privateTournaments.length === 0 ? (
          <EmptyState icon={Ticket} title="Sin torneos privados" description="Únete con un código de invitación." />
        ) : (
          privateTournaments.map((tournament) => (
            <Card key={tournament.id} onPress={() => router.push(`/tournament/${tournament.id}`)}>
              <View className="gap-2">
                <Text className="font-display text-base text-ink" numberOfLines={1}>
                  {tournament.name}
                </Text>
                {tournament.inviteCode ? (
                  <InviteCode code={tournament.inviteCode} />
                ) : (
                  <Text className="font-sans text-sm text-ink-muted">Por invitación</Text>
                )}
              </View>
            </Card>
          ))
        )}
      </Section>

      <Sheet visible={createOpen} onClose={() => setCreateOpen(false)} title="Crear liga">
        <View className="gap-3">
          <Field inSheet label="Nombre" placeholder="Liga de los martes" value={name} onChangeText={setName} />
          <Field
            inSheet
            label="Descripción"
            placeholder="Opcional"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <FormError message={createLeague.error ? errorMessage(createLeague.error, "league.create") : null} />
          <Button
            label="Crear"
            loading={createLeague.isPending}
            onPress={async () => {
              const league = await createLeague.mutateAsync({
                name: name.trim(),
                description: description.trim() || null,
              });
              setName("");
              setDescription("");
              setCreateOpen(false);
              router.push(`/league/${league.id}`);
            }}
          />
        </View>
      </Sheet>

      <Sheet
        visible={joinOpen != null}
        onClose={() => setJoinOpen(null)}
        title={joinOpen === "tournament" ? "Unirse a torneo" : "Unirse a liga"}
      >
        <View className="gap-3">
          <Field
            inSheet
            label="Código de invitación"
            placeholder="ABC123"
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
          />
          <FormError
            message={
              joinOpen === "tournament"
                ? joinTournament.error
                  ? errorMessage(joinTournament.error, "tournament.joinByCode")
                  : null
                : joinLeague.error
                  ? errorMessage(joinLeague.error, "league.join")
                  : null
            }
          />
          <Button
            label="Unirse"
            loading={joinLeague.isPending || joinTournament.isPending}
            onPress={async () => {
              const inviteCode = code.trim().toUpperCase();
              if (!inviteCode || !joinOpen) return;
              if (joinOpen === "tournament") {
                const tournament = await joinTournament.mutateAsync({ inviteCode });
                setJoinOpen(null);
                setCode("");
                router.push(`/tournament/${tournament.id}`);
              } else {
                const league = await joinLeague.mutateAsync({ inviteCode });
                setJoinOpen(null);
                setCode("");
                router.push(`/league/${league.id}`);
              }
            }}
          />
        </View>
      </Sheet>
    </Screen>
  );
}
