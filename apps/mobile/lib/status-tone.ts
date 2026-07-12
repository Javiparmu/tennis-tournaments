import type { TournamentJoinRequestStatus, TournamentStatus } from "@courtrank/core";
import type { ChipTone } from "../components/ui/chip";

export function statusTone(status: TournamentStatus): ChipTone {
  switch (status) {
    case "STARTED":
      return "grass";
    case "COMPLETED":
      return "hard";
    case "CANCELLED":
    case "ABANDONED":
      return "clay";
    default:
      return "muted";
  }
}

export function joinStatusTone(status: TournamentJoinRequestStatus): ChipTone {
  switch (status) {
    case "ACCEPTED":
      return "grass";
    case "REJECTED":
    case "EXPIRED":
      return "clay";
    case "PENDING":
      return "hard";
    default:
      return "muted";
  }
}
