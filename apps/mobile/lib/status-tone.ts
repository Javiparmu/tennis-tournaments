import type { TournamentJoinRequestStatus, TournamentStatus } from "@courtrank/core";
import type { ChipTone } from "../components/ui/chip";

export function statusTone(status: TournamentStatus): ChipTone {
  switch (status) {
    case "STARTED":
      return "live";
    case "COMPLETED":
      return "info";
    case "CANCELLED":
    case "ABANDONED":
      return "danger";
    default:
      // DRAFT — "Proximamente" to players, so it reads as pending, not alarming.
      return "neutral";
  }
}

export function joinStatusTone(status: TournamentJoinRequestStatus): ChipTone {
  switch (status) {
    case "ACCEPTED":
      return "success";
    case "PENDING":
      return "live";
    case "REJECTED":
    case "EXPIRED":
    case "WITHDRAWN":
      return "danger";
    default:
      return "neutral";
  }
}
