"use client";

import { Show } from "@clerk/nextjs";
import { LogIn, Mail, Pencil, Settings2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ClubContactCta } from "@/components/club-contact-modal";
import { DataCard } from "@/components/data-card";
import { EmptyState } from "@/components/empty-state";
import { ClubFormModal, type ClubFormValues } from "@/components/host/club-form-modal";
import { PageHero } from "@/components/page-hero";
import { PageScaffold } from "@/components/page-scaffold";
import { PageSkeleton } from "@/components/page-skeleton";
import { useClubsQuery, useMeQuery, useUpdateClubMutation } from "@/data/queries";
import { errorMessage } from "@/lib/errors";
import type { Club } from "@/models";

export default function HostDashboardPage() {
  const me = useMeQuery();
  const clubsQuery = useClubsQuery();
  const updateClub = useUpdateClubMutation();
  const [editingClub, setEditingClub] = useState<Club | null>(null);

  const managedClubIds = me.data?.managedClubIds ?? [];
  const myClubs = (clubsQuery.data ?? []).filter((club) => managedClubIds.includes(club.id));
  const isLoading = me.isLoading || clubsQuery.isLoading;
  const submitError = updateClub.error ? errorMessage(updateClub.error) : null;

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
    <PageScaffold>
      <div className="mb-6">
        <PageHero
          compact
          eyebrow="Zona de organizador"
          title="Tus clubes"
          accent=" clubes"
          subtitle="Publica y gestiona los torneos de tu club. ¿Aún no tienes club en CourtRank? Escríbenos y lo damos de alta."
        />
      </div>

      <Show when="signed-out">
        <EmptyState
          icon={LogIn}
          title="Inicia sesión para organizar"
          description="Los torneos se publican desde la cuenta de tu club. Inicia sesión para acceder a tus clubes y gestionar tus torneos."
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
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
          }
        />
      </Show>

      <Show when="signed-in">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Clubes que gestionas</h2>
        </div>

        {isLoading ? <PageSkeleton rows={2} height="h-28" /> : null}

        {!isLoading && myClubs.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="¿Gestionas un club?"
            description="Los clubes se dan de alta personalmente con nosotros. Escríbenos y te creamos la cuenta de tu club."
            action={
              <ClubContactCta className="inline-flex items-center gap-2 rounded-xl bg-court px-4 py-2 text-sm font-semibold text-ball-bright hover:bg-court-hover">
                <Mail className="h-4 w-4" />
                Contactar
              </ClubContactCta>
            }
          />
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {myClubs.map((club) => (
            <DataCard key={club.id} accent="var(--court)">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold">{club.name}</p>
                  <p className="text-sm text-stone-500">{club.address ?? "Sin dirección"}</p>
                  {club.phoneNumber ? <p className="text-sm text-stone-500">{club.phoneNumber}</p> : null}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-court/10 pt-3">
                <Link
                  href={`/host/clubs/${club.id}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-court/5 px-3 py-1.5 text-sm font-medium text-court hover:bg-court/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-court"
                >
                  <Settings2 className="h-4 w-4" />
                  Gestionar
                </Link>
                <button
                  type="button"
                  onClick={() => setEditingClub(club)}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-court-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-court"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
              </div>
            </DataCard>
          ))}
        </div>
      </Show>

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
    </PageScaffold>
  );
}
