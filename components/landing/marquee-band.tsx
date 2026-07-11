// Lime value-words band: pure CSS marquee (keyframes + reduced-motion halt live
// in globals.css). The sequence renders twice so the -50% translate loops
// seamlessly; the duplicate is aria-hidden so screen readers hear it once.
// Deliberately replaces numeric stats — live counts are too small to brag.
const WORDS = [
  "Ranking Elo",
  "Logros",
  "Raquetas y encordados",
  "Entrenamientos",
  "Cuadros automáticos",
  "Clubes verificados",
];

export function MarqueeBand() {
  return (
    <section aria-label="Qué ofrece CourtRank" className="overflow-hidden bg-ball py-4 text-court-ink md:py-5">
      <div className="flex w-max animate-marquee">
        <MarqueeSequence />
        <MarqueeSequence hidden />
      </div>
    </section>
  );
}

function MarqueeSequence({ hidden = false }: { hidden?: boolean }) {
  return (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {WORDS.map((word) => (
        <span key={word} className="flex items-center">
          <span className="px-6 font-display text-2xl font-black uppercase tracking-tight md:px-8 md:text-3xl">
            {word}
          </span>
          <span aria-hidden className="h-2 w-2 rounded-full bg-court-ink/40" />
        </span>
      ))}
    </div>
  );
}
