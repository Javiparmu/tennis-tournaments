"use client";

import { useAuth } from "@clerk/nextjs";
import { Button, Form } from "@heroui/react";
import {
  AtSign,
  BarChart3,
  Building2,
  CircleAlert,
  Inbox,
  Mail,
  Phone,
  Search,
  Trash2,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataCard } from "@/components/data-card";
import { EmptyState } from "@/components/empty-state";
import { FormError, inputClass, ModalShell } from "@/components/modal-shell";
import { PageHero } from "@/components/page-hero";
import { PageScaffold } from "@/components/page-scaffold";
import { PageSkeleton } from "@/components/page-skeleton";
import {
  useAdminClubContactRequestsQuery,
  useAdminClubsQuery,
  useAdminOverviewQuery,
  useCreateAdminClubMutation,
  useDeleteAdminClubContactRequestMutation,
  useMeQuery,
  useUserByUsernameQuery,
} from "@/data/queries";
import { notifySuccess } from "@/data/queries/notify";
import { errorMessage } from "@courtrank/core/lib/errors";
import type { AdminClubContactRequest, AdminClubSummary, AdminOverview } from "@courtrank/core/models";

const dateFormatter = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" });

export function AdminDashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const me = useMeQuery();
  const overviewQuery = useAdminOverviewQuery();
  const requestsQuery = useAdminClubContactRequestsQuery();
  const clubsQuery = useAdminClubsQuery();
  const deleteRequest = useDeleteAdminClubContactRequestMutation();
  const [provisioning, setProvisioning] = useState<AdminClubContactRequest | null>(null);
  const [deletingRequest, setDeletingRequest] = useState<AdminClubContactRequest | null>(null);

  const isAdmin = me.data?.role === "PLATFORM_ADMIN";
  const isLoadingAdminData = isAdmin && (overviewQuery.isLoading || requestsQuery.isLoading || clubsQuery.isLoading);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/sign-in");
      return;
    }
    if (!me.isLoading && !isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, isLoaded, isSignedIn, me.isLoading, router]);

  if (!isLoaded || !isSignedIn || me.isLoading || !isAdmin) {
    return null;
  }

  async function handleConfirmDelete() {
    if (!deletingRequest) return;
    try {
      await deleteRequest.mutateAsync(deletingRequest.id);
      setDeletingRequest(null);
    } catch {
      // surfaced in the dialog via deleteRequest.error
    }
  }

  return (
    <PageScaffold>
      <div className="mb-8">
        <PageHero
          eyebrow="Administración"
          title="Panel operativo"
          accent=" operativo"
          subtitle="Gestiona altas de clubes, revisa solicitudes de contacto y consulta las métricas principales de CourtRank."
        />
      </div>

      {isLoadingAdminData ? <PageSkeleton rows={3} height="h-28" className="mb-8" /> : null}

      <div className="space-y-8">
        <AdminSummaryCards
          overview={overviewQuery.data}
          isLoading={overviewQuery.isLoading}
          isError={overviewQuery.isError}
        />
        <ContactRequestsPanel
          requests={requestsQuery.data ?? []}
          isLoading={requestsQuery.isLoading}
          isError={requestsQuery.isError}
          onProvision={setProvisioning}
          onDelete={setDeletingRequest}
        />
        <AdminClubsPanel clubs={clubsQuery.data ?? []} isLoading={clubsQuery.isLoading} isError={clubsQuery.isError} />
      </div>

      {provisioning ? (
        <ProvisionClubModal key={provisioning.id} request={provisioning} onClose={() => setProvisioning(null)} />
      ) : null}

      <ConfirmDialog
        open={deletingRequest !== null}
        title="Eliminar solicitud"
        description={deletingRequest ? `¿Eliminar la solicitud de "${deletingRequest.clubName}"?` : undefined}
        confirmLabel="Eliminar"
        isPending={deleteRequest.isPending}
        error={deleteRequest.error ? errorMessage(deleteRequest.error) : null}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          deleteRequest.reset();
          setDeletingRequest(null);
        }}
      />
    </PageScaffold>
  );
}

