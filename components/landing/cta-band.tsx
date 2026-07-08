import { Building2 } from "lucide-react";
import { ClubContactCta } from "@/components/club-contact-modal";
import { CourtLinesSvg } from "./court-lines-svg";

// Slim closing band aimed at the one audience the hero doesn't already convert:
// clubs. Players get their CTA up top; this is the manual club-onboarding path.
export function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-court-night to-court-night-deep text-white">
      <CourtLinesSvg strokeWidth={2} className="pointer-events-none absolute inset-0 h-full w-full text-white/[0.05]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-14">
        <div>
          <h2 className="font-display text-2xl font-black tracking-tight text-white md:text-3xl">
            ¿Gestionas un club?
          </h2>
          <p className="mt-2 max-w-xl text-white/70">
            Publica tus torneos, gestiona inscripciones y cuadros. Te damos de alta la cuenta personalmente.
          </p>
        </div>
        <ClubContactCta className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-ball-bright px-6 py-3 font-semibold text-court-ink transition-colors hover:bg-ball focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright">
          <Building2 className="h-4 w-4" />
          Contacta con nosotros
        </ClubContactCta>
      </div>
    </section>
  );
}
