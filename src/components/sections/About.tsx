import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { GraduationCap, Languages, MapPin } from 'lucide-react';
import { PERSONAL_INFO, STATS } from '../../data/portfolioData';
import { SpotlightHeading } from '../common/SpotlightHeading';
import { ScrubText } from '../common/ScrubText';
import { Reveal } from '../common/Reveal';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export const About: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  // Photo tilt
  const [photoTilt, setPhotoTilt] = useState({ rx: 0, ry: 0 });
  const handlePhotoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - (rect.left + rect.width / 2);
    const cy = e.clientY - (rect.top + rect.height / 2);
    setPhotoTilt({
      rx: (-cy / (rect.height / 2)) * 6,
      ry: (cx / (rect.width / 2)) * 6,
    });
  };

  const handlePhotoMouseLeave = () => {
    setPhotoTilt({ rx: 0, ry: 0 });
  };

  return (
    <section id="about" ref={sectionRef} className="py-24 md:py-32 relative overflow-hidden section-content-visibility">
      {/* Background Subtle Glow Blob with Parallax */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-content mx-auto px-6 md:px-10">
        {/* Section mono label */}
        <Reveal>
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs md:text-sm text-primary tracking-widest font-semibold uppercase">
              01 — ABOUT
            </span>
            <div className="h-[1px] w-12 bg-primary/40" />
          </div>
        </Reveal>

        {/* Section Heading with SpotlightHeading */}
        <div className="mb-14">
          <SpotlightHeading
            text="ABOUT ME"
            as="h2"
            className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight"
          />
        </div>

        {/* Two Columns: Photo (left) and Summary & Info (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* Photo Slot (4:5, radius 16px, clip-path curtain wipe, gentle parallax, tilt) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <motion.div
              initial={{ clipPath: 'inset(0% 100% 0% 0%)' }}
              whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              onMouseMove={handlePhotoMouseMove}
              onMouseLeave={handlePhotoMouseLeave}
              style={{
                perspective: 1000,
              }}
              className="relative w-full max-w-[360px] aspect-[4/5] rounded-card overflow-hidden border border-border/80 shadow-[0_16px_36px_rgba(0,0,0,0.3)] bg-surface group"
            >
              <div
                style={{
                  transform: `rotateX(${photoTilt.rx}deg) rotateY(${photoTilt.ry}deg)`,
                  transition: 'transform 0.15s ease-out',
                }}
                className="w-full h-full relative"
              >
                <picture>
                  <source srcSet="/ziad-gamal.webp" type="image/webp" />
                  <img
                    src="/ziad-gamal.jpg"
                    alt="Ziad Gamal - Flutter Developer"
                    loading="lazy"
                    decoding="async"
                    width={360}
                    height={450}
                    className="w-full h-full object-cover object-center filter grayscale contrast-[1.05] group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                    onError={(e) => {
                      // Fallback to labeled placeholder if file is missing
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        const placeholder = document.createElement('div');
                        placeholder.className =
                          'w-full h-full flex flex-col items-center justify-center bg-surface p-6 text-center';
                        placeholder.innerHTML =
                          '<span class="font-mono text-xs text-primary">[IMAGE: profile photo]</span><span class="mt-2 text-sm text-secondary">Ziad Gamal</span>';
                        target.parentElement.appendChild(placeholder);
                      }
                    }}
                  />
                </picture>

                {/* Subtle gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />

                {/* Floating badge inside photo */}
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-surface/80 backdrop-blur-md border border-border/60 flex items-center justify-between">
                  <div>
                    <p className="font-heading font-semibold text-sm text-text">Ziad Gamal</p>
                    <p className="font-mono text-[11px] text-primary">Flutter Developer</p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" title="Available for opportunities" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: ScrubText paragraph + Info cards */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full">
            <div>
              {/* ScrubText Summary */}
              <ScrubText text={PERSONAL_INFO.summary} className="mb-10 text-secondary" />

              {/* Three Info Cards (Education, Languages, Location) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Education */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="p-4 rounded-card bg-surface border border-border hover:border-primary/50 transition-colors duration-200 flex flex-col justify-between"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-secondary mb-1">
                      Education
                    </h4>
                    <p className="font-heading font-semibold text-sm text-text leading-snug">
                      {PERSONAL_INFO.education.institution}
                    </p>
                    <p className="text-xs text-secondary mt-1">
                      {PERSONAL_INFO.education.faculty}
                    </p>
                    <span className="inline-block mt-2 font-mono text-[11px] text-primary/90">
                      {PERSONAL_INFO.education.expectedGraduation}
                    </span>
                  </div>
                </motion.div>

                {/* Languages */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="p-4 rounded-card bg-surface border border-border hover:border-primary/50 transition-colors duration-200 flex flex-col justify-between"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <Languages className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-secondary mb-1">
                      Languages
                    </h4>
                    {PERSONAL_INFO.languages.map((lang, idx) => (
                      <div key={idx} className="mt-1">
                        <p className="font-heading font-semibold text-sm text-text">
                          {lang.language}
                        </p>
                        <p className="text-xs text-secondary">{lang.proficiency}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Location */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="p-4 rounded-card bg-surface border border-border hover:border-primary/50 transition-colors duration-200 flex flex-col justify-between"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-secondary mb-1">
                      Location
                    </h4>
                    <p className="font-heading font-semibold text-sm text-text">
                      {PERSONAL_INFO.location}
                    </p>
                    <p className="text-xs text-secondary mt-1">Available worldwide (Remote)</p>
                    <span className="inline-block mt-2 font-mono text-[11px] text-accent">
                      UTC+2 Timezone
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Strip under About (count-up: 77, 3, 5, 2+) */}
        <div className="mt-20 pt-10 border-t border-border/70">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {STATS.map((stat, idx) => (
              <StatCounter
                key={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                delay={idx * 0.1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Count-up counter component with ease-out over 1.4s
const StatCounter: React.FC<{
  value: number;
  suffix: string;
  label: string;
  delay: number;
}> = ({ value, suffix, label, delay }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 1400; // 1.4s ease-out
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(ease * value);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    const timeout = setTimeout(() => {
      requestAnimationFrame(step);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [isInView, value, delay]);

  return (
    <div ref={ref} className="flex flex-col">
      <div className="flex items-baseline gap-1">
        <span className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl text-text">
          {displayValue}
        </span>
        {suffix && (
          <span className="font-heading font-bold text-3xl sm:text-4xl text-primary">
            {suffix}
          </span>
        )}
      </div>
      <span className="font-mono text-xs sm:text-sm text-secondary uppercase tracking-wider mt-1">
        {label}
      </span>
    </div>
  );
};
