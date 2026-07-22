import type { ReactNode } from "react";
import { View } from "react-native";
import { PressableScale } from "./pressable-scale";

type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
  /** Hex for a 4px top strip — pass `surfaceColor(...)` from theme/tokens, not the
      raw core SURFACE_HEX, which is tuned for white and goes muddy here. */
  accent?: string;
  /** Set false for table-style row lists that pad their own cells. */
  padded?: boolean;
};

// The canonical card: every list row and detail section is one of these.
//
// No shadow — a drop shadow is invisible on the near-black canvas. Depth comes from
// the surface being lighter than the canvas plus the hairline border, which is why
// `cardShadow` no longer exists in theme/tokens.
export function Card({ children, onPress, className, accent, padded = true }: CardProps) {
  const cls = `rounded-2xl border border-line bg-surface ${padded ? "p-4" : ""} ${
    accent ? "overflow-hidden" : ""
  } ${className ?? ""}`;

  const content = accent ? (
    <>
      <View className="absolute left-0 right-0 top-0 h-1" style={{ backgroundColor: accent }} />
      {children}
    </>
  ) : (
    children
  );

  if (onPress) {
    return (
      <PressableScale onPress={onPress} className={`${cls} active:bg-surface-2`}>
        {content}
      </PressableScale>
    );
  }

  return <View className={cls}>{content}</View>;
}
