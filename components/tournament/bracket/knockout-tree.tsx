"use client";

import { motion } from "motion/react";
import { Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BracketPhase, Match } from "@/models";
import { Connectors } from "./connectors";
import { MatchCard } from "./match-card";
import { useNodePositions } from "./use-node-positions";

const MIN_SCALE = 0.5;
const MAX_SCALE = 1.5;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function KnockoutTree({
  phase,
  onSelectMatch,
}: {
  phase: BracketPhase;
  onSelectMatch?: (match: Match) => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const rounds = [...(phase.rounds ?? [])].sort((a, b) => a.round - b.round);
  const matches = rounds.flatMap((r) => r.matches ?? []);
  const depKey = matches.map((m) => `${m.id}:${m.status}:${m.winnerId}`).join("|");

  const { register, rects } = useNodePositions(canvasRef, depKey);

  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef<number | null>(null);

  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    setTransform((t) => {
      const scale = clamp(t.scale * factor, MIN_SCALE, MAX_SCALE);
      const k = scale / t.scale;
      // Keep the point (cx, cy) in viewport space anchored while scaling.
      return { scale, x: cx - k * (cx - t.x), y: cy - k * (cy - t.y) };
    });
  }, []);

  // Native non-passive wheel listener: React's onWheel is passive, so calling
  // preventDefault there is ignored and the page scrolls behind the bracket.
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = vp.getBoundingClientRect();
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      zoomAt(factor, e.clientX - rect.left, e.clientY - rect.top);
    };
    vp.addEventListener("wheel", handler, { passive: false });
    return () => vp.removeEventListener("wheel", handler);
  }, [zoomAt]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];

    if (pts.length >= 2) {
      // Pinch: scale around the midpoint of the two active pointers.
      const [a, b] = pts;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist.current != null && viewportRef.current) {
        const rect = viewportRef.current.getBoundingClientRect();
        const midX = (a.x + b.x) / 2 - rect.left;
        const midY = (a.y + b.y) / 2 - rect.top;
        setTransform((t) => {
          const scale = clamp((t.scale * dist) / (pinchDist.current ?? dist), MIN_SCALE, MAX_SCALE);
          const k = scale / t.scale;
          return { scale, x: midX - k * (midX - t.x), y: midY - k * (midY - t.y) };
        });
      }
      pinchDist.current = dist;
      return;
    }

    // Single pointer: pan.
    setTransform((t) => ({ ...t, x: t.x + (e.clientX - prev.x), y: t.y + (e.clientY - prev.y) }));
  }, []);

  const endPointer = useCallback((e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchDist.current = null;
  }, []);

  // Default view: scale the whole draw down to fit both dimensions and center it.
  const fitToView = useCallback(() => {
    const vp = viewportRef.current;
    const canvas = canvasRef.current;
    if (!vp || !canvas || canvas.offsetWidth === 0) return;
    const pad = 16;
    const scale = clamp(
      Math.min(
        (vp.clientWidth - pad * 2) / canvas.offsetWidth,
        (vp.clientHeight - pad * 2) / canvas.offsetHeight,
      ),
      MIN_SCALE,
      1,
    );
    setTransform({
      scale,
      x: (vp.clientWidth - canvas.offsetWidth * scale) / 2,
      y: (vp.clientHeight - canvas.offsetHeight * scale) / 2,
    });
  }, []);

  // Fill the width for a larger, readable draw (scroll vertically to see more).
  const fitWidth = useCallback(() => {
    const vp = viewportRef.current;
    const canvas = canvasRef.current;
    if (!vp || !canvas || canvas.offsetWidth === 0) return;
    const scale = clamp((vp.clientWidth - 24) / canvas.offsetWidth, MIN_SCALE, MAX_SCALE);
    setTransform({ scale, x: 12, y: 12 });
  }, []);

  // Center the whole bracket once it is first laid out (and when data arrives).
  const didFit = useRef(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: depKey drives the initial fit.
  useEffect(() => {
    if (didFit.current) return;
    const canvas = canvasRef.current;
    if (!canvas || canvas.offsetWidth === 0) return;
    fitToView();
    didFit.current = true;
  }, [fitToView, depKey]);

  const ctrlBtn =
    "grid h-8 w-8 place-items-center rounded-lg border border-court/15 bg-white/90 text-court shadow-sm transition-colors hover:bg-court/10";

  return (
    <div className="relative h-[520px] overflow-hidden rounded-2xl border border-court/10 bg-[#fbfdf7] court-lines">
      <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5">
        <button type="button" aria-label="Alejar" className={ctrlBtn} onClick={() => zoomAt(1 / 1.1, 0, 0)}>
          <Minus className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Acercar" className={ctrlBtn} onClick={() => zoomAt(1.1, 0, 0)}>
          <Plus className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Ajustar al ancho" className={ctrlBtn} onClick={fitWidth}>
          <Maximize2 className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Ver todo" className={ctrlBtn} onClick={fitToView}>
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={viewportRef}
        className="h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
      >
        <div
          ref={canvasRef}
          className="relative w-max px-6 pb-6 pt-16"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: "0 0",
          }}
        >
          <Connectors matches={matches} rects={rects} animate={!reducedMotion} />
          <div className="relative z-10 flex items-stretch gap-12">
            {rounds.map((round) => (
              <div key={round.round} className="flex w-56 shrink-0 flex-col">
                <p className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-zinc-400">
                  Ronda {round.round}
                </p>
                <div className="flex flex-1 flex-col justify-around gap-4">
                  {(round.matches ?? []).map((match, i) => (
                    <motion.div
                      key={match.id}
                      ref={register(match.id)}
                      initial={reducedMotion ? false : { opacity: 0, scale: 0.94 }}
                      animate={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: Math.max(0, round.round - 1) * 0.12 + i * 0.04,
                      }}
                    >
                      <MatchCard match={match} onSelect={onSelectMatch} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
