import { Dumbbell, Medal, Target, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FadeContent } from "@/components/react-bits/FadeContent";
import { SectionHeading } from "./section-heading";

type Feature = {
  icon: LucideIcon;
  title: string;
  body: string;
  span: string;
};

// The real player features — surfaced honestly so the profile's depth is visible
// from the landing (ranking is not the whole story). Bento rhythm (2+1 / 1+2) so it
// doesn't read as four identical cards.
const features: Feature[] = [
  {
    icon: TrendingUp,
    title: "Ranking por Elo",
    body: "Tu rating sube y baja con cada resultado. Sigue tu progresión partido a partido y compárate en la clasificación.",
    span: "md:col-span-2",
  },
  {
    icon: Medal,
    title: "Logros",
    body: "Desbloquea insignias por victorias, rachas y especialidades por superficie.",
    span: "md:col-span-1",
  },
  {
    icon: Target,
    title: "Raquetas y encordados",
    body: "Registra tus raquetas y todo su historial de encordados: tensiones, cuerdas y notas de cómo jugó cada uno.",
    span: "md:col-span-1",
  },
  {
    icon: Dumbbell,
    title: "Entrenamientos",
    body: "Apunta tus sesiones con duración y notas, y elige cuáles compartir en tu perfil público.",
    span: "md:col-span-2",
  },
];

export function Features() {
  return (
    <section aria-labelledby="features-heading" className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
      <FadeContent>
        <SectionHeading id="features-heading" eyebrow="Tu perfil" title="Más que un ranking." accent="un ranking." />
      </FadeContent>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {features.map((feature, index) => (
          <FadeContent key={feature.title} delay={index * 0.06} className={feature.span}>
            <div className="flex h-full flex-col gap-3 rounded-2xl border border-court/10 bg-white p-6 shadow-sm">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-court/5">
                <feature.icon className="h-5 w-5 text-court" aria-hidden />
              </span>
              <p className="font-display text-lg font-bold text-court-ink">{feature.title}</p>
              <p className="text-sm text-stone-600">{feature.body}</p>
            </div>
          </FadeContent>
        ))}
      </div>
    </section>
  );
}
