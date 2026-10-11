import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface ScrubTextProps {
  text: string;
  className?: string;
}

const Word: React.FC<{
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0.25, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.28em] transition-colors duration-200">
      {children}
    </motion.span>
  );
};

export const ScrubText: React.FC<ScrubTextProps> = ({ text, className = '' }) => {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.85', 'end 0.45'],
  });

  const words = text.split(' ');

  if (prefersReduced) {
    return (
      <p ref={containerRef} className={`leading-relaxed ${className}`}>
        {text}
      </p>
    );
  }

  return (
    <p
      ref={containerRef}
      className={`leading-relaxed text-[17px] md:text-[18px] max-w-[65ch] font-normal text-text ${className}`}
    >
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </p>
  );
};
