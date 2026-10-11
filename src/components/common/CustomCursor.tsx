import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCursor } from '../../context/CursorContext';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

export const CustomCursor: React.FC = () => {
  const { cursorVariant, cursorText, setIsClicking } = useCursor();
  const prefersReduced = usePrefersReducedMotion();

  const dotRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ballPos = useRef({ x: -100, y: -100 });
  const isVisible = useRef(false);
  const isInputHovered = useRef(false);
  const isModalOpenRef = useRef(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataCursor, setDataCursor] = useState<{ variant: string; label: string } | null>(null);

  const [enabled, setEnabled] = useState(false);
  const [ripples, setRipples] = useState<ClickRipple[]>([]);
  const isMouseDown = useRef(false);

  // Check modal open state via MutationObserver on body/documentElement
  useEffect(() => {
    const checkModalState = () => {
      const open =
        document.body.classList.contains('is-modal-open') ||
        document.documentElement.classList.contains('is-modal-open');
      isModalOpenRef.current = open;
      setIsModalOpen(open);
    };

    checkModalState();
    const observer = new MutationObserver(checkModalState);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Only enable on desktop with fine pointer & not reduced-motion
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFinePointer || prefersReduced) {
      setEnabled(false);
      document.documentElement.classList.remove('has-custom-cursor');
      return;
    }

    setEnabled(true);
    document.documentElement.classList.add('has-custom-cursor');

    const handlePointerMove = (e: MouseEvent | PointerEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible.current) {
        isVisible.current = true;
        ballPos.current = { x: e.clientX, y: e.clientY };
      }

      // Detect if hovering input/textarea/select
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        isInputHovered.current = true;
      } else {
        isInputHovered.current = false;
      }

      // Check data-cursor and data-cursor-label on hovered element or ancestor
      if (target) {
        const cursorEl = target.closest<HTMLElement>('[data-cursor]');
        if (cursorEl) {
          const variant = cursorEl.getAttribute('data-cursor') || '';
          const label = cursorEl.getAttribute('data-cursor-label') || '';
          setDataCursor({ variant, label });
        } else {
          setDataCursor(null);
        }
      } else {
        setDataCursor(null);
      }
    };

    const handleMouseLeave = () => {
      isVisible.current = false;
    };

    const handleMouseEnter = () => {
      isVisible.current = true;
    };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown.current = true;
      setIsClicking(true);
      // Emit expanding ring
      const newRipple = { id: Date.now(), x: e.clientX, y: e.clientY };
      setRipples((prev) => [...prev.slice(-3), newRipple]);
    };

    const handleMouseUp = () => {
      isMouseDown.current = false;
      setIsClicking(false);
    };

    // Listen on window in CAPTURE phase so no element or event stopPropagation can block cursor tracking
    window.addEventListener('pointermove', handlePointerMove, { capture: true, passive: true });
    window.addEventListener('mousemove', handlePointerMove, { capture: true, passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mousedown', handleMouseDown, { capture: true, passive: true });
    window.addEventListener('mouseup', handleMouseUp, { capture: true, passive: true });

    let rafId: number;
    const lerpFactor = 0.16;

    const render = () => {
      try {
        if (ballRef.current && dotRef.current) {
          // Dot follows pointer immediately
          dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;

          // Ball trails with smooth lerp
          ballPos.current.x += (mousePos.current.x - ballPos.current.x) * lerpFactor;
          ballPos.current.y += (mousePos.current.y - ballPos.current.y) * lerpFactor;

          const scale = isMouseDown.current ? 0.8 : 1;
          ballRef.current.style.transform = `translate3d(${ballPos.current.x}px, ${ballPos.current.y}px, 0) translate(-50%, -50%) scale(${scale})`;

          // Hide custom cursor completely when modal is open, or hovering inputs, or off window
          const shouldHide =
            !isVisible.current ||
            isInputHovered.current ||
            isModalOpenRef.current;

          const opacity = shouldHide ? '0' : '1';
          dotRef.current.style.opacity = opacity;
          ballRef.current.style.opacity = opacity;
        }
      } catch (err) {
        // Prevent any error from killing the rAF loop
        console.error('Custom cursor error:', err);
      } finally {
        rafId = requestAnimationFrame(render);
      }
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove, { capture: true });
      window.removeEventListener('mousemove', handlePointerMove, { capture: true });
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mousedown', handleMouseDown, { capture: true });
      window.removeEventListener('mouseup', handleMouseUp, { capture: true });
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, [prefersReduced, setIsClicking]);

  // Clean ripples
  useEffect(() => {
    if (ripples.length === 0) return;
    const timer = setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 600);
    return () => clearTimeout(timer);
  }, [ripples]);

  if (!enabled || typeof document === 'undefined') return null;

  // Derive active variant and label from context OR DOM data attributes
  const effectiveVariant = dataCursor?.variant || cursorVariant;
  let label = dataCursor?.label || cursorText;

  let ballStyles = 'w-10 h-10 border-[1.5px] border-[#B79CFF] bg-[#B79CFF]/10 shadow-[0_0_16px_rgba(183,156,255,0.2)]';
  let isDifference = false;

  switch (effectiveVariant) {
    case 'magnetic':
      ballStyles = 'w-16 h-16 border border-[#B79CFF] bg-[#B79CFF]/20 shadow-[0_0_20px_rgba(183,156,255,0.35)]';
      break;
    case 'project':
    case 'view':
      ballStyles = 'w-24 h-24 bg-[#B79CFF] text-[#0F1117] shadow-[0_0_28px_rgba(183,156,255,0.6)] border-transparent';
      label = label || 'VIEW';
      break;
    case 'drag':
      ballStyles = 'w-20 h-20 bg-[#B79CFF]/95 text-[#0F1117] shadow-[0_0_20px_rgba(183,156,255,0.4)] border-transparent';
      label = label || 'DRAG';
      break;
    case 'code':
      ballStyles = 'w-10 h-10 border-[1.5px] border-[#B79CFF] bg-[#B79CFF]/10 shadow-[0_0_16px_rgba(183,156,255,0.2)]';
      label = '';
      break;
    case 'heading':
      ballStyles = 'w-10 h-10 border-[1.5px] border-[#B79CFF] bg-[#B79CFF]/10 shadow-[0_0_16px_rgba(183,156,255,0.2)]';
      isDifference = false;
      break;
    case 'hidden':
      ballStyles = 'w-0 h-0 opacity-0 pointer-events-none';
      break;
    default:
      ballStyles = 'w-10 h-10 border-[1.5px] border-[#B79CFF] bg-[#B79CFF]/10 shadow-[0_0_16px_rgba(183,156,255,0.2)]';
      break;
  }

  const isTextBall = effectiveVariant === 'project' || effectiveVariant === 'view' || effectiveVariant === 'drag';

  // Render directly into document.body as the last element with highest z-index
  return createPortal(
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{
        zIndex: 2147483647,
        display: isModalOpen ? 'none' : 'block',
      }}
    >
      {/* Expanding click rings */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full border border-[#B79CFF] animate-ping pointer-events-none"
          style={{
            left: `${r.x}px`,
            top: `${r.y}px`,
            width: '40px',
            height: '40px',
            transform: 'translate(-50%, -50%)',
            animationDuration: '0.6s',
          }}
        />
      ))}

      {/* Trailing Ball */}
      <div
        ref={ballRef}
        className={`fixed top-0 left-0 rounded-full flex items-center justify-center pointer-events-none transition-[width,height,background-color,border-color,box-shadow] duration-200 ease-out will-change-transform ${ballStyles}`}
        style={{
          mixBlendMode: isDifference ? 'difference' : 'normal',
        }}
      >
        {label && (
          <span
            className="relative z-10 select-none text-center font-mono font-bold text-[12px] uppercase tracking-wider text-[#0F1117] leading-none pointer-events-none opacity-100"
          >
            {label}
          </span>
        )}
      </div>

      {/* Immediate Dot (hidden when ball has text label or modal is open) */}
      {!isDifference && !isTextBall && (
        <div
          ref={dotRef}
          className="fixed top-0 left-0 w-2 h-2 rounded-full bg-[#B79CFF] pointer-events-none will-change-transform shadow-[0_0_8px_#B79CFF]"
        />
      )}
    </div>,
    document.body
  );
};
