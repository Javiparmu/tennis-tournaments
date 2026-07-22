import type { ReactNode } from "react";
import { View } from "react-native";
import { SectionHeader, type SectionHeaderProps } from "./section-header";

type SectionProps = SectionHeaderProps & {
  children: ReactNode;
  className?: string;
};

// Relationship-spacing wrapper: the header hugs its content at gap-2 (8px) so a
// section reads as one block, leaving gap-4 as the separator between sections.
export function Section({ children, className, ...header }: SectionProps) {
  return (
    <View className={`gap-2 ${className ?? ""}`}>
      <SectionHeader {...header} />
      {children}
    </View>
  );
}
