import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const prefersReduced = usePrefersReducedMotion();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 40,
    restDelta: 0.001,
  });

  if (prefersReduced) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[2px] bg-transparent pointer-events-none">
      <motion.div
        className="h-full bg-primary origin-left shadow-[0_0_8px_var(--primary-color)]"
        style={{ scaleX }}
      />
    </div>
  );
};
