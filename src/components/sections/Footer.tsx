import React, { useEffect, useState } from 'react';
import { useScroll } from 'framer-motion';
import { ArrowUp, Mail } from 'lucide-react';
import { SiGithub } from 'react-icons/si';
import { FaLinkedin } from 'react-icons/fa6';
import { PERSONAL_INFO } from '../../data/portfolioData';
import { Magnetic } from '../common/Magnetic';

export const Footer: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return scrollYProgress.on('change', (latest) => {
      setProgress(latest);
    });
  }, [scrollYProgress]);

  const scrollToTop = () => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Circular ring calculations
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <footer className="w-full border-t border-border/60 bg-surface/50 py-10 relative">
      <div className="max-w-content mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Designer Credit */}
        <p className="font-mono text-xs text-secondary tracking-wider text-center md:text-left">
          Designed & developed by Ziad Gamal © 2026
        </p>

        {/* Center: Social icons shown on screens < 1100px */}
        <div className="flex min-[1100px]:hidden items-center gap-4">
          <Magnetic maxDistance={6}>
            <a
              href={PERSONAL_INFO.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="p-2 rounded-full bg-background border border-border text-secondary hover:text-primary transition-colors block"
            >
              <SiGithub className="w-4 h-4" />
            </a>
          </Magnetic>

          <Magnetic maxDistance={6}>
            <a
              href={PERSONAL_INFO.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-2 rounded-full bg-background border border-border text-secondary hover:text-primary transition-colors block"
            >
              <FaLinkedin className="w-4 h-4" />
            </a>
          </Magnetic>

          <Magnetic maxDistance={6}>
            <a
              href={`mailto:${PERSONAL_INFO.email}`}
              aria-label="Email"
              className="p-2 rounded-full bg-background border border-border text-secondary hover:text-primary transition-colors block"
            >
              <Mail className="w-4 h-4" />
            </a>
          </Magnetic>
        </div>

        {/* Right: Back to Top button with circular SVG progress ring */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-secondary hidden sm:inline-block">
            Back to top
          </span>
          <Magnetic maxDistance={8}>
            <button
              onClick={scrollToTop}
              aria-label="Scroll back to top"
              className="relative w-12 h-12 rounded-full bg-surface border border-border hover:border-primary flex items-center justify-center text-secondary hover:text-primary transition-colors duration-200 group"
            >
              {/* SVG Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 44 44">
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  className="stroke-border/40"
                  strokeWidth="2"
                  fill="none"
                />
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  className="stroke-primary transition-all duration-150"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>

              <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </Magnetic>
        </div>
      </div>
    </footer>
  );
};
