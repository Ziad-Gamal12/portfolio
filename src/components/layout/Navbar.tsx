import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { PERSONAL_INFO } from '../../data/portfolioData';
import { TextScramble } from '../common/TextScramble';
import { Magnetic } from '../common/Magnetic';

interface NavItem {
  id: string;
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'about', label: 'About', href: '#about' },
  { id: 'work', label: 'Work', href: '#work' },
  { id: 'contact', label: 'Contact', href: '#contact' },
];

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // Detect active section
      const sections = ['about', 'work', 'contact'];
      let current = '';
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.2) {
            current = sectionId;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (!element) {
      if (href === '#' || href === '#top') {
        if (window.__lenis) {
          window.__lenis.scrollTo(0);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      return;
    }

    if (window.__lenis) {
      window.__lenis.scrollTo(element, { offset: -60 });
    } else {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'py-3.5 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
          : 'py-5 bg-transparent'
      }`}
    >
      <nav className="max-w-content mx-auto px-6 md:px-10 flex items-center justify-between relative">
        {/* Left: ZG Logo */}
        <Magnetic maxDistance={10}>
          <button
            onClick={() => scrollTo('#top')}
            aria-label="Go to top"
            className="group flex items-center gap-2 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center group-hover:border-primary transition-colors duration-300">
              <span className="font-heading font-bold text-lg text-primary tracking-tight">
                ZG
              </span>
            </div>
          </button>
        </Magnetic>

        {/* Center: Email with TextScramble (Desktop only) */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
          <Magnetic maxDistance={8}>
            <a
              href={`mailto:${PERSONAL_INFO.email}`}
              className="px-4 py-1.5 rounded-pill border border-border/60 bg-surface/40 hover:border-primary/60 hover:bg-surface/80 text-secondary hover:text-text text-xs tracking-wider transition-all duration-200 inline-flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <TextScramble text={PERSONAL_INFO.email} duration={400} />
            </a>
          </Magnetic>
        </div>

        {/* Right: Nav items + Theme toggle */}
        <div className="flex items-center gap-4 md:gap-8">
          <ul className="hidden md:flex items-center gap-7">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id} className="relative">
                  <Magnetic maxDistance={6}>
                    <button
                      onClick={() => scrollTo(item.href)}
                      className={`py-1 text-sm font-mono tracking-wider transition-colors duration-200 ${
                        isActive ? 'text-primary' : 'text-secondary hover:text-text'
                      }`}
                    >
                      <TextScramble text={item.label} duration={350} />
                    </button>
                  </Magnetic>

                  {/* Animated sliding underline */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full shadow-[0_0_8px_var(--primary-color)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          {/* Theme Toggle Button */}
          <Magnetic maxDistance={8}>
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2.5 rounded-xl bg-surface border border-border hover:border-primary text-secondary hover:text-primary transition-colors duration-200"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-primary" />
              ) : (
                <Moon className="w-4 h-4 text-primary" />
              )}
            </button>
          </Magnetic>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2.5 rounded-xl bg-surface border border-border text-secondary hover:text-primary transition-colors duration-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Animated Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden bg-surface/98 border-b border-border backdrop-blur-xl px-6 py-6"
          >
            <ul className="flex flex-col gap-4">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollTo(item.href)}
                    className="w-full text-left py-2 font-mono text-base text-text hover:text-primary transition-colors flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-4 h-4 text-secondary" />
                  </button>
                </li>
              ))}
              <li className="pt-2 border-t border-border/60">
                <a
                  href={`mailto:${PERSONAL_INFO.email}`}
                  className="font-mono text-xs text-primary flex items-center gap-2 py-2"
                >
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>{PERSONAL_INFO.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={PERSONAL_INFO.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 w-full text-center py-2.5 px-4 rounded-pill border border-primary text-primary font-mono text-xs uppercase tracking-wider"
                >
                  Download CV
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
