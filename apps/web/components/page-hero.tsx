"use client";

import type { ReactNode } from "react";

type PageHeroFrameProps = {
  /** Extra outer classes — at minimum the padding (e.g. "p-8 md:p-10"). */
  className?: string;
  /** Layout classes for the content wrapper (it is always `relative`). */
  contentClassName?: string;
  children: ReactNode;
};

// The dark night-court shell on its own (gradient + floodlight). Pages whose
// hero content doesn't fit PageHero's copy layout (custom grids, side actions,
// different type scale) compose this directly.
export function PageHeroFrame({ className = "", contentClassName = "", children }: PageHeroFrameProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-linear-to-b from-court-night to-court-night-deep text-white shadow-lg ${className}`}
    >
      <div aria-hidden className="floodlight pointer-events-none absolute -top-16 right-1/4 h-72 w-72" />

      <div className={`relative ${contentClassName}`.trim()}>{children}</div>
    </div>
  );
}

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  /** Trailing word/phrase of `title` to color lime. Must be a suffix of `title`. */
  accent?: string;
  subtitle?: string;
  /** Meta rows, chips, or action buttons rendered under the copy. */
  children?: ReactNode;
  className?: string;
  /** Tighter padding + smaller title, for pages where the content below the hero
      (e.g. the ranking list) is the point and the band should get out of the way. */
  compact?: boolean;
};

// Dark night-court hero band shared across inner pages — the same language as the
// landing hero (gradient + floodlight + lime accent), contained (rounded) so it
// drops into each page's existing max-w-6xl <main>.
export function PageHero({
  eyebrow,
  title,
  accent,
  subtitle,
  children,
  className = "",
  compact = false,
}: PageHeroProps) {
  const lead = accent && title.endsWith(accent) ? title.slice(0, title.length - accent.length) : title;

  return (
    <PageHeroFrame className={`${compact ? "p-6 md:p-7" : "p-8 md:p-10"} ${className}`.trim()}>
      {eyebrow ? (
        <p className="font-display text-sm font-bold uppercase tracking-wide text-ball-bright/90">{eyebrow}</p>
      ) : null}
      <h1
        className={`mt-2 font-display font-black tracking-tight ${compact ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl"}`}
      >
        {lead}
        {accent && lead !== title ? <span className="text-ball-bright">{accent}</span> : null}
      </h1>
      {subtitle ? <p className="mt-3 max-w-xl text-white/70">{subtitle}</p> : null}
      {children}
    </PageHeroFrame>
  );
}
