"use client";

import { Button, Form } from "@heroui/react";
import { Show } from "@clerk/nextjs";
import { Building2, Inbox, Mail, Phone, Trash2, UserCheck } from "lucide-react";
import { useState } from "react";
import { ModalShell, inputClass } from "@/components/host/modal-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getUserByUsername } from "@/data/api/users";
import {
  useClubContactRequestsQuery,
  useCreateClubMutation,
  useDeleteClubContactRequestMutation,
  useMeQuery,
} from "@/data/queries";
import { errorMessage } from "@/lib/errors";
import type { ClubContactRequest } from "@/models";

const dateFormatter = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" });

export default function AdminPage() {
  const me = useMeQuery();
  const requestsQuery = useClubContactRequestsQuery();
  const deleteRequest = useDeleteClubContactRequestMutation();
  const [provisioning, setProvisioning] = useState<ClubContactRequest | null>(null);

  const isAdmin = me.data?.role === "PLATFORM_ADMIN";
  const requests = requestsQuery.data ?? [];

  async function handleDelete(request: ClubContactRequest) {
    if (!window.confirm(`¿Eliminar la solicitud de "${request.clubName}"?`)) return;
    try {
      await deleteRequest.mutateAsync(request.id);
    } catch {
      // surfaced via mutation error
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-court-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8">
          <p className="font-display text-sm font-bold uppercase tracking-wide text-court">Administración</p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight md:text-5xl">Solicitudes de clubes</h1>
          <p className="mt-3 max-w-xl text-zinc-600">
            Clubes que han pedido unirse a la plataforma. Da de alta su club y elimina la solicitud una vez atendida.
          </p>
        </div>

        <Show when="signed-out">
          <p className="text-zinc-600">Inicia sesión para acceder a la administración.</p>
        </Show>

        <Show when="signed-in">
          {me.isLoading || (isAdmin && requestsQuery.isLoading) ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
                <div key={i} className="h-32 animate-pulse rounded-2xl border border-zinc-100 bg-zinc-100/70" />
              ))}
            </div>
          ) : null}

          {!me.isLoading && !isAdmin ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              Esta zona es solo para administradores de la plataforma.
            </p>
          ) : null}

          {isAdmin && requestsQuery.isError ? (
            <p className="text-rose-600">No se pudieron cargar las solicitudes.</p>
          ) : null}

          {isAdmin && !requestsQuery.isLoading && !requestsQuery.isError ? (
            requests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-court/20 bg-white p-10 text-center">
                <Inbox className="mx-auto h-8 w-8 text-court" />
                <p className="mt-2 font-display text-lg font-bold">No hay solicitudes pendientes</p>
                <p className="mt-1 text-sm text-zinc-500">Las nuevas solicitudes del formulario aparecerán aquí.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deleteRequest.error ? (
                  <p className="text-sm text-rose-600">{errorMessage(deleteRequest.error)}</p>
                ) : null}
                {requests.map((request) => (
                  <div key={request.id} className="rounded-2xl border border-court/10 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-display text-lg font-bold">{request.clubName}</p>
                        <p className="text-sm text-zinc-500">
                          {request.contactName} · {dateFormatter.format(new Date(request.createdAt))}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-600">
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
                        {request.message ? <p className="mt-3 text-sm text-zinc-600">“{request.message}”</p> : null}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => setProvisioning(request)}
                          className="inline-flex items-center gap-2 rounded-xl bg-court px-4 py-2 text-sm font-semibold text-ball-bright hover:bg-court-hover"
                        >
                          <Building2 className="h-4 w-4" />
                          Dar de alta
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(request)}
                          disabled={deleteRequest.isPending}
                          className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : null}
        </Show>
      </main>
      <SiteFooter />

      {provisioning ? (
        <ProvisionClubModal key={provisioning.id} request={provisioning} onClose={() => setProvisioning(null)} />
      ) : null}
    </div>
  );
}

// Creates the club for an existing user (its future owner), prefilled from the inquiry.
function ProvisionClubModal({ request, onClose }: { request: ClubContactRequest; onClose: () => void }) {
  const createClub = useCreateClubMutation();
  const deleteRequest = useDeleteClubContactRequestMutation();
  const [name, setName] = useState(request.clubName);
  const [phoneNumber, setPhoneNumber] = useState(request.phone ?? "");
  const [address, setAddress] = useState("");
  const [ownerUsername, setOwnerUsername] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [createdClubName, setCreatedClubName] = useState<string | null>(null);

  const isPending = createClub.isPending || deleteRequest.isPending;

  if (createdClubName) {
    return (
      <ModalShell title="Club dado de alta" onClose={onClose}>
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <UserCheck className="h-10 w-10 text-court" />
          <p className="font-display text-lg font-bold text-court-ink">{createdClubName} ya está en la plataforma</p>
          <p className="max-w-sm text-sm text-zinc-600">
            El club aparece ya en la zona de organizador de su propietario. Puedes eliminar la solicitud atendida.
          </p>
          <div className="mt-2 flex gap-3">
            <Button type="button" variant="ghost" className="text-zinc-700" onPress={onClose}>
              Cerrar
            </Button>
            <Button
              type="button"
              className="bg-court text-ball-bright hover:bg-court-hover"
              isDisabled={deleteRequest.isPending}
              onPress={async () => {
                try {
                  await deleteRequest.mutateAsync(request.id);
                  onClose();
                } catch {
                  // surfaced via mutation error below the buttons on reopen
                }
              }}
            >
              Eliminar solicitud
            </Button>
          </div>
        </div>
      </ModalShell>
    );
  }

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
          if (!name.trim() || !ownerUsername.trim()) {
            setFormError("El nombre del club y el usuario propietario son obligatorios.");
            return;
          }
          try {
            const owner = await getUserByUsername(ownerUsername.trim()).catch(() => null);
            if (!owner) {
              setFormError("No existe ningún usuario con ese nombre — pídele que se registre primero.");
              return;
            }
            const club = await createClub.mutateAsync({
              name: name.trim(),
              phoneNumber: phoneNumber.trim() || null,
              address: address.trim() || null,
              ownerUserId: owner.id,
            });
            setCreatedClubName(club.name);
          } catch {
            setFormError("No se pudo crear el club. Inténtalo de nuevo.");
          }
        }}
      >
        <label className="block space-y-2 text-sm font-medium text-zinc-700">
          <span>Nombre del club</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>
        <label className="block space-y-2 text-sm font-medium text-zinc-700">
          <span>Usuario propietario</span>
          <input
            required
            value={ownerUsername}
            onChange={(e) => setOwnerUsername(e.target.value)}
            placeholder="nombre-de-usuario (el club quedará a su nombre)"
            className={inputClass}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium text-zinc-700">
            <span>Teléfono (opcional)</span>
            <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={inputClass} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-zinc-700">
            <span>Dirección (opcional)</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
          </label>
        </div>

        {formError ? <p className="text-sm text-rose-600">{formError}</p> : null}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" className="text-zinc-700" onPress={onClose} isDisabled={isPending}>
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
