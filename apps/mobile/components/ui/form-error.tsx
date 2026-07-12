import { Text } from "react-native";

// Inline validation/submit error. Mirrors web <FormError>: render on the query/
// mutation error state, not on the message being truthy.
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <Text className="text-sm text-clay">{message}</Text>;
}
