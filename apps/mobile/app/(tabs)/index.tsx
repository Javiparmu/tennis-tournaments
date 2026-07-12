import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Placeholder — Phase 5 renders the upcoming-tournaments agenda (getUpcomingCalendar).
export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-ink">
      <View className="flex-1 justify-center px-6">
        <Text className="text-2xl font-bold text-paper">Inicio</Text>
        <Text className="mt-2 text-paper/60">Próximos torneos (próximamente).</Text>
      </View>
    </SafeAreaView>
  );
}
