import { ClipboardList, Megaphone, Search, Settings2, Trophy, UserPlus } from "lucide-react";
import { FadeContent } from "@/components/react-bits/FadeContent";

const tracks = [
  {
    audience: "Para jugadores",
    accent: "text-court",
    steps: [
      { icon: Search, title: "Explora torneos", body: "Filtra los eventos por fecha y superficie." },
      { icon: UserPlus, title: "Inscríbete", body: "Apúntate a jugar en un par de toques." },
      { icon: Trophy, title: "Escala en el Elo", body: "Los resultados actualizan tu rating y tu perfil." },
    ],
  },
  {
    audience: "Para clubes",
    accent: "text-blue",
    steps: [
      { icon: ClipboardList, title: "Crea una cuenta de club", body: "Configura tu organización una sola vez." },
      { icon: Settings2, title: "Publica y gestiona", body: "Crea un torneo, define las fases y el formato." },
      { icon: Megaphone, title: "Los jugadores se apuntan", body: "Los usuarios registrados se inscriben y juegan." },
    ],
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <FadeContent>
        <p className="font-display text-sm font-bold uppercase tracking-wide text-court">Cómo funciona</p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl font-black tracking-tight text-court-ink md:text-4xl">
          Dos lados, una misma pista.
        </h2>
      </FadeContent>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {tracks.map((track, ti) => (
          <FadeContent key={track.audience} delay={ti * 0.1}>
            <div className="h-full rounded-2xl border border-court/10 bg-white p-6 shadow-sm">
              <p className={`mb-5 font-display text-sm font-bold uppercase tracking-wide ${track.accent}`}>
                {track.audience}
              </p>
              <ol className="space-y-5">
                {track.steps.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-court/5 text-court">
                      <step.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-court-ink">
                        <span className="mr-2 text-zinc-400">{i + 1}.</span>
                        {step.title}
                      </p>
                      <p className="text-sm text-zinc-600">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </FadeContent>
        ))}
      </div>
    </section>
  );
}