function AdminSummaryCards({
  overview,
  isLoading,
  isError,
}: {
  overview?: AdminOverview;
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) {
    return <PageSkeleton rows={1} height="h-28" />;
  }

  if (isError || !overview) {
    return (
      <EmptyState
        icon={CircleAlert}
        title="No se pudieron cargar las estadísticas"
        description="Hubo un problema al cargar el resumen administrativo."
        size="compact"
      />
    );
  }

  const cards = [
    { label: "Clubes", value: overview.totalClubs, icon: Building2 },
    { label: "Solicitudes pendientes", value: overview.pendingClubContactRequests, icon: Inbox },
    { label: "Torneos", value: overview.totalTournaments, icon: Trophy },
    { label: "En curso", value: overview.activeTournaments, icon: BarChart3 },
    { label: "Finalizados", value: overview.completedTournaments, icon: UserCheck },
    { label: "Usuarios", value: overview.totalUsers ?? overview.totalPlayers ?? "—", icon: Users },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <DataCard key={card.label} accent="var(--court)">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-stone-500">{card.label}</p>
                <p className="mt-1 font-display text-3xl font-black text-court-ink">{card.value}</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-court/10 text-court">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
            </div>
          </DataCard>
        );
      })}
    </section>
  );
}

function ContactRequestsPanel({
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
  return (
    <DataCard
      title="Solicitudes de clubes"
      subtitle="Clubes que han pedido unirse a la plataforma."
      icon={Inbox}
      accent="var(--court)"
    >
      {isLoading ? <PageSkeleton rows={2} height="h-28" /> : null}

      {isError ? (
        <EmptyState
          icon={CircleAlert}
          title="No se pudieron cargar las solicitudes"
          description="Vuelve a intentarlo en un momento."
          size="compact"
        />
      ) : null}

      {!isLoading && !isError && requests.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No hay solicitudes pendientes"
          description="Las nuevas solicitudes del formulario aparecerán aquí."
          size="compact"
        />
      ) : null}

      {!isLoading && !isError && requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <ContactRequestRow
              key={request.id}
              request={request}
              onProvision={() => onProvision(request)}
              onDelete={() => onDelete(request)}
            />
          ))}
        </div>
      ) : null}
    </DataCard>
  );
}

