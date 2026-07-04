"use client";

import { Chip } from "@heroui/react";
import { ArrowLeft, Plus, Trash2, Trophy, UserPlus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ClubFormModal, type ClubFormValues } from "@/components/host/club-form-modal";
import { TournamentFormModal, type TournamentFormValues } from "@/components/host/tournament-form-modal";
import { CourtLinesSvg } from "@/components/landing/court-lines-svg";
import { EmptyState } from "@/components/empty-state";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  useAddClubAdminMutation,
  useCanManageClub,
  useClubAdminsQuery,
  useClubQuery,
  useCreateTournamentMutation,
  useRemoveClubAdminMutation,
  useTournamentsQuery,
  useUpdateClubMutation,
} from "@/data/queries";
import { formatDateRange } from "@/lib/format";
import { surfaceStyle } from "@/lib/surface";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : null;
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  STARTED: "En curso",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
  ABANDONED: "Abandonado",
};

export default function ClubManagePage() {
  const params = useParams<{ id: string | string[] }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const clubId = Number(rawId);
  const isValid = Number.isInteger(clubId) && clubId > 0;

  const clubQuery = useClubQuery(isValid ? clubId : undefined);
  const adminsQuery = useClubAdminsQuery(isValid ? clubId : undefined);
  const tournamentsQuery = useTournamentsQuery();
  const canManage = useCanManageClub(isValid ? clubId : undefined);

  const updateClub = useUpdateClubMutation();
  const addAdmin = useAddClubAdminMutation();
  const removeAdmin = useRemoveClubAdminMutation();
  const createTournament = useCreateTournamentMutation();

  const [editingClub, setEditingClub] = useState(false);
  const [creatingTournament, setCreatingTournament] = useState(false);
  const [adminUserId, setAdminUserId] = useState("");

  const club = clubQuery.data;
  const clubTournaments = (tournamentsQuery.data ?? []).filter((t) => t.clubId === clubId);

  async function handleClubUpdate(payload: ClubFormValues) {
    try {
      await updateClub.mutateAsync({ id: clubId, ...payload });
      setEditingClub(false);
    } catch {
      // surfaced via mutation error
    }
  }

  async function handleCreateTournament(values: TournamentFormValues) {
    try {
      await createTournament.mutateAsync({ clubId, ...values });
      setCreatingTournament(false);
    } catch {
      // surfaced via mutation error
    }
  }

  async function handleAddAdmin(event: React.FormEvent) {
    event.preventDefault();
    const userId = Number(adminUserId);
    if (!Number.isInteger(userId) || userId <= 0) return;
    try {
      await addAdmin.mutateAsync({ clubId, userId });
      setAdminUserId("");
    } catch {
      // surfaced via mutation error
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-court-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <Link href="/host" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-court">
          <ArrowLeft className="h-4 w-4" />
          Zona de organizador
        </Link>

        {!isValid && <p className="text-rose-600">Identificador de club no válido.</p>}
        {isValid && clubQuery.isLoading && <div className="h-32 animate-pulse rounded-3xl border border-zinc-100 bg-zinc-100/70" />}
        {isValid && (clubQuery.error || (!clubQuery.isLoading && !club)) && <p className="text-rose-600">No se pudo cargar este club.</p>}

        {club && (
          <>
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-b from-court-night to-court-night-deep p-8 text-white shadow-lg md:p-10">
              <CourtLinesSvg className="pointer-events-none absolute inset-0 h-full w-full text-white/[0.05]" />
              <div aria-hidden className="floodlight pointer-events-none absolute -top-16 right-1/4 h-72 w-72" />
              <div className="relative flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-sm font-bold uppercase tracking-wide text-ball-bright/90">Club</p>
                  <h1 className="mt-1 font-display text-3xl font-black tracking-tight md:text-4xl">{club.name}</h1>
                  <p className="mt-2 text-white/70">{club.address ?? "Sin dirección"}</p>
                  {club.phoneNumber ? <p className="text-white/70">{club.phoneNumber}</p> : null}
                  <p className="mt-1 text-sm text-white/50">Propietario: @{club.user.username}</p>
                </div>
                {canManage ? (
                  <button
                    type="button"
                    onClick={() => setEditingClub(true)}
                    className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright"
                  >
                    Editar club
                  </button>
                ) : null}
              </div>
            </div>

            {!canManage ? (
              <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                Estás viendo este club pero no eres propietario ni administrador, por lo que las acciones de gestión están ocultas.
              </p>
            ) : null}

            <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold">Torneos</h2>
                  {canManage ? (
                    <button
                      type="button"
                      onClick={() => setCreatingTournament(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-court px-4 py-2 text-sm font-semibold text-ball-bright hover:bg-court-hover"
                    >
                      <Plus className="h-4 w-4" />
                      Nuevo torneo
                    </button>
                  ) : null}
                </div>

                {createTournament.error ? <p className="mb-3 text-sm text-rose-600">{errorMessage(createTournament.error)}</p> : null}

                {clubTournaments.length === 0 ? (
                  <EmptyState
                    icon={Trophy}
                    title="Sin torneos"
                    description="Este club todavía no ha publicado torneos. Crea el primero."
                  />
                ) : (
                  <div className="space-y-3">
                    {clubTournaments.map((t) => {
                      const s = surfaceStyle(t.surface);
                      return (
                        <Link
                          key={t.id}
                          href={`/tournaments/${t.id}`}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-court/10 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                        >
                          <div>
                            <p className="font-display text-lg font-bold">{t.name}</p>
                            <p className="text-sm text-zinc-500">{formatDateRange(t.startDate, t.endDate)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Chip size="sm" variant="soft" className={`${s.bg} ${s.text} border ${s.border}`}>
                              {s.label}
                            </Chip>
                            <Chip size="sm" variant="soft" color="default">
                              {STATUS_LABEL[t.status] ?? t.status}
                            </Chip>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>

              <aside>
                <h2 className="mb-4 font-display text-xl font-bold">Administradores</h2>
                <div className="rounded-2xl border border-court/10 bg-white p-5 shadow-sm">
                  {adminsQuery.isLoading ? <p className="text-sm text-zinc-500">Cargando…</p> : null}
                  <ul className="space-y-2">
                    {(adminsQuery.data ?? []).map((admin) => (
                      <li key={admin.id} className="flex items-center justify-between gap-2 text-sm">
                        <span>@{admin.username}</span>
                        {canManage ? (
                          <button
                            type="button"
                            aria-label="Eliminar administrador"
                            onClick={() => removeAdmin.mutate({ clubId, userId: admin.id })}
                            className="text-zinc-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </li>
                    ))}
                    {!adminsQuery.isLoading && (adminsQuery.data ?? []).length === 0 ? (
                      <li className="rounded-xl bg-court/5 px-3 py-4 text-center text-sm text-zinc-500">
                        Aún no hay administradores.
                      </li>
                    ) : null}
                  </ul>

                  {canManage ? (
                    <form onSubmit={handleAddAdmin} className="mt-4 flex items-center gap-2 border-t border-court/10 pt-4">
                      <input
                        type="number"
                        min="1"
                        value={adminUserId}
                        onChange={(e) => setAdminUserId(e.target.value)}
                        placeholder="ID de usuario"
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-court"
                      />
                      <button
                        type="submit"
                        disabled={addAdmin.isPending}
                        className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-court px-3 py-2 text-sm font-semibold text-ball-bright hover:bg-court-hover disabled:opacity-50"
                      >
                        <UserPlus className="h-4 w-4" />
                        Añadir
                      </button>
                    </form>
                  ) : null}
                  {addAdmin.error ? <p className="mt-2 text-sm text-rose-600">{errorMessage(addAdmin.error)}</p> : null}
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
      <SiteFooter />

      {editingClub && club ? (
        <ClubFormModal
          club={club}
          onClose={() => {
            updateClub.reset();
            setEditingClub(false);
          }}
          onSubmit={handleClubUpdate}
          isSubmitting={updateClub.isPending}
          submitError={errorMessage(updateClub.error)}
        />
      ) : null}

      {creatingTournament ? (
        <TournamentFormModal
          tournament={null}
          onClose={() => {
            createTournament.reset();
            setCreatingTournament(false);
          }}
          onSubmit={handleCreateTournament}
          isSubmitting={createTournament.isPending}
          submitError={errorMessage(createTournament.error)}
        />
      ) : null}
    </div>
  );
}
