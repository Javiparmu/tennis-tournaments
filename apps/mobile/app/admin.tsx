import type { AdminClubContactRequest, AdminClubSummary, AdminOverview } from "@courtrank/core";
import { useRouter } from "expo-router";
import { AtSign, Building2, CircleAlert, Inbox, Mail, Phone, Search, Trash2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { ProvisionClubSheet } from "../components/admin/provision-club-sheet";
import {
  Button,
  Card,
  ConfirmSheet,
  EmptyState,
  Field,
  Hero,
  Screen,
  SectionHeader,
  Skeleton,
  Stat,
} from "../components/ui";
import {
  useAdminClubContactRequestsQuery,
  useAdminClubsQuery,
  useAdminOverviewQuery,
  useDeleteAdminClubContactRequestMutation,
} from "../data/queries/admin";
import { useMeQuery } from "../data/queries/users";
import { colors } from "../theme/tokens";

// Long-form Spanish date for request timestamps (es-ES; Hermes ships Intl).
const dateFormatter = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" });

// Platform-admin console — the mobile counterpart of web's /admin dashboard. Reached
// only from the Perfil tab's admin entry (a PLATFORM_ADMIN gate); the route is also
// wrapped in the signed-in navigator guard, and the backend authorizes every call.
export default function AdminScreen() {
  const router = useRouter();
  const me = useMeQuery();
  const isAdmin = me.data?.role === "PLATFORM_ADMIN";

  const overviewQuery = useAdminOverviewQuery();
  const requestsQuery = useAdminClubContactRequestsQuery();
  const clubsQuery = useAdminClubsQuery();
  const deleteRequest = useDeleteAdminClubContactRequestMutation();

  const [provisioning, setProvisioning] = useState<AdminClubContactRequest | null>(null);
  const [deleting, setDeleting] = useState<AdminClubContactRequest | null>(null);

  const hero = <Hero onBack={() => router.back()} eyebrow="ADMINISTRACIÓN" title="Panel operativo" />;

  // Non-admins never see the entry point, but a deep link could still land here —
  // bounce them once identity resolves, and reserve space with a skeleton meanwhile.
  if (me.isLoading || !isAdmin) {
    if (!me.isLoading && !isAdmin) {
      router.replace("/(tabs)/profile");
    }
    return (
      <Screen hero={hero}>
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </Screen>
    );
  }

  return (
    <Screen hero={hero}>
      <OverviewGrid overview={overviewQuery.data} isLoading={overviewQuery.isLoading} isError={overviewQuery.isError} />

      <SectionHeader icon={Inbox} eyebrow="SOLICITUDES" title="Solicitudes de clubes" />
      <ContactRequests
        requests={requestsQuery.data ?? []}
        isLoading={requestsQuery.isLoading}
        isError={requestsQuery.isError}
        onProvision={setProvisioning}
        onDelete={setDeleting}
      />

      <SectionHeader icon={Building2} eyebrow="CLUBES" title="Clubes dados de alta" />
      <ClubsDirectory clubs={clubsQuery.data ?? []} isLoading={clubsQuery.isLoading} isError={clubsQuery.isError} />

      {provisioning ? (
        <ProvisionClubSheet
          key={provisioning.id}
          visible
          request={provisioning}
          onClose={() => setProvisioning(null)}
        />
      ) : null}

      <ConfirmSheet
        visible={deleting !== null}
        title="Eliminar solicitud"
        message={deleting ? `¿Eliminar la solicitud de "${deleting.clubName}"?` : undefined}
        confirmLabel="Eliminar"
        danger
        onConfirm={() => {
          if (deleting) deleteRequest.mutate(deleting.id);
        }}
        onClose={() => setDeleting(null)}
      />
    </Screen>
  );
}

function OverviewGrid({
  overview,
  isLoading,
  isError,
}: {
  overview?: AdminOverview;
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) {
    return <Skeleton className="h-28 w-full rounded-2xl" />;
  }
  if (isError || !overview) {
    return (
      <EmptyState
        icon={CircleAlert}
        title="No se pudieron cargar las estadísticas"
        description="Hubo un problema al cargar el resumen administrativo."
      />
    );
  }

  const tiles: Array<{ label: string; value: string | number }> = [
    { label: "Clubes", value: overview.totalClubs },
    { label: "Solicitudes", value: overview.pendingClubContactRequests },
    { label: "Torneos", value: overview.totalTournaments },
    { label: "En curso", value: overview.activeTournaments },
    { label: "Finalizados", value: overview.completedTournaments },
    { label: "Usuarios", value: overview.totalUsers ?? overview.totalPlayers ?? "—" },
  ];

  return (
    <View className="flex-row flex-wrap justify-between gap-y-3">
      {tiles.map((tile) => (
        <View key={tile.label} className="w-[48%]">
          <Card>
            <Stat value={tile.value} label={tile.label} accent={tile.label === "Solicitudes"} />
          </Card>
        </View>
      ))}
    </View>
  );
}

function ContactRequests({
  requests,
  isLoading,
  isError,
  onProvision,
  onDelete,
}: {
  requests: AdminClubContactRequest[];
  isLoading: boolean;
  isError: boolean;
  onProvision: (request: AdminClubContactRequest) => void;
  onDelete: (request: AdminClubContactRequest) => void;
}) {
  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-2xl" />;
  }
  if (isError) {
    return (
      <EmptyState
        icon={CircleAlert}
        title="No se pudieron cargar las solicitudes"
        description="Vuelve a intentarlo en un momento."
      />
    );
  }
  if (requests.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No hay solicitudes pendientes"
        description="Las nuevas solicitudes del formulario aparecerán aquí."
      />
    );
  }

  return (
    <View className="gap-2">
      {requests.map((request) => (
        <Card key={request.id}>
          <View className="gap-2">
            <View>
              <Text className="font-display text-lg text-ink">{request.clubName}</Text>
              <Text className="font-sans text-sm text-ink-muted">
                {request.contactName} · {dateFormatter.format(new Date(request.createdAt))}
              </Text>
            </View>

            <View className="gap-1">
              {request.ownerUsername ? <MetaLine icon={AtSign} text={request.ownerUsername} accent /> : null}
              <MetaLine icon={Mail} text={request.email} />
              {request.phone ? <MetaLine icon={Phone} text={request.phone} /> : null}
            </View>

            {request.message ? <Text className="font-sans text-sm text-ink-muted">“{request.message}”</Text> : null}

            <View className="mt-1 flex-row gap-2">
              <Button
                className="flex-1"
                label="Dar de alta"
                icon={<Building2 color={colors.canvas} size={18} />}
                onPress={() => onProvision(request)}
              />
              <Button
                className="flex-1"
                variant="dangerGhost"
                label="Eliminar"
                icon={<Trash2 color={colors.danger} size={18} />}
                onPress={() => onDelete(request)}
              />
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
}

function ClubsDirectory({
  clubs,
  isLoading,
  isError,
}: {
  clubs: AdminClubSummary[];
  isLoading: boolean;
  isError: boolean;
}) {
  const [search, setSearch] = useState("");
  const normalized = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!normalized) return clubs;
    return clubs.filter((club) =>
      `${club.name} ${club.owner.username} ${club.address ?? ""}`.toLowerCase().includes(normalized),
    );
  }, [clubs, normalized]);

  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-2xl" />;
  }
  if (isError) {
    return (
      <EmptyState
        icon={CircleAlert}
        title="No se pudieron cargar los clubes"
        description="El listado administrativo de clubes no está disponible ahora mismo."
      />
    );
  }
  if (clubs.length === 0) {
    return (
      <EmptyState icon={Building2} title="Aún no hay clubes" description="Los clubes dados de alta aparecerán aquí." />
    );
  }

  return (
    <View className="gap-2">
      <Field icon={Search} placeholder="Buscar club" value={search} onChangeText={setSearch} autoCapitalize="none" />
      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="Sin resultados" description="No hay clubes que coincidan con la búsqueda." />
      ) : (
        filtered.map((club) => (
          <Card key={club.id}>
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Text className="font-display text-lg text-ink">{club.name}</Text>
                <Text className="font-sans text-sm text-ink-muted">{club.address ?? "Sin dirección"}</Text>
                <Text className="mt-1 font-sans text-sm text-ink-muted">@{club.owner.username}</Text>
                {club.phoneNumber ? <Text className="font-sans text-sm text-ink-muted">{club.phoneNumber}</Text> : null}
              </View>
              <View className="items-center rounded-2xl bg-surface-2 px-3 py-2">
                <Stat value={club.tournamentCount} label="Torneos" />
              </View>
            </View>
          </Card>
        ))
      )}
    </View>
  );
}

function MetaLine({ icon: Icon, text, accent = false }: { icon: typeof Mail; text: string; accent?: boolean }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Icon color={accent ? colors.lime : colors.inkFaint} size={14} />
      <Text className={`font-sans text-sm ${accent ? "text-ink" : "text-ink-muted"}`}>{text}</Text>
    </View>
  );
}
