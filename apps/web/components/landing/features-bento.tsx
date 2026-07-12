import type { LucideIcon } from "lucide-react";
import { Dumbbell, Medal, Target, TrendingUp } from "lucide-react";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import { FadeContent } from "@/components/react-bits/FadeContent";
import aerialCourt from "@/public/landing/aerial-court.webp";
import racketFlatlay from "@/public/landing/racket-flatlay.webp";
import { SectionHeading } from "./section-heading";

// Photo bento for the player features: the two photography cells break up the
// white cards so the grid doesn't read as four identical boxes. The photos
// anchor the left column (racket flat-lay tall on top, aerial below) and the
// cards read down the right, so the grid scans diagonally rather than piling
// both images on one side. Cell spans fill the 6-col grid exactly — no holes.

const BADGES = ["Primera victoria", "Racha de 5", "Rey de la tierra"];

const ELO_POINTS = [
  { x: 1, y: 78, elo: 1168 },
  { x: 21, y: 57, elo: 1196 },
  { x: 41, y: 65, elo: 1184 },
  { x: 60, y: 40, elo: 1221 },
  { x: 79, y: 28, elo: 1247 },
  { x: 98, y: 9, elo: 1284 },
];

export function FeaturesBento() {
  return (
    <section aria-labelledby="features-heading" className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
      <FadeContent>
        <SectionHeading
          id="features-heading"
          eyebrow="Tu perfil"
          title="Más que un ranking."
          accent="un ranking."
          size="lg"
        />
      </FadeContent>

      <div className="mt-10 grid gap-5 md:auto-rows-[240px] md:grid-cols-6">
        {/* 1 — Elo, the headline feature, gets the widest cell. */}
        <FadeContent className="md:col-span-4">
          <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-court/10 bg-white p-6 shadow-sm shadow-court/5">
            <CardHeader icon={TrendingUp} title="Ranking por Elo" />
            <p className="mt-2 max-w-md text-sm text-stone-600">
              Tu rating sube y baja con cada resultado. Sigue tu progresión partido a partido y compárate en la
              clasificación.
            </p>

            <div className="relative mt-auto h-20 w-full">
              <svg
                aria-hidden="true"
                role="presentation"
                viewBox="0 0 100 88"
                fill="none"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full text-court"
              >
                <polyline
                  points={ELO_POINTS.map(({ x, y }) => `${x},${y}`).join(" ")}
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {ELO_POINTS.map(({ x, y, elo }) => (
                <button
                  key={elo}
                  type="button"
                  aria-label={`${elo} pts`}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-default appearance-none border-0 bg-transparent p-0 outline-none"
                  style={{ left: `${x}%`, top: `${(y / 88) * 100}%` }}
                >
                  <span className="block h-3 w-3 rounded-full border-2 border-court bg-ball-bright shadow-sm transition-transform group-hover:scale-125 group-focus-visible:scale-125" />
                  <span
                    className={`pointer-events-none absolute bottom-full mb-2 rounded-md bg-court-ink px-2 py-1 font-mono text-[11px] font-semibold whitespace-nowrap text-white opacity-0 shadow-md transition-[opacity,transform] group-hover:-translate-y-0.5 group-hover:opacity-100 group-focus-visible:-translate-y-0.5 group-focus-visible:opacity-100 ${
                      x < 10 ? "left-0" : x > 90 ? "right-0" : "left-1/2 -translate-x-1/2"
                    }`}
                  >
                    {elo} pts
                  </span>
                </button>
              ))}
            </div>
          </div>
        </FadeContent>

        {/* 2 — Aerial photo cell, top-right. */}
        <FadeContent delay={0.05} className="md:col-span-2">
          <PhotoCell image={aerialCourt} alt="Vista aérea de pistas de tenis" caption="Pistas reales, clubes reales" />
        </FadeContent>

        {/* 3 — Racket flat-lay, tall cell under Elo anchoring the left column;
            foreshadows the rackets section below. */}
        <FadeContent delay={0.1} className="md:col-span-2 md:row-span-2">
          <PhotoCell
            image={racketFlatlay}
            alt="Raqueta de tenis sobre fondo azul"
            caption="Tu equipo también cuenta"
            tall
          />
        </FadeContent>

        {/* 4 — Logros with decorative badge pills. */}
        <FadeContent delay={0.15} className="md:col-span-2">
          <div className="flex h-full flex-col rounded-2xl border border-court/10 bg-white p-6 shadow-sm">
            <CardHeader icon={Medal} title="Logros" />
            <p className="mt-2 text-sm text-stone-600">
              Desbloquea insignias por victorias, rachas y especialidades por superficie.
            </p>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
              {BADGES.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-court/15 bg-court/5 px-2.5 py-1 text-[11px] font-semibold text-court"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </FadeContent>

        {/* 5 — Raquetas y encordados. */}
        <FadeContent delay={0.2} className="md:col-span-2">
          <div className="flex h-full flex-col rounded-2xl border border-court/10 bg-white p-6 shadow-sm">
            <CardHeader icon={Target} title="Raquetas y encordados" />
            <p className="mt-2 text-sm text-stone-600">
              Registra tus raquetas y todo su historial de encordados: tensiones, cuerdas y notas de cómo jugó cada uno.
            </p>
          </div>
        </FadeContent>

        {/* 6 — Entrenamientos closes the grid with a wide cell mirroring the Elo row. */}
        <FadeContent delay={0.25} className="md:col-span-4">
          <div className="flex h-full flex-col rounded-2xl border border-court/10 bg-white p-6 shadow-sm">
            <CardHeader icon={Dumbbell} title="Entrenamientos" />
            <p className="mt-2 max-w-md text-sm text-stone-600">
              Apunta tus sesiones con duración y notas, y elige cuáles compartir en tu perfil público.
            </p>
          </div>
        </FadeContent>
      </div>
    </section>
  );
}

function CardHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-court/5">
        <Icon className="h-5 w-5 text-court" aria-hidden />
      </span>
      <p className="font-display text-lg font-bold text-court-ink">{title}</p>
    </div>
  );
}

function PhotoCell({
  image,
  alt,
  caption,
  tall = false,
}: {
  image: StaticImageData;
  alt: string;
  caption: string;
  tall?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-sm md:h-full ${tall ? "h-72" : "h-56"}`}>
      <Image
        src={image}
        alt={alt}
        fill
        placeholder="blur"
        sizes="(min-width: 768px) 33vw, 100vw"
        className="object-cover"
      />
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-court-night/70 via-transparent to-transparent" />
      <p className="absolute inset-x-0 bottom-0 p-5 font-display text-base font-bold text-white">{caption}</p>
    </div>
  );
}
