import { Card, Chip } from "@heroui/react";
import { CalendarX } from "lucide-react";
import { startTransition } from "react";
import { EmptyState } from "@/components/empty-state";
import { JOIN_STATUS_LABEL } from "@/lib/labels";
import type { ProfileCalendarDay, ProfileCalendarEvent, RacketSummary } from "@/models";
import { type CalendarMode, formatTime, getMatchDisplayTime } from "./date-utils";
import { MiniCalendar } from "./mini-calendar";
import { RacketsCard } from "./rackets-card";
import { StatusChip } from "./status-chip";
import { getTrainingDurationLabel } from "./training-section";

// The owner-only overview: month/week calendar, a "de un vistazo" preview of the
// selected day, and a rackets + training-visibility summary column.
export function OverviewSection({
  mode,
  anchorDate,
  selectedDayKey,
  calendarDays,
  events,
  onModeChange,
  onDaySelect,
  onAnchorDateChange,
  calendarLoading,
  overviewPreview,
  rackets,
  racketsLoading,
  isOwner,
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
  overviewPreview: ProfileCalendarEvent[];
  rackets: RacketSummary[];
  racketsLoading: boolean;
  isOwner: boolean;
}) {
  return (
    <div className="mt-8 space-y-6">
      <MiniCalendar
        mode={mode}
        anchorDate={anchorDate}
        selectedDayKey={selectedDayKey}
        calendarDays={calendarDays}
        events={events}
        onModeChange={(nextMode) => {
          startTransition(() => {
            onModeChange(nextMode);
          });
        }}
        onDaySelect={onDaySelect}
        onAnchorDateChange={(date) => {
          startTransition(() => {
            onAnchorDateChange(date);
          });
        }}
      />
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="rounded-2xl border border-court/10 bg-white shadow-sm">
          <Card.Header>
            <div>
              <p className="font-display text-lg font-bold">De un vistazo</p>
              <p className="text-sm text-zinc-500">Vista rápida del día seleccionado.</p>
            </div>
          </Card.Header>
          <Card.Content className="gap-3 pt-0">
            {calendarLoading ? <p className="text-sm text-zinc-500">Cargando calendario...</p> : null}
            {!calendarLoading && overviewPreview.length === 0 ? (
              <EmptyState
                size="compact"
                icon={CalendarX}
                title="Día libre"
                description="Aún no hay nada programado para este día."
              />
            ) : null}
            {overviewPreview.map((event) => (
              <div key={event.eventId} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                {event.eventType === "MATCH" && event.match ? (
                  (() => {
                    const referenceTime = getMatchDisplayTime(event.match);
                    return (
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-zinc-900">
                            Partido vs {event.match.opponent?.name ?? "Rival desconocido"}
                          </p>
                          <p className="text-sm text-zinc-500">{event.match.tournament.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusChip status={event.match.status} />
                          <span className="text-sm text-zinc-500">
                            {referenceTime ? formatTime(referenceTime) : "Hora por definir"}
                          </span>
                        </div>
                      </div>
                    );
                  })()
                ) : event.eventType === "TOURNAMENT" && event.tournament ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-zinc-900">{event.tournament.name}</p>
                      <p className="text-sm text-zinc-500">El torneo empieza hoy</p>
                    </div>
                    <Chip color={event.tournament.status === "ACCEPTED" ? "success" : "warning"} variant="soft">
                      {JOIN_STATUS_LABEL[event.tournament.status] ?? event.tournament.status}
                    </Chip>
                  </div>
                ) : event.training ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-zinc-900">Sesión de entrenamiento</p>
                      <p className="text-sm text-zinc-500">{event.training.notes ?? "Sin notas."}</p>
                    </div>
                    <Chip color="default" variant="soft">
                      {getTrainingDurationLabel(event.training.durationMinutes)}
                    </Chip>
                  </div>
                ) : null}
              </div>
            ))}
          </Card.Content>
        </Card>

        <div className="space-y-6">
          <RacketsCard rackets={rackets.slice(0, 3)} isOwner={isOwner} isLoading={racketsLoading} />
          <Card className="rounded-2xl border border-court/10 bg-white shadow-sm">
            <Card.Header>
              <div>
                <p className="font-display text-lg font-bold">Visibilidad del entrenamiento</p>
                <p className="text-sm text-zinc-500">
                  {isOwner
                    ? "Cada sesión de entrenamiento se puede compartir públicamente o mantener privada."
                    : "En este perfil solo se ven las sesiones compartidas públicamente."}
                </p>
              </div>
            </Card.Header>
            <Card.Content className="pt-0 text-sm text-zinc-600">
              {isOwner
                ? "Usa la pestaña de entrenamiento para registrar sesiones, notas y la visibilidad de cada entrada."
                : "Las notas de entrenamiento solo aparecen cuando el jugador marca esa sesión como pública."}
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
}
