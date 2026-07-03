type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  /** Trailing word/phrase of `title` to color as the accent. Must be a suffix of `title`. */
  accent?: string;
  tone?: "light" | "dark";
  align?: "left" | "center";
  id?: string;
  className?: string;
};

// Shared eyebrow + heading used across landing sections. The accent word echoes
// the hero title's lime highlight; on light backgrounds it falls back to court
// green since lime fails contrast on white.
export function SectionHeading({
  eyebrow,
  title,
  accent,
  tone = "light",
  align = "left",
  id,
  className = "",
}: SectionHeadingProps) {
  const lead = accent && title.endsWith(accent) ? title.slice(0, title.length - accent.length) : title;
  const dark = tone === "dark";

  return (
    <div className={`${align === "center" ? "text-center" : ""} ${className}`}>
      <p
        className={`font-display text-sm font-bold uppercase tracking-wide ${
          dark ? "text-ball-bright/90" : "text-court"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        id={id}
        className={`mt-2 font-display text-3xl font-black tracking-tight md:text-4xl ${
          align === "center" ? "mx-auto" : ""
        } ${dark ? "text-white" : "text-court-ink"}`}
      >
        {lead}
        {accent && lead !== title ? (
          <span className={dark ? "text-ball-bright" : "text-court"}>{accent}</span>
        ) : null}
      </h2>
    </div>
  );
}
