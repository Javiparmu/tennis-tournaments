import { ActivityIndicator, Pressable, Text } from "react-native";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

const VARIANTS: Record<Variant, { container: string; text: string; spinner: string }> = {
  primary: { container: "bg-clay", text: "text-white", spinner: "#ffffff" },
  secondary: { container: "border border-paper/20 bg-paper/10", text: "text-paper", spinner: "#faf9f7" },
  ghost: { container: "", text: "text-clay", spinner: "#d8694c" },
};

export function Button({ label, onPress, variant = "primary", loading, disabled, className }: ButtonProps) {
  const v = VARIANTS[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      className={`flex-row items-center justify-center rounded-xl px-4 py-3 active:opacity-80 ${v.container} ${isDisabled ? "opacity-50" : ""} ${className ?? ""}`}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={v.spinner} />
      ) : (
        <Text className={`text-base font-semibold ${v.text}`}>{label}</Text>
      )}
    </Pressable>
  );
}
