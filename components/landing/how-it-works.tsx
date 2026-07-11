import { Mail, Megaphone, Search, Settings2, Trophy, UserPlus } from "lucide-react";
import { FadeContent } from "@/components/react-bits/FadeContent";
import { SectionHeading } from "./section-heading";

const tracks = [
  {
    audience: "Para jugadores",
    accent: "text-court",
    steps: [
      { icon: Search, title: "Explora torneos", body: "Mira qué hay abierto y filtra por fecha y superficie." },
      {
        icon: UserPlus,
        title: "Pide tu plaza",
        body: "Solicita jugar en un par de toques; el club confirma tu inscripción.",
      },
      {
        icon: Trophy,
        title: "Sube en el ranking",
        body: "Cada resultado actualiza tu ranking, tus logros y tu historial.",
      },
    ],
  },
  {
    audience: "Para clubes",
    accent: "text-blue",
    steps: [
      { icon: Mail, title: "Contacta con nosotros", body: "Te damos de alta la cuenta de tu club personalmente." },
      {
        icon: Settings2,
        title: "Publica y gestiona",
        body: "Eliminatorio, grupos o sistema suizo: tú eliges el formato y las fases.",
      },
      {
        icon: Megaphone,
        title: "Los jugadores se apuntan",
        body: "Recibes las solicitudes, confirmas jugadores y el cuadro se genera solo.",
      },
    ],
  },
];

// Editorial index rows instead of card chrome: ghost numbers and hairline rules
// give the section a pricing-table rhythm that matches the redesigned bento.
export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
      <FadeContent>
        <SectionHeading id="how-heading" eyebrow="Cómo funciona" title="Jugadores y clubes." accent="y clubes." size="lg" />
      </FadeContent>

      <div className="mt-12 grid gap-14 md:grid-cols-2">
        {tracks.map((track, ti) => (
          <FadeContent key={track.audience} delay={ti * 0.1}>
            <p className={`mb-2 font-display text-sm font-bold uppercase tracking-wide ${track.accent}`}>
              {track.audience}
            </p>
            <ol>
              {track.steps.map((step, i) => (
                <li key={step.title} className="flex gap-5 border-t border-court/10 py-6">
                  <span aria-hidden="true" className="font-display text-5xl font-black leading-none text-court/10">
                    {i + 1}
                  </span>
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-court-ink">
                      <step.icon aria-hidden="true" className="h-5 w-5 text-court" />
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm text-stone-600">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </FadeContent>
        ))}
      </div>
    </section>
  );
}
