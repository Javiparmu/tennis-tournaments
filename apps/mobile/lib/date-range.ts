function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayIso(): string {
  return iso(new Date());
}

// A wide window around today for the trainings list (the backend range endpoint
// needs explicit from/to). Mobile v1 shows a flat list rather than a calendar.
export function trainingRange(): { from: string; to: string } {
  const from = new Date();
  from.setDate(from.getDate() - 180);
  const to = new Date();
  to.setDate(to.getDate() + 30);
  return { from: iso(from), to: iso(to) };
}
