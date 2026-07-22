import { CircleAlert, CircleCheck, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeOutDown, SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/tokens";
import { tabBarClearance } from "./tab-bar";

// Imperative toast, mirroring the web's HeroUI queue: showToast() lives outside
// React (called from the core mutation notifier), ToastHost subscribes and renders.
type ToastType = "danger" | "success";
type ToastItem = { id: number; type: ToastType; message: string };

let listeners: Array<(item: ToastItem) => void> = [];
let seq = 0;

const DURATION = 4000;
const GAP_ABOVE_TAB_BAR = 8;

export function showToast(type: ToastType, message: string): void {
  const item: ToastItem = { id: ++seq, type, message };
  for (const listener of listeners) listener(item);
}

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const insets = useSafeAreaInsets();
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setItems((prev) => prev.filter((existing) => existing.id !== id));
  }, []);

  useEffect(() => {
    const pending = timers.current;
    const listener = (item: ToastItem) => {
      setItems((prev) => [...prev, item]);
      pending.set(
        item.id,
        setTimeout(() => dismiss(item.id), DURATION),
      );
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((existing) => existing !== listener);
      for (const timer of pending.values()) clearTimeout(timer);
      pending.clear();
    };
  }, [dismiss]);

  if (items.length === 0) return null;

  return (
    // `box-none`, not `none`: the container itself must stay transparent to touches
    // so the gaps pass through, while each toast below stays tappable to dismiss.
    //
    // Stacked on the tab bar's own geometry rather than a local guess, so the two
    // cannot drift apart. This sits above the bar on every screen — including the
    // stack screens that have no bar — which is the safe direction to be wrong in.
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", left: 0, right: 0, bottom: tabBarClearance(insets.bottom) + GAP_ABOVE_TAB_BAR }}
      className="gap-2 px-5"
    >
      {items.map((item) => (
        // Animated.View has no NativeWind interop, so it only ever animates —
        // the card inside carries the classes.
        <Animated.View key={item.id} entering={SlideInDown.springify().damping(18)} exiting={FadeOutDown}>
          <View className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3">
            {item.type === "danger" ? (
              <CircleAlert color={colors.danger} size={20} />
            ) : (
              <CircleCheck color={colors.lime} size={20} />
            )}
            <Text className="flex-1 font-sans-medium text-sm text-ink">{item.message}</Text>
            {/* A real 44pt box rather than a small one with hitSlop. The negative
                margins let it overhang the card's padding, so the target grows
                without the toast getting taller. */}
            <Pressable
              onPress={() => dismiss(item.id)}
              accessibilityRole="button"
              accessibilityLabel="Cerrar aviso"
              className="-my-1.5 -mr-2 h-11 w-11 items-center justify-center rounded-full active:opacity-70"
            >
              <X color={colors.inkFaint} size={16} />
            </Pressable>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}
