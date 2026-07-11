import type { LucideIcon } from "lucide-react";
import { Mail, Megaphone, Search, Settings2, Trophy, UserPlus } from "lucide-react";
import Image from "next/image";
import { FadeContent } from "@/components/react-bits/FadeContent";
import courtLineBall from "@/public/landing/court-line-ball.webp";
import { SectionHeading } from "./section-heading";

type Step = { icon: LucideIcon; title: string; body: string };
type Track = { audience: string; steps: Step[] };

const tracks: Track[] = [
  {
    audience: "Para jugadores",
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

// Editorial index rows on a photographic panel: the heading stays on the light
// page, but the two feature lists sit on the ball-on-line court photo — the
// players list over the green half, the clubs list over the blue half, and the
// central white line + ball is the divider between them. White text plus a soft
// shadow and a light wash keep the rows legible without muting the colors.
export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
      <FadeContent>
        <SectionHeading id="how-heading" eyebrow="Cómo funciona" title="Jugadores y clubes." accent="y clubes." size="lg" />
      </FadeContent>

      <FadeContent delay={0.1}>
        <div className="relative mt-12 overflow-hidden rounded-3xl shadow-lg">
          <Image
            src={courtLineBall}
            alt=""
            fill
            sizes="(min-width: 1152px) 1152px, 100vw"
            placeholder="blur"
            className="object-cover object-center"
          />
          <div aria-hidden className="absolute inset-0 bg-black/20" />

          <div className="relative grid gap-10 p-6 [text-shadow:0_1px_3px_rgb(0_0_0/0.5)] md:grid-cols-2 md:gap-16 md:p-10">
            <TrackColumn track={tracks[0]} />
            <TrackColumn track={tracks[1]} />
          </div>
        </div>
      </FadeContent>
    </section>
  );
}

function TrackColumn({ track }: { track: Track }) {
  return (
    <div>
      <p className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-white">{track.audience}</p>
      <ol>
        {track.steps.map((step, i) => (
          <li key={step.title} className="flex gap-5 border-t border-white/20 py-6">
            <span aria-hidden="true" className="font-display text-5xl font-black leading-none text-white/25">
              {i + 1}
            </span>
            <div>
              <p className="flex items-center gap-2 font-semibold text-white">
                <step.icon aria-hidden="true" className="h-5 w-5 text-ball-bright" />
                {step.title}
              </p>
              <p className="mt-1 text-sm text-white/80">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
