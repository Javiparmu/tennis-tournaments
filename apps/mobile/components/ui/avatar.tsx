import { Image } from "expo-image";
import { Text, View } from "react-native";

type AvatarProps = {
  /** `User.imageUrl` (synced from Clerk). Falls back to initials when absent. */
  imageUrl?: string | null;
  name: string;
  size?: number;
};

// First letter of the first two words — "Ana Lopez Ruiz" → "AL".
function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

// Player avatar: the image when we have one, otherwise lime initials on a raised
// tile. The gradient fallback is gone with the light theme — on the dark canvas a
// flat surface-2 tile reads cleaner and drops the LinearGradient dependency.
// expo-image has no NativeWind interop, so it is sized through `style`; the ring is
// a wrapping View that can take classes.
export function Avatar({ imageUrl, name, size = 40 }: AvatarProps) {
  const radius = size * 0.3;
  const tile = { width: size, height: size, borderRadius: radius } as const;

  return (
    <View className="border-2 border-line" style={{ borderRadius: radius + 2 }}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={tile} contentFit="cover" transition={150} />
      ) : (
        <View className="items-center justify-center bg-surface-2" style={tile}>
          <Text className="font-display text-lime" style={{ fontSize: size * 0.35 }}>
            {initials(name)}
          </Text>
        </View>
      )}
    </View>
  );
}
