"use client";

import { Chip } from "@heroui/react";
import { CalendarX } from "lucide-react";
import { startTransition } from "react";
import { DataCard } from "@/components/data-card";
import { EmptyState } from "@/components/empty-state";
import { JOIN_STATUS_LABEL } from "@courtrank/core/lib/labels";
import type { ProfileCalendarDay, ProfileCalendarEvent } from "@courtrank/core/models";
import { type CalendarMode, formatTime, getMatchDisplayTime } from "./date-utils";
import { MiniCalendar } from "./mini-calendar";
import { StatusChip } from "./status-chip";
import { getTrainingDurationLabel } from "./training-section";

// The Calendario tab: the full month/week calendar plus a "de un vistazo" preview
// of the selected day. This is where the calendar gets the room it needs — the
// Resumen only carries the compact week strip.
export function CalendarSection({
  mode,
  anchorDate,
  selectedDayKey,
  calendarDays,
  events,
  onModeChange,
  onDaySelect,
  onAnchorDateChange,
  calendarLoading,
  dayPreview,
}: {
  mode: CalendarMode;
  anchorDate: Date;
  selectedDayKey: string;
  calendarDays: ProfileCalendarDay[];
  events: ProfileCalendarEvent[];
  onModeChange: (mode: CalendarMode) => void;
  onDaySelect: (dayKey: string) => void;
  onAnchorDateChange: (date: Date) => void;
  calendarLoading: boolean;
  dayPreview: ProfileCalendarEvent[];
}) {
  return (
    <div className="space-y-6">
      <MiniCalendar
        mode={mode}
        anchorDate={anchorDate}
        selectedDayKey={selectedDayKey}
        calendarDays={calendarDays}
        events={events}
        onModeChange={(nextMode) => startTransition(() => onModeChange(nextMode))}
        onDaySelect={onDaySelect}
        onAnchorDateChange={(date) => startTransition(() => onAnchorDateChange(date))}
      />

      <DataCard title="De un vistazo">
        {calendarLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-stone-100" />
            ))}
          </div>
        ) : dayPreview.length === 0 ? (
          <EmptyState
            size="compact"
            icon={CalendarX}
            title="Día libre"
            description="Aún no hay nada programado para este día."
          />
        ) : (
          <div className="space-y-3">
            {dayPreview.map((event) => (
              <div key={event.eventId} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                {event.eventType === "MATCH" && event.match ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-stone-900">
                        Partido vs {event.match.opponent?.name ?? "Rival desconocido"}
                      </p>
                      <p className="text-sm text-stone-500">{event.match.tournament.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusChip status={event.match.status} />
                      <span className="text-sm text-stone-500">
                        {getMatchDisplayTime(event.match)
                          ? formatTime(getMatchDisplayTime(event.match) as string)
                          : "Hora por definir"}
                      </span>
                    </div>
                  </div>
                ) : event.eventType === "TOURNAMENT" && event.tournament ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-stone-900">{event.tournament.name}</p>
                      <p className="text-sm text-stone-500">El torneo empieza hoy</p>
                    </div>
                    <Chip color={event.tournament.status === "ACCEPTED" ? "success" : "warning"} variant="soft">
                      {JOIN_STATUS_LABEL[event.tournament.status] ?? event.tournament.status}
                    </Chip>
                  </div>
                ) : event.training ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-stone-900">Sesión de entrenamiento</p>
                      <p className="text-sm text-stone-500">{event.training.notes ?? "Sin notas."}</p>
                    </div>
                    <Chip color="default" variant="soft">
                      {getTrainingDurationLabel(event.training.durationMinutes)}
                    </Chip>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </DataCard>
    </div>
  );
}
