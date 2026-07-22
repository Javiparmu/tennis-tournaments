import type { Club } from "@courtrank/core";
import { useRouter } from "expo-router";
import { Building2, Mail, Pencil, Settings2 } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { ClubContactSheet } from "../components/club/club-contact-sheet";
import { ClubFormSheet } from "../components/club/club-form-sheet";
import { Button, Card, EmptyState, Hero, Screen, Skeleton } from "../components/ui";
import { useClubsQuery } from "../data/queries/clubs";
import { useMeQuery } from "../data/queries/users";
import { colors } from "../theme/tokens";

// Zona de organizador — the mobile host surface (web's /host). Lists the clubs the
// signed-in user owns or administers; anyone without one can request the operator to
// provision it. Signed-in-guarded by the root navigator; the backend authorizes every
// mutation, and this screen only filters by managedClubIds for display.
export default function HostScreen() {
  const router = useRouter();
  const me = useMeQuery();
  const clubsQuery = useClubsQuery();

  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  const managedClubIds = me.data?.managedClubIds ?? [];
  const myClubs = (clubsQuery.data ?? []).filter((club) => managedClubIds.includes(club.id));
  const isLoading = me.isLoading || clubsQuery.isLoading;

  const hero = <Hero onBack={() => router.back()} eyebrow="ZONA DE ORGANIZADOR" title="Tus clubes" accent=" clubes" />;

  return (
    <Screen hero={hero}>
      {isLoading ? (
        <>
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </>
      ) : myClubs.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="¿Gestionas un club?"
          description="Los clubes se dan de alta con nosotros. Envíanos una solicitud y creamos la cuenta de tu club."
          action={
            <Button
              label="Solicitar alta de club"
              icon={<Building2 color={colors.canvas} size={18} />}
              onPress={() => setContactOpen(true)}
            />
          }
        />
      ) : (
        <View className="gap-2">
          {myClubs.map((club) => (
            <Card key={club.id}>
              <View className="gap-3">
                <View>
                  <Text className="font-display text-lg text-ink">{club.name}</Text>
                  <Text className="font-sans text-sm text-ink-muted">{club.address ?? "Sin dirección"}</Text>
                  {club.phoneNumber ? (
                    <Text className="font-sans text-sm text-ink-muted">{club.phoneNumber}</Text>
                  ) : null}
                </View>
                <View className="flex-row gap-2 border-t border-line pt-3">
                  <Button
                    className="flex-1"
                    label="Gestionar"
                    icon={<Settings2 color={colors.canvas} size={18} />}
                    onPress={() => router.push(`/club/${club.id}`)}
                  />
                  <Button
                    className="flex-1"
                    variant="secondary"
                    label="Editar"
                    icon={<Pencil color={colors.ink} size={18} />}
                    onPress={() => setEditingClub(club)}
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {editingClub ? (
        <ClubFormSheet key={editingClub.id} visible club={editingClub} onClose={() => setEditingClub(null)} />
      ) : null}

      <ClubContactSheet visible={contactOpen} onClose={() => setContactOpen(false)} />
    </Screen>
  );
}
