import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface IntroCurtainProps {
  onComplete: () => void;
}

export const IntroCurtain: React.FC<IntroCurtainProps> = ({ onComplete }) => {
  const prefersReduced = usePrefersReducedMotion();
  const [isDone, setIsDone] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // If user already saw it on repeat visits or prefers reduced motion, skip
    if (localStorage.getItem('zg_intro_seen') === 'true' || prefersReduced) {
      setShouldRender(false);
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      finish();
    }, 1300);

    return () => clearTimeout(timer);
  }, [prefersReduced, onComplete]);

  const finish = () => {
    localStorage.setItem('zg_intro_seen', 'true');
    setIsDone(true);
    setTimeout(() => {
      setShouldRender(false);
      onComplete();
    }, 550);
  };

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          onClick={finish}
          initial={{ y: 0 }}
          exit={{
            y: '-100%',
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#0F1117] cursor-pointer select-none"
        >
          {/* Centered ZG Monogram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            <span className="font-heading text-5xl md:text-6xl font-bold tracking-widest text-[#B79CFF]">
              ZG
            </span>

            {/* Drawing lilac line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 0.45,
                delay: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-3 h-[2px] w-16 bg-[#B79CFF] origin-center rounded-full shadow-[0_0_12px_#B79CFF]"
            />

            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-4 font-mono text-xs uppercase tracking-widest text-[#A3A9B8]"
            >
              FLUTTER DEVELOPER
            </motion.span>
          </motion.div>

          {/* Click to skip hint */}
          <span className="absolute bottom-8 font-mono text-[11px] uppercase tracking-wider text-[#A3A9B8]/60">
            Click to enter
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
