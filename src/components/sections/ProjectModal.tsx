import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { SiGithub } from 'react-icons/si';
import type { Project } from '../../types';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useTheme } from '../../context/ThemeContext';

interface ProjectModalProps {
  project: Project | null;
  projects?: Project[];
  onClose: () => void;
  onNavigate?: (project: Project) => void;
}

// Darken accent color by ~20% for AA contrast on white in light theme
function getBulletColor(accentHex: string, isLightMode: boolean): string {
  if (!isLightMode) return accentHex;
  let hex = accentHex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  if (hex.length !== 6) return accentHex;
  const num = parseInt(hex, 16);
  const r = Math.max(0, Math.floor(((num >> 16) & 255) * 0.75));
  const g = Math.max(0, Math.floor(((num >> 8) & 255) * 0.75));
  const b = Math.max(0, Math.floor((num & 255) * 0.75));
  return `rgb(${r}, ${g}, ${b})`;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  projects = [],
  onClose,
  onNavigate,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const savedScrollY = useRef<number>(0);
  const prefersReduced = usePrefersReducedMotion();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Scroll Progress (0 to 100%)
  const [scrollProgress, setScrollProgress] = useState(0);
  const [parallaxY, setParallaxY] = useState(0);

  // Direction of project transition (-1 for prev, 1 for next)
  const [slideDirection, setSlideDirection] = useState<number>(0);

  // Current project index out of total
  const currentIndex = projects.findIndex((p) => p.id === project?.id);
  const totalCount = projects.length || 5;
  const currentFormatted = String(currentIndex >= 0 ? currentIndex + 1 : 1).padStart(2, '0');
  const totalFormatted = String(totalCount).padStart(2, '0');

  // Handle scroll inside modal body
  const handleBodyScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll > 0) {
      setScrollProgress((scrollTop / maxScroll) * 100);
      // Gentle cover parallax (up to 40px)
      if (!prefersReduced) {
        setParallaxY(Math.min(40, scrollTop * 0.2));
      }
    } else {
      setScrollProgress(0);
      setParallaxY(0);
    }
  }, [prefersReduced]);

  // Navigate to previous project
  const handlePrev = useCallback(() => {
    if (!projects.length || !onNavigate) return;
    setSlideDirection(-1);
    const prevIdx = (currentIndex - 1 + projects.length) % projects.length;
    onNavigate(projects[prevIdx]);
    // Reset scroll to top
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentIndex, projects, onNavigate]);

  // Navigate to next project
  const handleNext = useCallback(() => {
    if (!projects.length || !onNavigate) return;
    setSlideDirection(1);
    const nextIdx = (currentIndex + 1) % projects.length;
    onNavigate(projects[nextIdx]);
    // Reset scroll to top
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentIndex, projects, onNavigate]);

  // Lock page scroll on open, stop Lenis, handle keyboard and focus
  useEffect(() => {
    if (!project) return;

    // Capture currently focused element to return focus on close
    previousActiveElement.current = document.activeElement as HTMLElement | null;

    // Save exact current scroll position before locking
    savedScrollY.current = window.scrollY;

    // 1. Stop Lenis smooth scroll
    if (window.__lenis) {
      window.__lenis.stop();
    }

    // 2. Lock page scroll without layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevBodyPadding = document.body.style.paddingRight;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.classList.add('is-modal-open');
    document.documentElement.classList.add('is-modal-open');

    // 3. Focus panel on open so Space/PageUp/PageDown/Arrows scroll it
    const focusTimer = setTimeout(() => {
      panelRef.current?.focus();
    }, 50);

    // 4. Keyboard Listener: Escape, Left/Right arrows, Tab focus trap
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
        return;
      }

      // Focus trap within modal panel
      if (e.key === 'Tab' && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // 5. Non-passive wheel and touchmove fallback listener on scroll container
    const container = scrollContainerRef.current;
    const handleWheelFallback = (e: WheelEvent) => {
      if (!container) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      const atTop = scrollTop === 0;
      const atBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;

      if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
        e.stopPropagation();
        container.scrollTop += e.deltaY;
        handleBodyScroll();
      }
    };

    const handleTouchFallback = (e: TouchEvent) => {
      e.stopPropagation();
    };

    if (container) {
      container.addEventListener('wheel', handleWheelFallback, { passive: false });
      container.addEventListener('touchmove', handleTouchFallback, { passive: true });
    }

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);

      if (container) {
        container.removeEventListener('wheel', handleWheelFallback);
        container.removeEventListener('touchmove', handleTouchFallback);
      }

      // Restore body styles
      document.body.style.paddingRight = prevBodyPadding;
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.classList.remove('is-modal-open');
      document.documentElement.classList.remove('is-modal-open');

      // Restart Lenis
      if (window.__lenis) {
        window.__lenis.start();
      }

      // Restore exact scroll position
      window.scrollTo(0, savedScrollY.current);

      // Return focus to trigger button
      previousActiveElement.current?.focus?.();
    };
  }, [project, onClose, handlePrev, handleNext, handleBodyScroll]);

  if (!project || typeof document === 'undefined') return null;

  const accent = project.accentColor || '#5B8CFF';
  const bulletColor = getBulletColor(accent, isLight);

  // Render directly into document.body via Portal
  return createPortal(
    <AnimatePresence>
      <div
        data-modal-open="true"
        className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overscroll-contain h-[100dvh] cursor-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
      >
        {/* Backdrop Overlay with light blur and theme token */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{ backgroundColor: 'var(--modal-overlay)' }}
          className="fixed inset-0 backdrop-blur-[8px]"
        />

        {/* Modal Window Panel: flex column, max-height min(88dvh, 880px), min-height 0 */}
        <motion.div
          ref={panelRef}
          tabIndex={-1}
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          style={{ boxShadow: 'var(--modal-shadow)' }}
          className="relative w-full max-w-3xl max-h-[92dvh] sm:max-h-[min(88dvh,880px)] flex flex-col min-h-0 rounded-t-[28px] sm:rounded-[24px] bg-surface border border-border text-text outline-none overflow-hidden z-10 transition-colors duration-200"
        >
          {/* Mobile Drag Handle */}
          <div className="w-12 h-1 rounded-full bg-border mx-auto mt-2.5 sm:hidden shrink-0" />

          {/* Sticky Header: Index + Name + Close Button + Bottom Scroll-Progress Line */}
          <header className="shrink-0 px-6 sm:px-8 py-4 bg-surface relative z-30 flex items-center justify-between border-b border-border transition-colors duration-200">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-secondary font-semibold">
                {currentFormatted} / {totalFormatted}
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <h3
                id="project-modal-title"
                className="font-heading font-bold text-lg sm:text-xl uppercase tracking-tight text-text truncate max-w-[280px] sm:max-w-md"
              >
                {project.name}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline font-mono text-[11px] text-secondary uppercase tracking-widest mr-1 font-semibold">
                ESC
              </span>
              <button
                onClick={onClose}
                aria-label="Close modal (Esc)"
                className="w-8 h-8 rounded-full bg-surface-elevated hover:bg-border/60 border border-border text-secondary hover:text-text flex items-center justify-center transition-colors focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lilac Scroll Progress Bar along bottom edge */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-border/40">
              <div
                className="h-full bg-primary transition-all duration-75 shadow-[0_0_8px_var(--primary-color)]"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          </header>

          {/* Body Area: flex: 1, min-height: 0, overflow-y: auto, overscroll-behavior: contain */}
          <div
            ref={scrollContainerRef}
            data-lenis-prevent="true"
            onScroll={handleBodyScroll}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 sm:px-8 py-6 modal-scrollbar relative"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={project.id}
                initial={
                  prefersReduced
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        x: slideDirection * 24,
                      }
                }
                animate={{ opacity: 1, x: 0 }}
                exit={
                  prefersReduced
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        x: -slideDirection * 24,
                      }
                }
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="space-y-6"
              >
                {/* 1. Shorter Cover (220px) with Inner Parallax & Dark Mesh */}
                <div className="relative w-full h-[190px] sm:h-[220px] rounded-[18px] overflow-hidden bg-[#10131B] border border-white/[0.08] flex items-center justify-center shrink-0">
                  {/* Animated/Parallax Accent Mesh Blobs */}
                  <div
                    className="absolute inset-0 pointer-events-none overflow-hidden"
                    style={{
                      transform: !prefersReduced ? `translateY(${parallaxY}px)` : 'none',
                    }}
                  >
                    <div
                      className="absolute -top-10 -left-10 w-52 h-52 rounded-full blur-[50px]"
                      style={{ backgroundColor: `${accent}25` }}
                    />
                    <div className="absolute -bottom-10 -right-10 w-52 h-52 rounded-full bg-[#B79CFF]/15 blur-[50px]" />
                    <div
                      className="absolute inset-0 opacity-15"
                      style={{
                        backgroundImage:
                          'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                      }}
                    />
                  </div>

                  {/* Emblem in center */}
                  <div className="relative flex items-center justify-center z-10">
                    <div className="w-24 h-24 rounded-full border border-white/10 absolute pointer-events-none" />
                    <div
                      className="w-20 h-20 rounded-[20px] bg-white/[0.06] border border-white/[0.14] backdrop-blur-md flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                      style={{
                        boxShadow: `0 0 28px ${accent}30`,
                      }}
                    >
                      {project.logo ? (
                        <img
                          src={project.logo}
                          alt={`${project.name} logo`}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                        />
                      ) : (
                        <span className="font-heading font-bold text-2xl" style={{ color: accent }}>
                          {project.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Corner Meta: Fixed light text on dark glass pills in both themes */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-10">
                    <span className="px-2.5 py-1 rounded-pill bg-[#0F1117]/60 border border-white/14 backdrop-blur-md font-mono text-[11px] text-[#E6E8EE]">
                      {project.role}
                    </span>
                    <span className="px-2.5 py-1 rounded-pill bg-[#0F1117]/60 border border-white/14 backdrop-blur-md font-mono text-[11px] text-[#E6E8EE]">
                      {project.date}
                    </span>
                  </div>
                </div>

                {/* 2. One-line Summary */}
                <div className="pt-1">
                  <p className="text-secondary text-sm sm:text-base leading-relaxed font-normal">
                    {project.shortDescription}
                  </p>
                </div>

                {/* 3. "WHAT I BUILT" (4-6 short bullets from CV text) */}
                <div className="pt-2">
                  <h4 className="font-mono text-xs uppercase tracking-widest text-primary font-bold mb-3">
                    WHAT I BUILT
                  </h4>
                  <ul className="space-y-2.5">
                    {project.fullDescription.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-secondary text-xs sm:text-sm leading-relaxed">
                        <CheckCircle
                          className="w-4 h-4 flex-shrink-0 mt-0.5"
                          style={{ color: bulletColor }}
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 4. "STACK" chips */}
                <div className="pt-2">
                  <h4 className="font-mono text-xs uppercase tracking-widest text-primary font-bold mb-2.5">
                    STACK
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.techTags.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 rounded-pill bg-surface-elevated border border-border text-xs font-mono text-secondary font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 5. Action Row: GitHub (primary pill) + Live Demo (if available) */}
                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-11 px-6 rounded-pill bg-primary text-white dark:text-[#0F1117] font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_16px_var(--primary-glow)] hover:brightness-105 transition-all"
                  >
                    <SiGithub className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>

                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 px-6 rounded-pill bg-surface-elevated hover:bg-border/60 border border-border text-text font-mono text-xs tracking-wider flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="w-3.5 h-3.5 text-primary" />
                    </a>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sticky Footer: "← Previous" and "Next →" Buttons + Keyboard Navigation Hint */}
          <footer className="shrink-0 px-6 sm:px-8 py-3.5 bg-surface border-t border-border flex items-center justify-between relative z-30 transition-colors duration-200">
            <button
              onClick={handlePrev}
              disabled={projects.length <= 1}
              aria-label="Previous project (Left arrow)"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-surface-elevated hover:bg-border/60 border border-border text-xs font-mono text-secondary hover:text-text transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="hidden sm:inline font-mono text-[11px] text-secondary tracking-wider font-medium">
              ← / → navigate · ESC close
            </span>

            <button
              onClick={handleNext}
              disabled={projects.length <= 1}
              aria-label="Next project (Right arrow)"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-surface-elevated hover:bg-border/60 border border-border text-xs font-mono text-secondary hover:text-text transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
