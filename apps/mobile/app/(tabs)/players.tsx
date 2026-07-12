import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Placeholder — Phase 5 renders the ranking (useUsersQuery + rankUsers).
export default function PlayersScreen() {
  return (
    <SafeAreaView className="flex-1 bg-ink">
      <View className="flex-1 justify-center px-6">
        <Text className="text-2xl font-bold text-paper">Jugadores</Text>
      </View>
    </SafeAreaView>
  );
}
