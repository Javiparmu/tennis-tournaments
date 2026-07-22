"use client";

import { Button, Form } from "@heroui/react";
import type { LeagueMatch, LeagueMember, RecordLeagueMatchRequest, TennisScore } from "@courtrank/core/models";
import { errorMessage } from "@courtrank/core/lib/errors";
import { ArrowLeft, CalendarDays, Check, KeyRound, Plus, RefreshCw, Trash2, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { FormError, inputClass, ModalShell } from "@/components/modal-shell";
import { PageHeroFrame } from "@/components/page-hero";
import { PageScaffold } from "@/components/page-scaffold";
import { PageSkeleton } from "@/components/page-skeleton";
import {
  useAddLeagueMemberMutation,
  useDeleteLeagueMatchMutation,
  useLeagueMatchesQuery,
  useLeagueMembersQuery,
  useLeagueQuery,
  useMeQuery,
  useRecordLeagueMatchMutation,
  useRegenerateLeagueInviteCodeMutation,
  useRemoveLeagueMemberMutation,
} from "@/data/queries";

type SetRow = { p1: string; p2: string; tb1: string; tb2: string };

function formatLeagueScore(score: TennisScore | null): string {
  if (!score || score.sets.length === 0) return "Sin marcador";
  return score.sets
    .map((set) => {
      const tb = set.tiebreak ? `(${set.tiebreak.player1Points}-${set.tiebreak.player2Points})` : "";
      return `${set.player1Games}-${set.player2Games}${tb}`;
    })
    .join("  ");
}

function inferWinnerFromSets(player1Id: number, player2Id: number, score: TennisScore): number | null {
  let p1Sets = 0;
  let p2Sets = 0;
  for (const set of score.sets) {
    if (set.player1Games === set.player2Games) return null;
    if (set.player1Games > set.player2Games) p1Sets += 1;
    else p2Sets += 1;
  }
  if (p1Sets === p2Sets) return null;
  return p1Sets > p2Sets ? player1Id : player2Id;
}

function memberName(membersByPlayer: Map<number, LeagueMember>, playerId: number): string {
  return membersByPlayer.get(playerId)?.name ?? `Jugador ${playerId}`;
}

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
      className={`relative inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright ${
        copied ? "bg-ball-bright text-court-ink" : "bg-white/10 text-white/80 hover:bg-white/15"
      }`}
      aria-label={`Copiar código ${code}`}
    >
      {copied ? <Check className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
      {code}
      <span
        className={`pointer-events-none absolute -top-9 right-0 rounded-lg bg-ball-bright px-2 py-1 text-xs font-semibold text-court-ink shadow-sm transition-all ${
          copied ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
        }`}
      >
        Copiado!
      </span>
    </button>
  );
}

function AddMemberModal({
  onClose,
  onSubmit,
  isSubmitting,
  submitError,
}: {
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
}) {
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  return (
    <ModalShell
      title="Añadir miembro"
      subtitle="El servidor resuelve el correo sin exponer usuarios."
      onClose={onClose}
      disabled={isSubmitting}
      size="md"
    >
      <Form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setValidationError(null);
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setValidationError("Introduce un correo válido.");
            return;
          }
          await onSubmit(email.trim());
        }}
      >
        <label className="block space-y-2 text-sm font-medium text-stone-700">
          <span>Correo</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
            placeholder="ana@example.com"
          />
        </label>
        <FormError message={validationError ?? submitError} />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" className="text-stone-700" onPress={onClose} isDisabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-court text-ball-bright hover:bg-court-hover" isDisabled={isSubmitting}>
            Añadir
          </Button>
        </div>
      </Form>
    </ModalShell>
  );
}

