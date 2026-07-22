import { CircleAlert } from "lucide-react-native";
import { Text, View } from "react-native";
import { colors } from "../../theme/tokens";

// Inline validation/submit error. Mirrors web <FormError>: render on the query/
// mutation error state, not on the message being truthy.
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <View className="flex-row items-center gap-1.5">
      <CircleAlert color={colors.danger} size={14} />
      <Text className="flex-1 font-sans text-sm text-danger">{message}</Text>
    </View>
  );
}
