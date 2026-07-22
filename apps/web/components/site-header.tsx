"use client";

import { Show, useClerk, useUser } from "@clerk/nextjs";
import { Button, Modal } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/logo-mark";
import { useMeQuery } from "@/data/queries";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/tournaments", label: "Torneos" },
  { href: "/players", label: "Jugadores" },
  { href: "/competitions", label: "Ligas" },
  { href: "/host", label: "Organizar" },
];

function isNavActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { data: me } = useMeQuery();
  const [menuOpen, setMenuOpen] = useState(false);
  // The avatar goes to your own player profile; /players is the ranking, so fall
  // back to it only until the backend username resolves.
  const myProfileHref = me ? `/players/${encodeURIComponent(me.username)}` : "/players";

  // Close the mobile menu whenever the route changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: collapse on navigation
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-court/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark className="h-8 w-8 bg-court" />
          <span className="font-display text-xl font-extrabold tracking-tight text-court-ink">
            Court<span className="text-court">Rank</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-court ${
                  active ? "text-court" : "text-stone-600 hover:text-court-ink"
                }`}
              >
                {item.label}
                {active && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-court" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-9 w-9 place-items-center rounded-lg text-stone-600 transition-colors hover:text-court-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-court md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Show when="signed-out">
            {/* Styled as a ghost button via buttonVariants — Button's render prop types
                clash with next/link's anchor props. */}
            <Link
              href="/sign-in"
              className={buttonVariants({
                variant: "ghost",
                className: "rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:text-court-ink",
              })}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/sign-in"
              className="hidden rounded-lg bg-court px-4 py-2 text-sm font-semibold text-ball-bright shadow-sm transition-colors hover:bg-court-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-court sm:inline-flex"
            >
              Empezar
            </Link>
          </Show>
          <Show when="signed-in">
            {/* Own avatar + sign-out instead of Clerk's UserButton, so there is no
                Clerk-hosted account/profile editing surface. Edits happen at /players. */}
            <Link href={myProfileHref} aria-label="Mi perfil" className="shrink-0">
              {user?.imageUrl ? (
                // biome-ignore lint/performance/noImgElement: remote Clerk avatar, not a static asset
                <img src={user.imageUrl} alt="" className="h-8 w-8 rounded-xl object-cover ring-2 ring-court/20" />
              ) : (
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-court font-display text-sm font-black text-ball-bright">
                  {user?.firstName?.[0]?.toUpperCase() ?? user?.username?.[0]?.toUpperCase() ?? "?"}
                </span>
              )}
            </Link>
            <Modal>
              <Button
                variant="ghost"
                className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:text-court-ink"
              >
                Cerrar sesión
              </Button>
              <Modal.Backdrop>
                <Modal.Container>
                  <Modal.Dialog className="sm:max-w-[360px]">
                    {({ close }) => (
                      <>
                        <Modal.Header>
                          <Modal.Heading>¿Cerrar sesión?</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                          <p className="text-sm text-stone-600">
                            Tendrás que iniciar sesión de nuevo para acceder a tu perfil.
                          </p>
                        </Modal.Body>
                        <Modal.Footer>
                          <Button slot="close" variant="secondary">
                            Cancelar
                          </Button>
                          <Button
                            className="bg-court text-ball-bright hover:bg-court-hover"
                            onPress={() => {
                              close();
                              signOut({ redirectUrl: "/" });
                            }}
                          >
                            Cerrar sesión
                          </Button>
                        </Modal.Footer>
                      </>
                    )}
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>
          </Show>
        </div>
      </div>

      {menuOpen ? (
        <nav className="border-t border-court/10 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-6 py-3">
            {navItems.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-court ${
                    active ? "bg-court/5 text-court" : "text-stone-600 hover:bg-court/5 hover:text-court-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
