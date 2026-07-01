import Link from "next/link";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 text-court-ink sm:px-6 lg:py-16">
      {/* Full-viewport court field behind the centered split-card. */}
      <div className="court-lines absolute inset-0 -z-10 opacity-30" />
      <div className="glow absolute -left-40 -top-40 -z-10 h-[32rem] w-[32rem]" />
      <div className="glow-court absolute -right-40 -bottom-24 -z-10 h-[36rem] w-[36rem]" />

      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl border border-court/10 bg-white shadow-2xl lg:min-h-[640px] lg:grid-cols-2">
        <AuthBrandPanel
          heading="Empieza a competir en"
          pitch="Crea tu cuenta para inscribirte en torneos como jugador, o publica los tuyos como club."
        />

        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-sm">
            {/* Compact logo lockup — only on mobile, where the brand panel is hidden. */}
            <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-court text-ball-bright">
                <span className="font-display text-sm font-black">C</span>
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight text-court-ink">
                Court<span className="text-court">Rank</span>
              </span>
            </Link>

            <h2 className="font-display text-3xl font-black tracking-tight text-court-ink sm:text-4xl">
              Crea tu cuenta
            </h2>
            <p className="mt-2 text-zinc-600">
              ¿Ya tienes cuenta?{" "}
              <Link href="/sign-in" className="font-semibold text-court hover:text-court-hover">
                Inicia sesión
              </Link>
            </p>

            <div className="mt-8">
              <SignUpForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
