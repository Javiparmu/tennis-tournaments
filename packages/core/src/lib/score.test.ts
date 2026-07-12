import { describe, expect, it } from "vitest";
import type { MatchStatus, TennisScore } from "../models";
import { formatScore } from "./score";

const score = (sets: TennisScore["sets"]): TennisScore => ({ sets });

describe("formatScore", () => {
  it("formats a straight-sets score", () => {
    const result = formatScore(
      score([
        { player1Games: 6, player2Games: 4, tiebreak: null },
        { player1Games: 6, player2Games: 3, tiebreak: null },
      ]),
      "COMPLETED",
    );
    expect(result).toBe("6-4  6-3");
  });

  it("appends the tiebreak points for a tiebreak set", () => {
    const result = formatScore(
      score([{ player1Games: 7, player2Games: 6, tiebreak: { player1Points: 7, player2Points: 5 } }]),
      "COMPLETED",
    );
    expect(result).toBe("7-6(7-5)");
  });

  it("returns W.O. for a walkover with no sets", () => {
    expect(formatScore(score([]), "WALKOVER")).toBe("W.O.");
    expect(formatScore(null, "WALKOVER")).toBe("W.O.");
  });

  it("returns 'Sin resultado' when there is no score and it is not a walkover", () => {
    expect(formatScore(null, "SCHEDULED" as MatchStatus)).toBe("Sin resultado");
    expect(formatScore(score([]), "COMPLETED")).toBe("Sin resultado");
  });
});
