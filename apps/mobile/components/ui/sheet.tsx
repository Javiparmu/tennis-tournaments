import type { ReactNode } from "react";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Bottom sheet for forms/confirmations (replaces web ModalShell). Backdrop-close,
// slide-up. A plain Modal keeps it dependency-light and reliable across platforms.
export function Sheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/60" onPress={onClose}>
        <Pressable
          className="rounded-t-3xl border border-paper/10 bg-inkSoft px-5 pt-4"
          style={{ paddingBottom: insets.bottom + 16 }}
          onPress={(event) => event.stopPropagation()}
        >
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-paper/20" />
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
