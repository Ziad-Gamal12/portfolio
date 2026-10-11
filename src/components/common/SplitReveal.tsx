import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface SplitRevealProps {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'div';
}

export const SplitReveal: React.FC<SplitRevealProps> = ({
  text,
  className = '',
  wordClassName = '',
  delay = 0,
  stagger = 0.08,
  as: Component = 'h2',
}) => {
  const words = text.split(' ');
  const prefersReduced = usePrefersReducedMotion();

  if (prefersReduced) {
    return (
      <Component className={className}>
        {text}
      </Component>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: stagger,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: { y: '115%', opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <Component className={`inline-block ${className}`}>
      <motion.span
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="inline-flex flex-wrap gap-x-[0.28em] gap-y-1"
      >
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden py-1 -my-1">
            <motion.span
              variants={wordVariants}
              className={`inline-block ${wordClassName}`}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Component>
  );
};
