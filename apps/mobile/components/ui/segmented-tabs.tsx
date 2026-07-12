import { Pressable, Text, View } from "react-native";

// Segmented control for in-page tabs (profile: Resumen / Raquetas / Entrenos).
export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: Array<{ key: T; label: string }>;
  value: T;
  onChange: (key: T) => void;
}) {
  return (
    <View className="flex-row rounded-xl border border-paper/10 bg-paper/5 p-1">
      {tabs.map((tab) => {
        const active = tab.key === value;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            className={`flex-1 items-center rounded-lg py-2 ${active ? "bg-paper/10" : ""}`}
          >
            <Text className={`text-sm font-medium ${active ? "text-paper" : "text-paper/50"}`}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
