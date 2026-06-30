"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type RotatingTextProps = {
  words: string[];
  interval?: number;
  className?: string;
};

// react-bits style rotating word — cycles through `words`, sliding each in/out.
// Width is reserved to the widest word (invisible span) so nothing reflows.
// pb/-mb give descenders (g, y) room inside the vertical clip without shifting
// the inline baseline.
export function RotatingText({ words, interval = 2800, className }: RotatingTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className="relative inline-grid overflow-hidden pb-[0.3em] -mb-[0.3em]">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={words[index]}
          className={className}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          style={{ gridArea: "1 / 1" }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
      {/* Invisible widest word reserves layout width to stop reflow jitter. */}
      <span aria-hidden className={`${className ?? ""} invisible`} style={{ gridArea: "1 / 1" }}>
        {words.reduce((a, b) => (b.length > a.length ? b : a), "")}
      </span>
    </span>
  );
}
