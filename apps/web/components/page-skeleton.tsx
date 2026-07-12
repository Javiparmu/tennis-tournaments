// Space-reserving loading placeholder: a stack of pulsing blocks in the app's
// skeleton styling. Size it (rows/height) to roughly match the final content so
// it does not shift the layout when the real UI resolves (see AGENTS.md).
export function PageSkeleton({
  rows = 3,
  height = "h-32",
  className = "",
}: {
  rows?: number;
  height?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`.trim()}>
      {Array.from({ length: rows }, (_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
          key={i}
          className={`${height} animate-pulse rounded-2xl border border-stone-100 bg-stone-100/70`}
        />
      ))}
    </div>
  );
}
