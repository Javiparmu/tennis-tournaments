import { describe, expect, it } from "vitest";
import type { TournamentStatus } from "../models";
import { TOURNAMENT_STATUS_LABEL, TOURNAMENT_STATUS_LABEL_PUBLIC } from "./labels";

const ALL_STATUSES: TournamentStatus[] = ["DRAFT", "STARTED", "COMPLETED", "CANCELLED", "ABANDONED"];

describe("tournament status labels", () => {
  it("spot-checks canonical management labels", () => {
    expect(TOURNAMENT_STATUS_LABEL.DRAFT).toBe("Borrador");
    expect(TOURNAMENT_STATUS_LABEL.STARTED).toBe("En curso");
    expect(TOURNAMENT_STATUS_LABEL.COMPLETED).toBe("Finalizado");
    expect(TOURNAMENT_STATUS_LABEL.ABANDONED).toBe("Abandonado");
  });

  it("diverges from the management map exactly on DRAFT and ABANDONED", () => {
    const divergent = ALL_STATUSES.filter(
      (status) => TOURNAMENT_STATUS_LABEL_PUBLIC[status] !== TOURNAMENT_STATUS_LABEL[status],
    );
    expect(divergent.sort()).toEqual(["ABANDONED", "DRAFT"]);
  });

  it("uses the public-facing copy for the divergent statuses", () => {
    expect(TOURNAMENT_STATUS_LABEL_PUBLIC.DRAFT).toBe("Próximamente");
    expect(TOURNAMENT_STATUS_LABEL_PUBLIC.ABANDONED).toBe("Cancelado");
  });
});
