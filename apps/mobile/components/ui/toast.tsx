import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Imperative toast, mirroring the web's HeroUI queue: showToast() lives outside
// React (called from the core mutation notifier), ToastHost subscribes and renders.
type ToastType = "danger" | "success";
type ToastItem = { id: number; type: ToastType; message: string };

let listeners: Array<(item: ToastItem) => void> = [];
let seq = 0;

export function showToast(type: ToastType, message: string): void {
  const item: ToastItem = { id: ++seq, type, message };
  for (const listener of listeners) listener(item);
}

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const listener = (item: ToastItem) => {
      setItems((prev) => [...prev, item]);
      setTimeout(() => setItems((prev) => prev.filter((existing) => existing.id !== item.id)), 3500);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((existing) => existing !== listener);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", left: 0, right: 0, bottom: insets.bottom + 16 }}
      className="gap-2 px-5"
    >
      {items.map((item) => (
        <View key={item.id} className={`rounded-xl px-4 py-3 ${item.type === "danger" ? "bg-clay" : "bg-grass"}`}>
          <Text className="text-sm font-medium text-white">{item.message}</Text>
        </View>
      ))}
    </View>
  );
}
