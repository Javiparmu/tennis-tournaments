import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
};

const base = "rounded-2xl border border-paper/10 bg-paper/5 p-4";

// Soft surface card used across lists and detail sections.
export function Card({ children, onPress, className }: CardProps) {
  const cls = `${base} ${className ?? ""}`;
  if (onPress) {
    return (
      <Pressable className={`${cls} active:opacity-80`} onPress={onPress}>
        {children}
      </Pressable>
    );
  }
  return <View className={cls}>{children}</View>;
}
