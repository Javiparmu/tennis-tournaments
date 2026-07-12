import { Text, TextInput, type TextInputProps, View } from "react-native";

type FieldProps = TextInputProps & { label?: string };

// Styled text input matching the web inputClass.
export function Field({ label, className, ...props }: FieldProps) {
  return (
    <View className="gap-1.5">
      {label ? <Text className="text-sm font-medium text-paper/70">{label}</Text> : null}
      <TextInput
        placeholderTextColor="#9ca3af"
        className={`rounded-xl border border-paper/20 bg-paper/5 px-4 py-3 text-paper ${className ?? ""}`}
        {...props}
      />
    </View>
  );
}