function RecordResultModal({
  members,
  onClose,
  onSubmit,
  isSubmitting,
  submitError,
}: {
  members: LeagueMember[];
  onClose: () => void;
  onSubmit: (payload: RecordLeagueMatchRequest) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
}) {
  const [player1Id, setPlayer1Id] = useState("");
  const [player2Id, setPlayer2Id] = useState("");
  const [playedAt, setPlayedAt] = useState("");
  const [rows, setRows] = useState<SetRow[]>([{ p1: "", p2: "", tb1: "", tb2: "" }]);
  const [manualWinnerId, setManualWinnerId] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const p1 = Number(player1Id);
  const p2 = Number(player2Id);
  const parsedScore = useMemo<TennisScore | null>(() => {
    const sets = rows
      .filter((row) => row.p1 !== "" || row.p2 !== "")
      .map((row) => ({
        player1Games: Number(row.p1),
        player2Games: Number(row.p2),
        tiebreak:
          row.tb1 !== "" && row.tb2 !== "" ? { player1Points: Number(row.tb1), player2Points: Number(row.tb2) } : null,
      }));
    if (sets.length === 0) return null;
    if (sets.some((set) => !Number.isInteger(set.player1Games) || !Number.isInteger(set.player2Games))) return null;
    return { sets };
  }, [rows]);
  const inferredWinnerId = p1 > 0 && p2 > 0 && parsedScore ? inferWinnerFromSets(p1, p2, parsedScore) : null;

  function update(index: number, patch: Partial<SetRow>) {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  return (
    <ModalShell
      title="Registrar resultado"
      subtitle="El Elo de la liga se recalcula al guardar."
      onClose={onClose}
      disabled={isSubmitting}
    >
      <Form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setValidationError(null);
          if (!Number.isInteger(p1) || !Number.isInteger(p2) || p1 <= 0 || p2 <= 0 || p1 === p2) {
            setValidationError("Selecciona dos jugadores distintos.");
            return;
          }
          const winnerId = inferredWinnerId ?? Number(manualWinnerId);
          if (winnerId !== p1 && winnerId !== p2) {
            setValidationError("Selecciona el ganador.");
            return;
          }
          await onSubmit({
            player1Id: p1,
            player2Id: p2,
            winnerId,
            score: parsedScore,
            playedAt: playedAt ? new Date(playedAt).toISOString() : null,
          });
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-stone-700">
            <span>Jugador 1</span>
            <select value={player1Id} onChange={(event) => setPlayer1Id(event.target.value)} className={inputClass}>
              <option value="">Seleccionar</option>
              {members.map((member) => (
                <option key={member.playerId} value={member.playerId}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-stone-700">
            <span>Jugador 2</span>
            <select value={player2Id} onChange={(event) => setPlayer2Id(event.target.value)} className={inputClass}>
              <option value="">Seleccionar</option>
              {members.map((member) => (
                <option key={member.playerId} value={member.playerId}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-2 text-sm font-medium text-stone-700">
          <span>Fecha</span>
          <input
            type="datetime-local"
            value={playedAt}
            onChange={(event) => setPlayedAt(event.target.value)}
            className={inputClass}
          />
        </label>

        <div className="space-y-2">
          <p className="text-sm font-medium text-stone-700">Marcador opcional</p>
          {rows.map((row, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: positional set rows
            <div key={`set-${index}`} className="grid grid-cols-[3rem_1fr_1fr_1fr_1fr] gap-2 rounded-xl bg-court/5 p-3">
              <span className="self-center text-sm font-medium text-stone-500">{index + 1}</span>
              <input
                type="number"
                min="0"
                value={row.p1}
                onChange={(event) => update(index, { p1: event.target.value })}
                className={`${inputClass} rounded-xl text-center`}
                aria-label={`Juegos jugador 1 set ${index + 1}`}
              />
              <input
                type="number"
                min="0"
                value={row.p2}
                onChange={(event) => update(index, { p2: event.target.value })}
                className={`${inputClass} rounded-xl text-center`}
                aria-label={`Juegos jugador 2 set ${index + 1}`}
              />
              <input
                type="number"
                min="0"
                placeholder="TB 1"
                value={row.tb1}
                onChange={(event) => update(index, { tb1: event.target.value })}
                className={`${inputClass} rounded-xl text-center`}
                aria-label={`Tie-break jugador 1 set ${index + 1}`}
              />
              <input
                type="number"
                min="0"
                placeholder="TB 2"
                value={row.tb2}
                onChange={(event) => update(index, { tb2: event.target.value })}
                className={`${inputClass} rounded-xl text-center`}
                aria-label={`Tie-break jugador 2 set ${index + 1}`}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setRows((current) => [...current, { p1: "", p2: "", tb1: "", tb2: "" }])}
            className="text-sm font-medium text-court hover:text-court-hover"
          >
            Añadir set
          </button>
        </div>

        <label className="block space-y-2 text-sm font-medium text-stone-700">
          <span>Ganador</span>
          <select
            value={`${inferredWinnerId ?? manualWinnerId}`}
            onChange={(event) => setManualWinnerId(event.target.value)}
            className={inputClass}
            disabled={inferredWinnerId != null}
          >
            <option value="">Seleccionar</option>
            {p1 > 0 ? (
              <option value={p1}>{members.find((member) => member.playerId === p1)?.name ?? "Jugador 1"}</option>
            ) : null}
            {p2 > 0 ? (
              <option value={p2}>{members.find((member) => member.playerId === p2)?.name ?? "Jugador 2"}</option>
            ) : null}
          </select>
        </label>

        <FormError message={validationError ?? submitError} />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" className="text-stone-700" onPress={onClose} isDisabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-court text-ball-bright hover:bg-court-hover" isDisabled={isSubmitting}>
            Guardar resultado
          </Button>
        </div>
      </Form>
    </ModalShell>
  );
}

export default function LeaguePageClient() {
  const params = useParams<{ id: string | string[] }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(rawId);
  const isValid = Number.isInteger(id) && id > 0;

  const leagueQuery = useLeagueQuery(isValid ? id : undefined);
  const membersQuery = useLeagueMembersQuery(isValid ? id : undefined);
  const matchesQuery = useLeagueMatchesQuery(isValid ? id : undefined);
  const me = useMeQuery();
  const addMember = useAddLeagueMemberMutation();
  const removeMember = useRemoveLeagueMemberMutation();
  const recordMatch = useRecordLeagueMatchMutation();
  const deleteMatch = useDeleteLeagueMatchMutation();
  const regenerateInvite = useRegenerateLeagueInviteCodeMutation();

  const [addingMember, setAddingMember] = useState(false);
  const [recordingResult, setRecordingResult] = useState(false);
  const [removingMember, setRemovingMember] = useState<LeagueMember | null>(null);
  const [deletingMatch, setDeletingMatch] = useState<LeagueMatch | null>(null);

  const league = leagueQuery.data;
  const members = [...(membersQuery.data ?? [])].sort((a, b) => b.rating - a.rating || b.wins - a.wins);
  const matches = [...(matchesQuery.data ?? [])].sort((a, b) => +new Date(b.playedAt) - +new Date(a.playedAt));
  const membersByPlayer = useMemo(
    () => new Map((membersQuery.data ?? []).map((member) => [member.playerId, member])),
    [membersQuery.data],
  );
  const isOwner = league != null && me.data?.id === league.ownerUserId;

  return (
    <PageScaffold>
      <Link
        href="/competitions"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-court"
      >
        <ArrowLeft className="h-4 w-4" />
        Ligas
      </Link>

      {!isValid ? <p className="text-rose-600">Identificador de liga no válido.</p> : null}
      {isValid && leagueQuery.isLoading ? <PageSkeleton rows={2} height="h-32" /> : null}
      {isValid && (leagueQuery.error || (!leagueQuery.isLoading && !league)) ? (
        <EmptyState
          icon={Users}
          title="No se pudo cargar esta liga"
          description="Puede que no exista o que no tengas acceso."
        />
      ) : null}

      {league ? (
        <>
          <PageHeroFrame
            className="p-6 md:p-10"
            contentClassName="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
          >
            <div className="min-w-0">
              <p className="font-display text-sm font-bold uppercase tracking-wide text-ball-bright/90">Liga privada</p>
              <h1 className="mt-2 font-display text-4xl font-black tracking-tight md:text-5xl">{league.name}</h1>
              {league.description ? <p className="mt-3 max-w-2xl text-white/70">{league.description}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <CopyLeagueCodeButton code={league.inviteCode} />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white/80">
                  <Users className="h-4 w-4" />
                  {members.length} miembros
                </span>
              </div>
            </div>
            <div className="grid w-full gap-2 sm:w-64 lg:w-auto lg:grid-flow-col lg:auto-cols-max">
              <Button
                className="w-full justify-center bg-ball-bright text-court-ink hover:bg-ball lg:w-auto"
                onPress={() => setRecordingResult(true)}
              >
                <Plus className="mr-1 h-4 w-4" />
                Registrar resultado
              </Button>
              {isOwner ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-center border-white/20 text-white/80 hover:bg-white/10 lg:w-auto"
                    onPress={() => setAddingMember(true)}
                  >
                    <UserPlus className="mr-1 h-4 w-4" />
                    Añadir miembro
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-center border-white/20 text-white/80 hover:bg-white/10 lg:w-auto"
                    onPress={() => regenerateInvite.mutate(id)}
                    isDisabled={regenerateInvite.isPending}
                  >
                    <RefreshCw className="mr-1 h-4 w-4" />
                    Nuevo código
                  </Button>
                </>
              ) : null}
            </div>
          </PageHeroFrame>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
            <section className="rounded-2xl border border-court/10 bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-display text-xl font-bold">Clasificación</h2>
              {membersQuery.isLoading ? <PageSkeleton rows={4} height="h-12" /> : null}
              {!membersQuery.isLoading && members.length === 0 ? (
                <EmptyState size="compact" icon={Users} title="Sin miembros" />
              ) : null}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[34rem] text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-stone-400">
                    <tr>
                      <th className="py-2">#</th>
                      <th>Jugador</th>
                      <th className="text-right">Elo</th>
                      <th className="text-right">W-L</th>
                      <th className="text-right">Partidos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-court/10">
                    {members.map((member, index) => (
                      <tr key={member.playerId}>
                        <td className="py-3 font-semibold text-stone-400">{index + 1}</td>
                        <td>
                          <Link
                            href={`/players/${member.username}`}
                            className="font-semibold text-court-ink hover:text-court"
                          >
                            {member.name}
                          </Link>
                          {member.ratedMatches < 10 ? (
                            <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                              Provisional
                            </span>
                          ) : null}
                        </td>
                        <td className="text-right font-display font-bold">{member.rating}</td>
                        <td className="text-right">
                          {member.wins}-{member.losses}
                        </td>
                        <td className="text-right">{member.ratedMatches}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="grid gap-6">
              <section className="rounded-2xl border border-court/10 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold">Miembros</h2>
                </div>
                <ul className="space-y-2">
                  {(membersQuery.data ?? []).map((member) => (
                    <li
                      key={member.playerId}
                      className="flex items-center justify-between gap-3 rounded-xl bg-court/5 px-3 py-2 text-sm"
                    >
                      <span>
                        <span className="font-semibold">{member.name}</span>
                        <span className="ml-1 text-stone-500">@{member.username}</span>
                      </span>
                      {isOwner && member.userId !== league.ownerUserId ? (
                        <button
                          type="button"
                          aria-label="Quitar miembro"
                          onClick={() => setRemovingMember(member)}
                          className="text-stone-400 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>

          <section className="mt-8 rounded-2xl border border-court/10 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-display text-xl font-bold">Partidos</h2>
            {matchesQuery.isLoading ? <PageSkeleton rows={4} height="h-16" /> : null}
            {!matchesQuery.isLoading && matches.length === 0 ? (
              <EmptyState
                size="compact"
                icon={CalendarDays}
                title="Sin partidos"
                description="Registra el primer resultado para mover el ranking."
              />
            ) : null}
            <div className="grid gap-3">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-court/10 bg-court/5 p-4"
                >
                  <div>
                    <p className="font-semibold">
                      {memberName(membersByPlayer, match.player1Id)} vs {memberName(membersByPlayer, match.player2Id)}
                    </p>
                    <p className="text-sm text-stone-500">
                      Ganador: {memberName(membersByPlayer, match.winnerId)} · {formatLeagueScore(match.score)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-stone-500">
                      {new Date(match.playedAt).toLocaleDateString("es-ES")}
                    </span>
                    {isOwner ? (
                      <button
                        type="button"
                        aria-label="Eliminar resultado"
                        onClick={() => setDeletingMatch(match)}
                        className="text-stone-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {addingMember ? (
        <AddMemberModal
          onClose={() => {
            addMember.reset();
            setAddingMember(false);
          }}
          onSubmit={async (email) => {
            await addMember.mutateAsync({ id, payload: { email } });
            setAddingMember(false);
          }}
          isSubmitting={addMember.isPending}
          submitError={addMember.error ? errorMessage(addMember.error, "league.addMember") : null}
        />
      ) : null}

      {recordingResult ? (
        <RecordResultModal
          members={membersQuery.data ?? []}
          onClose={() => {
            recordMatch.reset();
            setRecordingResult(false);
          }}
          onSubmit={async (payload) => {
            await recordMatch.mutateAsync({ id, payload });
            setRecordingResult(false);
          }}
          isSubmitting={recordMatch.isPending}
          submitError={recordMatch.error ? errorMessage(recordMatch.error, "league.recordResult") : null}
        />
      ) : null}

      <ConfirmDialog
        open={removingMember != null}
        title="Quitar miembro"
        description={removingMember ? `Vas a quitar a ${removingMember.name} de la liga.` : undefined}
        confirmLabel="Quitar"
        isPending={removeMember.isPending}
        error={removeMember.error ? errorMessage(removeMember.error, "league.removeMember") : null}
        onClose={() => {
          removeMember.reset();
          setRemovingMember(null);
        }}
        onConfirm={() => {
          if (removingMember)
            removeMember.mutate(
              { id, playerId: removingMember.playerId },
              { onSuccess: () => setRemovingMember(null) },
            );
        }}
      />

      <ConfirmDialog
        open={deletingMatch != null}
        title="Eliminar resultado"
        description="El ranking de la liga se recalculará al borrar este partido."
        confirmLabel="Eliminar"
        isPending={deleteMatch.isPending}
        error={deleteMatch.error ? errorMessage(deleteMatch.error, "league.deleteResult") : null}
        onClose={() => {
          deleteMatch.reset();
          setDeletingMatch(null);
        }}
        onConfirm={() => {
          if (deletingMatch)
            deleteMatch.mutate({ id, matchId: deletingMatch.id }, { onSuccess: () => setDeletingMatch(null) });
        }}
      />
    </PageScaffold>
  );
}
