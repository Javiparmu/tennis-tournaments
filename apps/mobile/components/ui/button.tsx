import type { ReactNode } from "react";
import { ActivityIndicator, Text } from "react-native";
import { colors } from "../../theme/tokens";
import { PressableScale } from "./pressable-scale";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dangerGhost";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  /** Rendered left of the label. Size it to ~18px and colour it per variant. */
  icon?: ReactNode;
};

// One theme means one set of variants. The old `dark`/`night` pair existed only so a
// button could survive both the light content area and the night hero band; that
// split is gone. `primary` is the lime slab — a screen's single loud action.
const VARIANTS: Record<Variant, { container: string; text: string; spinner: string }> = {
  primary: { container: "bg-lime active:bg-lime-dim", text: "text-canvas", spinner: colors.canvas },
  secondary: { container: "border border-line bg-surface-2 active:bg-surface", text: "text-ink", spinner: colors.ink },
  ghost: { container: "active:bg-surface-2", text: "text-lime", spinner: colors.lime },
  danger: { container: "bg-danger active:opacity-90", text: "text-canvas", spinner: colors.canvas },
  // Destructive but not loud — sign-out, row deletes. `danger` shouts; these are
  // routine actions that only need to read as "this one is different".
  dangerGhost: { container: "active:bg-surface-2", text: "text-danger", spinner: colors.danger },
};

export function Button({ label, onPress, variant = "primary", loading, disabled, className, icon }: ButtonProps) {
  const v = VARIANTS[variant];
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`min-h-[48px] flex-row items-center justify-center gap-2 rounded-2xl px-5 py-3 ${v.container} ${
        isDisabled ? "opacity-50" : ""
      } ${className ?? ""}`}
    >
      {loading ? (
        <ActivityIndicator color={v.spinner} />
      ) : (
        <>
          {icon}
          <Text className={`font-sans-semibold text-base ${v.text}`}>{label}</Text>
        </>
      )}
    </PressableScale>
  );
}
