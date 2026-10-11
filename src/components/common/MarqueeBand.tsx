import React, { useRef, useState, useEffect } from 'react';
import { useCursor } from '../../context/CursorContext';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const MARQUEE_ITEMS = [
  'Flutter',
  'Dart',
  'BLoC',
  'Cubit',
  'Firebase',
  'Supabase',
  'REST APIs',
  'Clean Architecture',
  'MVVM',
  'GoRouter',
  'GetIt',
  'Hive',
];

export const MarqueeBand: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();
  const { setCursor, resetCursor } = useCursor();

  const [isInView, setIsInView] = useState(true);
  const isHoveringItem = useRef(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // IntersectionObserver to pause when off-screen
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: '100px' }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Scroll velocity tracking & smooth infinite translation loop
  useEffect(() => {
    if (prefersReduced) return;

    let animId: number;
    let offset = 0;
    let lastTime = performance.now();
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();
    let scrollVelocityFactor = 1; // 1 to 5, negative for scrolling up
    let targetVelocityFactor = 1;

    const handleScroll = () => {
      const now = performance.now();
      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - lastScrollY;
      const deltaTime = Math.max(16, now - lastScrollTime);

      const pixelsPerMs = deltaY / deltaTime; // can be positive (down) or negative (up)
      // Base factor: 1. If scrolling down, increase up to 5x. If scrolling up, reverse up to -5x.
      if (Math.abs(pixelsPerMs) > 0.05) {
        const sign = pixelsPerMs > 0 ? 1 : -1;
        const magnitude = Math.min(5, 1 + Math.abs(pixelsPerMs) * 3);
        targetVelocityFactor = sign * magnitude;
      }

      lastScrollY = currentScrollY;
      lastScrollTime = now;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const baseSpeed = 60; // 60px/second base speed

    const loop = (now: number) => {
      if (isInView && trackRef.current) {
        const dt = Math.min(0.05, (now - lastTime) / 1000); // capped delta time

        // Ease targetVelocityFactor back toward normal forward speed (1)
        targetVelocityFactor += (1 - targetVelocityFactor) * 0.04;

        // Ease current scrollVelocityFactor toward target
        scrollVelocityFactor += (targetVelocityFactor - scrollVelocityFactor) * 0.1;

        // If hovering an item, speed is 30%
        const hoverMultiplier = isHoveringItem.current ? 0.3 : 1.0;

        const deltaPixels = baseSpeed * scrollVelocityFactor * hoverMultiplier * dt;
        offset -= deltaPixels;

        // Wrap seamlessly at half the scrollWidth (track has 2 identical sets)
        const halfWidth = trackRef.current.scrollWidth / 2;
        if (halfWidth > 0) {
          if (offset <= -halfWidth) {
            offset += halfWidth;
          } else if (offset > 0) {
            offset -= halfWidth;
          }
          trackRef.current.style.transform = `translate3d(${offset}px, 0, 0)`;
        }
      }

      lastTime = now;
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isInView, prefersReduced]);

  if (prefersReduced) {
    return (
      <div className="w-full border-y border-border py-7 select-none px-6">
        <div className="flex flex-wrap items-center justify-center gap-6">
          {MARQUEE_ITEMS.map((item, i) => (
            <React.Fragment key={i}>
              <span className="font-heading font-bold text-3xl md:text-5xl uppercase tracking-tight text-text/80">
                {item}
              </span>
              {i < MARQUEE_ITEMS.length - 1 && (
                <span className="w-4 h-4 rounded-full bg-primary shadow-[0_0_12px_var(--primary-color)]" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-screen -ml-[50vw] left-1/2 right-1/2 overflow-hidden border-y border-border py-7 select-none bg-transparent"
      style={{
        maskImage:
          'linear-gradient(to right, transparent, black 120px, black calc(100% - 120px), transparent)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 120px, black calc(100% - 120px), transparent)',
      }}
    >
      {/* Moving Track with duplicated items for seamless loop */}
      <div
        ref={trackRef}
        className="flex items-center whitespace-nowrap will-change-transform"
      >
        {[0, 1].map((copyIndex) => (
          <div key={copyIndex} className="flex items-center shrink-0">
            {MARQUEE_ITEMS.map((item, itemIndex) => {
              const globalIndex = copyIndex * MARQUEE_ITEMS.length + itemIndex;
              const isHovered = hoveredIndex === globalIndex;

              return (
                <div key={itemIndex} className="flex items-center shrink-0">
                  {/* Giant Outlined Word */}
                  <span
                    onMouseEnter={() => {
                      isHoveringItem.current = true;
                      setHoveredIndex(globalIndex);
                      setCursor('magnetic');
                    }}
                    onMouseLeave={() => {
                      isHoveringItem.current = false;
                      setHoveredIndex(null);
                      resetCursor();
                    }}
                    className={`font-heading font-bold uppercase transition-[color,-webkit-text-stroke,-webkit-text-fill-color] duration-250 cursor-pointer ${
                      isHovered
                        ? 'text-primary fill-primary'
                        : 'text-transparent'
                    }`}
                    style={{
                      fontSize: 'clamp(48px, 8vw, 104px)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1,
                      WebkitTextStroke: isHovered
                        ? '1.5px var(--primary-color)'
                        : '1.5px rgba(230, 232, 238, 0.35)',
                      WebkitTextFillColor: isHovered
                        ? 'var(--primary-color)'
                        : 'transparent',
                    }}
                  >
                    {item}
                  </span>

                  {/* 16px Solid Lilac Glowing Dot Separator */}
                  <div className="mx-12 flex items-center justify-center shrink-0">
                    <span className="w-4 h-4 rounded-full bg-primary shadow-[0_0_12px_var(--primary-color)] block" />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
