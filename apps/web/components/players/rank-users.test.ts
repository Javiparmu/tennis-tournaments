import { describe, expect, it } from "vitest";
import type { User } from "@courtrank/core/models";
import { rankUsers } from "./rank-users";

// Minimal User factory — the ranking only reads rating, matchWins and username.
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

describe("rankUsers", () => {
  it("sorts by rating descending", () => {
    const ranked = rankUsers([
      user({ id: 1, username: "low", rating: 1000 }),
      user({ id: 2, username: "high", rating: 1500 }),
      user({ id: 3, username: "mid", rating: 1200 }),
    ]);
    expect(ranked.map((u) => u.username)).toEqual(["high", "mid", "low"]);
  });

  it("breaks rating ties by match wins descending", () => {
    const ranked = rankUsers([
      user({ id: 1, username: "fewer", rating: 1200, matchWins: 3 }),
      user({ id: 2, username: "more", rating: 1200, matchWins: 8 }),
    ]);
    expect(ranked.map((u) => u.username)).toEqual(["more", "fewer"]);
  });

  it("breaks rating and win ties by username alphabetically", () => {
    const ranked = rankUsers([
      user({ id: 1, username: "zoe", rating: 1200, matchWins: 5 }),
      user({ id: 2, username: "ana", rating: 1200, matchWins: 5 }),
    ]);
    expect(ranked.map((u) => u.username)).toEqual(["ana", "zoe"]);
  });

  it("defaults a missing rating to 1000", () => {
    const ranked = rankUsers([
      user({ id: 1, username: "unrated" }),
      user({ id: 2, username: "below", rating: 900 }),
      user({ id: 3, username: "above", rating: 1100 }),
    ]);
    expect(ranked.map((u) => u.username)).toEqual(["above", "unrated", "below"]);
  });

  it("returns a new array without mutating the input", () => {
    const input = [user({ id: 1, username: "a", rating: 1000 }), user({ id: 2, username: "b", rating: 1500 })];
    const ranked = rankUsers(input);
    expect(ranked).not.toBe(input);
    expect(input.map((u) => u.username)).toEqual(["a", "b"]);
  });
});
