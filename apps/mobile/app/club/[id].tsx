import type { PublicUser } from "@courtrank/core";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Building2, Pencil, Trash2, Trophy, UserPlus, Users } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { AddAdminSheet } from "../../components/club/add-admin-sheet";
import { ClubFormSheet } from "../../components/club/club-form-sheet";
import { TournamentRow } from "../../components/tournament-row";
import { Card, ConfirmSheet, EmptyState, Hero, Screen, Section, Skeleton } from "../../components/ui";
import {
  useCanManageClub,
  useClubAdminsQuery,
  useClubQuery,
  useRemoveClubAdminMutation,
} from "../../data/queries/clubs";
import { useTournamentsQuery } from "../../data/queries/tournaments";
import { colors } from "../../theme/tokens";

// Manage one club — the mobile port of web's host/clubs/[id] page, minus tournament
// creation (deferred; the tournament list here is read-only). Owners/admins can edit
// the club and add/remove admins; anyone can view. canManage is a UI gate off
// managedClubIds — the backend authorizes every mutation.
export default function ClubManageScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const clubId = Number(id);
  const validId = Number.isInteger(clubId) && clubId > 0;

  const clubQuery = useClubQuery(validId ? clubId : undefined);
  const adminsQuery = useClubAdminsQuery(validId ? clubId : undefined);
  const tournamentsQuery = useTournamentsQuery();
  const canManage = useCanManageClub(validId ? clubId : undefined);
  const removeAdmin = useRemoveClubAdminMutation();

  const [editingClub, setEditingClub] = useState(false);
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [removing, setRemoving] = useState<PublicUser | null>(null);

  const club = clubQuery.data;
  const clubTournaments = (tournamentsQuery.data ?? []).filter((t) => t.clubId === clubId);
  const admins = adminsQuery.data ?? [];

  const hero = (
    <Hero
      onBack={() => router.back()}
      eyebrow="CLUB"
      title={club?.name ?? " "}
      subtitle={club ? (club.address ?? "Sin dirección") : " "}
      right={
        club && canManage ? (
          <Pressable
            onPress={() => setEditingClub(true)}
            accessibilityRole="button"
            accessibilityLabel="Editar club"
            className="h-11 w-11 items-center justify-center rounded-full bg-surface-2 active:opacity-70"
          >
            <Pencil color={colors.ink} size={18} />
          </Pressable>
        ) : undefined
      }
    >
      {club ? (
        <View className="gap-0.5">
          {club.phoneNumber ? <Text className="font-sans text-sm text-ink-muted">{club.phoneNumber}</Text> : null}
          <Text className="font-sans text-sm text-ink-faint">Propietario: @{club.user.username}</Text>
        </View>
      ) : null}
    </Hero>
  );

  if (!validId) {
    return (
      <Screen hero={hero}>
        <EmptyState icon={Building2} title="Club no válido" description="El identificador del club no es correcto." />
      </Screen>
    );
  }

  return (
    <Screen hero={hero}>
      {clubQuery.isLoading ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : clubQuery.isError || !club ? (
        <EmptyState icon={Building2} title="Club no disponible" description="No se pudo cargar este club." />
      ) : (
        <>
          {!canManage ? (
            <Card>
              <Text className="font-sans text-sm text-ink-muted">
                Estás viendo este club pero no eres propietario ni administrador, por lo que las acciones de gestión
                están ocultas.
              </Text>
            </Card>
          ) : null}

          <Section icon={Trophy} eyebrow="TORNEOS" title="Torneos">
            {clubTournaments.length === 0 ? (
              <EmptyState icon={Trophy} title="Sin torneos" description="Este club todavía no ha publicado torneos." />
            ) : (
              clubTournaments.map((t) => (
                <TournamentRow key={t.id} tournament={t} onPress={() => router.push(`/tournament/${t.id}`)} />
              ))
            )}
          </Section>

          <Section
            icon={Users}
            eyebrow="EQUIPO"
            title="Administradores"
            action={
              canManage ? (
                <Pressable
                  onPress={() => setAddingAdmin(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Añadir administrador"
                  className="h-10 w-10 items-center justify-center rounded-full bg-surface-2 active:opacity-70"
                >
                  <UserPlus color={colors.lime} size={18} />
                </Pressable>
              ) : undefined
            }
          >
            {adminsQuery.isLoading ? (
              <Skeleton className="h-20 w-full rounded-2xl" />
            ) : admins.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Sin administradores"
                description="Aún no hay administradores en este club."
              />
            ) : (
              <View className="gap-2">
                {admins.map((admin) => (
                  <Card key={admin.id}>
                    <View className="flex-row items-center justify-between gap-3">
                      <Text className="font-sans-medium text-ink">@{admin.username}</Text>
                      {canManage ? (
                        <Pressable
                          onPress={() => setRemoving(admin)}
                          accessibilityRole="button"
                          accessibilityLabel={`Eliminar a @${admin.username}`}
                          className="h-9 w-9 items-center justify-center rounded-full active:bg-surface-2"
                        >
                          <Trash2 color={colors.danger} size={18} />
                        </Pressable>
                      ) : null}
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </Section>
        </>
      )}

      {club ? <ClubFormSheet visible={editingClub} club={club} onClose={() => setEditingClub(false)} /> : null}

      <AddAdminSheet visible={addingAdmin} clubId={clubId} onClose={() => setAddingAdmin(false)} />

      <ConfirmSheet
        visible={removing !== null}
        title="Eliminar administrador"
        message={removing ? `¿Quitar a @${removing.username} de los administradores?` : undefined}
        confirmLabel="Eliminar"
        danger
        onConfirm={() => {
          if (removing) removeAdmin.mutate({ clubId, userId: removing.id });
        }}
        onClose={() => setRemoving(null)}
      />
    </Screen>
  );
}
