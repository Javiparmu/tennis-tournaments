import { Mail, Megaphone, Search, Settings2, Trophy, UserPlus } from "lucide-react";
import { FadeContent } from "@/components/react-bits/FadeContent";
import { SectionHeading } from "./section-heading";

const tracks = [
  {
    audience: "Para jugadores",
    accent: "text-court",
    steps: [
      { icon: Search, title: "Explora torneos", body: "Mira qué hay abierto y filtra por fecha y superficie." },
      { icon: UserPlus, title: "Pide tu plaza", body: "Solicita jugar en un par de toques; el club confirma tu inscripción." },
      { icon: Trophy, title: "Sube en el ranking", body: "Cada resultado actualiza tu ranking, tus logros y tu historial." },
    ],
  },
  {
    audience: "Para clubes",
    accent: "text-blue",
    steps: [
      { icon: Mail, title: "Contacta con nosotros", body: "Te damos de alta la cuenta de tu club personalmente." },
      { icon: Settings2, title: "Publica y gestiona", body: "Eliminatorio, grupos o sistema suizo: tú eliges el formato y las fases." },
      { icon: Megaphone, title: "Los jugadores se apuntan", body: "Recibes las solicitudes, confirmas jugadores y el cuadro se genera solo." },
    ],
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
      <FadeContent>
        <SectionHeading
          id="how-heading"
          eyebrow="Cómo funciona"
          title="Dos lados, una misma pista."
          accent="una misma pista."
        />
      </FadeContent>

      {/* Two rallies facing each other across the net (the dashed divider). */}
      <div className="relative mt-10">
        <div
          aria-hidden
          className="court-lines pointer-events-none absolute inset-0 rounded-3xl opacity-60"
        />
        <div className="relative grid gap-6 md:grid-cols-2 md:gap-0">
          {/* Chalk net line down the center, desktop only. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-2 left-1/2 hidden -translate-x-1/2 border-l-2 border-dashed border-court/25 md:block"
          />
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-court/20 bg-background px-3 py-1 font-display text-[11px] font-bold uppercase tracking-widest text-court md:block"
          >
            VS
          </span>

          {tracks.map((track, ti) => (
            <FadeContent
              key={track.audience}
              delay={ti * 0.1}
              className={ti === 0 ? "md:pr-12" : "md:pl-12"}
            >
              <div className="h-full rounded-2xl border border-court/10 bg-white p-6 shadow-sm md:border-0 md:bg-transparent md:p-0 md:shadow-none">
                <p className={`mb-5 font-display text-sm font-bold uppercase tracking-wide ${track.accent}`}>
                  {track.audience}
                </p>
                <ol className="space-y-5">
                  {track.steps.map((step, i) => (
                    <li key={step.title} className="flex gap-4">
                      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-court/5 text-court">
                        <step.icon className="h-5 w-5" />
                        <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-court font-display text-[10px] font-black text-ball-bright">
                          {i + 1}
                        </span>
                      </span>
                      <div>
                        <p className="font-semibold text-court-ink">{step.title}</p>
                        <p className="text-sm text-zinc-600">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </FadeContent>
          ))}
        </div>
      </div>
    </section>
  );
}
