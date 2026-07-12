// Case- and accent-insensitive search key: trimmed, lowercased, diacritics
// stripped so "José" and "jose" compare equal. Shared by the client-side list
// filters (player ranking, tournament list).
export function normalizeSearch(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}
