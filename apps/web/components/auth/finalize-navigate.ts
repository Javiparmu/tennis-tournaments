// Shared `navigate` callback for Clerk's `signIn.finalize()` / `signUp.finalize()`.
// No session-task routes are defined in this app, so we bail on a pending task and
// otherwise send the user home. `decorateUrl` may return an absolute URL to survive
// Safari's Intelligent Tracking Prevention — follow it with a hard navigation.

type FinalizeArgs = {
  session?: { currentTask?: unknown } | null;
  decorateUrl: (path: string) => string;
};

// Minimal router shape (just what we use) so this stays a plain, non-hook module.
type PushRouter = { push: (href: string) => void };

export function makeNavigate(router: PushRouter) {
  return ({ session, decorateUrl }: FinalizeArgs) => {
    if (session?.currentTask) return;
    const url = decorateUrl("/");
    if (url.startsWith("http")) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  };
}
