import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { Button, Card, Hero, Skeleton } from "../../components/ui";
import { useMeQuery } from "../../data/queries/users";

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { data: me, isLoading } = useMeQuery();

  return (
    <View className="flex-1 bg-ink">
      <Hero title="Mi perfil" />
      <ScrollView contentContainerClassName="gap-4 px-5 py-4" showsVerticalScrollIndicator={false}>
        {isLoading || !me ? (
          <Skeleton className="h-28 w-full" />
        ) : (
          <Card>
            <Text className="text-xl font-bold text-paper">{me.name ?? me.username}</Text>
            <Text className="mt-0.5 text-sm text-paper/50">@{me.username}</Text>
            <View className="mt-4 flex-row gap-6">
              <View>
                <Text className="text-2xl font-bold text-clay">{me.rating ?? 1000}</Text>
                <Text className="text-xs text-paper/40">puntos</Text>
              </View>
              <View>
                <Text className="text-2xl font-bold text-paper">{me.matchWins ?? 0}</Text>
                <Text className="text-xs text-paper/40">victorias</Text>
              </View>
              <View>
                <Text className="text-2xl font-bold text-paper">{me.achievements.length}</Text>
                <Text className="text-xs text-paper/40">logros</Text>
              </View>
            </View>
          </Card>
        )}

        {me ? (
          <Button label="Ver mi perfil completo" variant="secondary" onPress={() => router.push(`/players/${me.username}`)} />
        ) : null}
        <Button label="Cerrar sesión" variant="ghost" onPress={() => signOut()} />
      </ScrollView>
    </View>
  );
}
