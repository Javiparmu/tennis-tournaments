type LogoMarkProps = {
  // Size + color via Tailwind utilities, e.g. "h-8 w-8 bg-court".
  className?: string;
};

// CourtRank badge (tennis ball + rising ranking bars). The source art is a white
// silhouette on transparent; we render it as a CSS mask so the shape takes the
// element's background color — pass a `bg-*` in className to recolor per surface.
export function LogoMark({ className = "bg-court" }: LogoMarkProps) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 ${className}`}
      style={{
        maskImage: "url(/logo-mark.png)",
        WebkitMaskImage: "url(/logo-mark.png)",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
