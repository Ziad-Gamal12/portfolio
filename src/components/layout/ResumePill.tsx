import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download } from 'lucide-react';
import { PERSONAL_INFO } from '../../data/portfolioData';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { Magnetic } from '../common/Magnetic';

interface ResumePillProps {
  isWorkActive?: boolean;
}

export const ResumePill: React.FC<ResumePillProps> = ({ isWorkActive = false }) => {
  const { scrollDirection, isIdle, scrollY } = useScrollDirection();
  const [isWorkInViewport, setIsWorkInViewport] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  // 1. Observe whether the Work section is anywhere in the viewport
  useEffect(() => {
    const workEl = document.getElementById('work');
    if (!workEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsWorkInViewport(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(workEl);
    return () => observer.disconnect();
  }, []);

  // 2. Observe whether the project details modal is currently open
  useEffect(() => {
    const checkModal = () => {
      const open =
        document.body.classList.contains('is-modal-open') ||
        document.documentElement.classList.contains('is-modal-open');
      setIsModalOpen(open);
    };

    checkModal();
    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // 3. Control visibility
  useEffect(() => {
    // Hide whenever Work section is anywhere in the viewport, or pinned, or modal is open
    if (isWorkInViewport || isWorkActive || isModalOpen) {
      setVisible(false);
      return;
    }

    // Auto-hide when scrolling down (unless near the top), show when scrolling up or idle
    if (scrollY < 120) {
      setVisible(true);
    } else if (scrollDirection === 'down' && !isIdle) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [scrollDirection, isIdle, isWorkActive, isWorkInViewport, isModalOpen, scrollY]);

  return (
    <aside aria-label="Resume quick access" className="fixed bottom-6 right-6 z-40 pointer-events-auto">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Magnetic maxDistance={10}>
              <a
                href={PERSONAL_INFO.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                download="Ziad_Gamal_CV.pdf"
                className="group flex items-center gap-2.5 px-4 py-2.5 rounded-pill bg-surface/90 border border-border/80 shadow-[0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-md text-text text-xs md:text-sm font-mono tracking-wider hover:border-primary hover:text-primary transition-all duration-300"
              >
                <FileText className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-200" />
                <span>RESUME</span>
                <Download className="w-3.5 h-3.5 text-secondary group-hover:text-primary group-hover:translate-y-0.5 transition-transform duration-200" />
              </a>
            </Magnetic>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};
