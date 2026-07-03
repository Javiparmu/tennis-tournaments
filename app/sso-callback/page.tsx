"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

// Intermediate landing route for OAuth/SSO (`signIn.sso` / `signUp.sso` set this as
// `redirectCallbackUrl`). Clerk finishes the token exchange here, then redirects to the
// `redirectUrl` ("/"). We only show a brief fallback while that happens.
export default function SSOCallbackPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background text-court-ink">
      <p className="text-sm text-zinc-500">Redirigiendo…</p>
      <AuthenticateWithRedirectCallback />
    </main>
  );
}
