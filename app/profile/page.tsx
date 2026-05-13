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
      router.replace(`/users/${me.id}`);
    }
  }, [me, router]);

  return (
    <div className="min-h-screen bg-[#f6faf8] text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <Show when="signed-out">
          <p className="text-zinc-600">Sign in to open your profile.</p>
        </Show>
        <Show when="signed-in">
          {!isLoaded || isLoading ? <p className="text-zinc-600">Loading your profile...</p> : null}
          {error ? <p className="text-rose-600">Could not load your profile.</p> : null}
          {me ? <p className="text-zinc-600">Redirecting to your user page...</p> : null}
          {isLoaded && isSignedIn && !isLoading && !error && !me ? (
            <p className="text-zinc-600">No backend user profile was found for this account yet.</p>
          ) : null}
        </Show>
      </main>
    </div>
  );
}
