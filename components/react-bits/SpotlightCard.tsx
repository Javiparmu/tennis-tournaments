"use client";

import { type ReactNode, useRef } from "react";

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
  /** Spotlight color, CSS color string. */
  spotlightColor?: string;
};

// react-bits style spotlight card — a soft radial highlight follows the cursor.
export function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(198, 242, 78, 0.35)",
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: decorative spotlight follows the cursor; not an interactive control
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={`group relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(220px circle at var(--mx) var(--my), ${spotlightColor}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}
