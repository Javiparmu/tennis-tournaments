import { Medal } from "lucide-react";

function createInitials(value: string) {
  return value
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Desconocido";
  return new Intl.DateTimeFormat("es-ES", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function UserSummaryCard({
  displayName,
  username,
  imageUrl,
  createdAt,
  achievements,
  isOwner,
  onEdit,
}: {
  displayName: string;
  username: string;
  imageUrl: string | null;
  createdAt: string | null;
  achievements: Array<{ id: number; name: string; description: string | null }>;
  isOwner: boolean;
  onEdit?: () => void;
}) {
  const initials = createInitials(displayName);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4">
        {imageUrl ? (
          // biome-ignore lint/performance/noImgElement: remote Clerk avatar, not a static asset
          <img
            src={imageUrl}
            alt={displayName}
            className="h-16 w-16 rounded-2xl object-cover shadow-sm ring-2 ring-ball-bright/30"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-court to-court-hover font-display text-xl font-black text-ball-bright shadow-sm ring-2 ring-ball-bright/30">
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
          <p className="text-sm text-white/60">@{username}</p>
        </div>
        {isOwner && onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright"
          >
            Editar perfil
          </button>
        ) : null}
      </div>

      <p className="text-sm text-white/60">
        Se unió el {formatDate(createdAt)}. Los datos públicos del perfil se sincronizan desde el servidor.
      </p>

      <div className="flex flex-wrap gap-2">
        {achievements.length > 0 ? (
          achievements.map((achievement) => (
            <span
              key={achievement.id}
              title={achievement.description ?? achievement.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/80"
            >
              <Medal className="h-3 w-3 text-ball-bright" />
              {achievement.name}
            </span>
          ))
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-white/20 px-3 py-1 text-xs font-medium text-white/60">
            <Medal className="h-3 w-3 text-white/40" />
            Aún no se han desbloqueado logros.
          </span>
        )}
      </div>
    </div>
  );
}
