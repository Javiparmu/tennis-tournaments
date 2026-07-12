import { type RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// Geometry of a match card in canvas-local coordinates. We use offsetLeft/Top
// (layout coords) rather than getBoundingClientRect so a CSS `transform: scale`
// on the pan/zoom canvas does not distort the measurements — connectors are
// drawn in the untransformed coordinate space and scale along with the cards.
export type NodeRect = {
  left: number;
  top: number;
  right: number;
  midY: number;
  width: number;
  height: number;
};

// Tracks the DOM node of every match and reports their positions relative to
// the (position: relative) canvas. Re-measures on layout, on container/element
// resize, and whenever `depKey` changes (matches added / statuses updated).
export function useNodePositions(canvasRef: RefObject<HTMLElement | null>, depKey: string) {
  const nodesRef = useRef(new Map<number, HTMLElement>());
  const [rects, setRects] = useState<Map<number, NodeRect>>(() => new Map());

  const register = useCallback(
    (id: number) => (el: HTMLElement | null) => {
      if (el) nodesRef.current.set(id, el);
      else nodesRef.current.delete(id);
    },
    [],
  );

  const measure = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const next = new Map<number, NodeRect>();
    for (const [id, el] of nodesRef.current) {
      // Accumulate offsets up the offsetParent chain to the canvas so the
      // coordinates are canvas-local regardless of positioned wrappers in
      // between (which would otherwise become the offsetParent and skew the
      // connector endpoints).
      let left = 0;
      let top = 0;
      let node: HTMLElement | null = el;
      while (node && node !== canvas) {
        left += node.offsetLeft;
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      next.set(id, { left, top, right: left + width, midY: top + height / 2, width, height });
    }
    setRects(next);
  }, [canvasRef]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: depKey drives re-measure.
  useLayoutEffect(() => {
    measure();
  }, [measure, depKey]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: depKey drives re-observe.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(canvas);
    for (const el of nodesRef.current.values()) ro.observe(el);
    return () => ro.disconnect();
  }, [canvasRef, measure, depKey]);

  return { register, rects };
}
