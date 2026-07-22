import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import type { LucideIcon } from "lucide-react-native";
import { cssInterop } from "nativewind";
import { useState } from "react";
import { Platform, Text, TextInput, type TextInputProps, View } from "react-native";
import { colors } from "../../theme/tokens";
import { FormError } from "./form-error";

type FieldProps = TextInputProps & {
  label?: string;
  /** Message under the input; also turns the border rose. */
  error?: string | null;
  /** Leading glyph inside the input (search boxes). Pass the lucide component: `icon={Search}`. */
  icon?: LucideIcon;
  /** Render the gorhom input so the sheet tracks the keyboard. Required inside <Sheet>. */
  inSheet?: boolean;
};

// `BottomSheetTextInputProps extends TextInputProps`, so it inherits NativeWind's
// `className` in the type system — but gorhom registers no interop, so at runtime
// the class would be dropped without a single type error. Registering it here maps
// className → style exactly the way NativeWind registers RN's own TextInput, which
// keeps both branches below styled from one source.
const SheetTextInput = cssInterop(BottomSheetTextInput, { className: "style" });

// Taken from the props rather than named outright: RN types these events differently
// across versions, and the handlers only forward them anyway.
type FocusEvent = Parameters<NonNullable<TextInputProps["onFocus"]>>[0];
type BlurEvent = Parameters<NonNullable<TextInputProps["onBlur"]>>[0];

// Styled text input. Focus is state-driven: NativeWind's `focus:` variant is
// unreliable on TextInput.
export function Field({ label, error, icon: Icon, inSheet = false, className, onFocus, onBlur, ...props }: FieldProps) {
  const [focused, setFocused] = useState(false);

  const border = error ? "border-danger" : focused ? "border-lime" : "border-line";

  const inputProps: TextInputProps = {
    ...props,
    placeholderTextColor: colors.inkFaint,
    // `pl-11` clears the absolutely-positioned leading icon; without an icon the
    // input keeps its normal `px-4`.
    className: `min-h-[48px] rounded-2xl border bg-surface-2 py-3 pr-4 font-sans text-ink ${border} ${
      Icon ? "pl-11" : "pl-4"
    } ${className ?? ""}`,
    onFocus: (event: FocusEvent) => {
      setFocused(true);
      onFocus?.(event);
    },
    onBlur: (event: BlurEvent) => {
      setFocused(false);
      onBlur?.(event);
    },
  };

  // `inSheet` swaps in gorhom's BottomSheetTextInput so the native sheet tracks the
  // keyboard — but that input needs gorhom sheet context, which the web fallback
  // (a plain RN Modal) does not provide, so on web it always falls back to TextInput.
  const useSheetInput = inSheet && Platform.OS !== "web";

  return (
    <View className="gap-1.5">
      {label ? <Text className="font-sans-medium text-sm text-ink-muted">{label}</Text> : null}
      <View className="relative">
        {/* Overlay rather than a wrapper row so the icon never disturbs the input's
            own focus/error border, and both input branches stay untouched. The
            top-0/bottom-0 span lets `justify-center` centre the icon against the
            input height (absolute elements ignore the parent's justify-content). */}
        {Icon ? (
          <View pointerEvents="none" className="absolute bottom-0 left-4 top-0 z-10 justify-center">
            <Icon color={colors.inkFaint} size={18} />
          </View>
        ) : null}
        {useSheetInput ? <SheetTextInput {...inputProps} /> : <TextInput {...inputProps} />}
      </View>
      <FormError message={error} />
    </View>
  );
}
