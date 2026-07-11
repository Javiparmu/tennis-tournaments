import { Building2 } from "lucide-react";
import Image from "next/image";
import { ClubContactCta } from "@/components/club-contact-modal";
import serveImg from "@/public/landing/serve.webp";

// Full-bleed photographic closer aimed at the one audience the hero doesn't
// already convert: clubs. Players get their CTA up top; this is the manual
// club-onboarding path. The serve-toss photo crops so the ball and reaching
// arm sit upper-right, above the scrimmed copy.
export function CtaBand() {
  return (
    <section className="relative flex min-h-[420px] items-end overflow-hidden md:min-h-[520px]">
      <Image
        src={serveImg}
        alt=""
        role="presentation"
        fill
        placeholder="blur"
        sizes="100vw"
        className="object-cover object-[70%_20%]"
      />
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-court-night/90 via-court-night/40 to-transparent" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-wrap items-end justify-between gap-6 px-6 pb-14 pt-40">
        <div>
          <h2 className="font-display text-3xl font-black tracking-tight text-white md:text-5xl">
            ¿Gestionas un club?
          </h2>
          <p className="mt-2 max-w-xl text-white/80">
            Publica tus torneos, gestiona inscripciones y cuadros. Te damos de alta la cuenta personalmente.
          </p>
        </div>
        <ClubContactCta className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-ball-bright px-7 py-3.5 font-semibold text-court-ink transition-colors hover:bg-ball focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright">
          <Building2 className="h-4 w-4" />
          Contacta con nosotros
        </ClubContactCta>
      </div>
    </section>
  );
}
