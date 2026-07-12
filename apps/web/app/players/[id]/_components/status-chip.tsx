import { Chip } from "@heroui/react";
import { MATCH_STATUS_LABEL } from "@courtrank/core/lib/labels";
import type { UserProfileMatchEntry } from "@courtrank/core/models";

export function StatusChip({ status }: { status: UserProfileMatchEntry["status"] }) {
  const color = status === "LIVE" || status === "WALKOVER" ? "warning" : "default";

  return (
    <Chip color={color} variant="soft">
      {MATCH_STATUS_LABEL[status] ?? status}
    </Chip>
  );
}
