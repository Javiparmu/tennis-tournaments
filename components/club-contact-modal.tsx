"use client";

import { Button, Form } from "@heroui/react";
import { CheckCircle2 } from "lucide-react";
import { type ReactNode, useState } from "react";
import { inputClass, ModalShell } from "@/components/modal-shell";
import { useClubContactRequestMutation } from "@/data/queries";
import { CLUB_CONTACT_EMAIL } from "@/lib/contact";

type ClubContactCtaProps = {
  // Trigger styling comes from the call site so the CTA blends into each context.
  className?: string;
  children: ReactNode;
};

// "Para clubes" call to action: opens the club onboarding contact form. Clubs are
// provisioned manually by the operator, so the form records an inquiry — it does
// not create an account.
export function ClubContactCta({ className, children }: ClubContactCtaProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open ? <ClubContactModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function ClubContactModal({ onClose }: { onClose: () => void }) {
  const contactRequest = useClubContactRequestMutation();
  const [clubName, setClubName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const submitError =
    contactRequest.error instanceof Error
      ? "No se pudo enviar la solicitud. Inténtalo de nuevo o escríbenos por email."
      : null;

  if (contactRequest.isSuccess) {
    return (
      <ModalShell title="Solicitud enviada" onClose={onClose}>
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircle2 className="h-10 w-10 text-court" />
          <p className="font-display text-lg font-bold text-court-ink">¡Gracias por tu interés!</p>
          <p className="max-w-sm text-sm text-stone-600">
            Hemos recibido la solicitud de <span className="font-semibold">{clubName.trim()}</span>. Te contactaremos en{" "}
            {email.trim()} para dar de alta tu club.
          </p>
          <Button type="button" className="mt-2 bg-court text-ball-bright hover:bg-court-hover" onPress={onClose}>
            Entendido
          </Button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell
      title="Da de alta tu club"
      subtitle="Cuéntanos sobre tu club y te crearemos la cuenta personalmente."
      onClose={onClose}
      disabled={contactRequest.isPending}
    >
      <Form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setValidationError(null);
          if (!clubName.trim() || !contactName.trim() || !email.trim()) {
            setValidationError("Nombre del club, tu nombre y email son obligatorios.");
            return;
          }
          try {
            await contactRequest.mutateAsync({
              clubName: clubName.trim(),
              contactName: contactName.trim(),
              email: email.trim(),
              phone: phone.trim() || null,
              message: message.trim() || null,
            });
          } catch {
            // surfaced via mutation error
          }
        }}
      >
        <label className="block space-y-2 text-sm font-medium text-stone-700">
          <span>Nombre del club</span>
          <input
            required
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            placeholder="Club de Tenis Ribera"
            className={inputClass}
          />
        </label>
        <label className="block space-y-2 text-sm font-medium text-stone-700">
          <span>Tu nombre</span>
          <input
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Nombre y apellidos"
            className={inputClass}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium text-stone-700">
            <span>Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contacto@tuclub.com"
              className={inputClass}
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-stone-700">
            <span>Teléfono (opcional)</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+34 600 000 000"
              className={inputClass}
            />
          </label>
        </div>
        <label className="block space-y-2 text-sm font-medium text-stone-700">
          <span>Mensaje (opcional)</span>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Cuántos torneos organizáis, superficies, fechas…"
            className={inputClass}
          />
        </label>

        {validationError ? <p className="text-sm text-rose-600">{validationError}</p> : null}
        {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-stone-400">
            También puedes escribirnos a{" "}
            <a href={`mailto:${CLUB_CONTACT_EMAIL}`} className="font-medium text-court hover:text-court-hover">
              {CLUB_CONTACT_EMAIL}
            </a>
          </p>
          <div className="flex shrink-0 gap-3">
            <Button
              type="button"
              variant="ghost"
              className="text-stone-700"
              onPress={onClose}
              isDisabled={contactRequest.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-court text-ball-bright hover:bg-court-hover"
              isDisabled={contactRequest.isPending}
            >
              {contactRequest.isPending ? "Enviando…" : "Enviar solicitud"}
            </Button>
          </div>
        </div>
      </Form>
    </ModalShell>
  );
}
