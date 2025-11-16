import React from 'react';
import { motion } from 'framer-motion';

export default function Page({ children, style }) {
  // Respect user preference for reduced motion
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const transition = prefersReduced ? { duration: 0 } : { duration: 0.32, ease: [0.2, 0.9, 0.2, 1] };
  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0, y: 10, scale: 0.995 }}
      animate={prefersReduced ? {} : { opacity: 1, y: 0, scale: 1 }}
      exit={prefersReduced ? {} : { opacity: 0, y: -8, scale: 0.995 }}
      transition={transition}
      style={style}
    >
      {children}
    </motion.div>
  );
}
