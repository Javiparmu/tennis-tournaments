"use client";

import { Button } from "@heroui/react";
import { FormError, ModalShell } from "@/components/modal-shell";

// Shared confirmation dialog for destructive actions. Built on ModalShell with a
// danger-styled confirm button; renders nothing until `open`. Wire the mutation's
// pending/error state in so failures stay visible instead of silently closing.
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  isPending = false,
  error,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  isPending?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <ModalShell title={title} onClose={onClose} disabled={isPending} size="md">
      <div className="space-y-4">
        {description ? <p className="text-sm text-zinc-600">{description}</p> : null}
        <FormError message={error} />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" className="text-zinc-700" onPress={onClose} isDisabled={isPending}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-rose-600 text-white hover:bg-rose-700"
            onPress={onConfirm}
            isDisabled={isPending}
          >
            {isPending ? "Procesando…" : confirmLabel}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
