"use client";

import { Button, Form } from "@heroui/react";
import { CalendarDays, Check, KeyRound, Plus, Shield, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { TournamentFormModal, type TournamentFormValues } from "@/components/host/tournament-form-modal";
import { FormError, inputClass, ModalShell } from "@/components/modal-shell";
import { PageHeroFrame } from "@/components/page-hero";
import { PageScaffold } from "@/components/page-scaffold";
import { PageSkeleton } from "@/components/page-skeleton";
import {
  useCreateLeagueMutation,
  useCreateTournamentMutation,
  useJoinLeagueByCodeMutation,
  useJoinTournamentByCodeMutation,
  useMyLeaguesQuery,
  useMyTournamentsQuery,
} from "@/data/queries";
import { errorMessage } from "@courtrank/core/lib/errors";
import { formatDateRange } from "@courtrank/core/lib/format";
import { TOURNAMENT_STATUS_LABEL } from "@courtrank/core/lib/labels";

type LeagueFormValues = { name: string; description: string | null };

function CopyLeagueCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard?.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={copyCode}
      className={`relative inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-court ${
        copied ? "bg-court text-ball-bright" : "bg-court/5 text-court hover:bg-court/10"
      }`}
      aria-label={`Copiar código ${code}`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <KeyRound className="h-3.5 w-3.5" />}
      {code}
      <span
        className={`pointer-events-none absolute -top-8 right-0 rounded-lg bg-court px-2 py-1 text-[11px] font-semibold text-ball-bright shadow-sm transition-all ${
          copied ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
        }`}
      >
        Copiado!
      </span>
    </button>
  );
}

function LeagueFormModal({
  onClose,
  onSubmit,
  isSubmitting,
  submitError,
}: {
  onClose: () => void;
  onSubmit: (values: LeagueFormValues) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  return (
    <ModalShell
      title="Crear liga"
      subtitle="Una clasificación privada para jugar con tu grupo."
      onClose={onClose}
      disabled={isSubmitting}
    >
      <Form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setValidationError(null);
          if (!name.trim()) {
            setValidationError("El nombre de la liga es obligatorio.");
            return;
          }
          await onSubmit({ name: name.trim(), description: description.trim() || null });
        }}
      >
        <label className="block space-y-2 text-sm font-medium text-stone-700">
          <span>Nombre</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
            placeholder="Liga del sábado"
          />
        </label>
        <label className="block space-y-2 text-sm font-medium text-stone-700">
          <span>Descripción</span>
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={inputClass}
            placeholder="Pistas, normas del grupo, horario habitual..."
          />
        </label>
        <FormError message={validationError ?? submitError} />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" className="text-stone-700" onPress={onClose} isDisabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-court text-ball-bright hover:bg-court-hover" isDisabled={isSubmitting}>
            Crear liga
          </Button>
        </div>
      </Form>
    </ModalShell>
  );
}

function JoinCodeForm({
  label,
  placeholder,
  onSubmit,
  isSubmitting,
  error,
}: {
  label: string;
  placeholder: string;
  onSubmit: (code: string) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}) {
  const [code, setCode] = useState("");
  return (
    <form
      className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const inviteCode = code.trim().toUpperCase();
        if (!inviteCode) return;
        await onSubmit(inviteCode);
        setCode("");
      }}
    >
      <label className="min-w-0 space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-stone-400">{label}</span>
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      </label>
      <Button
        type="submit"
        className="shrink-0 self-end bg-court px-3 text-ball-bright hover:bg-court-hover"
        isDisabled={isSubmitting}
      >
        Unirse
      </Button>
      <div className="col-span-2">
        <FormError message={error} />
      </div>
    </form>
  );
}

