"use client";

import { Button, Card, Chip } from "@heroui/react";
import { useState } from "react";
import type { CreateTrainingRequest, TrainingVisibility, UserTrainingEntry } from "@/models";

type TrainingFormModalProps = {
  training: UserTrainingEntry | null | undefined;
  onClose: () => void;
  onSubmit: (payload: CreateTrainingRequest) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
};

type FormState = {
  trainingDate: string;
  durationMinutes: string;
  notes: string;
  visibility: TrainingVisibility;
};

function getTodayLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildInitialState(training: UserTrainingEntry | null | undefined): FormState {
  return {
    trainingDate: training?.trainingDate ?? getTodayLocalDateKey(),
    durationMinutes: training?.durationMinutes?.toString() ?? "",
    notes: training?.notes ?? "",
    visibility: training?.visibility ?? "PRIVATE",
  };
}

export function TrainingFormModal({ training, onClose, onSubmit, isSubmitting, submitError }: TrainingFormModalProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(training));
  const [validationError, setValidationError] = useState<string | null>(null);

  if (training === undefined) {
    return null;
  }

  const isEditing = training != null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 px-4 py-8">
      <button
        type="button"
        aria-label="Close training form"
        className="absolute inset-0 cursor-default disabled:cursor-not-allowed"
        disabled={isSubmitting}
        onClick={onClose}
      />
      <Card className="relative z-10 w-full max-w-xl border border-zinc-200 bg-white shadow-2xl">
        <Card.Header className="flex items-start justify-between gap-4 p-5 pb-0">
          <div>
            <p className="text-lg font-semibold">{isEditing ? "Edit training session" : "Add training session"}</p>
            <p className="text-sm text-zinc-500">
              Choose a date, note the work done, and decide if it is public or private.
            </p>
          </div>
          <Chip variant="soft" color={form.visibility === "PUBLIC" ? "success" : "default"}>
            {form.visibility}
          </Chip>
        </Card.Header>
        <Card.Content className="p-5">
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setValidationError(null);

              if (!form.trainingDate) {
                setValidationError("Training date is required.");
                return;
              }

              const durationMinutes = form.durationMinutes ? Number(form.durationMinutes) : null;
              if (durationMinutes != null && (!Number.isFinite(durationMinutes) || durationMinutes <= 0)) {
                setValidationError("Duration must be greater than 0.");
                return;
              }

              await onSubmit({
                trainingDate: form.trainingDate,
                durationMinutes,
                notes: form.notes.trim() || null,
                visibility: form.visibility,
              });
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-zinc-700">
                <span>Training date</span>
                <input
                  required
                  type="date"
                  value={form.trainingDate}
                  onChange={(event) => setForm((current) => ({ ...current, trainingDate: event.target.value }))}
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-zinc-700">
                <span>Duration (minutes)</span>
                <input
                  type="number"
                  min="1"
                  placeholder="90"
                  value={form.durationMinutes}
                  onChange={(event) => setForm((current) => ({ ...current, durationMinutes: event.target.value }))}
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-400"
                />
              </label>
            </div>

            <label className="block space-y-2 text-sm font-medium text-zinc-700">
              <span>Visibility</span>
              <select
                value={form.visibility}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    visibility: event.target.value as TrainingVisibility,
                  }))
                }
                className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-400"
              >
                <option value="PRIVATE">Private</option>
                <option value="PUBLIC">Public</option>
              </select>
            </label>

            <label className="block space-y-2 text-sm font-medium text-zinc-700">
              <span>Notes</span>
              <textarea
                rows={5}
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                placeholder="What did you work on?"
                className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-400"
              />
            </label>

            {validationError ? <p className="text-sm text-rose-600">{validationError}</p> : null}
            {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                className="text-zinc-700"
                onPress={onClose}
                isDisabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-700" isLoading={isSubmitting}>
                {isEditing ? "Save changes" : "Create session"}
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
