import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { EXPERIENCES } from '../../data/portfolioData';
import { SpotlightHeading } from '../common/SpotlightHeading';
import { Reveal } from '../common/Reveal';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export const Experience: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const prefersReduced = usePrefersReducedMotion();

  // Scroll progress for vertical timeline line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 30%'],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 30,
    restDelta: 0.001,
  });

  // Track item nearest viewport center
  useEffect(() => {
    const handleScroll = () => {
      const center = window.innerHeight / 2;
      let minDistance = Infinity;
      let closest = 0;

      itemRefs.current.forEach((el, index) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        const dist = Math.abs(itemCenter - center);
        if (dist < minDistance) {
          minDistance = dist;
          closest = index;
        }
      });

      setActiveIndex(closest);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="experience" className="py-24 md:py-32 relative overflow-hidden section-content-visibility">
      {/* Background Soft Glow */}
      <div className="absolute top-1/3 left-10 w-96 h-96 rounded-full bg-primary/5 blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-content mx-auto px-6 md:px-10">
        {/* Section tag */}
        <Reveal>
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs md:text-sm text-primary tracking-widest font-semibold uppercase">
              03 — EXPERIENCE
            </span>
            <div className="h-[1px] w-12 bg-primary/40" />
          </div>
        </Reveal>

        {/* Section Heading with SpotlightHeading */}
        <div className="mb-16">
          <SpotlightHeading
            text="EXPERIENCE"
            as="h2"
            className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight"
          />
        </div>

        {/* Vertical Timeline Container */}
        <div ref={containerRef} className="relative pl-6 md:pl-10">
          {/* Base Inactive Line */}
          <div className="absolute left-2.5 md:left-4 top-4 bottom-4 w-[2px] bg-border/60" />

          {/* Glowing Drawn Line */}
          <motion.div
            style={{ scaleY: prefersReduced ? 1 : scaleY }}
            className="absolute left-2.5 md:left-4 top-4 bottom-4 w-[2px] bg-primary origin-top shadow-[0_0_10px_var(--primary-color)]"
          />

          {/* Timeline Items */}
          <div className="space-y-12 md:space-y-16">
            {EXPERIENCES.map((exp, index) => {
              const isActive = activeIndex === index;

              return (
                <div
                  key={exp.id}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  className={`relative transition-opacity duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  {/* Glowing Node Dot */}
                  <div
                    className={`absolute -left-6 md:-left-10 top-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-primary/20 scale-125'
                        : 'bg-surface'
                    }`}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? 'bg-primary shadow-[0_0_12px_var(--primary-color)] scale-110'
                          : 'bg-border'
                      }`}
                    />
                  </div>

                  {/* Two-part layout: Left (Date + Role + Project) and Right (Description) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">
                    {/* Left: Date slides from left */}
                    <motion.div
                      initial={{ opacity: 0, x: -24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="lg:col-span-5"
                    >
                      <span className="font-mono text-sm md:text-base font-bold text-primary tracking-wide block mb-1">
                        {exp.period}
                      </span>
                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider text-secondary">
                        <span>{exp.role}</span>
                        <span className="text-primary">•</span>
                        <span className="text-text font-semibold">{exp.project}</span>
                      </div>
                    </motion.div>

                    {/* Right: Description slides from right */}
                    <motion.div
                      initial={{ opacity: 0, x: 24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="lg:col-span-7"
                    >
                      <p className="text-base md:text-lg text-text/90 leading-relaxed font-normal">
                        {exp.description}
                      </p>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
