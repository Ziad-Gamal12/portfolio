import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useCursor } from '../../context/CursorContext';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface MagneticProps {
  children: React.ReactNode;
  maxDistance?: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const Magnetic: React.FC<MagneticProps> = ({
  children,
  maxDistance = 12,
  className = '',
  onClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { setCursor, resetCursor } = useCursor();
  const prefersReduced = usePrefersReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced || !ref.current) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    // Constrain to maxDistance
    const distance = Math.hypot(deltaX, deltaY);
    const angle = Math.atan2(deltaY, deltaX);
    const clampedDist = Math.min(distance, maxDistance);

    setPosition({
      x: Math.cos(angle) * clampedDist,
      y: Math.sin(angle) * clampedDist,
    });
  };

  const handleMouseEnter = () => {
    setCursor('magnetic');
  };

  const handleMouseLeave = () => {
    resetCursor();
    setPosition({ x: 0, y: 0 });
  };

  if (prefersReduced) {
    return <div className={`inline-block ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 20, mass: 0.5 }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
};
