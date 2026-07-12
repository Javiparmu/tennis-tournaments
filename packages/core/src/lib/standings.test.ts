import { describe, expect, it } from "vitest";
import type { Match, MatchStatus, Player } from "../models";
import { computeStandings } from "./standings";

const player = (id: number): Player => ({
  id,
  name: `P${id}`,
  external: false,
  user: null,
});

// computeStandings only reads player1/player2/status/winnerId; the rest is padding.
const match = (id: number, p1: Player | null, p2: Player | null, status: MatchStatus, winnerId: number | null): Match =>
  ({
    id,
    phaseId: 1,
    round: 1,
    groupId: null,
    player1: p1,
    player2: p2,
    winnerId,
    score: null,
    status,
    scheduledTime: null,
    completedAt: null,
    court: null,
    createdAt: null,
    updatedAt: null,
    matchDependencies: [],
  }) satisfies Match;

describe("computeStandings", () => {
  it("counts wins/losses only for COMPLETED/WALKOVER matches with a winnerId", () => {
    const p1 = player(1);
    const p2 = player(2);
    const standings = computeStandings(
      [p1, p2],
      [
        match(10, p1, p2, "COMPLETED", 1),
        match(11, p1, p2, "WALKOVER", 1),
        // COMPLETED but no winnerId recorded -> ignored.
        match(12, p1, p2, "COMPLETED", null),
      ],
    );
    const byId = new Map(standings.map((s) => [s.player.id, s]));
    expect(byId.get(1)).toMatchObject({ wins: 2, losses: 0 });
    expect(byId.get(2)).toMatchObject({ wins: 0, losses: 2 });
  });

  it("does not count SCHEDULED/LIVE toward wins/losses but marks them upcoming ('in')", () => {
    const p1 = player(1);
    const p2 = player(2);
    const standings = computeStandings(
      [p1, p2],
      [match(20, p1, p2, "SCHEDULED", null), match(21, p1, p2, "LIVE", null)],
    );
    for (const s of standings) {
      expect(s.wins).toBe(0);
      expect(s.losses).toBe(0);
      expect(s.status).toBe("in");
    }
  });

  it("flags the champion and orders champion, in, pending, out; ties broken by wins", () => {
    const champ = player(1);
    const stillIn = player(2);
    const pending = player(3);
    const eliminated = player(4);
    const standings = computeStandings(
      [champ, stillIn, pending, eliminated],
      [
        // champ beats eliminated -> champ win, eliminated loss (out).
        match(30, champ, eliminated, "COMPLETED", 1),
        // stillIn has an upcoming match (vs the champ); pending has no matches at all.
        match(31, champ, stillIn, "SCHEDULED", null),
      ],
      1,
    );
    expect(standings.map((s) => s.player.id)).toEqual([1, 2, 3, 4]);
    expect(standings[0].status).toBe("champion");
    expect(standings[3].status).toBe("out");
  });

  it("folds in players that only appear inside matches", () => {
    const enrolled = player(1);
    const bracketOnly = player(99);
    const standings = computeStandings([enrolled], [match(40, enrolled, bracketOnly, "COMPLETED", 1)]);
    expect(standings.map((s) => s.player.id).sort((a, b) => a - b)).toEqual([1, 99]);
  });

  it("breaks status ties by win count (more wins first)", () => {
    const a = player(1);
    const b = player(2);
    const c = player(3);
    // a and b both stay 'in' (each has an upcoming match), but a has more
    // completed wins; c only has a loss so it drops to 'out'.
    const standings = computeStandings(
      [a, b, c],
      [match(50, a, c, "COMPLETED", 1), match(51, a, b, "SCHEDULED", null)],
    );
    const inPlayers = standings.filter((s) => s.status === "in").map((s) => s.player.id);
    expect(inPlayers).toEqual([1, 2]);
  });
});
