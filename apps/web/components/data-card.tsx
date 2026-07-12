import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type DataCardProps = {
  /** Card title. Omit for a chrome-less surface (just the padded body). */
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Small icon rendered before the title. */
  icon?: LucideIcon;
  /** Trailing header slot — a button, link, or chip. */
  action?: ReactNode;
  /** CSS color for a thin top accent strip (e.g. a surface hex). */
  accent?: string;
  className?: string;
  /** Overrides the default body padding (e.g. "p-0" for edge-to-edge lists). */
  bodyClassName?: string;
  children?: ReactNode;
};

// The canonical content card: one surface used across the app so dashboards,
// listings and detail panels share the same chrome instead of each re-rolling a
// `rounded-2xl border bg-white` div. Header is optional; pass `accent` for the
// court/surface top-strip that several listings use.
export function DataCard({
  title,
  subtitle,
  icon: Icon,
  action,
  accent,
  className = "",
  bodyClassName = "p-5",
  children,
}: DataCardProps) {
  const hasHeader = title != null || action != null;

  return (
    <section
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-court/10 bg-white shadow-sm ${className}`.trim()}
    >
      {accent ? <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} /> : null}
      {hasHeader ? (
        <header className="flex items-start justify-between gap-3 p-5 pb-0">
          <div className="min-w-0">
            {title != null ? (
              <p className="flex items-center gap-2 font-display text-lg font-bold text-court-ink">
                {Icon ? <Icon className="h-4 w-4 shrink-0 text-court" aria-hidden /> : null}
                <span className="min-w-0 truncate">{title}</span>
              </p>
            ) : null}
            {subtitle != null ? <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p> : null}
          </div>
          {action != null ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={`${hasHeader ? "pt-4" : ""} ${bodyClassName}`.trim()}>{children}</div>
    </section>
  );
}
