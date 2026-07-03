"use client";

import { Show } from "@clerk/nextjs";
import { LogIn, Mail, Pencil, Settings2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ClubContactCta } from "@/components/club-contact-modal";
import { ClubFormModal, type ClubFormValues } from "@/components/host/club-form-modal";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useClubsQuery, useMeQuery, useUpdateClubMutation } from "@/data/queries";
import type { Club } from "@/models";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : null;
}

export default function HostDashboardPage() {
  const me = useMeQuery();
  const clubsQuery = useClubsQuery();
  const updateClub = useUpdateClubMutation();
  const [editingClub, setEditingClub] = useState<Club | null>(null);

  const managedClubIds = me.data?.managedClubIds ?? [];
  const myClubs = (clubsQuery.data ?? []).filter((club) => managedClubIds.includes(club.id));
  const isLoading = me.isLoading || clubsQuery.isLoading;
  const submitError = errorMessage(updateClub.error);

  async function handleSubmit(payload: ClubFormValues) {
    if (!editingClub) return;
    try {
      await updateClub.mutateAsync({ id: editingClub.id, ...payload });
      setEditingClub(null);
    } catch {
      // surfaced via mutation error
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-court-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8">
          <PageHero
            eyebrow="Zona de organizador"
            title="Tus clubes"
            accent=" clubes"
            subtitle="Publica y gestiona los torneos de tu club. ¿Aún no tienes club en CourtRank? Escríbenos y lo damos de alta."
          />
        </div>

        <Show when="signed-out">
          <div className="rounded-2xl border border-dashed border-court/20 bg-white p-10 text-center">
            <LogIn className="mx-auto h-8 w-8 text-court" />
            <p className="mt-2 font-display text-lg font-bold">Inicia sesión para organizar</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
              Los torneos se publican desde la cuenta de tu club. Inicia sesión para acceder a tus clubes y gestionar
              tus torneos.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 rounded-xl bg-court px-4 py-2 text-sm font-semibold text-ball-bright hover:bg-court-hover"
              >
                <LogIn className="h-4 w-4" />
                Iniciar sesión
              </Link>
              <ClubContactCta className="inline-flex items-center gap-2 rounded-xl border border-court/20 bg-white px-4 py-2 text-sm font-semibold text-court-ink hover:bg-court/5">
                <Mail className="h-4 w-4" />
                ¿Aún sin club? Escríbenos
              </ClubContactCta>
            </div>
          </div>
        </Show>

        <Show when="signed-in">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Clubes que gestionas</h2>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-dashed border-court/20 bg-white p-10 text-center">
              <p className="text-sm text-zinc-500">Cargando clubes…</p>
            </div>
          ) : null}

          {!isLoading && myClubs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-court/20 bg-white p-10 text-center">
              <Mail className="mx-auto h-8 w-8 text-court" />
              <p className="mt-2 font-display text-lg font-bold">¿Gestionas un club?</p>
              <p className="mt-1 text-sm text-zinc-500">
                Los clubes se dan de alta personalmente con nosotros. Escríbenos y te creamos la cuenta de tu club.
              </p>
              <ClubContactCta className="mt-4 inline-flex items-center gap-2 rounded-xl bg-court px-4 py-2 text-sm font-semibold text-ball-bright hover:bg-court-hover">
                <Mail className="h-4 w-4" />
                Contactar
              </ClubContactCta>
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
                </div>
              </div>
            ))}
          </div>
        </Show>
      </main>
      <SiteFooter />

      {editingClub ? (
        <ClubFormModal
          key={editingClub.id}
          club={editingClub}
          onClose={() => {
            updateClub.reset();
            setEditingClub(null);
          }}
          onSubmit={handleSubmit}
          isSubmitting={updateClub.isPending}
          submitError={submitError}
        />
      ) : null}
    </div>
  );
}
