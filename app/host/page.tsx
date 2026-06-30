"use client";

import { Show } from "@clerk/nextjs";
import { Building2, Pencil, Plus, Settings2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ClubFormModal } from "@/components/host/club-form-modal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  useClubsQuery,
  useCreateClubMutation,
  useDeleteClubMutation,
  useMeQuery,
  useUpdateClubMutation,
} from "@/data/queries";
import type { Club, CreateClubRequest } from "@/models";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : null;
}

export default function HostDashboardPage() {
  const me = useMeQuery();
  const clubsQuery = useClubsQuery();
  const createClub = useCreateClubMutation();
  const updateClub = useUpdateClubMutation();
  const deleteClub = useDeleteClubMutation();
  const [editingClub, setEditingClub] = useState<Club | null | undefined>(undefined);

  const myClubs = (clubsQuery.data ?? []).filter((club) => club.user.id === me.data?.id);
  const submitError = errorMessage(createClub.error) ?? errorMessage(updateClub.error);

  async function handleSubmit(payload: CreateClubRequest) {
    try {
      if (editingClub) {
        await updateClub.mutateAsync({ id: editingClub.id, ...payload });
      } else {
        await createClub.mutateAsync(payload);
      }
      setEditingClub(undefined);
    } catch {
      // surfaced via mutation error
    }
  }

  async function handleDelete(club: Club) {
    if (!window.confirm(`¿Eliminar el club "${club.name}"? También se eliminarán sus torneos.`)) return;
    try {
      await deleteClub.mutateAsync(club.id);
    } catch {
      // surfaced via mutation error
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-court-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-court/10 bg-white p-8 shadow-sm">
          <div className="court-lines absolute inset-0 -z-10 opacity-60" />
          <div className="glow absolute -right-16 -top-20 -z-10 h-56 w-56" />
          <p className="font-display text-sm font-bold uppercase tracking-wide text-court">Zona de organizador</p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight md:text-5xl">Tus clubes</h1>
          <p className="mt-3 max-w-xl text-zinc-600">Crea un club y luego publica y gestiona torneos a los que los jugadores puedan apuntarse.</p>
        </div>

        <Show when="signed-out">
          <p className="text-zinc-600">Inicia sesión para gestionar tus clubes.</p>
        </Show>

        <Show when="signed-in">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Clubes que gestionas</h2>
            <button
              type="button"
              onClick={() => setEditingClub(null)}
              className="inline-flex items-center gap-2 rounded-xl bg-court px-4 py-2 text-sm font-semibold text-ball-bright hover:bg-court-hover"
            >
              <Plus className="h-4 w-4" />
              Nuevo club
            </button>
          </div>

          {clubsQuery.isLoading ? <p className="text-sm text-zinc-500">Cargando clubes…</p> : null}
          {deleteClub.error ? <p className="mb-3 text-sm text-rose-600">{errorMessage(deleteClub.error)}</p> : null}

          {!clubsQuery.isLoading && myClubs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-court/20 bg-white p-10 text-center">
              <Building2 className="mx-auto h-8 w-8 text-court" />
              <p className="mt-2 font-display text-lg font-bold">Aún no hay clubes</p>
              <p className="mt-1 text-sm text-zinc-500">Crea tu primer club para empezar a organizar.</p>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            {myClubs.map((club) => (
              <div key={club.id} className="rounded-2xl border border-court/10 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold">{club.name}</p>
                    <p className="text-sm text-zinc-500">{club.address ?? "Sin dirección"}</p>
                    {club.phoneNumber ? <p className="text-sm text-zinc-500">{club.phoneNumber}</p> : null}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-court/10 pt-3">
                  <Link
                    href={`/host/clubs/${club.id}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-court/5 px-3 py-1.5 text-sm font-medium text-court hover:bg-court/10"
                  >
                    <Settings2 className="h-4 w-4" />
                    Gestionar
                  </Link>
                  <button
                    type="button"
                    onClick={() => setEditingClub(club)}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-court-ink"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(club)}
                    disabled={deleteClub.isPending}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Show>
      </main>
      <SiteFooter />

      {editingClub !== undefined ? (
        <ClubFormModal
          key={editingClub?.id ?? "create-club"}
          club={editingClub}
          onClose={() => {
            createClub.reset();
            updateClub.reset();
            setEditingClub(undefined);
          }}
          onSubmit={handleSubmit}
          isSubmitting={createClub.isPending || updateClub.isPending}
          submitError={submitError}
        />
      ) : null}
    </div>
  );
}
