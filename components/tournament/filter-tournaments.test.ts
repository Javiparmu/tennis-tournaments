import { describe, expect, it } from "vitest";
import { filterTournaments } from "./filter-tournaments";

// The filter only reads name + description, so tests pass minimal objects.
const list = [
  { name: "Open de Málaga", description: "Torneo de tierra batida" },
  { name: "Copa Primavera", description: null },
  { name: "Masters Indoor", description: "Pista rápida cubierta" },
];

describe("filterTournaments", () => {
  it("returns the same array reference for an empty query", () => {
    expect(filterTournaments(list, "")).toBe(list);
  });

  it("treats a whitespace-only query as empty", () => {
    expect(filterTournaments(list, "   ")).toBe(list);
  });

  it("matches against the name", () => {
    const out = filterTournaments(list, "copa");
    expect(out.map((t) => t.name)).toEqual(["Copa Primavera"]);
  });

  it("matches against the description", () => {
    const out = filterTournaments(list, "rápida");
    expect(out.map((t) => t.name)).toEqual(["Masters Indoor"]);
  });

  it("is case- and accent-insensitive", () => {
    expect(filterTournaments(list, "MALAGA")).toHaveLength(1);
    expect(filterTournaments(list, "málaga")).toHaveLength(1);
  });

  it("tolerates a null description", () => {
    expect(filterTournaments(list, "primavera")).toHaveLength(1);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterTournaments(list, "wimbledon")).toEqual([]);
  });
});
