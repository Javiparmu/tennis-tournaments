// Chalk-line divider with a glowing ball dot in the middle — a light court-themed
// break between two stacked white landing sections. The dot mirrors the hero pill
// marker (bg-ball-bright + glow) so the page reads as one system.
export function SectionDivider() {
  return (
    <div aria-hidden className="mx-auto w-full max-w-6xl px-6">
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-linear-to-r from-transparent to-court/15" />
        <span className="h-2 w-2 rounded-full bg-ball-bright shadow-[0_0_8px_1px] shadow-ball-bright/50" />
        <span className="h-px flex-1 bg-linear-to-l from-transparent to-court/15" />
      </div>
    </div>
  );
}
