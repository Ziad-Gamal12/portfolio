import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SiFlutter } from 'react-icons/si';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useTheme } from '../../context/ThemeContext';

interface HeroCodeCardProps {
  roleIndex?: number;
  currentRole?: string;
  inspectedFromPage?: string | null;
}

interface OverlayData {
  x: number;
  y: number;
  width: number;
  height: number;
  tag: string;
}

interface InspectTargetMeta {
  selector: string;
  widgetName: string;
}

const INSPECT_TARGETS: Record<string, InspectTargetMeta> = {
  label: { selector: '[data-inspect="label"]', widgetName: 'Label' },
  headline: { selector: '[data-inspect="headline"]', widgetName: 'Headline' },
  role: { selector: '[data-inspect="role"]', widgetName: 'Role' },
  paragraph: { selector: '[data-inspect="paragraph"]', widgetName: 'Paragraph' },
  buttons: { selector: '[data-inspect="buttons"]', widgetName: 'Row' },
  'primary-button': { selector: '[data-inspect="primary-button"]', widgetName: 'PrimaryButton' },
  'outlined-button': { selector: '[data-inspect="outlined-button"]', widgetName: 'OutlinedButton' },
};

export const HeroCodeCard: React.FC<HeroCodeCardProps> = ({
  roleIndex = 0,
  inspectedFromPage = null,
}) => {
  const prefersReduced = usePrefersReducedMotion();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const cardRef = useRef<HTMLDivElement>(null);
  const codeLinesRef = useRef<Record<string, HTMLDivElement | null>>({});

  const [isHovered, setIsHovered] = useState(false);
  const [activeTarget, setActiveTarget] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<OverlayData | null>(null);
  const [mousePos, setMousePos] = useState({ x: -500, y: -500, inside: false });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50 });

  // Flashing digit for Role(roles[X])
  const [isDigitFlashing, setIsDigitFlashing] = useState(false);
  const prevRoleIndex = useRef(roleIndex);

  useEffect(() => {
    if (prevRoleIndex.current !== roleIndex) {
      prevRoleIndex.current = roleIndex;
      setIsDigitFlashing(true);
      const timer = setTimeout(() => setIsDigitFlashing(false), 450);
      return () => clearTimeout(timer);
    }
  }, [roleIndex]);

  // Touch timer
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Demo sweep state
  const hasDemoRun = useRef(false);
  const demoTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Continuous accurate tracking of active inspectable element
  const activeKey = inspectedFromPage || activeTarget;

  useEffect(() => {
    if (!activeKey) {
      setOverlay(null);
      return;
    }

    const meta = INSPECT_TARGETS[activeKey];
    if (!meta) {
      setOverlay(null);
      return;
    }

    let rafId: number;

    const measureAndSync = () => {
      const el = document.querySelector(meta.selector) as HTMLElement | null;
      if (!el) {
        setOverlay(null);
        return;
      }

      const rect = el.getBoundingClientRect();
      setOverlay((prev) => {
        if (
          prev &&
          Math.abs(prev.x - rect.left) < 0.5 &&
          Math.abs(prev.y - rect.top) < 0.5 &&
          Math.abs(prev.width - rect.width) < 0.5 &&
          Math.abs(prev.height - rect.height) < 0.5 &&
          prev.tag.startsWith(meta.widgetName)
        ) {
          return prev;
        }
        return {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          tag: `${meta.widgetName} · ${Math.round(rect.width)} × ${Math.round(rect.height)}`,
        };
      });
    };

    // Immediate measurement
    measureAndSync();
    // After layout / animations tick
    const settleTimeout = setTimeout(measureAndSync, 40);

    // Continuous loop while overlay is visible to match parallax & scroll movements within 1px
    const loop = () => {
      measureAndSync();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    window.addEventListener('resize', measureAndSync);
    window.addEventListener('scroll', measureAndSync, { passive: true });

    // Scroll corresponding line into view in card if triggered from page
    if (inspectedFromPage && codeLinesRef.current[inspectedFromPage]) {
      codeLinesRef.current[inspectedFromPage]?.scrollIntoView({
        behavior: prefersReduced ? 'auto' : 'smooth',
        block: 'nearest',
      });
    }

    return () => {
      clearTimeout(settleTimeout);
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', measureAndSync);
      window.removeEventListener('scroll', measureAndSync);
    };
  }, [activeKey, inspectedFromPage, prefersReduced]);

  // Demo sweep: ~2.5s after load, sweep 5 elements (0.6s each), then stop
  useEffect(() => {
    if (prefersReduced || hasDemoRun.current) return;
    hasDemoRun.current = true;

    const targets = ['label', 'headline', 'role', 'paragraph', 'buttons'];
    const startTime = 2500;
    const stepDuration = 600;

    targets.forEach((key, idx) => {
      const timeout = setTimeout(() => {
        if (!isHovered && !inspectedFromPage) {
          setActiveTarget(key);
        }
      }, startTime + idx * stepDuration);
      demoTimeouts.current.push(timeout);
    });

    const finishTimeout = setTimeout(() => {
      if (!isHovered && !inspectedFromPage) {
        setActiveTarget(null);
      }
    }, startTime + targets.length * stepDuration);
    demoTimeouts.current.push(finishTimeout);

    return () => {
      demoTimeouts.current.forEach(clearTimeout);
      demoTimeouts.current = [];
    };
  }, [prefersReduced, isHovered, inspectedFromPage]);

  // Cancel demo on user interaction
  const cancelDemo = useCallback(() => {
    demoTimeouts.current.forEach(clearTimeout);
    demoTimeouts.current = [];
  }, []);

  // Mouse tilt tracking (max 5°)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y, inside: true });

    if (!prefersReduced && window.innerWidth >= 1024) {
      const cx = x - rect.width / 2;
      const cy = y - rect.height / 2;
      const rx = (-cy / (rect.height / 2)) * 5;
      const ry = (cx / (rect.width / 2)) * 5;
      const gx = (x / rect.width) * 100;
      const gy = (y / rect.height) * 100;
      setTilt({ rx, ry, gx, gy });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    cancelDemo();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setActiveTarget(null);
    setMousePos((prev) => ({ ...prev, inside: false }));
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 50 });
  };

  const handleLineHover = (targetKey: string | null) => {
    cancelDemo();
    setActiveTarget(targetKey);
  };

  const handleLineTap = (targetKey: string) => {
    cancelDemo();
    setActiveTarget(targetKey);
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      setActiveTarget(null);
    }, 1500);
  };

  const isLineHighlighted = (targetKey: string) => {
    const current = inspectedFromPage || activeTarget;
    if (targetKey === 'buttons') {
      return current === 'buttons' || current === 'primary-button' || current === 'outlined-button';
    }
    return current === targetKey;
  };

  const highlightClass = (targetKey: string) =>
    isLineHighlighted(targetKey)
      ? 'bg-[#B79CFF]/[0.12] border-l-2 border-primary font-medium'
      : 'border-l-2 border-transparent';

  // Syntax tokens with AA contrast in both themes
  const kwColor = isLight ? 'text-[#6D4AE0]' : 'text-[#B79CFF]'; // keywords
  const typeColor = isLight ? 'text-[#0284C7]' : 'text-[#7DD3FC]'; // widgets/types
  const strColor = isLight ? 'text-[#1B7F4B]' : 'text-[#86EFAC]'; // strings
  const syntaxColor = isLight ? 'text-[#5B6173]' : 'text-[#E6E8EE]/75'; // punctuation
  const numColor = isLight ? 'text-[#5B6173]/50' : 'text-secondary/45'; // line numbers

  return (
    <div className="flex flex-col items-center w-full max-w-[540px]" aria-hidden="true">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform:
            !prefersReduced && window.innerWidth >= 1024
              ? `perspective(1000px) rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg)`
              : 'none',
          transition: isHovered
            ? 'transform 0.1s ease-out'
            : 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="relative w-full sm:w-[clamp(440px,36vw,540px)] rounded-[18px] bg-surface border border-border select-none shadow-[0_20px_48px_-12px_rgba(0,0,0,0.4)] transition-all duration-200 overflow-hidden"
      >
        {/* Dynamic 1px Spotlight Border following mouse */}
        <div
          className="absolute inset-0 rounded-[18px] pointer-events-none transition-opacity duration-300 z-30"
          style={{
            opacity: mousePos.inside ? 1 : 0,
            padding: '1px',
            background: `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, var(--primary-glow), transparent 70%)`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />

        {/* Gentle Flashlight Glow near pointer (enhances saturation without dimming background code) */}
        <div
          className="absolute inset-0 rounded-[18px] pointer-events-none transition-opacity duration-300 z-10"
          style={{
            opacity: mousePos.inside && !prefersReduced ? 1 : 0,
            background: `radial-gradient(180px circle at ${mousePos.x}px ${mousePos.y}px, ${
              isLight ? 'rgba(109,74,224,0.06)' : 'rgba(183,156,255,0.08)'
            }, transparent 70%)`,
          }}
        />

        {/* Window Chrome Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-elevated/40 relative z-20">
          {/* Traffic Light Dots */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/70" />
          </div>

          {/* File Tab */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-surface border border-border text-secondary font-mono text-[11px] font-medium tracking-wide">
            <SiFlutter className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#54C5F8]" />
            <span>portfolio.dart</span>
          </div>

          <div className="w-12" />
        </div>

        {/* Code Content Container: Full brightness by default, no line > 44 chars, no clip */}
        <div className="relative p-5 font-mono text-[12px] sm:text-[13px] 2xl:text-[14px] leading-[22px] whitespace-pre overflow-x-auto modal-scrollbar z-20">
          <div className="space-y-0 select-none">
            {/* Line 1 */}
            <div className="flex items-center">
              <span className={`w-5 text-right pr-2 ${numColor} text-[11px]`}>1</span>
              <span>
                <span className={`${kwColor} font-semibold`}>class</span>{' '}
                <span className={typeColor}>Hero</span>{' '}
                <span className={`${kwColor} font-semibold`}>extends</span>{' '}
                <span className={typeColor}>StatelessWidget</span>{' '}
                <span className={syntaxColor}>{'{'}</span>
              </span>
            </div>

            {/* Line 2 */}
            <div className="flex items-center">
              <span className={`w-5 text-right pr-2 ${numColor} text-[11px]`}>2</span>
              <span>
                {'  '}
                <span className={`${kwColor} font-medium`}>@override</span>
              </span>
            </div>

            {/* Line 3 */}
            <div className="flex items-center">
              <span className={`w-5 text-right pr-2 ${numColor} text-[11px]`}>3</span>
              <span>
                {'  '}
                <span className={typeColor}>Widget</span>{' '}
                <span className={typeColor}>build</span>
                <span className={syntaxColor}>(</span>
                <span className={typeColor}>BuildContext</span>{' '}
                <span className={syntaxColor}>context) {'{'}</span>
              </span>
            </div>

            {/* Line 4 */}
            <div className="flex items-center">
              <span className={`w-5 text-right pr-2 ${numColor} text-[11px]`}>4</span>
              <span>
                {'    '}
                <span className={`${kwColor} font-semibold`}>return</span>{' '}
                <span className={typeColor}>Column</span>
                <span className={syntaxColor}>(</span>
              </span>
            </div>

            {/* Line 5 */}
            <div className="flex items-center">
              <span className={`w-5 text-right pr-2 ${numColor} text-[11px]`}>5</span>
              <span>
                {'      '}
                <span className={typeColor}>children</span>
                <span className={syntaxColor}>: [</span>
              </span>
            </div>

            {/* Line 6: Label("Hello! I'm"), */}
            <div
              ref={(el) => { codeLinesRef.current.label = el; }}
              onMouseEnter={() => handleLineHover('label')}
              onMouseLeave={() => handleLineHover(null)}
              onClick={() => handleLineTap('label')}
              className={`flex items-center rounded transition-colors duration-150 cursor-pointer ${highlightClass('label')}`}
            >
              <span className={`w-5 text-right pr-2 ${numColor} text-[11px]`}>6</span>
              <span>
                {'        '}
                <span className={typeColor}>Label</span>
                <span className={syntaxColor}>(</span>
                <span className={strColor}>"Hello! I'm"</span>
                <span className={syntaxColor}>),</span>
              </span>
            </div>

            {/* Line 7: Headline('ZIAD GAMAL'), */}
            <div
              ref={(el) => { codeLinesRef.current.headline = el; }}
              onMouseEnter={() => handleLineHover('headline')}
              onMouseLeave={() => handleLineHover(null)}
              onClick={() => handleLineTap('headline')}
              className={`flex items-center rounded transition-colors duration-150 cursor-pointer ${highlightClass('headline')}`}
            >
              <span className={`w-5 text-right pr-2 ${numColor} text-[11px]`}>7</span>
              <span>
                {'        '}
                <span className={typeColor}>Headline</span>
                <span className={syntaxColor}>(</span>
                <span className={strColor}>'ZIAD GAMAL'</span>
                <span className={syntaxColor}>),</span>
              </span>
            </div>

            {/* Line 8: Role(roles[0]), */}
            <div
              ref={(el) => { codeLinesRef.current.role = el; }}
              onMouseEnter={() => handleLineHover('role')}
              onMouseLeave={() => handleLineHover(null)}
              onClick={() => handleLineTap('role')}
              className={`flex items-center rounded transition-colors duration-150 cursor-pointer ${highlightClass('role')}`}
            >
              <span className={`w-5 text-right pr-2 ${numColor} text-[11px]`}>8</span>
              <span>
                {'        '}
                <span className={typeColor}>Role</span>
                <span className={syntaxColor}>(roles[</span>
                <span
                  key={roleIndex}
                  className={`inline-block font-bold transition-all duration-200 ${
                    isDigitFlashing
                      ? 'text-primary bg-primary/20 px-1 rounded scale-125 shadow-[0_0_8px_var(--primary-color)]'
                      : kwColor
                  }`}
                >
                  {roleIndex}
                </span>
                <span className={syntaxColor}>]),</span>
              </span>
            </div>

            {/* Line 9: Paragraph(summary), */}
            <div
              ref={(el) => { codeLinesRef.current.paragraph = el; }}
              onMouseEnter={() => handleLineHover('paragraph')}
              onMouseLeave={() => handleLineHover(null)}
              onClick={() => handleLineTap('paragraph')}
              className={`flex items-center rounded transition-colors duration-150 cursor-pointer ${highlightClass('paragraph')}`}
            >
              <span className={`w-5 text-right pr-2 ${numColor} text-[11px]`}>9</span>
              <span>
                {'        '}
                <span className={typeColor}>Paragraph</span>
                <span className={syntaxColor}>(summary),</span>
              </span>
            </div>

            {/* Line 10: Row(children: [ */}
            <div
              ref={(el) => { codeLinesRef.current.buttons = el; }}
              onMouseEnter={() => handleLineHover('buttons')}
              onMouseLeave={() => handleLineHover(null)}
              onClick={() => handleLineTap('buttons')}
              className={`flex items-center rounded transition-colors duration-150 cursor-pointer ${highlightClass('buttons')}`}
            >
              <span className={`w-5 text-right pr-2 ${numColor} text-[11px]`}>10</span>
              <span>
                {'        '}
                <span className={typeColor}>Row</span>
                <span className={syntaxColor}>(children: [</span>
              </span>
            </div>

            {/* Line 11: PrimaryButton('View Work'), */}
            <div
              onMouseEnter={() => handleLineHover('primary-button')}
              onMouseLeave={() => handleLineHover(null)}
              onClick={() => handleLineTap('primary-button')}
              className={`flex items-center rounded transition-colors duration-150 cursor-pointer ${highlightClass('primary-button')}`}
            >
              <span className={`w-5 text-right pr-2 ${numColor} text-[11px]`}>11</span>
              <span>
                {'          '}
                <span className={typeColor}>PrimaryButton</span>
                <span className={syntaxColor}>(</span>
                <span className={strColor}>'View Work'</span>
                <span className={syntaxColor}>),</span>
              </span>
            </div>

            {/* Line 12: OutlinedButton('Download CV'), */}
            <div
              onMouseEnter={() => handleLineHover('outlined-button')}
              onMouseLeave={() => handleLineHover(null)}
              onClick={() => handleLineTap('outlined-button')}
              className={`flex items-center rounded transition-colors duration-150 cursor-pointer ${highlightClass('outlined-button')}`}
            >
              <span className={`w-5 text-right pr-2 ${numColor} text-[11px]`}>12</span>
              <span>
                {'          '}
                <span className={typeColor}>OutlinedButton</span>
                <span className={syntaxColor}>(</span>
                <span className={strColor}>'Download CV'</span>
                <span className={syntaxColor}>),</span>
              </span>
            </div>

            {/* Line 13: ]), */}
            <div className="flex items-center">
              <span className={`w-5 text-right pr-2 ${numColor} text-[11px]`}>13</span>
              <span>
                {'        '}
                <span className={syntaxColor}>]),</span>
              </span>
            </div>

            {/* Line 14: ], */}
            <div className="flex items-center">
              <span className={`w-5 text-right pr-2 ${numColor} text-[11px]`}>14</span>
              <span>
                {'      '}
                <span className={syntaxColor}>],</span>
              </span>
            </div>

            {/* Line 15: ); */}
            <div className="flex items-center">
              <span className={`w-5 text-right pr-2 ${numColor} text-[11px]`}>15</span>
              <span>
                {'    '}
                <span className={syntaxColor}>);</span>
              </span>
            </div>

            {/* Line 16: } */}
            <div className="flex items-center">
              <span className={`w-5 text-right pr-2 ${numColor} text-[11px]`}>16</span>
              <span>
                {'  '}
                <span className={syntaxColor}>{'}'}</span>
              </span>
            </div>

            {/* Line 17: } */}
            <div className="flex items-center">
              <span className={`w-5 text-right pr-2 ${numColor} text-[11px]`}>17</span>
              <span>
                <span className={syntaxColor}>{'}'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tiny hint under card: 11px mono, 40% opacity */}
      <div className="flex items-center justify-center gap-1.5 mt-2.5 text-secondary/50 font-mono text-[11px] select-none tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] dark:bg-[#42A5F5] animate-pulse" />
        <span>hover to inspect</span>
      </div>

      {/* Flutter Inspector Style Portal Overlay on Real Page Element */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {overlay && (
              <motion.div
                key="inspector-overlay"
                initial={prefersReduced ? false : { opacity: 0 }}
                animate={{
                  opacity: 1,
                  x: overlay.x,
                  y: overlay.y,
                  width: overlay.width,
                  height: overlay.height,
                }}
                exit={{ opacity: 0 }}
                transition={
                  prefersReduced
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 500, damping: 35 }
                }
                className="fixed pointer-events-none z-50 rounded-lg border border-[#0284C7]/80 dark:border-[#42A5F5]/80 bg-[#0284C7]/[0.15] dark:bg-[#42A5F5]/[0.16] shadow-[0_0_20px_rgba(2,132,199,0.25)] dark:shadow-[0_0_20px_rgba(66,165,245,0.3)]"
                style={{
                  top: 0,
                  left: 0,
                }}
              >
                {/* Floating Tag Badge */}
                <div className="absolute -top-6 left-0 px-2 py-0.5 rounded bg-surface border border-border text-primary font-mono text-[11px] font-semibold whitespace-nowrap shadow-md">
                  {overlay.tag}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
