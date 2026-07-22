import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/tokens";

type HeroProps = {
  eyebrow?: string;
  title: string;
  /** Trailing word/phrase of `title` to colour lime. Must be a suffix of `title`. */
  accent?: string;
  subtitle?: string;
  /** Action rendered opposite the copy. */
  right?: ReactNode;
  /** Meta rows, chips, or a search field rendered under the copy. */
  children?: ReactNode;
  onBack?: () => void;
  /** Smaller title, for screens where the content below (e.g. the ranking list) is
      the point and the header should get out of the way. */
  compact?: boolean;
};

// Screen header.
//
// This was a night-court gradient *band*: squared at the top to bleed under the
// status bar, rounded at the bottom where it met the light content. The contrast
// against that light content was its entire job — and on a dark-first canvas there
// is nothing left to contrast with, since a darker band on near-black just reads as
// a smudge. So it is a flat header block on the canvas now, and the display type
// does the work the gradient used to do.
export function Hero({ eyebrow, title, accent, subtitle, right, children, onBack, compact = false }: HeroProps) {
  const insets = useSafeAreaInsets();
  const lead = accent && title.endsWith(accent) ? title.slice(0, title.length - accent.length) : title;

  return (
    <View style={{ paddingTop: insets.top + 12 }}>
      <View className={`gap-3 px-5 ${compact ? "pb-3" : "pb-5"}`}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            className="-ml-2 h-11 w-11 items-center justify-center rounded-full bg-surface-2 active:opacity-70"
          >
            <ChevronLeft color={colors.ink} size={24} />
          </Pressable>
        ) : null}
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-1">
            {eyebrow ? (
              <Text className="font-mono text-[11px] uppercase tracking-[2px] text-ink-faint">{eyebrow}</Text>
            ) : null}
            <Text className={`font-display-black tracking-tight text-ink ${compact ? "text-3xl" : "text-4xl"}`}>
              {lead}
              {accent && lead !== title ? <Text className="text-lime">{accent}</Text> : null}
            </Text>
            {subtitle ? <Text className="font-sans text-sm text-ink-muted">{subtitle}</Text> : null}
          </View>
          {right}
        </View>
        {children}
      </View>
    </View>
  );
}
