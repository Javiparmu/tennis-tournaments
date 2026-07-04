"use client";

import { useUser } from "@clerk/nextjs";
import { Button, Card } from "@heroui/react";
import { ImageUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useUpdateMeMutation } from "@/data/queries";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

type ProfileEditModalProps = {
  initialName: string;
  initialUsername: string;
  initialImageUrl: string | null;
  onClose: () => void;
};

export function ProfileEditModal({ initialName, initialUsername, initialImageUrl, onClose }: ProfileEditModalProps) {
  const { user } = useUser();
  const router = useRouter();
  const updateMe = useUpdateMeMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initialName);
  const [username, setUsername] = useState(initialUsername);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Preview: the picked file (via a temporary object URL) if any, else the current image.
  const [preview, setPreview] = useState<string | null>(initialImageUrl);
  useEffect(() => {
    if (!file) {
      setPreview(initialImageUrl);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, initialImageUrl]);

  const initial = (name.trim()[0] ?? "?").toUpperCase();
  const isSubmitting = updateMe.isPending;

  // Clerk hosts raster images only; SVG (and other vector/unknown types) are rejected by
  // its API, so reject them at selection time with a clear message instead.
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    if (selected && !ACCEPTED_IMAGE_TYPES.includes(selected.type)) {
      setError("Formato no admitido. Usa JPG, PNG, GIF o WEBP.");
      event.target.value = "";
      setFile(null);
      return;
    }
    setError(null);
    setFile(selected);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("El nombre es obligatorio.");
      return;
    }
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError("El nombre de usuario es obligatorio.");
      return;
    }
    if (!user) {
      setError("Debes iniciar sesión para editar tu perfil.");
      return;
    }

    const nameChanged = trimmed !== initialName;
    const usernameChanged = trimmedUsername !== initialUsername;
    const imageChanged = file !== null;
    if (!nameChanged && !usernameChanged && !imageChanged) {
      onClose();
      return;
    }

    try {
      // Only touch the fields the user actually changed. Name and image live in Clerk
      // (source of truth; the webhook mirrors them to our DB); the username is ours only.
      // We also PATCH /users/me so the profile reflects the change immediately.
      if (nameChanged) {
        const [firstName, ...rest] = trimmed.split(/\s+/);
        await user.update({ firstName, lastName: rest.join(" ") });
      }
      if (imageChanged) {
        await user.setProfileImage({ file });
      }
      if (nameChanged || imageChanged) {
        await user.reload();
      }

      // Backend slugifies the username and may adjust it, so follow the response to the URL.
      const updated = await updateMe.mutateAsync({
        name: nameChanged ? trimmed : undefined,
        username: usernameChanged ? trimmedUsername : undefined,
        imageUrl: imageChanged ? (user.imageUrl ?? null) : undefined,
      });
      onClose();
      router.replace(`/players/${encodeURIComponent(updated.username)}`);
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
              <span>Nombre de usuario</span>
              <input
                required
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="tu-usuario"
                className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-court"
              />
              <span className="block text-xs font-normal text-zinc-500">
                Aparece en la URL de tu perfil. Se convierte a minúsculas y guiones (p. ej. &quot;Ana Díaz&quot; → &quot;ana-diaz&quot;).
              </span>
            </label>

            <div className="space-y-2 text-sm font-medium text-zinc-700">
              <span>Foto de perfil</span>
              <div className="flex items-center gap-4">
                <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 text-lg font-bold text-zinc-500">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element -- local object URL / Clerk CDN preview
                    <img src={preview} alt="Vista previa del perfil" className="size-full object-cover" />
                  ) : (
                    initial
                  )}
                </span>
                <div className="space-y-1">
                  <Button
                    type="button"
                    variant="ghost"
                    className="gap-2 border border-zinc-200 text-zinc-700"
                    onPress={() => fileInputRef.current?.click()}
                    isDisabled={isSubmitting}
                  >
                    <ImageUp className="size-4" />
                    {file ? "Cambiar foto" : "Subir foto"}
                  </Button>
                  <p className="text-xs font-normal text-zinc-500">
                    {file ? file.name : "JPG, PNG o GIF."}
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

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
