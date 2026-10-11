import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ExternalLink } from 'lucide-react';
import { PERSONAL_INFO } from '../../data/portfolioData';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { Magnetic } from '../common/Magnetic';
import { MarqueeBand } from '../common/MarqueeBand';
import { HeroCodeCard } from '../common/HeroCodeCard';

import { useAdaptiveLiteMode } from '../../hooks/useAdaptiveLiteMode';

const ROLES = ['Flutter Developer', 'Flutter Web Developer', 'Mobile & Web Apps'];

export const Hero: React.FC = () => {
  const prefersReduced = usePrefersReducedMotion();
  const isLiteMode = useAdaptiveLiteMode();
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax on scroll
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);

  // Rotating role text
  const [roleIndex, setRoleIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROLES.length);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  // Interactive Name letters hover lift
  const [hoveredLetter, setHoveredLetter] = useState<number | null>(null);
  const fullName = useMemo(() => ['ZIAD', 'GAMAL'], []);

  // Interactive Widget Inspector tracking (Page -> Code)
  const [inspectedFromHero, setInspectedFromHero] = useState<string | null>(null);

  const handleHeroPointerOver = (e: React.PointerEvent) => {
    const target = (e.target as HTMLElement).closest('[data-inspect]');
    if (target) {
      setInspectedFromHero(target.getAttribute('data-inspect'));
    }
  };

  const handleHeroPointerOut = (e: React.PointerEvent) => {
    const target = (e.target as HTMLElement).closest('[data-inspect]');
    if (target) {
      setInspectedFromHero(null);
    }
  };

  // Mouse spotlight for hero background
  const [mouseSpotlight, setMouseSpotlight] = useState({ x: -500, y: -500 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMouseSpotlight({ x, y });
  };

  // Canvas Particles (max 40 tiny dots, auto paused if hidden or off-screen)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (prefersReduced || isLiteMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const count = 35;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    let animId: number;
    let isPaused = false;

    const handleVisibility = () => {
      isPaused = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const render = () => {
      if (!isPaused && ctx) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#B79CFF';

        for (let i = 0; i < count; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [prefersReduced, isLiteMode]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (window.__lenis) {
      window.__lenis.scrollTo(el, { offset: -60 });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="top"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex flex-col justify-between pt-28 pb-12 overflow-hidden"
    >
      {/* Background Aurora Mesh & Spotlight */}
      <div className="absolute inset-0 pointer-events-none -z-20 overflow-hidden">
        {/* Soft Aurora Blobs */}
        <div className="absolute -top-[20%] -left-[10%] w-[650px] h-[650px] rounded-full bg-primary/10 blur-[140px] animate-pulse-slow" />
        <div className="absolute top-[30%] -right-[10%] w-[550px] h-[550px] rounded-full bg-accent/8 blur-[150px]" />
        
        {/* Dot Grid */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `radial-gradient(var(--border-color) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Hero Spotlight on Dot Grid */}
        {!prefersReduced && (
          <div
            className="absolute inset-0 opacity-80 transition-opacity duration-300"
            style={{
              background: `radial-gradient(240px circle at ${mouseSpotlight.x}px ${mouseSpotlight.y}px, rgba(183,156,255,0.12), transparent 70%)`,
            }}
          />
        )}

        {/* Particles Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      </div>

      {/* Main Content Area */}
      <motion.div
        style={{ opacity: heroOpacity }}
        className="max-w-content w-full mx-auto px-6 md:px-10 flex-1 flex flex-col justify-center"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Heading, Role, Intro, CTAs */}
          <motion.div
            style={{ y: textY }}
            onPointerOver={handleHeroPointerOver}
            onPointerOut={handleHeroPointerOut}
            className="lg:col-span-7 flex flex-col z-10"
          >
            {/* Small lilac mono label */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mb-4"
            >
              <div
                data-inspect="label"
                className="inline-flex w-fit items-center gap-2 cursor-default"
              >
                <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary-color)]" />
                <span className="font-mono text-xs md:text-sm tracking-widest text-primary uppercase font-semibold">
                  HELLO! I'M
                </span>
              </div>
            </motion.div>

            {/* Huge Name with Letter-by-Letter Reveal & Interactive Hover */}
            <div className="mb-6">
              <h1
                data-inspect="headline"
                className="inline-block w-fit font-heading font-bold text-5xl sm:text-6xl md:text-7xl lg:text-[5.2rem] leading-[0.95] tracking-tight uppercase text-text select-none cursor-default"
              >
                {fullName.map((word, wordIndex) => {
                  const letterOffset = wordIndex === 0 ? 0 : 4;
                  return (
                    <div key={word} className="flex">
                      {word.split('').map((char, charIndex) => {
                        const globalIndex = letterOffset + charIndex;
                        const isHovered = hoveredLetter === globalIndex;
                        const isNeighbor =
                          hoveredLetter !== null && Math.abs(hoveredLetter - globalIndex) === 1;

                        return (
                          <div key={charIndex} className="overflow-hidden inline-block py-1">
                            <motion.span
                              initial={{ y: '120%' }}
                              animate={{
                                y: isHovered ? -8 : isNeighbor ? -3 : 0,
                                color: isHovered ? 'var(--primary-color)' : 'var(--text-color)',
                              }}
                              transition={{
                                duration: isHovered || isNeighbor ? 0.2 : 0.7,
                                delay: isHovered || isNeighbor ? 0 : 0.2 + globalIndex * 0.04,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                              onMouseEnter={() => setHoveredLetter(globalIndex)}
                              onMouseLeave={() => setHoveredLetter(null)}
                              className="inline-block cursor-default transition-colors duration-150"
                            >
                              {char}
                            </motion.span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </h1>
            </div>

            {/* Leading Line + Rotating Role Text */}
            <div className="mb-6 h-9">
              <div
                data-inspect="role"
                className="inline-flex w-fit items-center gap-3 h-9 overflow-hidden cursor-default"
              >
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="w-10 h-[2px] bg-primary origin-left rounded-full shadow-[0_0_8px_var(--primary-color)] flex-shrink-0"
                />
                <div className="relative h-9 flex items-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={roleIndex}
                      initial={{ y: 24, opacity: 0, filter: 'blur(4px)' }}
                      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                      exit={{ y: -24, opacity: 0, filter: 'blur(4px)' }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="font-mono text-base md:text-xl font-medium text-accent tracking-wide whitespace-nowrap"
                    >
                      {ROLES[roleIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Short Paragraph */}
            <div className="mb-8">
              <motion.p
                data-inspect="paragraph"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block w-fit max-w-[54ch] text-base md:text-lg text-secondary leading-relaxed cursor-default"
              >
                Building cross-platform mobile & web apps with Dart and Flutter. Based in Menoufia, Egypt.
              </motion.p>
            </div>

            {/* Two CTAs */}
            <motion.div
              data-inspect="buttons"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.9, type: 'spring', stiffness: 260, damping: 20 }}
              className="inline-flex w-fit flex-wrap items-center gap-4"
            >
              {/* Primary Lilac Pill */}
              <Magnetic maxDistance={12}>
                <button
                  data-inspect="primary-button"
                  onClick={() => scrollToSection('work')}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-pill bg-primary text-white dark:text-[#0F1117] font-heading font-semibold text-sm md:text-base tracking-wide shadow-[0_4px_24px_rgba(183,156,255,0.35)] hover:shadow-[0_6px_32px_rgba(183,156,255,0.5)] hover:brightness-105 active:scale-95 transition-all duration-200"
                >
                  <span>View Work</span>
                  <span className="text-lg">→</span>
                </button>
              </Magnetic>

              {/* Download CV Outlined */}
              <Magnetic maxDistance={10}>
                <a
                  data-inspect="outlined-button"
                  href={PERSONAL_INFO.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download="Ziad_Gamal_CV.pdf"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-pill border border-border bg-surface/50 hover:bg-surface hover:border-primary/80 text-text font-mono text-sm tracking-wide transition-all duration-200"
                >
                  <span>Download CV</span>
                  <ExternalLink className="w-4 h-4 text-secondary group-hover:text-primary" />
                </a>
              </Magnetic>
            </motion.div>
          </motion.div>

          {/* Right Column: Code Card "portfolio.dart" with INSPECT ME interaction */}
          <motion.div
            style={{ y: cardY }}
            className="lg:col-span-5 relative flex justify-center lg:justify-end"
          >
            <HeroCodeCard
              roleIndex={roleIndex}
              currentRole={ROLES[roleIndex]}
              inspectedFromPage={inspectedFromHero}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Animated "Scroll" Indicator at Bottom Center */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-6 pb-2">
        <button
          onClick={() => scrollToSection('about')}
          aria-label="Scroll to about section"
          className="flex flex-col items-center gap-2 text-secondary hover:text-primary transition-colors duration-200 group"
        >
          <span className="font-mono text-[11px] uppercase tracking-widest text-secondary/70 group-hover:text-primary">
            Scroll
          </span>
          <div className="w-[1px] h-8 bg-border overflow-hidden relative">
            <motion.div
              animate={{ y: [-16, 32] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-full h-4 bg-primary shadow-[0_0_6px_var(--primary-color)]"
            />
          </div>
          <ArrowDown className="w-3 h-3 text-secondary/70 group-hover:text-primary transition-transform group-hover:translate-y-0.5" />
        </button>
      </div>

      {/* Bold Giant Outlined Marquee Band Below Hero */}
      <MarqueeBand />
    </section>
  );
};
