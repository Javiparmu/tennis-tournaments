import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Tone = "light" | "dark";
type Size = "default" | "compact";

const TONE: Record<Tone, { border: string; icon: string; iconBg: string; title: string; body: string }> = {
  light: {
    border: "border-court/20",
    icon: "text-court",
    iconBg: "bg-court/10",
    title: "text-court-ink",
    body: "text-stone-500",
  },
  dark: {
    border: "border-white/15",
    icon: "text-ball-bright",
    iconBg: "bg-white/[0.06]",
    title: "text-white",
    body: "text-white/60",
  },
};

/**
 * Shared empty-state block: dashed frame, optional icon badge, title and hint.
 * `compact` fits inside section cards; `default` suits full-width page sections.
 * `dark` tone is for the navy hero surfaces.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "light",
  size = "default",
  className = "",
}: {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  tone?: Tone;
  size?: Size;
  className?: string;
}) {
  const t = TONE[tone];
  const compact = size === "compact";

  return (
    <div
      className={`flex flex-col items-center rounded-2xl border border-dashed text-center ${t.border} ${
        compact ? "gap-2 p-6" : "gap-3 p-10"
      } ${className}`}
    >
      {Icon ? (
        <span
          className={`flex items-center justify-center rounded-full ${t.iconBg} ${compact ? "h-9 w-9" : "h-11 w-11"}`}
        >
          <Icon className={`${compact ? "h-4 w-4" : "h-5 w-5"} ${t.icon}`} aria-hidden />
        </span>
      ) : null}
      <div className="space-y-1">
        <p className={`font-display font-bold ${t.title} ${compact ? "text-base" : "text-lg"}`}>{title}</p>
        {description ? <p className={`text-sm ${t.body}`}>{description}</p> : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
