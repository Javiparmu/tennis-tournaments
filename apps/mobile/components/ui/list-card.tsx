import { Children, isValidElement, type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Card } from "./card";
import { Skeleton } from "./skeleton";

// Grouped list surface: one Card with hairline-divided rows, generalizing the
// ranking-table pattern (players.tsx, StandingsTable). RN has no `divide-y` — no
// child selectors — so the shell injects a `border-t` wrapper before every row
// after the first, keyed off what Children.toArray already assigns.
export function ListCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Card padded={false} className={`overflow-hidden ${className ?? ""}`}>
      {Children.toArray(children).map((child, index) =>
        index === 0 ? (
          child
        ) : (
          <View key={isValidElement(child) ? child.key : index} className="border-t border-line">
            {child}
          </View>
        ),
      )}
    </Card>
  );
}

// One row of a ListCard. `onPress` turns it into a Pressable; the min height keeps a
// single-line row from collapsing below the 44pt+ tap floor.
export function ListRow({
  children,
  onPress,
  className,
}: {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
}) {
  const cls = `min-h-[56px] flex-row items-center gap-3 px-4 py-3 ${className ?? ""}`;

  if (onPress) {
    return (
      <Pressable className={`${cls} active:bg-surface-2`} onPress={onPress}>
        {children}
      </Pressable>
    );
  }

  return <View className={cls}>{children}</View>;
}

// Space-reserving loader for a ListCard: an icon tile + two text bars per row, so a
// grouped list never shifts when data lands. `rowClassName` matches the real row height.
export function ListCardSkeleton({ rows = 3, rowClassName = "h-14" }: { rows?: number; rowClassName?: string }) {
  return (
    <ListCard>
      {Array.from({ length: rows }, (_, i) => i).map((i) => (
        <View key={i} className={`flex-row items-center gap-3 px-4 ${rowClassName}`}>
          <Skeleton className="h-9 w-9 rounded-xl" />
          <View className="flex-1 gap-1.5">
            <Skeleton className="h-4 w-2/5 rounded-md" />
            <Skeleton className="h-3 w-1/4 rounded-md" />
          </View>
        </View>
      ))}
    </ListCard>
  );
}
