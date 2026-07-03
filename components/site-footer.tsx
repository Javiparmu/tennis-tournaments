import Link from "next/link";
import { ClubContactCta } from "@/components/club-contact-modal";

const links = [
  { href: "/tournaments", label: "Torneos" },
  { href: "/profile", label: "Mi perfil" },
];

export function SiteFooter() {
  // Starts at court-night-deep — the exact color the CtaBand gradient ends on —
  // so the two dark bands read as one seamless close.
  return (
    <footer className="bg-court-night-deep text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-display text-lg font-extrabold tracking-tight text-white">
            Court<span className="text-ball-bright">Rank</span>
          </span>
          <p className="mt-1 text-sm text-white/60">Torneos de clubes reales. Resultados que cuentan.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md text-sm font-medium text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright"
            >
              {l.label}
            </Link>
          ))}
          {/* Clubs join by contacting us — there is no self-service club signup. */}
          <ClubContactCta className="rounded-md text-sm font-medium text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright">
            Para clubes
          </ClubContactCta>
        </nav>
      </div>
      <div className="border-t border-white/10 py-4">
        <p className="mx-auto max-w-6xl px-6 text-xs text-white/60">
          © {new Date().getFullYear()} CourtRank. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
