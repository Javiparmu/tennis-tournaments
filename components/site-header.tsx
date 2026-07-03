"use client";

import { Show, useClerk, useUser } from "@clerk/nextjs";
import { Button, Modal } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/logo-mark";
import { useMeQuery } from "@/data/queries";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/tournaments", label: "Torneos" },
  { href: "/host", label: "Organizar" },
  { href: "/profile", label: "Jugadores" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { data: me } = useMeQuery();
  // The avatar goes to your own player profile; /profile is the ranking, so fall
  // back to it only until the backend username resolves.
  const myProfileHref = me ? `/users/${encodeURIComponent(me.username)}` : "/profile";

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
            const active =
              item.href === "/"
                ? pathname === "/"
                : item.href === "/profile"
                  ? // /profile redirects to /users/{id}, so keep it active on the resolved page too.
                    pathname.startsWith("/profile") || pathname.startsWith("/users")
                  : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "text-court" : "text-zinc-600 hover:text-court-ink"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-court" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Show when="signed-out">
            {/* Styled as a ghost button via buttonVariants — Button's render prop types
                clash with next/link's anchor props. */}
            <Link
              href="/sign-in"
              className={buttonVariants({
                variant: "ghost",
                className: "rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:text-court-ink",
              })}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/sign-in"
              className="rounded-lg bg-court px-4 py-2 text-sm font-semibold text-ball-bright shadow-sm transition-colors hover:bg-court-hover"
            >
              Empezar
            </Link>
          </Show>
          <Show when="signed-in">
            {/* Own avatar + sign-out instead of Clerk's UserButton, so there is no
                Clerk-hosted account/profile editing surface. Edits happen at /profile. */}
            <Link href={myProfileHref} aria-label="Mi perfil" className="shrink-0">
              {user?.imageUrl ? (
                // biome-ignore lint/performance/noImgElement: remote Clerk avatar, not a static asset
                <img src={user.imageUrl} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-court/20" />
              ) : (
                <span className="grid h-8 w-8 place-items-center rounded-full bg-court font-display text-sm font-black text-ball-bright">
                  {user?.firstName?.[0]?.toUpperCase() ?? user?.username?.[0]?.toUpperCase() ?? "?"}
                </span>
              )}
            </Link>
            <Modal>
              <Button
                variant="ghost"
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:text-court-ink"
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
                          <p className="text-sm text-zinc-600">Tendrás que iniciar sesión de nuevo para acceder a tu perfil.</p>
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
    </header>
  );
}
