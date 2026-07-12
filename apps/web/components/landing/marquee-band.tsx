// Lime value-words band: pure CSS marquee (keyframes + reduced-motion halt live
// in globals.css). Two identical copies slide -50% for a seamless loop — but
// that only closes without a gap if ONE copy is wider than the viewport, so the
// word list is repeated enough times to exceed any target width. animationDuration
// is set inline (proportional to the longer track) to keep the scroll pace calm;
// the reduced-motion `animation: none !important` rule still overrides it.
// Deliberately replaces numeric stats — live counts are too small to brag.
const WORDS = [
  "Ranking Elo",
  "Logros",
  "Raquetas y encordados",
  "Entrenamientos",
  "Cuadros automáticos",
  "Clubes verificados",
];

// Repeated so a single copy comfortably overflows a wide desktop viewport.
const SEQUENCE = [...WORDS, ...WORDS, ...WORDS];

export function MarqueeBand() {
  return (
    <section aria-label="Qué ofrece CourtRank" className="overflow-hidden bg-ball py-4 text-court-ink md:py-5">
      <div className="flex w-max animate-marquee" style={{ animationDuration: "120s" }}>
        <MarqueeSequence />
        <MarqueeSequence hidden />
      </div>
    </section>
  );
}

function MarqueeSequence({ hidden = false }: { hidden?: boolean }) {
  return (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {SEQUENCE.map((word, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static repeated list
        <span key={`${word}-${i}`} className="flex items-center">
          <span className="px-6 font-display text-2xl font-black uppercase tracking-tight md:px-8 md:text-3xl">
            {word}
          </span>
          <span aria-hidden className="h-2 w-2 rounded-full bg-court-ink/40" />
        </span>
      ))}
    </div>
  );
}
