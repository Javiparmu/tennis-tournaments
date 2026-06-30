"use client";

import { Show, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { useMeQuery } from "@/data/queries";

export default function ProfilePage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { data: me, isLoading, error } = useMeQuery();

  useEffect(() => {
    if (me) {
      router.replace(`/users/${encodeURIComponent(me.username)}`);
    }
  }, [me, router]);

  return (
    <div className="min-h-screen bg-background text-court-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <Show when="signed-out">
          <p className="text-zinc-600">Inicia sesión para abrir tu perfil.</p>
        </Show>
        <Show when="signed-in">
          {!isLoaded || isLoading ? <p className="text-zinc-600">Cargando tu perfil...</p> : null}
          {error ? <p className="text-rose-600">No se pudo cargar tu perfil.</p> : null}
          {me ? <p className="text-zinc-600">Redirigiendo a tu página de usuario...</p> : null}
          {isLoaded && isSignedIn && !isLoading && !error && !me ? (
            <p className="text-zinc-600">Todavía no se ha encontrado un perfil de usuario para esta cuenta.</p>
          ) : null}
        </Show>
      </main>
    </div>
  );
}
