"use client";

import { useUser } from "@clerk/nextjs";
import { Button, Card } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUpdateMeMutation } from "@/data/queries";

type ProfileEditModalProps = {
  initialName: string;
  onClose: () => void;
};

export function ProfileEditModal({ initialName, onClose }: ProfileEditModalProps) {
  const { user } = useUser();
  const router = useRouter();
  const updateMe = useUpdateMeMutation();
  const [name, setName] = useState(initialName);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSubmitting = updateMe.isPending;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!user) {
      setError("Debes iniciar sesión para editar tu perfil.");
      return;
    }

    try {
      // Clerk is the source of truth; the webhook mirrors this to our DB. We also
      // PATCH /users/me directly so the profile reflects the change immediately.
      const [firstName, ...rest] = trimmed.split(/\s+/);
      await user.update({ firstName, lastName: rest.join(" ") });
      if (file) {
        await user.setProfileImage({ file });
      }
      await user.reload();
      // Changing the name regenerates the username on the backend, so follow it to the new URL.
      const updated = await updateMe.mutateAsync({ name: trimmed, imageUrl: user.imageUrl ?? null });
      onClose();
      router.replace(`/users/${encodeURIComponent(updated.username)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar tu perfil.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 px-4 py-8">
      <button
        type="button"
        aria-label="Cerrar editor de perfil"
        className="absolute inset-0 cursor-default disabled:cursor-not-allowed"
        disabled={isSubmitting}
        onClick={onClose}
      />
      <Card className="relative z-10 w-full max-w-md rounded-2xl border border-court/10 bg-white shadow-2xl">
        <Card.Header className="p-5 pb-0">
          <div>
            <p className="font-display text-lg font-bold">Editar perfil</p>
            <p className="text-sm text-zinc-500">Actualiza tu nombre y foto. Los cambios se sincronizan con tu cuenta.</p>
          </div>
        </Card.Header>
        <Card.Content className="p-5">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2 text-sm font-medium text-zinc-700">
              <span>Nombre</span>
              <input
                required
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Tu nombre"
                className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-court"
              />
            </label>

            <label className="block space-y-2 text-sm font-medium text-zinc-700">
              <span>Foto de perfil</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-court"
              />
            </label>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" className="text-zinc-700" onPress={onClose} isDisabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-court text-ball-bright hover:bg-court-hover" isDisabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
