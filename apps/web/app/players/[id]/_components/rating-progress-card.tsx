"use client";

import { Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useId, useMemo, useRef, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeroFrame } from "@/components/page-hero";
import { CountUp } from "@/components/react-bits/CountUp";
import { useUserRatingHistoryQuery } from "@/data/queries";
import { RATING_REASON_LABEL } from "@courtrank/core/lib/labels";
import type { RatingReason } from "@courtrank/core/models";
import { buildRatingChartGeometry, type RatingChartPoint } from "./rating-chart-geometry";

const LIME = "#d7ff3e";
const ROSE = "#fb7185";
const AMBER = "#fbbf24";

const FULL_DATE = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" });
const SHORT_DATE = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" });

function reasonLabel(reason: string | null): string {
  if (!reason) return "Inicio";
  return RATING_REASON_LABEL[reason as RatingReason] ?? "Ajuste";
}

// A milestone (tournament bonus) gets an amber diamond; wins/losses take the
// direction color. The origin and neutral points stay lime.
function pointColor(point: RatingChartPoint): string {
  if (point.reason === "TOURNAMENT_BONUS") return AMBER;
  if (point.delta != null && point.delta < 0) return ROSE;
  return LIME;
}

export function RatingProgressCard({ userId, currentRating }: { userId?: number; currentRating: number }) {
  const reduceMotion = useReducedMotion();
  const gradientId = useId();
  const glowId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { data, isLoading, isError } = useUserRatingHistoryQuery(userId);

  // API returns newest-first; the chart climbs oldest -> newest.
  const geo = useMemo(() => {
    if (!data?.length) return null;
    return buildRatingChartGeometry([...data].reverse());
  }, [data]);

  // ---- Loading / empty / error: keep the gamified frame so nothing pops in. ----
  if (userId == null || isLoading) {
    return (
      <PageHeroFrame className="p-6 md:p-7">
        <div className="h-[300px] animate-pulse rounded-2xl bg-white/5" />
      </PageHeroFrame>
    );
  }

  if (isError || !geo) {
    return (
      <PageHeroFrame className="p-6 md:p-7">
        <div className="mb-4">
          <p className="font-display text-sm font-bold uppercase tracking-wide text-ball-bright/90">
            Progresión de puntos
          </p>
        </div>
        <EmptyState
          tone="dark"
          icon={Sparkles}
          title={isError ? "No se pudo cargar la progresión" : "Aún no hay progresión"}
          description={
            isError
              ? "Vuelve a intentarlo en un momento."
              : "Juega partidos puntuables para empezar a construir tu curva de puntos."
          }
        />
      </PageHeroFrame>
    );
  }

  const { width, height, points, linePath, areaPath, peakIndex, yTicks } = geo;
  const endPoint = points[points.length - 1];
  const peakPoint = points[peakIndex];
  const originRating = points[0].rating;
  const netChange = currentRating - originRating;
  const activePoint = activeIndex != null ? points[activeIndex] : null;
  const keyboardPoint = activePoint ?? endPoint;
  const showAllDots = points.length <= 14;

  function handleMove(clientX: number) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) return;
    const vx = ((clientX - rect.left) / rect.width) * width;
    let nearest = 0;
    for (let i = 1; i < points.length; i += 1) {
      if (Math.abs(points[i].x - vx) < Math.abs(points[nearest].x - vx)) nearest = i;
    }
    setActiveIndex(nearest);
  }

  function handleKey(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      setActiveIndex((prev) => {
        const base = prev ?? points.length - 1;
        const next = event.key === "ArrowRight" ? base + 1 : base - 1;
        return Math.max(0, Math.min(points.length - 1, next));
      });
    }
  }

  return (
    <PageHeroFrame className="p-6 md:p-7">
      {/* Header: eyebrow + hero number + net-change / peak stats. */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-wide text-ball-bright/90">
            Progresión de puntos
          </p>
          <div className="mt-1 flex items-baseline gap-3">
            {reduceMotion ? (
              <span className="font-display text-5xl font-black leading-none text-white">
                {currentRating.toLocaleString()}
              </span>
            ) : (
              <CountUp
                to={currentRating}
                from={originRating}
                duration={1.4}
                className="font-display text-5xl font-black leading-none text-white"
              />
            )}
            <NetChangePill value={netChange} />
          </div>
        </div>
        <div className="flex gap-5 text-right">
          <MiniStat label="Máximo" value={peakPoint.rating} />
          <MiniStat label="Cambios" value={points.length - 1} />
        </div>
      </div>

      {/* Chart. */}
      <div
        className="relative mt-5"
        role="slider"
        tabIndex={0}
        aria-label={`Explorar curva de puntos: desde ${originRating} hasta ${currentRating}, máximo ${peakPoint.rating}.`}
        aria-valuemin={0}
        aria-valuemax={points.length - 1}
        aria-valuenow={activeIndex ?? points.length - 1}
        aria-valuetext={`${keyboardPoint.rating} puntos, ${reasonLabel(keyboardPoint.reason)}`}
        onKeyDown={handleKey}
        onBlur={() => setActiveIndex(null)}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full touch-none select-none"
          role="img"
          aria-label={`Curva de puntos: desde ${originRating} hasta ${currentRating}, máximo ${peakPoint.rating}.`}
          onPointerMove={(e) => handleMove(e.clientX)}
          onPointerLeave={() => setActiveIndex(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={LIME} stopOpacity="0.28" />
              <stop offset="100%" stopColor={LIME} stopOpacity="0" />
            </linearGradient>
            <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Recessive gridlines + y ticks. */}
          {yTicks.map((tick) => (
            <g key={tick.value}>
              <line
                x1={44}
                x2={width - 58}
                y1={tick.y}
                y2={tick.y}
                stroke="#ffffff"
                strokeOpacity="0.08"
                strokeWidth="1"
              />
              <text
                x={36}
                y={tick.y}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-white/40 text-[11px] [font-variant-numeric:tabular-nums]"
              >
                {tick.value}
              </text>
            </g>
          ))}

          {/* Area wash + glowing line. */}
          <path d={areaPath} fill={`url(#${gradientId})`} />
          <motion.path
            d={linePath}
            fill="none"
            stroke={LIME}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${glowId})`}
            initial={reduceMotion ? undefined : { pathLength: 0 }}
            animate={reduceMotion ? undefined : { pathLength: 1 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />

          {/* Dots: every point on short series; milestones always. */}
          {points.map((point, index) => {
            const isMilestone = point.reason === "TOURNAMENT_BONUS";
            if (!showAllDots && !isMilestone) return null;
            if (index === points.length - 1) return null; // end marker drawn separately
            const color = pointColor(point);
            return isMilestone ? (
              <rect
                key={point.id ?? "origin"}
                x={point.x - 3.4}
                y={point.y - 3.4}
                width={6.8}
                height={6.8}
                transform={`rotate(45 ${point.x} ${point.y})`}
                fill={color}
                stroke="#0a4023"
                strokeWidth="2"
              />
            ) : (
              <circle
                key={point.id ?? "origin"}
                cx={point.x}
                cy={point.y}
                r={3}
                fill={color}
                stroke="#0a4023"
                strokeWidth="2"
              />
            );
          })}

          {/* Peak marker + label (only when the peak isn't the current point). */}
          {peakIndex !== points.length - 1 && peakPoint.rating !== originRating ? (
            <g>
              <circle cx={peakPoint.x} cy={peakPoint.y} r={4} fill="#fff" stroke="#0a4023" strokeWidth="2" />
              <text
                x={peakPoint.x}
                y={peakPoint.y - 12}
                textAnchor="middle"
                className="fill-white/70 text-[10px] font-semibold uppercase tracking-wide"
              >
                Máx
              </text>
            </g>
          ) : null}

          {/* Crosshair for the hovered/focused point. */}
          {activePoint ? (
            <g>
              <line
                x1={activePoint.x}
                x2={activePoint.x}
                y1={30}
                y2={height - 30}
                stroke="#ffffff"
                strokeOpacity="0.25"
                strokeWidth="1"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={5}
                fill={pointColor(activePoint)}
                stroke="#0a4023"
                strokeWidth="2"
              />
            </g>
          ) : null}

          {/* Current point: pulsing end marker + direct value label. */}
          <circle cx={endPoint.x} cy={endPoint.y} r={5.5} fill={LIME} stroke="#0a4023" strokeWidth="2.5" />
          {!reduceMotion ? (
            <motion.circle
              cx={endPoint.x}
              cy={endPoint.y}
              r={5.5}
              fill="none"
              stroke={LIME}
              strokeWidth="1.5"
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 2.6, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
              style={{ transformOrigin: `${endPoint.x}px ${endPoint.y}px` }}
            />
          ) : null}
          <text
            x={endPoint.x + 10}
            y={endPoint.y}
            dominantBaseline="middle"
            className="fill-white text-[13px] font-black [font-variant-numeric:tabular-nums]"
          >
            {currentRating}
          </text>

          {/* First/last date ticks along the bottom. */}
          {points[0].date || points[1]?.date ? (
            <>
              <text x={44} y={height - 12} textAnchor="start" className="fill-white/45 text-[10px]">
                Inicio
              </text>
              {endPoint.date ? (
                <text x={width - 58} y={height - 12} textAnchor="end" className="fill-white/45 text-[10px]">
                  {SHORT_DATE.format(new Date(endPoint.date))}
                </text>
              ) : null}
            </>
          ) : null}
        </svg>

        {/* HTML tooltip overlay (values lead, label follows). */}
        {activePoint ? (
          <div
            className="pointer-events-none absolute z-10 w-max max-w-[200px] -translate-y-full rounded-xl border border-white/15 bg-court-night-deep/95 px-3 py-2 shadow-xl backdrop-blur"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${(activePoint.y / height) * 100}%`,
              transform: `translate(${activePoint.x > width * 0.7 ? "-100%" : activePoint.x < width * 0.3 ? "0" : "-50%"}, calc(-100% - 12px))`,
            }}
          >
            <p className="font-display text-lg font-black leading-none text-white [font-variant-numeric:tabular-nums]">
              {activePoint.rating}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: pointColor(activePoint) }}
                aria-hidden
              />
              <span className="text-xs text-white/70">{reasonLabel(activePoint.reason)}</span>
              {activePoint.delta != null ? (
                <span
                  className="text-xs font-bold [font-variant-numeric:tabular-nums]"
                  style={{ color: activePoint.delta < 0 ? ROSE : LIME }}
                >
                  {activePoint.delta > 0 ? "+" : ""}
                  {activePoint.delta}
                </span>
              ) : null}
            </div>
            {activePoint.date ? (
              <p className="mt-1 text-[11px] text-white/45">{FULL_DATE.format(new Date(activePoint.date))}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </PageHeroFrame>
  );
}

function NetChangePill({ value }: { value: number }) {
  const positive = value >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold [font-variant-numeric:tabular-nums] ${
        positive ? "bg-ball-bright/15 text-ball-bright" : "bg-rose-500/15 text-rose-300"
      }`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {positive ? "+" : ""}
      {value}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-display text-2xl font-black leading-none text-white [font-variant-numeric:tabular-nums]">
        {value.toLocaleString()}
      </p>
      <p className="text-[11px] text-white/60">{label}</p>
    </div>
  );
}
