import { Tabs } from "expo-router";
import { House, Medal, Trophy, User, Users } from "lucide-react-native";
import { TabBar } from "../../components/ui";

const ICON_SIZE = 22;

// The bar is our own floating pill (components/ui/tab-bar.tsx), so the navigator
// only supplies routes, titles, and icons — the `tabBarStyle` / tint options that
// used to live here are read by the stock docked bar we are replacing, and are gone
// on purpose.
//
// `title` is never drawn: the bar is icon-only, because five labels cannot be
// legible at this width. It survives as each tab's accessibility label, which TabBar
// reads back off these options.
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{ title: "Inicio", tabBarIcon: ({ color }) => <House color={color} size={ICON_SIZE} /> }}
      />
      <Tabs.Screen
        name="tournaments"
        options={{ title: "Torneos", tabBarIcon: ({ color }) => <Trophy color={color} size={ICON_SIZE} /> }}
      />
      <Tabs.Screen
        name="players"
        options={{ title: "Jugadores", tabBarIcon: ({ color }) => <Users color={color} size={ICON_SIZE} /> }}
      />
      <Tabs.Screen
        name="leagues"
        options={{ title: "Ligas", tabBarIcon: ({ color }) => <Medal color={color} size={ICON_SIZE} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Perfil", tabBarIcon: ({ color }) => <User color={color} size={ICON_SIZE} /> }}
      />
    </Tabs>
  );
}
