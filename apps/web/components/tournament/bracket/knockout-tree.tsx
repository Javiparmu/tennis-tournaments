"use client";

import type { BracketPhase, Match } from "@courtrank/core/models";
import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Connectors } from "./connectors";
import { roundLabel } from "./labels";
import type { MatchSelectionState } from "./match-card";
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
  getMatchSelectionState,
}: {
  phase: BracketPhase;
  onSelectMatch?: (match: Match) => void;
  getMatchSelectionState?: (match: Match) => MatchSelectionState;
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
  const clickCandidate = useRef<{ button: HTMLButtonElement; x: number; y: number } | null>(null);
  const pinchDist = useRef<number | null>(null);

  // Round navigation: keep a ref to each round's desktop column (to pan to) and
  // its mobile section (to scroll to), plus which round the selector highlights.
  const columnRefs = useRef(new Map<number, HTMLDivElement>());
  const sectionRefs = useRef(new Map<number, HTMLElement>());
  const [activeRound, setActiveRound] = useState<number | null>(null);
  // Animate the canvas transform only while jumping to a round; drag/pinch/zoom
  // stay instantaneous by clearing this first.
  const [smoothPan, setSmoothPan] = useState(false);

  const registerColumn = useCallback(
    (round: number) => (el: HTMLDivElement | null) => {
      if (el) columnRefs.current.set(round, el);
      else columnRefs.current.delete(round);
    },
    [],
  );

  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    setSmoothPan(false);
    setTransform((t) => {
      const scale = clamp(t.scale * factor, MIN_SCALE, MAX_SCALE);
      const k = scale / t.scale;
      // Keep the point (cx, cy) in viewport space anchored while scaling.
      return { scale, x: cx - k * (cx - t.x), y: cy - k * (cy - t.y) };
    });
  }, []);

  // Bring a round into view: pan the desktop canvas so its column is centered,
  // and scroll the mobile stacked section into view. Whichever layout is hidden
  // at the current breakpoint no-ops (zero-width viewport / display:none section).
  const focusRound = useCallback((round: number) => {
    setActiveRound(round);
    const vp = viewportRef.current;
    const col = columnRefs.current.get(round);
    if (vp && col && vp.clientWidth > 0) {
      setSmoothPan(true);
      setTransform((t) => ({ ...t, x: vp.clientWidth / 2 - (col.offsetLeft + col.offsetWidth / 2) * t.scale }));
    }
    sectionRefs.current.get(round)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    setSmoothPan(false);
    const button = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-match-card-button='true']");
    clickCandidate.current = button ? { button, x: e.clientX, y: e.clientY } : null;
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
    const candidate = clickCandidate.current;
    if (candidate && Math.hypot(e.clientX - candidate.x, e.clientY - candidate.y) <= 6) {
      e.preventDefault();
      candidate.button.click();
    }
    clickCandidate.current = null;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchDist.current = null;
  }, []);

  // Default view: scale the whole draw down to fit both dimensions and center it.
  const fitToView = useCallback(() => {
    const vp = viewportRef.current;
    const canvas = canvasRef.current;
    // Bail if either dimension is 0 — the height divisor below is just as unsafe.
    if (!vp || !canvas || canvas.offsetWidth === 0 || canvas.offsetHeight === 0) return;
    setSmoothPan(false);
    setActiveRound(null);
    const pad = 16;
    const scale = clamp(
      Math.min((vp.clientWidth - pad * 2) / canvas.offsetWidth, (vp.clientHeight - pad * 2) / canvas.offsetHeight),
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
    setSmoothPan(false);
    setActiveRound(null);
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
    "grid h-8 w-8 place-items-center rounded-lg border border-court/15 bg-white/90 text-court shadow-sm transition-colors hover:bg-court/10 disabled:opacity-40 disabled:hover:bg-white/90";

  const roundNumbers = rounds.map((r) => r.round);
  const currentRound = activeRound ?? roundNumbers[0] ?? 1;
  const stepRound = (dir: -1 | 1) => {
    const idx = roundNumbers.indexOf(currentRound);
    const next = roundNumbers[Math.min(roundNumbers.length - 1, Math.max(0, idx + dir))];
    if (next != null) focusRound(next);
  };

  return (
    <>
      {rounds.length > 1 ? (
        <nav aria-label="Rondas" className="mb-4 flex items-center gap-2">
          <button
            type="button"
            aria-label="Ronda anterior"
            className={ctrlBtn}
            disabled={currentRound === roundNumbers[0]}
            onClick={() => stepRound(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto rounded-xl border border-court/10 bg-white p-1 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {rounds.map((round) => {
              const isActive = round.round === currentRound;
              return (
                <button
                  key={round.round}
                  type="button"
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => focusRound(round.round)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-court ${
                    isActive ? "bg-court text-ball-bright" : "text-stone-600 hover:bg-court/5 hover:text-court-ink"
                  }`}
                >
                  {roundLabel(round.round, rounds.length)}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            aria-label="Ronda siguiente"
            className={ctrlBtn}
            disabled={currentRound === roundNumbers[roundNumbers.length - 1]}
            onClick={() => stepRound(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      ) : null}

      <div className="grid gap-5 md:hidden">
        {rounds.map((round) => (
          <section
            key={round.round}
            ref={(el) => {
              if (el) sectionRefs.current.set(round.round, el);
              else sectionRefs.current.delete(round.round);
            }}
            className="min-w-0 scroll-mt-4 rounded-2xl border border-court/10 bg-[#fbfdf7] p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="font-display text-base font-black text-court-ink">
                {roundLabel(round.round, rounds.length)}
              </h4>
              <span className="rounded-full bg-court/10 px-2.5 py-1 text-xs font-semibold text-court">
                {(round.matches ?? []).length} partidos
              </span>
            </div>
            <div className="grid gap-3">
              {(round.matches ?? []).map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onSelect={onSelectMatch}
                  selectionState={getMatchSelectionState?.(match)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="relative hidden h-[520px] overflow-hidden rounded-2xl border border-court/10 bg-[#fbfdf7] court-lines md:block">
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
              transition: smoothPan ? "transform 300ms ease" : undefined,
            }}
          >
            <Connectors matches={matches} rects={rects} animate={!reducedMotion} />
            <div className="relative z-10 flex items-stretch gap-12">
              {rounds.map((round) => (
                <div key={round.round} ref={registerColumn(round.round)} className="flex w-56 shrink-0 flex-col">
                  <p className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-stone-400">
                    {roundLabel(round.round, rounds.length)}
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
                        <MatchCard
                          match={match}
                          onSelect={onSelectMatch}
                          selectionState={getMatchSelectionState?.(match)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
