import { Tabs } from "expo-router";
import { House, Trophy, User, Users } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#d8694c",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Inicio", tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="tournaments"
        options={{ title: "Torneos", tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="players"
        options={{ title: "Jugadores", tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Perfil", tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
