import React from 'react';
import { motion } from 'framer-motion';

export default function Page({ children, style }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.995 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={style}
    >
      {children}
    </motion.div>
  );
}
