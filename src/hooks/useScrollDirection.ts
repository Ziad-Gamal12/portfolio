import { useState, useEffect, useRef } from 'react';

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [isIdle, setIsIdle] = useState<boolean>(true);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [scrollY, setScrollY] = useState<number>(0);
  const lastScrollY = useRef<number>(0);
  const idleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, currentScrollY / maxScroll)) : 0;

      setScrollY(currentScrollY);
      setScrollProgress(progress);

      if (Math.abs(currentScrollY - lastScrollY.current) > 6) {
        setScrollDirection(currentScrollY > lastScrollY.current ? 'down' : 'up');
        lastScrollY.current = currentScrollY;
      }

      setIsIdle(false);
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
      idleTimeout.current = setTimeout(() => {
        setIsIdle(true);
      }, 350);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
    };
  }, []);

  return { scrollDirection, isIdle, scrollProgress, scrollY };
}
