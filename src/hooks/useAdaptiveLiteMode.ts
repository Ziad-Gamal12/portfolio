import { useState, useEffect } from 'react';

export function useAdaptiveLiteMode() {
  const [isLiteMode, setIsLiteMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;

    // Check hardware concurrency (<= 4 cores)
    if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4) {
      return true;
    }

    // Check device memory (<= 4 GB RAM)
    const nav = navigator as any;
    if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4) {
      return true;
    }

    // Check Save-Data header
    if (nav.connection?.saveData === true) {
      return true;
    }

    return false;
  });

  // Dynamic runtime FPS detector: if FPS < 40 for 2 consecutive seconds, enable lite mode
  useEffect(() => {
    if (isLiteMode) return;

    let frames = 0;
    let lastTime = performance.now();
    let lowFpsCount = 0;
    let animId: number;

    const measure = (now: number) => {
      frames++;
      const elapsed = now - lastTime;

      if (elapsed >= 1000) {
        const fps = (frames / elapsed) * 1000;
        frames = 0;
        lastTime = now;

        if (fps < 40) {
          lowFpsCount++;
          if (lowFpsCount >= 2) {
            setIsLiteMode(true);
            return;
          }
        } else {
          lowFpsCount = 0;
        }
      }

      animId = requestAnimationFrame(measure);
    };

    animId = requestAnimationFrame(measure);

    return () => cancelAnimationFrame(animId);
  }, [isLiteMode]);

  return isLiteMode;
}
