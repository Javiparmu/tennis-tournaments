"use client";

import { Button, Form } from "@heroui/react";
import { useState } from "react";
import type { Club } from "@/models";
import { ModalShell, inputClass } from "@/components/modal-shell";

// Clubs are provisioned by the platform operator, so this modal only edits.
export type ClubFormValues = {
  name: string;
  phoneNumber: string | null;
  address: string | null;
};

type ClubFormModalProps = {
  club: Club;
  onClose: () => void;
  onSubmit: (payload: ClubFormValues) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
};

export function ClubFormModal({ club, onClose, onSubmit, isSubmitting, submitError }: ClubFormModalProps) {
  const [name, setName] = useState(club.name);
  const [phoneNumber, setPhoneNumber] = useState(club.phoneNumber ?? "");
  const [address, setAddress] = useState(club.address ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);

  return (
    <ModalShell
      title="Editar club"
      subtitle="Tu club organiza y gestiona torneos."
      onClose={onClose}
      disabled={isSubmitting}
    >
      <Form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setValidationError(null);
          if (!name.trim()) {
            setValidationError("El nombre del club es obligatorio.");
            return;
          }
          await onSubmit({
            name: name.trim(),
            phoneNumber: phoneNumber.trim() || null,
            address: address.trim() || null,
          });
        }}
      >
        <label className="block space-y-2 text-sm font-medium text-zinc-700">
          <span>Nombre</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Club de Tenis Ribera" className={inputClass} />
        </label>
        <label className="block space-y-2 text-sm font-medium text-zinc-700">
          <span>Teléfono</span>
          <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+34 600 000 000" className={inputClass} />
        </label>
        <label className="block space-y-2 text-sm font-medium text-zinc-700">
          <span>Dirección</span>
          <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle, ciudad" className={inputClass} />
        </label>

        {validationError ? <p className="text-sm text-rose-600">{validationError}</p> : null}
        {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" className="text-zinc-700" onPress={onClose} isDisabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-court text-ball-bright hover:bg-court-hover" isDisabled={isSubmitting}>
            Guardar cambios
          </Button>
        </div>
      </Form>
    </ModalShell>
  );
}
