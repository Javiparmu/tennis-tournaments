"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type FadeContentProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
};

// react-bits style on-scroll reveal — fades + slides up once, when in view.
export function FadeContent({ children, delay = 0, y = 24, className }: FadeContentProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
