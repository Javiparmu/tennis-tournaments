"use client";

import { Card } from "@heroui/react";
import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-court";

type ModalShellProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  disabled?: boolean;
  headerExtra?: ReactNode;
  children: ReactNode;
};

// Shared overlay + card chrome for the host forms (backdrop closes, click-through
// disabled while submitting). The form body and its buttons live in `children`.
export function ModalShell({ title, subtitle, onClose, disabled, headerExtra, children }: ModalShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 px-4 py-8">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 cursor-default disabled:cursor-not-allowed"
        disabled={disabled}
        onClick={onClose}
      />
      <Card className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-court/10 bg-white shadow-2xl">
        <Card.Header className="flex items-start justify-between gap-4 p-5 pb-0">
          <div>
            <p className="font-display text-lg font-bold text-court-ink">{title}</p>
            {subtitle ? <p className="text-sm text-zinc-500">{subtitle}</p> : null}
          </div>
          {headerExtra}
        </Card.Header>
        <Card.Content className="p-5">{children}</Card.Content>
      </Card>
    </div>
  );
}
