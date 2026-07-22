import { describe, expect, it } from "vitest";
import type { Match, TennisScore } from "../models";
import { getMatchResultEditState, inferScoreWinnerId, inferScoreWinnerSide } from "./match-results";

const score = (sets: TennisScore["sets"]): TennisScore => ({ sets });

const baseMatch = (patch: Partial<Match> = {}): Match => ({
  id: 1,
  phaseId: 10,
  round: 1,
  groupId: null,
  player1: { id: 101, name: "A", external: false, seed: null, user: null },
  player2: { id: 102, name: "B", external: false, seed: null, user: null },
  winnerId: null,
  score: null,
  status: "SCHEDULED",
  scheduledTime: null,
  completedAt: null,
  court: null,
  createdAt: null,
  updatedAt: null,
  matchDependencies: [],
  ...patch,
});

describe("inferScoreWinnerSide", () => {
  it("infers the winner from sets won", () => {
    expect(
      inferScoreWinnerSide(
        score([
          { player1Games: 6, player2Games: 4, tiebreak: null },
          { player1Games: 3, player2Games: 6, tiebreak: null },
          { player1Games: 6, player2Games: 2, tiebreak: null },
        ]),
      ),
    ).toBe(1);
  });

  it("rejects tied set counts and tied games", () => {
    expect(
      inferScoreWinnerSide(
        score([
          { player1Games: 6, player2Games: 4, tiebreak: null },
          { player1Games: 4, player2Games: 6, tiebreak: null },
        ]),
      ),
    ).toBeNull();
    expect(inferScoreWinnerSide(score([{ player1Games: 6, player2Games: 6, tiebreak: null }]))).toBeNull();
  });
});

describe("inferScoreWinnerId", () => {
  it("maps the winning side to the match player id", () => {
    expect(inferScoreWinnerId(baseMatch(), score([{ player1Games: 4, player2Games: 6, tiebreak: null }]))).toBe(102);
  });
});

describe("getMatchResultEditState", () => {
  it("allows editing before a dependent match has a result", () => {
    const match = baseMatch();
    const next = baseMatch({
      id: 2,
      round: 2,
      player1: null,
      player2: null,
      matchDependencies: [{ requiredMatchId: 1, requiredOutcome: "WINNER" }],
    });

    expect(getMatchResultEditState(match, [match, next])).toEqual({
      canEdit: true,
      reason: null,
      blockingMatchId: null,
    });
  });

  it("blocks editing after a dependent match has been played", () => {
    const match = baseMatch({ winnerId: 101, status: "COMPLETED" });
    const next = baseMatch({
      id: 2,
      round: 2,
      winnerId: 101,
      status: "COMPLETED",
      matchDependencies: [{ requiredMatchId: 1, requiredOutcome: "WINNER" }],
    });

    expect(getMatchResultEditState(match, [match, next])).toEqual({
      canEdit: false,
      reason: "next-match-played",
      blockingMatchId: 2,
    });
  });

  it("blocks matches without both players", () => {
    const match = baseMatch({ player2: null });

    expect(getMatchResultEditState(match, [match])).toEqual({
      canEdit: false,
      reason: "missing-player",
      blockingMatchId: null,
    });
  });
});
