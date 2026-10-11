import React, { useRef, useEffect, useId } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface SpotlightHeadingProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'div';
  spotlightRadius?: number;
}

export const SpotlightHeading: React.FC<SpotlightHeadingProps> = ({
  text,
  className = '',
  as: Component = 'h2',
  spotlightRadius = 140,
}) => {
  const prefersReduced = usePrefersReducedMotion();
  const headingId = useId().replace(/:/g, '');

  const words = text.split(' ');

  // Reduced motion fallback: always solid state
  if (prefersReduced) {
    return (
      <Component className={`font-heading font-bold uppercase tracking-tight text-text ${className}`}>
        {text}
      </Component>
    );
  }

  return (
    <SpotlightHeadingInteractive
      Component={Component}
      words={words}
      className={className}
      spotlightRadius={spotlightRadius}
      headingId={headingId}
    />
  );
};

interface InteractiveProps {
  Component: any;
  words: string[];
  className: string;
  spotlightRadius: number;
  headingId: string;
}

const SpotlightHeadingInteractive: React.FC<InteractiveProps> = ({
  Component,
  words,
  className,
  spotlightRadius,
  headingId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);

  const isHovered = useRef(false);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  // Default state: --r = 2000px (fully visible solid text), outline opacity = 0
  const currentRadius = useRef(2000);
  const targetRadius = useRef(2000);
  const currentOutlineOpacity = useRef(0);
  const targetOutlineOpacity = useRef(0);

  useEffect(() => {
    // On touch devices without fine pointer, keep always solid
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFinePointer) return;

    const container = containerRef.current;
    const spotlight = spotlightRef.current;
    const outline = outlineRef.current;
    if (!container || !spotlight || !outline) return;

    // Collect letter spans for spring lifting
    const baseLetters = Array.from(
      outline.querySelectorAll<HTMLElement>(`.outline-letter-${headingId}`)
    );
    const topLetters = Array.from(
      spotlight.querySelectorAll<HTMLElement>(`.top-letter-${headingId}`)
    );

    const letterLifts = new Array(baseLetters.length).fill(0);
    const letterTargetLifts = new Array(baseLetters.length).fill(0);

    let rafId: number;
    let isVisible = true;

    // Pause when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mouseTarget.current = { x, y };

      // Update target lift for each letter based on distance
      baseLetters.forEach((el, i) => {
        const elRect = el.getBoundingClientRect();
        const elCenterX = elRect.left + elRect.width / 2 - rect.left;
        const elCenterY = elRect.top + elRect.height / 2 - rect.top;

        const dist = Math.hypot(x - elCenterX, y - elCenterY);
        const maxDist = 90; // distance threshold in px
        if (dist < maxDist) {
          letterTargetLifts[i] = (1 - dist / maxDist) * 6;
        } else {
          letterTargetLifts[i] = 0;
        }
      });
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseTarget.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      currentPos.current = { ...mouseTarget.current };

      // Animate --r from 2000px down to 140px, fade outline layer in at ~35%
      targetRadius.current = spotlightRadius;
      targetOutlineOpacity.current = 0.35;
      isHovered.current = true;
    };

    const handleMouseLeave = () => {
      // Animate back to 2000px (solid) and fade outline out
      targetRadius.current = 2000;
      targetOutlineOpacity.current = 0;
      isHovered.current = false;
      for (let i = 0; i < letterTargetLifts.length; i++) {
        letterTargetLifts[i] = 0;
      }
    };

    container.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    container.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    const posLerp = 0.18;
    const radiusLerp = 0.12;
    const opacityLerp = 0.12;

    const tick = () => {
      if (isVisible) {
        // Lerp position
        currentPos.current.x += (mouseTarget.current.x - currentPos.current.x) * posLerp;
        currentPos.current.y += (mouseTarget.current.y - currentPos.current.y) * posLerp;

        // Lerp radius
        currentRadius.current += (targetRadius.current - currentRadius.current) * radiusLerp;

        // Lerp outline opacity
        currentOutlineOpacity.current +=
          (targetOutlineOpacity.current - currentOutlineOpacity.current) * opacityLerp;

        // Update spotlight mask
        const r = Math.round(currentRadius.current);
        if (r >= 1950 && !isHovered.current) {
          // Default solid state
          spotlight.style.maskImage = 'none';
          spotlight.style.webkitMaskImage = 'none';
          outline.style.opacity = '0';
        } else {
          const px = currentPos.current.x.toFixed(1);
          const py = currentPos.current.y.toFixed(1);
          const maskVal = `radial-gradient(${r}px circle at ${px}px ${py}px, black 35%, transparent 100%)`;
          spotlight.style.maskImage = maskVal;
          spotlight.style.webkitMaskImage = maskVal;
          outline.style.opacity = currentOutlineOpacity.current.toFixed(3);
        }

        // Lerp per-letter vertical spring lift
        for (let i = 0; i < baseLetters.length; i++) {
          letterLifts[i] += (letterTargetLifts[i] - letterLifts[i]) * 0.22;

          const lift = letterLifts[i];
          const transformValue = lift > 0.05 ? `translate3d(0, -${lift.toFixed(2)}px, 0)` : '';

          if (baseLetters[i]) baseLetters[i].style.transform = transformValue;
          if (topLetters[i]) topLetters[i].style.transform = transformValue;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [spotlightRadius, headingId]);

  let outlineIndex = 0;
  let topIndex = 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="inline-block"
    >
      <Component
        ref={containerRef}
        className={`relative inline-block select-none cursor-default py-1 font-heading font-bold uppercase tracking-tight ${className}`}
      >
        {/* OUTLINE LAYER: Hidden by default (opacity 0), fades to ~35% on hover */}
        <span
          ref={outlineRef}
          aria-hidden="true"
          className="inline-flex flex-wrap gap-x-[0.28em] gap-y-1 relative z-10 transition-opacity duration-300 opacity-0 pointer-events-none"
          style={{
            WebkitTextStroke: '1.35px color-mix(in srgb, var(--text-color) 40%, transparent)',
            color: 'transparent',
          }}
        >
          {words.map((word, wIdx) => (
            <span key={wIdx} className="inline-block whitespace-nowrap">
              {word.split('').map((char, cIdx) => {
                const idx = outlineIndex++;
                return (
                  <span
                    key={cIdx}
                    data-index={idx}
                    className={`outline-letter-${headingId} inline-block transition-transform duration-75 will-change-transform`}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          ))}
        </span>

        {/* FILLED LAYER: Fully solid by default (mask: none or r: 2000px), masks to spotlight on hover */}
        <span
          ref={spotlightRef}
          className="absolute inset-0 z-20 py-1 transition-opacity duration-200"
          style={{
            color: 'var(--text-color)',
            maskImage: 'none',
            WebkitMaskImage: 'none',
          }}
        >
          <span className="inline-flex flex-wrap gap-x-[0.28em] gap-y-1">
            {words.map((word, wIdx) => (
              <span key={wIdx} className="inline-block whitespace-nowrap">
                {word.split('').map((char, cIdx) => {
                  const idx = topIndex++;
                  return (
                    <span
                      key={cIdx}
                      data-index={idx}
                      className={`top-letter-${headingId} inline-block transition-transform duration-75 will-change-transform`}
                    >
                      {char}
                    </span>
                  );
                })}
              </span>
            ))}
          </span>
        </span>
      </Component>
    </motion.div>
  );
};
