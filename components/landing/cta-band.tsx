import { Building2 } from "lucide-react";
import Image from "next/image";
import { ClubContactCta } from "@/components/club-contact-modal";
import serveImg from "@/public/landing/serve.webp";

// Closing band aimed at the one audience the hero doesn't already convert:
// clubs. Players get their CTA up top; this is the manual club-onboarding path.
// The serve-toss photo is portrait, so it sits in a contained side panel at its
// natural aspect (sharp, uncropped) rather than stretched full-bleed.
export function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-court-night to-court-night-deep text-white">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-14 md:grid-cols-2 md:gap-12 md:py-16">
        <div>
          <h2 className="font-display text-3xl font-black tracking-tight text-white md:text-5xl">
            ¿Gestionas un club?
          </h2>
          <p className="mt-3 max-w-xl text-white/80">
            Publica tus torneos, gestiona inscripciones y cuadros. Te damos de alta la cuenta personalmente.
          </p>
          <ClubContactCta className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-ball-bright px-7 py-3.5 font-semibold text-court-ink transition-colors hover:bg-ball focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright">
            <Building2 className="h-4 w-4" />
            Contacta con nosotros
          </ClubContactCta>
        </div>

        <div className="relative mx-auto aspect-[2/3] w-full max-w-[280px] overflow-hidden rounded-3xl shadow-xl md:ml-auto md:mr-0">
          <Image
            src={serveImg}
            alt="Jugador sacando en un torneo"
            fill
            placeholder="blur"
            sizes="(min-width: 768px) 280px, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