export default function CompetitionsPage() {
  const router = useRouter();
  const leaguesQuery = useMyLeaguesQuery();
  const tournamentsQuery = useMyTournamentsQuery();
  const createLeague = useCreateLeagueMutation();
  const createTournament = useCreateTournamentMutation();
  const joinLeague = useJoinLeagueByCodeMutation();
  const joinTournament = useJoinTournamentByCodeMutation();
  const [creatingLeague, setCreatingLeague] = useState(false);
  const [creatingTournament, setCreatingTournament] = useState(false);

  const privateTournaments = (tournamentsQuery.data ?? []).filter((tournament) => tournament.visibility === "PRIVATE");
  const isLoading = leaguesQuery.isLoading || tournamentsQuery.isLoading;

  async function handleCreateLeague(values: LeagueFormValues) {
    try {
      const league = await createLeague.mutateAsync(values);
      setCreatingLeague(false);
      router.push(`/leagues/${league.id}`);
    } catch {
      // surfaced in modal
    }
  }

  async function handleCreateTournament(values: TournamentFormValues) {
    try {
      const tournament = await createTournament.mutateAsync(values);
      setCreatingTournament(false);
      router.push(`/tournaments/${tournament.id}`);
    } catch {
      // surfaced in modal
    }
  }

  return (
    <PageScaffold>
      <PageHeroFrame
        className="p-6 md:p-10"
        contentClassName="grid gap-6 md:grid-cols-[minmax(0,1fr)_20rem] md:items-end lg:grid-cols-[minmax(0,1fr)_auto]"
      >
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-wide text-ball-bright/90">Ligas privadas</p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight md:text-5xl">Juega con tu grupo</h1>
          <p className="mt-3 max-w-2xl text-white/70">
            Crea ligas con ranking propio o torneos por invitación sin afectar al Elo público.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-1 lg:flex lg:items-center">
          <Button
            className="w-full min-w-0 justify-center bg-ball-bright px-2 text-court-ink hover:bg-ball sm:px-4 lg:w-auto"
            onPress={() => setCreatingLeague(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Crear liga
          </Button>
          <Button
            variant="outline"
            className="w-full min-w-0 justify-center border-white/20 px-2 text-white/80 hover:bg-white/10 sm:px-4 lg:w-auto"
            onPress={() => setCreatingTournament(true)}
          >
            <Trophy className="mr-1 h-4 w-4" />
            Crear torneo
          </Button>
        </div>
      </PageHeroFrame>

      <section className="mt-8 grid gap-4 rounded-2xl border border-court/10 bg-white p-5 shadow-sm md:grid-cols-2">
        <JoinCodeForm
          label="Código de liga"
          placeholder="ABC234XY"
          onSubmit={async (inviteCode) => {
            const league = await joinLeague.mutateAsync({ inviteCode });
            router.push(`/leagues/${league.id}`);
          }}
          isSubmitting={joinLeague.isPending}
          error={joinLeague.error ? errorMessage(joinLeague.error, "league.join") : null}
        />
        <JoinCodeForm
          label="Código de torneo"
          placeholder="JKM789QR"
          onSubmit={async (inviteCode) => {
            const tournament = await joinTournament.mutateAsync({ inviteCode });
            router.push(`/tournaments/${tournament.id}`);
          }}
          isSubmitting={joinTournament.isPending}
          error={joinTournament.error ? errorMessage(joinTournament.error, "tournament.joinByCode") : null}
        />
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Tus ligas</h2>
          </div>
          {isLoading ? <PageSkeleton rows={3} height="h-24" /> : null}
          {!isLoading && (leaguesQuery.data ?? []).length === 0 ? (
            <EmptyState
              icon={Users}
              title="Sin ligas todavía"
              description="Crea una liga o únete con un código de invitación."
            />
          ) : null}
          <div className="grid gap-3">
            {(leaguesQuery.data ?? []).map((league) => (
              <article
                key={league.id}
                className="rounded-2xl border border-court/10 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/leagues/${league.id}`}
                    className="min-w-0 flex-1 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-court"
                  >
                    <p className="truncate font-display text-lg font-bold text-court-ink hover:text-court">
                      {league.name}
                    </p>
                    {league.description ? <p className="mt-1 text-sm text-stone-500">{league.description}</p> : null}
                  </Link>
                  <CopyLeagueCodeButton code={league.inviteCode} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Torneos privados</h2>
          </div>
          {isLoading ? <PageSkeleton rows={3} height="h-24" /> : null}
          {!isLoading && privateTournaments.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="Sin torneos privados"
              description="Crea un torneo por invitación para usar el cuadro completo con tus amigos."
            />
          ) : null}
          <div className="grid gap-3">
            {privateTournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournaments/${tournament.id}`}
                className="rounded-2xl border border-court/10 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold">{tournament.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-stone-500">
                      <CalendarDays className="h-4 w-4" />
                      {formatDateRange(tournament.startDate, tournament.endDate)}
                    </p>
                  </div>
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600">
                    {TOURNAMENT_STATUS_LABEL[tournament.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {creatingLeague ? (
        <LeagueFormModal
          onClose={() => {
            createLeague.reset();
            setCreatingLeague(false);
          }}
          onSubmit={handleCreateLeague}
          isSubmitting={createLeague.isPending}
          submitError={createLeague.error ? errorMessage(createLeague.error, "league.create") : null}
        />
      ) : null}

      {creatingTournament ? (
        <TournamentFormModal
          tournament={null}
          subtitle="Será privado, tendrá código de invitación y no afectará al Elo público."
          onClose={() => {
            createTournament.reset();
            setCreatingTournament(false);
          }}
          onSubmit={handleCreateTournament}
          isSubmitting={createTournament.isPending}
          submitError={createTournament.error ? errorMessage(createTournament.error, "tournament.create") : null}
        />
      ) : null}
    </PageScaffold>
  );
}
