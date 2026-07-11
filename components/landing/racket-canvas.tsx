"use client";

import { useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { Component, type ReactNode, Suspense, useMemo, useRef } from "react";
import { Box3, type Group, Vector3 } from "three";

// Heavy chunk: the only module that imports three/r3f/drei. It is reached
// exclusively through next/dynamic(ssr:false) in racket-section.tsx, so three
// stays out of the main bundle and loads only near the viewport.

const MODEL_URL = "/models/racket.glb";

// Fires when this lazy chunk is evaluated — i.e. once the section is near the
// viewport — so the GLB download overlaps with the canvas mounting.
useGLTF.preload(MODEL_URL, undefined, true);

type RacketCanvasProps = {
  /** Scroll progress (0–1) driving the rotation; omitted = idle slow spin. */
  progress?: MotionValue<number>;
  /** Reduced motion: render a single static frame, no rotation or bob. */
  reduced: boolean;
};

export function RacketCanvas({ progress, reduced }: RacketCanvasProps) {
  return (
    <CanvasBoundary>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        frameloop={reduced ? "demand" : "always"}
        aria-hidden="true"
      >
        {/* Lights only — drei Environment presets fetch HDRs from a CDN. */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 5]} intensity={1.6} />
        <directionalLight position={[-4, -2, -3]} intensity={0.5} color="#d7ff3e" />
        <Suspense fallback={null}>
          <RacketModel progress={progress} reduced={reduced} />
        </Suspense>
      </Canvas>
    </CanvasBoundary>
  );
}

const BASE_ROTATION_Y = -0.6;

function RacketModel({ progress, reduced }: RacketCanvasProps) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(MODEL_URL, undefined, true);

  // Meshy exports carry an arbitrary pivot and scale — recenter on the origin
  // and normalize the racket height instead of trusting the authored transform.
  const { scale, offset } = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const s = 2.4 / (size.y || 1);
    return { scale: s, offset: center.multiplyScalar(-s) };
  }, [scene]);

  useFrame(({ clock }, delta) => {
    const g = group.current;
    if (!g || reduced) return;
    if (progress) {
      g.rotation.y = BASE_ROTATION_Y + progress.get() * Math.PI * 1.5;
    } else {
      g.rotation.y += delta * 0.25;
    }
    g.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.06;
  });

  return (
    <group ref={group} rotation={[0.15, BASE_ROTATION_Y, 0.08]}>
      <group scale={scale} position={offset}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

// WebGL init or GLB load failures must never break the page — the section
// simply keeps showing the reserved placeholder styling underneath.
class CanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
