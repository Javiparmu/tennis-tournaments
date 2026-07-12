import { describe, expect, it } from "vitest";
import type { User } from "@courtrank/core/models";
import { filterRankedUsers } from "./filter-ranked-users";

// Minimal User factory — the filter only reads name and username.
function user(overrides: Partial<User> & { id: number; username: string }): User {
  return {
    name: null,
    imageUrl: null,
    email: null,
    authProvider: null,
    authSubject: null,
    createdAt: null,
    updatedAt: null,
    achievements: [],
    ...overrides,
  };
}

// Callers pass an already-ranked array; this fixture is treated as rank order.
const ranked: User[] = [
  user({ id: 1, username: "roger", name: "Roger Federer" }),
  user({ id: 2, username: "rafa", name: "Rafael Nadal" }),
  user({ id: 3, username: "nole", name: "Novak Djokovic" }),
  user({ id: 4, username: "jose", name: "José García" }),
];

describe("filterRankedUsers", () => {
  it("returns every row with its 1-based position for an empty query", () => {
    const rows = filterRankedUsers(ranked, "");
    expect(rows.map((r) => r.position)).toEqual([1, 2, 3, 4]);
    expect(rows.map((r) => r.user.username)).toEqual(["roger", "rafa", "nole", "jose"]);
  });

  it("treats a whitespace-only query as empty", () => {
    expect(filterRankedUsers(ranked, "   ")).toHaveLength(4);
  });

  it("preserves the true rank on a match (not renumbered 1..N)", () => {
    const rows = filterRankedUsers(ranked, "nole");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.position).toBe(3);
  });

  it("matches against display name", () => {
    const rows = filterRankedUsers(ranked, "nadal");
    expect(rows.map((r) => r.user.username)).toEqual(["rafa"]);
  });

  it("matches against username", () => {
    const rows = filterRankedUsers(ranked, "roger");
    expect(rows.map((r) => r.user.username)).toEqual(["roger"]);
  });

  it("is case-insensitive", () => {
    expect(filterRankedUsers(ranked, "ROGER")).toHaveLength(1);
  });

  it("is accent-insensitive both ways", () => {
    // Query without accent finds an accented name.
    expect(filterRankedUsers(ranked, "jose garcia")).toHaveLength(1);
    // Accented query still finds it.
    expect(filterRankedUsers(ranked, "josé")).toHaveLength(1);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterRankedUsers(ranked, "murray")).toEqual([]);
  });

  it("tolerates a null name", () => {
    const rows = filterRankedUsers([user({ id: 9, username: "ghost", name: null })], "ghost");
    expect(rows).toHaveLength(1);
  });
});
