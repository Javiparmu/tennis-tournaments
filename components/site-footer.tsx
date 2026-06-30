import Link from "next/link";

const links = [
  { href: "/tournaments", label: "Torneos" },
  { href: "/profile", label: "Mi perfil" },
  { href: "/sign-up", label: "Para clubes" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-court/10 bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-display text-lg font-extrabold tracking-tight text-court-ink">
            Court<span className="text-court">Rank</span>
          </span>
          <p className="mt-1 text-sm text-zinc-500">
            Los clubes publican torneos. Los jugadores se inscriben y escalan en la clasificación.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-court"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-court/10 py-4">
        <p className="mx-auto max-w-6xl px-6 text-xs text-zinc-400">
          © {new Date().getFullYear()} CourtRank. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
