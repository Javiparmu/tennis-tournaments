// Shared date helpers for tournament listings.

const RANGE = new Intl.DateTimeFormat("es-ES", { month: "short", day: "numeric" });

export function formatDateRange(start: string, end: string): string {
  return `${RANGE.format(new Date(start))} – ${RANGE.format(new Date(end))}`;
}

const DAY = new Intl.DateTimeFormat("es-ES", { day: "2-digit" });
const MONTH = new Intl.DateTimeFormat("es-ES", { month: "short" });

export function dayMonth(date: string): { day: string; month: string } {
  const d = new Date(date);
  return { day: DAY.format(d), month: MONTH.format(d).toUpperCase() };
}

/** "Hoy", "en 4d", or "hace 5d" relative to now. */
export function countdown(date: string): string {
  const days = Math.round((new Date(date).getTime() - Date.now()) / 86_400_000);
  if (days === 0) return "Hoy";
  if (days > 0) return `en ${days}d`;
  return `hace ${Math.abs(days)}d`;
}
