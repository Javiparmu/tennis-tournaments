"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@heroui/react";
import { ImageUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { errorMessage } from "@courtrank/core/lib/errors";
import { FormError, inputClass, ModalShell } from "@/components/modal-shell";
import { useUpdateMeMutation } from "@/data/queries";
import { notifyMutationError } from "@/data/queries/notify";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// Read a picked image into a data URL so the profile cache can be painted with it
// immediately — the Clerk upload that yields the durable CDN URL is much slower.
// A data URL needs no revocation (unlike an object URL), so it survives the modal
// unmounting mid-upload.
function readImageDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

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

  function handleSubmit(event: React.FormEvent) {
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

    // Close now and let the flow settle in the background. React Query invokes a
    // mutation's own onMutate/onError/onSettled from the mutation (not the
    // component observer), so the optimistic paint, rollback, reconcile, and error
    // toast all still fire after this modal unmounts.
    const currentFile = file;
    onClose();
    void submitProfileChanges({
      trimmed,
      trimmedUsername,
      nameChanged,
      usernameChanged,
      file: imageChanged ? currentFile : null,
    });
  }

  async function submitProfileChanges({
    trimmed,
    trimmedUsername,
    nameChanged,
    usernameChanged,
    file: pickedFile,
  }: {
    trimmed: string;
    trimmedUsername: string;
    nameChanged: boolean;
    usernameChanged: boolean;
    file: File | null;
  }) {
    if (!user) return;
    const [firstName, ...rest] = trimmed.split(/\s+/);
    const lastName = rest.join(" ");

    // Data URL for the picked photo → onMutate paints the avatar instantly, before
    // the Clerk upload runs. On read failure we simply skip the image paint (name /
    // username still paint); the durable image still lands via `prepare`.
    const optimisticImageUrl = pickedFile ? await readImageDataUrl(pickedFile).catch(() => undefined) : undefined;

    // The photo genuinely needs Clerk before the PATCH (it yields the CDN URL), so
    // that upload — plus the parallel name sync — runs inside the mutation via
    // `prepare`; onMutate has already painted by the time it fires. A name-only edit
    // syncs Clerk in the background (best-effort) since our PATCH writes the name too.
    let prepare: (() => Promise<string | null | undefined>) | undefined;
    if (pickedFile) {
      prepare = async () => {
        await Promise.all([
          nameChanged ? user.update({ firstName, lastName }) : null,
          user.setProfileImage({ file: pickedFile }),
        ]);
        await user.reload();
        return user.imageUrl ?? null;
      };
    } else if (nameChanged) {
      void user.update({ firstName, lastName }).catch(notifyMutationError);
    }

    try {
      const updated = await updateMe.mutateAsync({
        payload: {
          name: nameChanged ? trimmed : undefined,
          username: usernameChanged ? trimmedUsername : undefined,
        },
        optimistic: {
          name: nameChanged ? trimmed : undefined,
          username: usernameChanged ? trimmedUsername : undefined,
          imageUrl: optimisticImageUrl,
        },
        prepare,
        clerkTouched: pickedFile !== null,
      });
      // Backend slugifies the username, so follow the response to the canonical URL.
      if (usernameChanged) router.replace(`/players/${encodeURIComponent(updated.username)}`);
    } catch (submitError) {
      // updateMe.onError already rolled the optimistic cache back and toasted;
      // surface the specific copy inline too (e.g. a taken username).
      setError(errorMessage(submitError, "user.update"));
    }
  }

  return (
    <ModalShell
      title="Editar perfil"
      subtitle="Actualiza tu nombre y foto. Los cambios se sincronizan con tu cuenta."
      onClose={onClose}
      size="md"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2 text-sm font-medium text-stone-700">
          <span>Nombre</span>
          <input
            required
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Tu nombre"
            className={inputClass}
          />
        </label>

        <label className="block space-y-2 text-sm font-medium text-stone-700">
          <span>Nombre de usuario</span>
          <input
            required
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="tu-usuario"
            className={inputClass}
          />
          <span className="block text-xs font-normal text-stone-500">
            Aparece en la URL de tu perfil. Se convierte a minúsculas y guiones (p. ej. &quot;Ana Díaz&quot; →
            &quot;ana-diaz&quot;).
          </span>
        </label>

        <div className="space-y-2 text-sm font-medium text-stone-700">
          <span>Foto de perfil</span>
          <div className="flex items-center gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-100 text-lg font-bold text-stone-500">
              {preview ? (
                // biome-ignore lint/performance/noImgElement: local object URL / Clerk CDN preview, not a static asset
                <img src={preview} alt="Vista previa del perfil" className="size-full object-cover" />
              ) : (
                initial
              )}
            </span>
            <div className="space-y-1">
              <Button
                type="button"
                variant="ghost"
                className="gap-2 border border-stone-200 text-stone-700"
                onPress={() => fileInputRef.current?.click()}
              >
                <ImageUp className="size-4" />
                {file ? "Cambiar foto" : "Subir foto"}
              </Button>
              <p className="text-xs font-normal text-stone-500">{file ? file.name : "JPG, PNG o GIF."}</p>
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

        <FormError message={error} />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" className="text-stone-700" onPress={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-court text-ball-bright hover:bg-court-hover">
            Guardar cambios
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
