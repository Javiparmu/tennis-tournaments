import { Text, View } from "react-native";
import { Button } from "./button";
import { Sheet } from "./sheet";

type ConfirmSheetProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  /** Optional body copy explaining the consequence. */
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button for destructive/irreversible actions (sign out, delete). */
  danger?: boolean;
};

// Confirmation modal — the mobile counterpart to web's ConfirmDialog, built on the
// shared Sheet so it slides up like every other sheet. Confirm runs the action and
// closes; cancel just closes. Reuse this for any "are you sure?" step.
export function ConfirmSheet({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
}: ConfirmSheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View className="gap-4">
        {message ? <Text className="font-sans text-sm text-ink-muted">{message}</Text> : null}
        <View className="gap-2">
          <Button
            variant={danger ? "danger" : "primary"}
            label={confirmLabel}
            onPress={() => {
              onConfirm();
              onClose();
            }}
          />
          <Button variant="secondary" label={cancelLabel} onPress={onClose} />
        </View>
      </View>
    </Sheet>
  );
}
