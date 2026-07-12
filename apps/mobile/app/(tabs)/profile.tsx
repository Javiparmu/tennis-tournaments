import { useAuth, useUser } from "@clerk/clerk-expo";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Placeholder — Phase 5 renders the full player profile (rating chart, achievements,
// calendar, trainings, rackets). For now: identity + sign out.
export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-ink">
      <View className="flex-1 justify-center gap-4 px-6">
        <Text className="text-2xl font-bold text-paper">Perfil</Text>
        <Text className="text-paper/60">{user?.primaryEmailAddress?.emailAddress ?? "—"}</Text>
        <Pressable className="mt-4 items-center rounded-xl border border-paper/20 py-3 active:opacity-80" onPress={() => signOut()}>
          <Text className="text-base font-semibold text-paper">Cerrar sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
