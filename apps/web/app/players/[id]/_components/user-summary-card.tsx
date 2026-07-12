import { TrendingUp } from "lucide-react";

function createInitials(value: string) {
  return value
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

function formatDate(value: string | null | undefined) {
  if (!value) return null;
  return new Intl.DateTimeFormat("es-ES", { month: "short", year: "numeric" }).format(new Date(value));
}

// Slim identity bar for the top of the profile: avatar, name, handle and the
// headline rating in one compact row. Detailed stats and data live in the tabs, so
// the header stays short and does not push everything down.
export function UserSummaryCard({
  displayName,
  username,
  imageUrl,
  createdAt,
  rating,
  isOwner,
  onEdit,
}: {
  displayName: string;
  username: string;
  imageUrl: string | null;
  createdAt: string | null;
  rating: number;
  isOwner: boolean;
  onEdit?: () => void;
}) {
  const initials = createInitials(displayName);
  const joined = formatDate(createdAt);

  return (
    <div className="flex flex-wrap items-center gap-4">
      {imageUrl ? (
        // biome-ignore lint/performance/noImgElement: remote Clerk avatar, not a static asset
        <img
          src={imageUrl}
          alt={displayName}
          className="h-14 w-14 shrink-0 rounded-xl object-cover shadow-sm ring-2 ring-ball-bright/30"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-court to-court-hover font-display text-lg font-black text-ball-bright shadow-sm ring-2 ring-ball-bright/30">
          {initials}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-black tracking-tight text-white">{displayName}</h1>
          {isOwner ? (
            <span className="rounded-full bg-ball-bright/15 px-2 py-0.5 text-xs font-semibold text-ball-bright">
              Tu página
            </span>
          ) : null}
        </div>
        <p className="text-sm text-white/60">
          @{username}
          {joined ? ` · desde ${joined}` : ""}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2">
          <TrendingUp className="h-4 w-4 text-ball-bright" aria-hidden />
          <span className="font-display text-2xl font-black leading-none text-white tabular-nums">
            {rating.toLocaleString()}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-white/60">pts</span>
        </div>
        {isOwner && onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center self-stretch rounded-xl border border-white/20 px-4 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright"
          >
            Editar
          </button>
        ) : null}
      </div>
    </div>
  );
}
