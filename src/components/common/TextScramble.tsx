import React, { useState, useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface TextScrambleProps {
  text: string;
  className?: string;
  duration?: number;
  triggerOnHover?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

const GLYPHS = '01#$*+/<=>?@[]^_{}~';

export const TextScramble: React.FC<TextScrambleProps> = ({
  text,
  className = '',
  duration = 400,
  triggerOnHover = true,
  onHoverStart,
  onHoverEnd,
}) => {
  const [displayText, setDisplayText] = useState(text);
  const isScrambling = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  const scramble = () => {
    if (prefersReduced || isScrambling.current) return;
    isScrambling.current = true;
    onHoverStart?.();

    const startTime = Date.now();
    const length = text.length;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      const revealedCount = Math.floor(progress * length);

      let scrambled = '';
      for (let i = 0; i < length; i++) {
        if (text[i] === ' ' || text[i] === '@' || text[i] === '.') {
          scrambled += text[i];
        } else if (i < revealedCount) {
          scrambled += text[i];
        } else {
          scrambled += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }

      setDisplayText(scrambled);

      if (progress >= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        isScrambling.current = false;
        setDisplayText(text);
      }
    }, 30);
  };

  const handleMouseLeave = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    isScrambling.current = false;
    setDisplayText(text);
    onHoverEnd?.();
  };

  return (
    <span
      onMouseEnter={triggerOnHover ? scramble : undefined}
      onMouseLeave={triggerOnHover ? handleMouseLeave : undefined}
      className={`inline-block font-mono select-none ${className}`}
    >
      {displayText}
    </span>
  );
};
