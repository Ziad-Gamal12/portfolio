import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SiGithub } from 'react-icons/si';
import { ExternalLink, ArrowRight, ArrowUpRight } from 'lucide-react';
import { PROJECTS } from '../../data/portfolioData';
import type { Project } from '../../types';
import { SpotlightHeading } from '../common/SpotlightHeading';
import { Reveal } from '../common/Reveal';
import { ProjectModal } from './ProjectModal';
import { useCursor } from '../../context/CursorContext';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { Magnetic } from '../common/Magnetic';
import { useTheme } from '../../context/ThemeContext';

interface WorkProps {
  onSectionActiveChange?: (isActive: boolean) => void;
}

export const Work: React.FC<WorkProps> = ({ onSectionActiveChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeProject, setActiveProject] = useState<number>(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { setCursor, resetCursor } = useCursor();
  const prefersReduced = usePrefersReducedMotion();

  // Desktop Pinned Horizontal Scroll with GSAP MatchMedia
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const mm = gsap.matchMedia();

    // Desktop: Pinned scrub only for >= 1024px with fine pointer and hover
    mm.add(
      '(min-width: 1024px) and (hover: hover) and (pointer: fine)',
      () => {
        if (prefersReduced) {
          onSectionActiveChange?.(false);
          return;
        }

        const getScrollAmount = () => -(track.scrollWidth - window.innerWidth + 80);

        const tween = gsap.to(track, {
          x: getScrollAmount,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: () => `+=${track.scrollWidth - window.innerWidth + 400}`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onToggle: (self) => {
              onSectionActiveChange?.(self.isActive);
            },
            onUpdate: (self) => {
              const progress = self.progress;
              const index = Math.min(
                PROJECTS.length - 1,
                Math.floor(progress * PROJECTS.length)
              );
              setActiveProject(index);
            },
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(track, { clearProps: 'all' });
          gsap.set(container, { clearProps: 'all' });
          onSectionActiveChange?.(false);
        };
      }
    );

    // Below 1024px or touch/coarse pointer: NO pin, NO scrub, clear all props
    mm.add(
      '(max-width: 1023px), (hover: none), (pointer: coarse)',
      () => {
        onSectionActiveChange?.(false);
        gsap.set(track, { clearProps: 'all' });
        gsap.set(container, { clearProps: 'all' });
      }
    );

    return () => {
      mm.revert();
      ScrollTrigger.refresh();
      onSectionActiveChange?.(false);
    };
  }, [prefersReduced, onSectionActiveChange]);

  // Mobile & Small Screen Counter Synchronization via scroll + IntersectionObserver
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let ticking = false;

    const updateActiveIndexOnScroll = () => {
      if (
        window.innerWidth >= 1024 &&
        window.matchMedia('(hover: hover) and (pointer: fine)').matches
      ) {
        return;
      }
      const cards = track.querySelectorAll('[data-project-card]');
      if (!cards.length) return;

      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      let closestIdx = 0;
      let minDiff = Infinity;

      cards.forEach((card, idx) => {
        const el = card as HTMLElement;
        const cardCenter = el.offsetLeft + el.offsetWidth / 2;
        const diff = Math.abs(cardCenter - trackCenter);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });

      if (closestIdx < PROJECTS.length) {
        setActiveProject(closestIdx);
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveIndexOnScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    track.addEventListener('scroll', handleScroll, { passive: true });
    updateActiveIndexOnScroll();

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              const idxStr = (entry.target as HTMLElement).getAttribute('data-project-index');
              if (idxStr !== null) {
                const idx = parseInt(idxStr, 10);
                if (!isNaN(idx) && idx < PROJECTS.length) {
                  setActiveProject(idx);
                }
              }
            }
          });
        },
        { root: track, threshold: 0.5 }
      );

      const cards = track.querySelectorAll('[data-project-card]');
      cards.forEach((c) => observer?.observe(c));
    }

    return () => {
      track.removeEventListener('scroll', handleScroll);
      observer?.disconnect();
    };
  }, []);

  // Drag on track support (for touch or mobile gesture)
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleTrackMouseDown = (e: React.MouseEvent) => {
    if (window.innerWidth >= 1024) return;
    isDragging.current = true;
    startX.current = e.pageX - (trackRef.current?.offsetLeft || 0);
    scrollLeft.current = trackRef.current?.scrollLeft || 0;
  };

  const handleTrackMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - (trackRef.current.offsetLeft || 0);
    const walk = (x - startX.current) * 1.5;
    trackRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleTrackMouseUp = () => {
    isDragging.current = false;
  };

  const activeAccent = PROJECTS[activeProject]?.accentColor || '#B79CFF';

  return (
    <section id="work" ref={containerRef} className="relative bg-background overflow-hidden">
      {/* Background Section Ambient Glow (large on desktop, subtle on mobile) */}
      <div
        className="hidden lg:block absolute top-1/4 -right-20 w-[600px] h-[600px] rounded-full blur-[170px] pointer-events-none -z-10 transition-colors duration-600"
        style={{
          backgroundColor: `${activeAccent}18`,
        }}
      />
      <div
        className="block lg:hidden absolute top-1/3 right-0 w-[240px] h-[240px] rounded-full blur-[90px] pointer-events-none -z-10 transition-colors duration-600 opacity-25"
        style={{
          backgroundColor: activeAccent,
        }}
      />

      {/* Giant Outlined Project Name behind track (DESKTOP ONLY) */}
      {!prefersReduced && (
        <div className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none -z-10 overflow-hidden select-none">
          <AnimatePresence mode="wait">
            <motion.span
              key={activeProject}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 0.07, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="font-heading font-bold uppercase whitespace-nowrap text-transparent"
              style={{
                fontSize: 'clamp(120px, 18vw, 280px)',
                lineHeight: 1,
                WebkitTextStroke: `1.5px ${activeAccent}`,
              }}
            >
              {PROJECTS[activeProject]?.name}
            </motion.span>
          </AnimatePresence>
        </div>
      )}

      {/* Header Bar within pinned section */}
      <div className="max-w-content mx-auto px-6 md:px-10 pt-20 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          {/* Section tag */}
          <Reveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-xs md:text-sm text-primary tracking-widest font-semibold uppercase">
                04 — WORK
              </span>
              <div className="h-[1px] w-12 bg-primary/40" />
            </div>
          </Reveal>

          {/* Title with SpotlightHeading */}
          <SpotlightHeading
            text="SELECTED WORK"
            as="h2"
            className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight"
          />
        </div>

        {/* Top-Right Progress UI: Animated Rolling Counter "01 / 05" + Progress Bar */}
        <div className="flex items-center gap-4">
          <div className="flex items-center font-mono text-sm tracking-widest text-secondary">
            {/* Rolling digit for active index */}
            <div className="h-6 overflow-hidden relative w-6 text-center">
              <motion.div
                animate={{ y: -activeProject * 24 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col"
              >
                {PROJECTS.map((_, i) => (
                  <span key={i} className="h-6 flex items-center justify-center font-bold text-primary">
                    {`0${i + 1}`}
                  </span>
                ))}
              </motion.div>
            </div>
            <span className="mx-1 text-secondary/60">/</span>
            <span className="text-secondary/70">05</span>
          </div>

          {/* Thin Progress bar */}
          <div className="w-24 h-1 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary origin-left rounded-full"
              animate={{
                width: `${((activeProject + 1) / PROJECTS.length) * 100}%`,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Horizontal Cards Track */}
      <div
        ref={trackRef}
        data-cursor="drag"
        data-cursor-label="DRAG"
        onMouseDown={handleTrackMouseDown}
        onMouseMove={handleTrackMouseMove}
        onMouseUp={handleTrackMouseUp}
        onMouseLeave={() => {
          handleTrackMouseUp();
          resetCursor();
        }}
        onMouseEnter={() => {
          if (window.innerWidth < 1024) setCursor('drag', 'DRAG');
        }}
        className="w-full lg:w-max flex gap-4 lg:gap-10 px-[7vw] lg:px-12 pb-24 pt-4 overflow-x-auto lg:overflow-visible no-scrollbar snap-x snap-mandatory relative z-10"
      >
        {PROJECTS.map((project, index) => (
          <ProjectPosterCard
            key={project.id}
            project={project}
            index={index}
            isActive={activeProject === index}
            onSelect={() => setSelectedProject(project)}
            prefersReduced={prefersReduced}
          />
        ))}

        {/* Final Card: "MORE ON GITHUB" */}
        <MoreOnGithubCard />
      </div>

      {/* Details Modal with layoutId shared element transition */}
      <ProjectModal
        project={selectedProject}
        projects={PROJECTS}
        onClose={() => setSelectedProject(null)}
        onNavigate={(p) => setSelectedProject(p)}
      />
    </section>
  );
};

// ================= CINEMATIC CASE-STUDY POSTER CARD =================
interface ProjectCardProps {
  project: Project;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  prefersReduced: boolean;
}

const ProjectPosterCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  isActive,
  onSelect,
  prefersReduced,
}) => {
  const { setCursor, resetCursor } = useCursor();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, mx: 50, my: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPreviewCrossfaded, setIsPreviewCrossfaded] = useState(false);
  const [isDesktopFine, setIsDesktopFine] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsDesktopFine(
        window.innerWidth >= 1024 &&
        window.matchMedia('(hover: hover) and (pointer: fine)').matches
      );
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const accent = project.accentColor || '#5B8CFF';
  const inactiveScale = isLight ? 0.95 : 0.94;
  const inactiveOpacity = isLight ? 0.8 : 0.55;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced || !isDesktopFine) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - (rect.left + rect.width / 2);
    const cy = e.clientY - (rect.top + rect.height / 2);
    // Tilt max 6 deg
    const rx = (-cy / (rect.height / 2)) * 6;
    const ry = (cx / (rect.width / 2)) * 6;
    const gx = ((e.clientX - rect.left) / rect.width) * 100;
    const gy = ((e.clientY - rect.top) / rect.height) * 100;
    setTilt({ rx, ry, gx, gy, mx: e.clientX - rect.left, my: e.clientY - rect.top });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setCursor('project', 'VIEW');
    if (project.preview) setIsPreviewCrossfaded(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPreviewCrossfaded(false);
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, mx: 50, my: 50 });
    resetCursor();
  };

  return (
    <motion.div
      layoutId={`project-card-${project.id}`}
      ref={cardRef}
      data-project-card="true"
      data-project-index={index}
      data-cursor="view"
      data-cursor-label="VIEW"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
      style={{
        perspective: 1000,
        transform:
          !prefersReduced && isDesktopFine
            ? `scale(${isActive ? 1 : inactiveScale}) rotateY(${isActive ? 0 : index > 2 ? -4 : 4}deg)`
            : 'none',
        opacity:
          !prefersReduced && isDesktopFine
            ? isActive
              ? 1
              : inactiveOpacity
            : 1,
        boxShadow:
          isActive && !prefersReduced && isDesktopFine
            ? `0 20px 60px ${accent}35`
            : '0 16px 40px rgba(0,0,0,0.3)',
        transition:
          'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease, box-shadow 0.4s ease',
      }}
      className="w-[86vw] sm:w-[460px] md:w-[500px] lg:w-[520px] flex-shrink-0 snap-center rounded-[24px] bg-surface border border-border hover:border-primary/80 transition-all duration-300 cursor-pointer overflow-hidden group select-none relative"
    >
      {/* Dynamic Cursor Spotlight Border via radial gradient */}
      <div
        className="absolute inset-0 rounded-[24px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
        style={{
          padding: '1px',
          background: `radial-gradient(350px circle at ${tilt.mx}px ${tilt.my}px, ${accent}, transparent 70%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      <div
        style={{
          transform: !prefersReduced
            ? `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
            : 'none',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.15s ease-out',
        }}
        className="p-6 sm:p-7 relative flex flex-col justify-between h-full min-h-[620px] lg:min-h-[640px]"
      >
        {/* Moving Glare overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[24px]"
          style={{
            background: `radial-gradient(400px circle at ${tilt.gx}% ${tilt.gy}%, ${accent}20, transparent 70%)`,
          }}
        />

        {/* ================= 1. COVER (320px tall, radius 20px, overflow hidden) ================= */}
        <div className="relative w-full h-[300px] sm:h-[320px] rounded-[20px] overflow-hidden mb-6 bg-[#12151E] border border-border/80 flex items-center justify-center">
          {/* Animated Gradient Mesh (2-3 blurred blobs in accent color + lilac drifting slowly) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Blob 1 */}
            <motion.div
              animate={
                prefersReduced
                  ? undefined
                  : {
                      x: [0, 25, -20, 0],
                      y: [0, -20, 15, 0],
                      scale: isHovered ? 1.2 : 1,
                    }
              }
              transition={{
                duration: isHovered ? 3 : 7,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -top-10 -left-10 w-56 h-56 rounded-full blur-[60px]"
              style={{
                backgroundColor: isHovered ? `${accent}40` : `${accent}25`,
              }}
            />
            {/* Blob 2 */}
            <motion.div
              animate={
                prefersReduced
                  ? undefined
                  : {
                      x: [0, -30, 20, 0],
                      y: [0, 25, -20, 0],
                      scale: isHovered ? 1.25 : 1,
                    }
              }
              transition={{
                duration: isHovered ? 4 : 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full blur-[65px]"
              style={{
                backgroundColor: isHovered ? '#B79CFF35' : '#B79CFF18',
              }}
            />

            {/* Faint Dot-Grid Overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />
          </div>

          {/* Giant Outlined Index Number ("01"…"05") anchored bottom-right partly clipped */}
          <div
            style={{
              transform: !prefersReduced ? 'translateZ(20px)' : 'none',
            }}
            className="absolute -bottom-10 -right-4 pointer-events-none select-none z-10"
          >
            <span
              className="font-heading font-bold text-[180px] sm:text-[210px] leading-none text-transparent opacity-12 tracking-tighter"
              style={{
                WebkitTextStroke: '1.5px currentColor',
              }}
            >
              {project.number}
            </span>
          </div>

          {/* Optional cover or preview media (if provided) */}
          {project.cover && (
            <img
              src={project.cover}
              alt={project.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                isPreviewCrossfaded ? 'opacity-0' : 'opacity-100'
              }`}
            />
          )}

          {project.preview && (
            <video
              src={project.preview}
              autoPlay
              loop
              muted
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                isPreviewCrossfaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          {/* Center Glass Emblem with Floating Animation & Orbit Ring */}
          {(!project.cover || !isPreviewCrossfaded) && (
            <motion.div
              style={{
                transform: !prefersReduced ? 'translateZ(60px)' : 'none',
              }}
              animate={
                prefersReduced
                  ? undefined
                  : {
                      y: [0, -6, 6, 0],
                    }
              }
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative flex items-center justify-center z-20"
            >
              {/* Thin Orbit Ring around emblem with circling glowing dot */}
              <motion.div
                animate={
                  prefersReduced
                    ? undefined
                    : {
                        rotate: 360,
                      }
                }
                transition={{
                  duration: isHovered ? 7 : 14,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute w-36 h-36 rounded-full border border-white/20 pointer-events-none flex items-center justify-center"
              >
                {/* Orbit glowing accent dot */}
                <span
                  className="absolute -top-1 w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]"
                  style={{
                    backgroundColor: accent,
                    color: accent,
                  }}
                />
              </motion.div>

              {/* The 96px Glass Emblem */}
              <div
                className="w-24 h-24 rounded-[24px] bg-white/[0.08] dark:bg-white/[0.08] border border-white/[0.18] backdrop-blur-md flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform duration-300"
                style={{
                  transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: `0 0 32px ${accent}40`,
                }}
              >
                {project.logo ? (
                  <img
                    src={project.logo}
                    alt={`${project.name} logo`}
                    width={56}
                    height={56}
                    loading="lazy"
                    decoding="async"
                    className="w-14 h-14 object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                  />
                ) : (
                  <span
                    className="font-heading font-bold text-2xl"
                    style={{ color: accent }}
                  >
                    {project.name.charAt(0)}
                  </span>
                )}
              </div>
            </motion.div>
          )}

          {/* Corner Pills */}
          {/* Top-Left: Date pill */}
          <div className="absolute top-3.5 left-3.5 z-20">
            <span className="font-mono text-[11px] text-[#E6E8EE] px-3 py-1 rounded-pill bg-[#0F1117]/55 border border-white/14 backdrop-blur-md">
              {project.date}
            </span>
          </div>

          {/* Top-Right: Tag pill */}
          <div className="absolute top-3.5 right-3.5 z-20">
            <span
              className="font-mono text-[11px] font-semibold px-3 py-1 rounded-pill bg-[#0F1117]/55 border border-white/14 backdrop-blur-md"
              style={{
                color: accent,
              }}
            >
              {project.tag}
            </span>
          </div>
        </div>

        {/* ================= 2. BODY ================= */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Title & Role */}
            <div className="flex items-baseline justify-between mb-1.5">
              <h3 className="font-heading font-bold text-2xl sm:text-[28px] uppercase tracking-tight text-text group-hover:text-primary transition-colors duration-200">
                {project.name}
              </h3>
            </div>

            <div className="font-mono text-xs text-secondary/80 mb-3 flex items-center gap-2">
              <span>{project.role}</span>
              <span style={{ color: accent }}>•</span>
              <span>{project.date}</span>
            </div>

            {/* 2-line description */}
            <p className="text-secondary text-sm leading-relaxed mb-4 line-clamp-2">
              {project.shortDescription}
            </p>

            {/* Key Facts Chips (animating in with stagger, each with tiny accent dot) */}
            {project.keyFacts && (
              <div
                style={{
                  transform: !prefersReduced ? 'translateZ(30px)' : 'none',
                }}
                className="flex flex-wrap gap-2 mb-4"
              >
                {project.keyFacts.map((fact, factIdx) => (
                  <motion.div
                    key={factIdx}
                    initial={{ opacity: 0.85, y: 0 }}
                    animate={
                      isHovered && !prefersReduced
                        ? {
                            opacity: 1,
                            y: -2,
                            transition: { delay: factIdx * 0.05, duration: 0.2 },
                          }
                        : { opacity: 0.85, y: 0 }
                    }
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-surface/90 border border-border/80 text-[11px] font-mono text-text/90"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_6px_currentColor]"
                      style={{
                        backgroundColor: accent,
                        color: accent,
                      }}
                    />
                    <span>{fact}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* All Tech Tags in a wrapped row (no truncating!) */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {project.techTags.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-0.5 rounded-pill bg-background/80 border border-border/70 text-[11px] font-mono text-secondary"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* ================= FOOTER ROW ================= */}
          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            {/* Full Pill GitHub button (min-width 112px, height 44px) */}
            <div className="flex items-center gap-3">
              <Magnetic maxDistance={6}>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="min-w-[112px] h-[44px] px-4 rounded-pill border border-border bg-surface hover:border-primary text-text font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(183,156,255,0.2)]"
                >
                  <SiGithub className="w-4 h-4 text-primary" />
                  <span>GitHub</span>
                </a>
              </Magnetic>

              {project.demoUrl && (
                <Magnetic maxDistance={6}>
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="h-[44px] px-4 rounded-pill border border-border bg-surface hover:border-primary text-text font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Demo</span>
                    <ExternalLink className="w-3.5 h-3.5 text-primary" />
                  </a>
                </Magnetic>
              )}
            </div>

            {/* Details link (arrow slides 6px on hover) */}
            <button
              onClick={onSelect}
              className="flex items-center gap-2 font-mono text-xs font-semibold text-primary hover:text-accent transition-colors group/btn py-2"
            >
              <span>Details</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Final Card at end of track: "MORE ON GITHUB"
const MoreOnGithubCard: React.FC = () => {
  const { setCursor, resetCursor } = useCursor();

  return (
    <div
      onMouseEnter={() => setCursor('magnetic')}
      onMouseLeave={resetCursor}
      className="w-[86vw] sm:w-[320px] md:w-[360px] flex-shrink-0 snap-center rounded-[24px] bg-surface/80 border border-dashed border-border/90 hover:border-primary transition-all duration-300 p-8 flex flex-col justify-between items-center text-center group cursor-pointer"
    >
      <div className="w-full flex justify-end">
        <span className="font-mono text-xs text-secondary/60">06</span>
      </div>

      <div className="flex flex-col items-center gap-5 my-auto">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:scale-110 group-hover:border-primary transition-all duration-300 shadow-[0_0_24px_rgba(183,156,255,0.2)]">
          <SiGithub className="w-10 h-10 text-primary" />
        </div>

        <div>
          <h4 className="font-heading font-bold text-2xl uppercase tracking-tight text-text mb-2">
            More on GitHub
          </h4>
          <p className="text-secondary text-xs font-mono max-w-[22ch]">
            Explore open-source Flutter repositories, packages & experiments
          </p>
        </div>

        <a
          href="https://github.com/Ziad-Gamal12"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-pill bg-primary text-[#0F1117] font-mono font-bold text-xs uppercase tracking-wider shadow-[0_4px_16px_rgba(183,156,255,0.35)] hover:brightness-105 transition-all"
        >
          <span>View Profile</span>
          <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
        </a>
      </div>

      <span className="font-mono text-[11px] text-secondary/50">
        @Ziad-Gamal12
      </span>
    </div>
  );
};
