import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Smartphone, LayoutDashboard, Cpu, CheckCircle2 } from 'lucide-react';
import { SERVICES } from '../../data/portfolioData';
import { SpotlightHeading } from '../common/SpotlightHeading';
import { Reveal } from '../common/Reveal';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const ICONS = [
  <Smartphone className="w-5 h-5 text-primary" />,
  <LayoutDashboard className="w-5 h-5 text-primary" />,
  <Cpu className="w-5 h-5 text-primary" />,
];

export const Services: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const prefersReduced = usePrefersReducedMotion();

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <section id="services" className="py-24 md:py-32 relative overflow-hidden section-content-visibility">
      {/* Background soft glow */}
      <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-accent/5 blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-content mx-auto px-6 md:px-10">
        {/* Section tag */}
        <Reveal>
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs md:text-sm text-primary tracking-widest font-semibold uppercase">
              02 — SERVICES
            </span>
            <div className="h-[1px] w-12 bg-primary/40" />
          </div>
        </Reveal>

        {/* Section Heading with SpotlightHeading */}
        <div className="mb-14">
          <SpotlightHeading
            text="WHAT I DO"
            as="h2"
            className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight"
          />
        </div>

        {/* 3 Service Cards */}
        <div className="grid grid-cols-1 gap-6">
          {SERVICES.map((service, index) => (
            <ServiceCard
              key={service.number}
              service={service}
              icon={ICONS[index]}
              isOpen={openIndex === index}
              onToggle={() => toggleAccordion(index)}
              delay={index * 0.1}
              prefersReduced={prefersReduced}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const ServiceCard: React.FC<{
  service: typeof SERVICES[0];
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  delay: number;
  prefersReduced: boolean;
}> = ({ service, icon, isOpen, onToggle, delay, prefersReduced }) => {
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      className="relative rounded-card border border-dashed border-border/90 bg-surface/80 p-6 md:p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/60 group overflow-hidden"
    >
      {/* Corner Brackets with drawing stroke */}
      <CornerBrackets />

      {/* Internal Radial Mouse Spotlight */}
      {!prefersReduced && (
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(183,156,255,0.08), transparent 75%)`,
          }}
        />
      )}

      {/* Card Header & Accordion Toggle */}
      <button
        onClick={onToggle}
        className="w-full text-left flex items-start justify-between gap-4 select-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-4 md:gap-6 flex-1">
          {/* Service number */}
          <span className="font-mono text-sm md:text-base font-bold text-primary mt-1">
            {service.number}
          </span>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                {icon}
              </span>
              <h3 className="font-heading font-bold text-lg sm:text-xl md:text-2xl uppercase tracking-tight text-text group-hover:text-primary transition-colors duration-200">
                {service.title}
              </h3>
            </div>
            <p className="text-secondary text-sm md:text-base font-normal mt-1 max-w-[60ch]">
              {service.tagline}
            </p>
          </div>
        </div>

        {/* Chevron */}
        <div
          className={`p-2 rounded-full border border-border/80 text-secondary group-hover:border-primary group-hover:text-primary transition-all duration-300 mt-1 ${
            isOpen ? 'rotate-180 bg-primary/10 text-primary border-primary' : ''
          }`}
        >
          <ChevronDown className="w-5 h-5 transition-transform duration-300" />
        </div>
      </button>

      {/* Accordion Expandable Bullets Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-6 mt-6 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-3.5 pl-0 md:pl-12">
              {service.bullets.map((bullet, bulletIdx) => (
                <motion.div
                  key={bulletIdx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: bulletIdx * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex items-start gap-2.5 text-secondary text-sm md:text-[15px]"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{bullet}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Corner brackets SVG stroke animation
const CornerBrackets: React.FC = () => {
  return (
    <>
      {/* Top Left */}
      <svg
        className="absolute top-2 left-2 w-3.5 h-3.5 text-primary/70 pointer-events-none"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path d="M1 13V1H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {/* Top Right */}
      <svg
        className="absolute top-2 right-2 w-3.5 h-3.5 text-primary/70 pointer-events-none"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path d="M1 1H13V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {/* Bottom Left */}
      <svg
        className="absolute bottom-2 left-2 w-3.5 h-3.5 text-primary/70 pointer-events-none"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path d="M1 1V13H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {/* Bottom Right */}
      <svg
        className="absolute bottom-2 right-2 w-3.5 h-3.5 text-primary/70 pointer-events-none"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path d="M13 1V13H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </>
  );
};