function ContactRequestRow({
  request,
  onProvision,
  onDelete,
}: {
  request: AdminClubContactRequest;
  onProvision: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-court/10 bg-court/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-display text-lg font-bold">{request.clubName}</p>
          <p className="text-sm text-stone-500">
            {request.contactName} · {dateFormatter.format(new Date(request.createdAt))}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone-600">
            {request.ownerUsername ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-court-ink">
                <AtSign className="h-3.5 w-3.5 text-court" />
                {request.ownerUsername}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-court" />
              {request.email}
            </span>
            {request.phone ? (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-court" />
                {request.phone}
              </span>
            ) : null}
          </div>
          {request.message ? <p className="mt-3 text-sm text-stone-600">“{request.message}”</p> : null}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onProvision}
            className="inline-flex items-center gap-2 rounded-xl bg-court px-4 py-2 text-sm font-semibold text-ball-bright hover:bg-court-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-court"
          >
            <Building2 className="h-4 w-4" />
            Dar de alta
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminClubsPanel({
  clubs,
  isLoading,
  isError,
}: {
  clubs: AdminClubSummary[];
  isLoading: boolean;
  isError: boolean;
}) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const filteredClubs = useMemo(() => {
    if (!normalizedSearch) return clubs;
    return clubs.filter((club) => {
      const haystack = `${club.name} ${club.owner.username} ${club.address ?? ""}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [clubs, normalizedSearch]);

  return (
    <DataCard
      title="Clubes dados de alta"
      subtitle="Consulta rápida de clubes, propietarios y actividad."
      icon={Building2}
      action={
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar club"
            className="w-52 rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-court"
          />
        </label>
      }
      accent="var(--court)"
    >
      {isLoading ? <PageSkeleton rows={2} height="h-20" /> : null}

      {isError ? (
        <EmptyState
          icon={CircleAlert}
          title="No se pudieron cargar los clubes"
          description="El listado administrativo de clubes no está disponible ahora mismo."
          size="compact"
        />
      ) : null}

      {!isLoading && !isError && clubs.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aún no hay clubes"
          description="Los clubes dados de alta aparecerán aquí."
        />
      ) : null}

      {!isLoading && !isError && clubs.length > 0 && filteredClubs.length === 0 ? (
        <EmptyState icon={Search} title="Sin resultados" description="No hay clubes que coincidan con la búsqueda." />
      ) : null}

      {!isLoading && !isError && filteredClubs.length > 0 ? (
        <div className="divide-y divide-court/10 overflow-hidden rounded-2xl border border-court/10">
          {filteredClubs.map((club) => (
            <div key={club.id} className="grid gap-3 bg-white p-4 md:grid-cols-[1.4fr_1fr_auto] md:items-center">
              <div>
                <p className="font-display text-lg font-bold text-court-ink">{club.name}</p>
                <p className="text-sm text-stone-500">{club.address ?? "Sin dirección"}</p>
              </div>
              <div className="text-sm text-stone-600">
                <p>Propietario: @{club.owner.username}</p>
                {club.phoneNumber ? <p>{club.phoneNumber}</p> : null}
              </div>
              <div className="rounded-xl bg-court/5 px-3 py-2 text-center">
                <p className="font-display text-xl font-black text-court-ink">{club.tournamentCount}</p>
                <p className="text-xs text-stone-500">torneos</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </DataCard>
  );
}

function ProvisionClubModal({ request, onClose }: { request: AdminClubContactRequest; onClose: () => void }) {
  const createClub = useCreateAdminClubMutation();
  const deleteRequest = useDeleteAdminClubContactRequestMutation();
  const [name, setName] = useState(request.clubName);
  const [phoneNumber, setPhoneNumber] = useState(request.phone ?? "");
  const [address, setAddress] = useState("");
  // The requester's handle rides along on the request (captured read-only at
  // submit time). Prefill + lock it so the admin never retypes or hunts for it;
  // fall back to a manual input only for legacy requests that predate the field.
  const [ownerUsername, setOwnerUsername] = useState(request.ownerUsername ?? "");
  const ownerLocked = Boolean(request.ownerUsername);
  const [formError, setFormError] = useState<string | null>(null);
  const ownerUsernameValue = ownerUsername.trim();
  const ownerQuery = useUserByUsernameQuery(ownerUsernameValue || undefined);

  const isPending = createClub.isPending || deleteRequest.isPending || ownerQuery.isFetching;

  return (
    <ModalShell
      title="Dar de alta el club"
      subtitle={`Solicitud de ${request.contactName} (${request.email})`}
      onClose={onClose}
      disabled={isPending}
    >
      <Form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setFormError(null);
          if (!name.trim() || !ownerUsernameValue) {
            setFormError("El nombre del club y el usuario propietario son obligatorios.");
            return;
          }
          try {
            const owner = ownerQuery.data ?? (await ownerQuery.refetch()).data;
            if (!owner) {
              setFormError("No existe ningún usuario con ese nombre. Pídele que se registre primero.");
              return;
            }
            const club = await createClub.mutateAsync({
              name: name.trim(),
              phoneNumber: phoneNumber.trim() || null,
              address: address.trim() || null,
              ownerUserId: owner.id,
            });
            // Club created: clear the attended request from the queue
            // (fire-and-close — the optimistic delete removes the row and toasts
            // on error even after this modal unmounts) and confirm via toast.
            deleteRequest.mutate(request.id);
            notifySuccess(`Club "${club.name}" dado de alta`);
            onClose();
          } catch {
            setFormError("No se pudo crear el club. Inténtalo de nuevo.");
          }
        }}
      >
        <label className="block space-y-2 text-sm font-medium text-stone-700">
          <span>Nombre del club</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>
        <label htmlFor="club-owner-username" className="block space-y-2 text-sm font-medium text-stone-700">
          <span>Usuario propietario</span>
          {ownerLocked ? (
            <input
              id="club-owner-username"
              readOnly
              value={`@${ownerUsername}`}
              className={`${inputClass} cursor-not-allowed bg-stone-50 text-stone-500`}
            />
          ) : (
            <input
              id="club-owner-username"
              required
              value={ownerUsername}
              onChange={(e) => setOwnerUsername(e.target.value)}
              placeholder="nombre-de-usuario"
              className={inputClass}
            />
          )}
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium text-stone-700">
            <span>Teléfono (opcional)</span>
            <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={inputClass} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-stone-700">
            <span>Dirección (opcional)</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
          </label>
        </div>

        <FormError message={formError} />
        <FormError message={createClub.error ? errorMessage(createClub.error) : null} />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" className="text-stone-700" onPress={onClose} isDisabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-court text-ball-bright hover:bg-court-hover" isDisabled={isPending}>
            {createClub.isPending ? "Creando…" : "Crear club"}
          </Button>
        </div>
      </Form>
    </ModalShell>
  );
}
