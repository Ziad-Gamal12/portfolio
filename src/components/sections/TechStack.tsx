import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  SiDart,
  SiFlutter,
  SiFirebase,
  SiSupabase,
  SiGit,
  SiGithub,
  SiPostman,
  SiAndroidstudio,
  SiFigma,
} from 'react-icons/si';
import { TbBrandVscode } from 'react-icons/tb';
import {
  Layers,
  Box,
  Component,
  Route,
  Workflow,
  Database,
  Save,
  Globe,
  Server,
  Boxes,
  Kanban,
  FolderGit2,
  ShieldCheck,
  Code2,
  Cpu,
  MonitorSmartphone,
  Languages,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { SpotlightHeading } from '../common/SpotlightHeading';
import { Reveal } from '../common/Reveal';
import { useCursor } from '../../context/CursorContext';
import { useTheme } from '../../context/ThemeContext';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { DottedGlobeCanvas, type ActiveTileInfo } from '../common/DottedGlobeCanvas';

interface SkillItem {
  id: string;
  name: string;
  displayName: string[];
  brandColor: string;
  isBrandSvg?: boolean;
  isTool: boolean;
  url?: string;
  ariaLabel: string;
  icon: React.ReactNode;
  row: number; // 0, 1, 2, 3 in desktop layout
  col: number;
}

// Exact 29 skills in descending rows (10, 8, 6, 5)
const SKILLS: SkillItem[] = [
  // --- ROW 1 (10) ---
  {
    id: 'dart',
    name: 'Dart',
    displayName: ['Dart'],
    brandColor: '#00B4AB',
    isBrandSvg: true,
    isTool: true,
    url: 'https://dart.dev',
    ariaLabel: 'Dart official site',
    icon: <SiDart className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 0,
    col: 0,
  },
  {
    id: 'flutter',
    name: 'Flutter',
    displayName: ['Flutter'],
    brandColor: '#54C5F8',
    isBrandSvg: true,
    isTool: true,
    url: 'https://flutter.dev',
    ariaLabel: 'Flutter official site',
    icon: <SiFlutter className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 0,
    col: 1,
  },
  {
    id: 'bloc',
    name: 'BLoC',
    displayName: ['BLoC'],
    brandColor: '#8B5CF6',
    isBrandSvg: false,
    isTool: true,
    url: 'https://bloclibrary.dev',
    ariaLabel: 'BLoC Library official site',
    icon: <Layers className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 0,
    col: 2,
  },
  {
    id: 'cubit',
    name: 'Cubit',
    displayName: ['Cubit'],
    brandColor: '#38BDF8',
    isBrandSvg: false,
    isTool: false,
    ariaLabel: 'Cubit state management',
    icon: <Box className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 0,
    col: 3,
  },
  {
    id: 'provider',
    name: 'Provider',
    displayName: ['Provider'],
    brandColor: '#818CF8',
    isBrandSvg: false,
    isTool: false,
    ariaLabel: 'Provider state management',
    icon: <Component className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 0,
    col: 4,
  },
  {
    id: 'firebase',
    name: 'Firebase',
    displayName: ['Firebase'],
    brandColor: '#FFA611',
    isBrandSvg: true,
    isTool: true,
    url: 'https://firebase.google.com',
    ariaLabel: 'Firebase official site',
    icon: <SiFirebase className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 0,
    col: 5,
  },
  {
    id: 'supabase',
    name: 'Supabase',
    displayName: ['Supabase'],
    brandColor: '#3ECF8E',
    isBrandSvg: true,
    isTool: true,
    url: 'https://supabase.com',
    ariaLabel: 'Supabase official site',
    icon: <SiSupabase className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 0,
    col: 6,
  },
  {
    id: 'gorouter',
    name: 'GoRouter',
    displayName: ['GoRouter'],
    brandColor: '#0284C7',
    isBrandSvg: false,
    isTool: true,
    url: 'https://pub.dev/packages/go_router',
    ariaLabel: 'GoRouter package documentation',
    icon: <Route className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 0,
    col: 7,
  },
  {
    id: 'getit',
    name: 'GetIt',
    displayName: ['GetIt'],
    brandColor: '#F472B6',
    isBrandSvg: false,
    isTool: true,
    url: 'https://pub.dev/packages/get_it',
    ariaLabel: 'GetIt package documentation',
    icon: <Workflow className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 0,
    col: 8,
  },
  {
    id: 'hive',
    name: 'Hive',
    displayName: ['Hive'],
    brandColor: '#FBBF24',
    isBrandSvg: false,
    isTool: true,
    url: 'https://docs.hivedb.dev',
    ariaLabel: 'Hive Database documentation',
    icon: <Database className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 0,
    col: 9,
  },

  // --- ROW 2 (8) ---
  {
    id: 'shared-preferences',
    name: 'SharedPreferences',
    displayName: ['Shared', 'Preferences'],
    brandColor: '#A3E635',
    isBrandSvg: false,
    isTool: false,
    ariaLabel: 'SharedPreferences local storage',
    icon: <Save className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 1,
    col: 0,
  },
  {
    id: 'rest-apis',
    name: 'REST APIs',
    displayName: ['REST APIs'],
    brandColor: '#38BDF8',
    isBrandSvg: false,
    isTool: false,
    ariaLabel: 'REST APIs integration',
    icon: <Globe className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 1,
    col: 1,
  },
  {
    id: 'third-party-apis',
    name: 'Third-party APIs',
    displayName: ['Third-party', 'APIs'],
    brandColor: '#818CF8',
    isBrandSvg: false,
    isTool: false,
    ariaLabel: 'Third-party API integration',
    icon: <Server className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 1,
    col: 2,
  },
  {
    id: 'clean-architecture',
    name: 'Clean Architecture',
    displayName: ['Clean', 'Architecture'],
    brandColor: '#B79CFF',
    isBrandSvg: false,
    isTool: false,
    ariaLabel: 'Clean Architecture paradigm',
    icon: <Boxes className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 1,
    col: 3,
  },
  {
    id: 'mvvm',
    name: 'MVVM',
    displayName: ['MVVM'],
    brandColor: '#7DD3FC',
    isBrandSvg: false,
    isTool: false,
    ariaLabel: 'Model-View-ViewModel architecture',
    icon: <Kanban className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 1,
    col: 4,
  },
  {
    id: 'repository-pattern',
    name: 'Repository Pattern',
    displayName: ['Repository', 'Pattern'],
    brandColor: '#A78BFA',
    isBrandSvg: false,
    isTool: false,
    ariaLabel: 'Repository design pattern',
    icon: <FolderGit2 className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 1,
    col: 5,
  },
  {
    id: 'solid',
    name: 'SOLID',
    displayName: ['SOLID'],
    brandColor: '#34D399',
    isBrandSvg: false,
    isTool: false,
    ariaLabel: 'SOLID principles',
    icon: <ShieldCheck className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 1,
    col: 6,
  },
  {
    id: 'oop',
    name: 'OOP',
    displayName: ['OOP'],
    brandColor: '#F472B6',
    isBrandSvg: false,
    isTool: false,
    ariaLabel: 'Object-Oriented Programming',
    icon: <Code2 className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 1,
    col: 7,
  },

  // --- ROW 3 (6) ---
  {
    id: 'dependency-injection',
    name: 'Dependency Injection',
    displayName: ['Dependency', 'Injection'],
    brandColor: '#38BDF8',
    isBrandSvg: false,
    isTool: false,
    ariaLabel: 'Dependency Injection',
    icon: <Cpu className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 2,
    col: 0,
  },
  {
    id: 'git',
    name: 'Git',
    displayName: ['Git'],
    brandColor: '#F05032',
    isBrandSvg: true,
    isTool: true,
    url: 'https://git-scm.com',
    ariaLabel: 'Git official site',
    icon: <SiGit className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 2,
    col: 1,
  },
  {
    id: 'github',
    name: 'GitHub',
    displayName: ['GitHub'],
    brandColor: 'currentColor',
    isBrandSvg: true,
    isTool: true,
    url: 'https://github.com',
    ariaLabel: 'GitHub official site',
    icon: <SiGithub className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 2,
    col: 2,
  },
  {
    id: 'postman',
    name: 'Postman',
    displayName: ['Postman'],
    brandColor: '#FF6C37',
    isBrandSvg: true,
    isTool: true,
    url: 'https://www.postman.com',
    ariaLabel: 'Postman official site',
    icon: <SiPostman className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 2,
    col: 3,
  },
  {
    id: 'android-studio',
    name: 'Android Studio',
    displayName: ['Android', 'Studio'],
    brandColor: '#3DDC84',
    isBrandSvg: true,
    isTool: true,
    url: 'https://developer.android.com/studio',
    ariaLabel: 'Android Studio official site',
    icon: <SiAndroidstudio className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 2,
    col: 4,
  },
  {
    id: 'vscode',
    name: 'VS Code',
    displayName: ['VS Code'],
    brandColor: '#007ACC',
    isBrandSvg: true,
    isTool: true,
    url: 'https://code.visualstudio.com',
    ariaLabel: 'Visual Studio Code official site',
    icon: <TbBrandVscode className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 2,
    col: 5,
  },

  // --- ROW 4 (5) ---
  {
    id: 'figma',
    name: 'Figma',
    displayName: ['Figma'],
    brandColor: '#F24E1E',
    isBrandSvg: true,
    isTool: true,
    url: 'https://www.figma.com',
    ariaLabel: 'Figma official site',
    icon: <SiFigma className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 3,
    col: 0,
  },
  {
    id: 'responsive-ui',
    name: 'Responsive & Adaptive UI',
    displayName: ['Responsive', '& Adaptive'],
    brandColor: '#38BDF8',
    isBrandSvg: false,
    isTool: false,
    ariaLabel: 'Responsive & Adaptive UI design',
    icon: <MonitorSmartphone className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 3,
    col: 1,
  },
  {
    id: 'localization',
    name: 'Localization',
    displayName: ['Localization'],
    brandColor: '#F43F5E',
    isBrandSvg: false,
    isTool: false,
    ariaLabel: 'App Localization',
    icon: <Languages className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 3,
    col: 2,
  },
  {
    id: 'custom-animations',
    name: 'Custom Animations',
    displayName: ['Custom', 'Animations'],
    brandColor: '#FBBF24',
    isBrandSvg: false,
    isTool: false,
    ariaLabel: 'Custom Flutter Animations',
    icon: <Sparkles className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 3,
    col: 3,
  },
  {
    id: 'payment-gateway',
    name: 'Payment Gateway Integration',
    displayName: ['Payment', 'Gateways'],
    brandColor: '#34D399',
    isBrandSvg: false,
    isTool: false,
    ariaLabel: 'Payment Gateway Integration',
    icon: <CreditCard className="w-7 h-7 sm:w-[30px] sm:h-[30px]" />,
    row: 3,
    col: 4,
  },
];

// 40 deterministic twinkling stars
const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  top: (i * 19 + 7) % 94 + 3,
  left: (i * 23 + 11) % 94 + 3,
  size: i % 3 === 0 ? 2.5 : i % 2 === 0 ? 2 : 1.5,
  duration: 2.2 + (i % 4) * 0.8,
  delay: (i % 5) * 0.6,
  color: i % 4 === 0 ? '#7DD3FC' : '#B79CFF',
}));

// Pre-computed scatter offsets (±40px)
const SCATTER_OFFSETS = [
  { x: -28, y: -34 },
  { x: 18, y: -38 },
  { x: -35, y: -20 },
  { x: 32, y: -25 },
  { x: -15, y: -39 },
  { x: 26, y: -32 },
  { x: -38, y: -14 },
  { x: 37, y: -18 },
  { x: -22, y: -35 },
  { x: 30, y: -28 },
  { x: -36, y: -8 },
  { x: 12, y: -16 },
  { x: -18, y: 14 },
  { x: 22, y: 12 },
  { x: -28, y: 22 },
  { x: 34, y: 18 },
  { x: -38, y: 26 },
  { x: 16, y: 28 },
  { x: -14, y: 34 },
  { x: 28, y: 32 },
  { x: -32, y: 36 },
  { x: 38, y: 35 },
  { x: -24, y: 38 },
  { x: 19, y: 39 },
  { x: -36, y: 40 },
  { x: 25, y: 38 },
  { x: -18, y: 36 },
  { x: 33, y: 37 },
  { x: -8, y: 40 },
];

// Pre-computed idle float parameters (±4px, 4.5–7s)
const FLOAT_PARAMS = [
  { y: 3.5, duration: 5.2, delay: 0.2 },
  { y: -4.0, duration: 6.1, delay: 0.8 },
  { y: 3.0, duration: 4.8, delay: 1.4 },
  { y: -3.5, duration: 5.7, delay: 0.5 },
  { y: 4.0, duration: 6.4, delay: 1.1 },
  { y: -3.0, duration: 4.9, delay: 1.7 },
  { y: 3.8, duration: 5.5, delay: 0.3 },
  { y: -4.0, duration: 6.8, delay: 0.9 },
  { y: 3.2, duration: 4.6, delay: 1.5 },
  { y: -3.6, duration: 5.9, delay: 0.7 },
  { y: 3.9, duration: 6.3, delay: 1.2 },
  { y: -3.2, duration: 5.0, delay: 0.4 },
  { y: 4.0, duration: 6.6, delay: 1.0 },
  { y: -3.8, duration: 4.7, delay: 1.6 },
  { y: 3.4, duration: 5.4, delay: 0.6 },
  { y: -4.0, duration: 6.0, delay: 1.3 },
  { y: 3.7, duration: 5.1, delay: 0.1 },
  { y: -3.5, duration: 6.7, delay: 0.8 },
  { y: 4.0, duration: 4.5, delay: 1.4 },
  { y: -3.1, duration: 5.8, delay: 0.5 },
  { y: 3.6, duration: 6.2, delay: 1.1 },
  { y: -4.0, duration: 5.3, delay: 0.3 },
  { y: 3.3, duration: 4.8, delay: 1.7 },
  { y: -3.7, duration: 6.5, delay: 0.9 },
  { y: 3.9, duration: 5.6, delay: 0.2 },
  { y: -4.0, duration: 6.9, delay: 1.5 },
  { y: 3.5, duration: 4.7, delay: 0.7 },
  { y: -3.3, duration: 5.2, delay: 1.3 },
  { y: 4.0, duration: 6.0, delay: 0.4 },
];

export const TechStack: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: false, margin: '-60px' });
  const prefersReduced = usePrefersReducedMotion();
  const { setCursor, resetCursor } = useCursor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Responsive layout state
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return 1200;
    return window.innerWidth;
  });

  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hover state
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  const [touchActiveId, setTouchActiveId] = useState<string | null>(null);

  // Active Tile for Dotted Globe Arc Connection
  const [activeTileInfo, setActiveTileInfo] = useState<ActiveTileInfo | null>(null);

  const hoveredSkill = useMemo(
    () => SKILLS.find((s) => s.id === hoveredSkillId),
    [hoveredSkillId]
  );

  // Mouse Parallax (desktop fine pointer only)
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });
  const rectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);

  const updateRect = () => {
    if (sectionRef.current) {
      const r = sectionRef.current.getBoundingClientRect();
      rectRef.current = {
        left: r.left + window.scrollX,
        top: r.top + window.scrollY,
        width: r.width,
        height: r.height,
      };
    }
  };

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, { passive: true });
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReduced || isTouchDevice || !rectRef.current) return;
    const { left, top, width, height } = rectRef.current;
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const normX = Math.max(-1, Math.min(1, (e.pageX - centerX) / (width / 2)));
    const normY = Math.max(-1, Math.min(1, (e.pageY - centerY) / (height / 2)));
    setMouseParallax({ x: normX, y: normY });
  };

  const handleMouseLeave = () => {
    setMouseParallax({ x: 0, y: 0 });
    setHoveredSkillId(null);
    setActiveTileInfo(null);
    resetCursor();
  };

  // Shooting Star Streak every ~7-10s
  const [shootingStar, setShootingStar] = useState<{ id: number; top: number; left: number } | null>(null);

  useEffect(() => {
    if (prefersReduced || !isInView) return;

    let timeoutId: number;
    const triggerStar = () => {
      const delay = 7000 + Math.random() * 3000;
      timeoutId = window.setTimeout(() => {
        setShootingStar({
          id: Date.now(),
          top: 15 + Math.random() * 35,
          left: 65 + Math.random() * 25,
        });

        setTimeout(() => {
          setShootingStar(null);
        }, 1300);

        triggerStar();
      }, delay);
    };

    triggerStar();
    return () => clearTimeout(timeoutId);
  }, [isInView, prefersReduced]);

  // Break skills into rows depending on viewport
  const displayRows = useMemo(() => {
    if (windowWidth >= 1024) {
      // Desktop inverted pyramid: 10, 8, 6, 5
      return [
        SKILLS.slice(0, 10),
        SKILLS.slice(10, 18),
        SKILLS.slice(18, 24),
        SKILLS.slice(24, 29),
      ];
    } else if (windowWidth >= 640) {
      // Tablet: 6 per row
      const result: SkillItem[][] = [];
      for (let i = 0; i < SKILLS.length; i += 6) {
        result.push(SKILLS.slice(i, i + 6));
      }
      return result;
    } else if (windowWidth > 360) {
      // Mobile: 4 per row
      const result: SkillItem[][] = [];
      for (let i = 0; i < SKILLS.length; i += 4) {
        result.push(SKILLS.slice(i, i + 4));
      }
      return result;
    } else {
      // Small mobile <= 360px: 3 per row
      const result: SkillItem[][] = [];
      for (let i = 0; i < SKILLS.length; i += 3) {
        result.push(SKILLS.slice(i, i + 3));
      }
      return result;
    }
  }, [windowWidth]);

  // Calculate distance from grid center for staggered entrance
  const getCenterDistance = useCallback((rowIdx: number, colIdx: number, totalCols: number) => {
    const centerRow = 1.5;
    const centerCol = (totalCols - 1) / 2;
    const dRow = rowIdx - centerRow;
    const dCol = colIdx - centerCol;
    return Math.sqrt(dRow * dRow + dCol * dCol);
  }, []);

  const handleTileActivate = (skill: SkillItem, el: HTMLElement) => {
    setHoveredSkillId(skill.id);
    setCursor('magnetic');

    const rect = el.getBoundingClientRect();
    const resolvedColor =
      skill.brandColor === 'currentColor'
        ? isDark
          ? '#FFFFFF'
          : '#1E1B2E'
        : skill.brandColor;

    setActiveTileInfo({
      id: skill.id,
      brandColor: resolvedColor,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  };

  const handleTileDeactivate = () => {
    setHoveredSkillId(null);
    setActiveTileInfo(null);
    resetCursor();
  };

  // Dynamic Ambient Aura tint
  const activeOrbTint = hoveredSkill
    ? hoveredSkill.brandColor === 'currentColor'
      ? isDark
        ? '#FFFFFF'
        : '#1E1B2E'
      : hoveredSkill.brandColor
    : '#B79CFF';

  return (
    <section
      id="tech"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="py-28 lg:py-36 relative select-none"
      style={{ overflowX: 'clip' }}
    >
      {/* SVG Gradient definitions for Concept and Non-Brand Icons on hover */}
      <svg width="0" height="0" className="absolute pointer-events-none -z-50">
        <defs>
          <linearGradient id="lilac-sky-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B79CFF" />
            <stop offset="100%" stopColor="#7DD3FC" />
          </linearGradient>
        </defs>
      </svg>

      {/* ================= 1. AMBIENT AURA (wide radial gradient filling section) ================= */}
      <div
        className="absolute inset-0 pointer-events-none -z-20 transition-all duration-500"
        style={{
          background: `radial-gradient(ellipse 75% 65% at 50% 55%, ${activeOrbTint}35 0%, rgba(125, 211, 252, 0.08) 45%, transparent 75%)`,
          opacity: 1,
        }}
      />

      {/* ================= 2. TWINKLING STARS (~40 dots across section) ================= */}
      {!prefersReduced && (
        <div className="absolute inset-0 pointer-events-none -z-20 overflow-hidden">
          {STARS.map((star) => (
            <motion.span
              key={star.id}
              animate={
                isInView
                  ? {
                      opacity: [0.2, 0.9, 0.2],
                      scale: [0.8, 1.2, 0.8],
                    }
                  : { opacity: 0.2 }
              }
              transition={{
                duration: star.duration,
                repeat: Infinity,
                delay: star.delay,
                ease: 'easeInOut',
              }}
              className="absolute rounded-full"
              style={{
                top: `${star.top}%`,
                left: `${star.left}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                backgroundColor: star.color,
                boxShadow: `0 0 6px ${star.color}`,
              }}
            />
          ))}
        </div>
      )}

      {/* ================= 3. SHOOTING STAR STREAK ================= */}
      <AnimatePresence>
        {shootingStar && !prefersReduced && (
          <motion.div
            key={shootingStar.id}
            initial={{
              x: 0,
              y: 0,
              opacity: 0,
              scaleX: 0.3,
            }}
            animate={{
              x: -260,
              y: 200,
              opacity: [0, 1, 0.9, 0],
              scaleX: [0.3, 1, 1, 0.3],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute pointer-events-none z-0"
            style={{
              top: `${shootingStar.top}%`,
              left: `${shootingStar.left}%`,
              transform: 'rotate(-38deg)',
              transformOrigin: 'right center',
            }}
          >
            <div className="w-[120px] h-[1.5px] bg-gradient-to-l from-white via-[#B79CFF] to-transparent rounded-full shadow-[0_0_8px_#B79CFF]" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-content mx-auto px-6 md:px-10 relative z-10">
        {/* Section tag (kept exact: 05 — TECH STACK) */}
        <Reveal>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-xs md:text-sm text-primary tracking-widest font-semibold uppercase">
              05 — TECH STACK
            </span>
            <div className="h-[1px] w-12 bg-primary/40" />
          </div>
        </Reveal>

        {/* Section Title (compact spacing, max ≈48px gap to grid) */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <SpotlightHeading
            text="SKILLS & TECHNOLOGIES"
            as="h2"
            className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight"
          />
        </div>

        {/* Central Display Area: Dotted Globe Scene directly behind the Grid */}
        <div className="relative flex items-center justify-center min-h-[520px]">
          {/* ================= 4. CANVAS 2D DOTTED GLOBE SCENE ================= */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
            <motion.div
              style={{
                x: -mouseParallax.x * 20,
                y: -mouseParallax.y * 20,
              }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            >
              <DottedGlobeCanvas
                activeTile={activeTileInfo}
                isDarkTheme={isDark}
              />
            </motion.div>
          </div>

          {/* ================= 5. THE INVERTED PYRAMID TILE GRID ================= */}
          <motion.div
            style={{
              x: mouseParallax.x * 10,
              y: mouseParallax.y * 10,
            }}
            transition={{ type: 'spring', stiffness: 150, damping: 22 }}
            className="relative z-10 flex flex-col items-center gap-3 w-full py-4"
          >
            {displayRows.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className="flex items-center justify-center flex-wrap gap-2.5 sm:gap-3"
              >
                {row.map((skill, colIdx) => {
                  const globalIdx = SKILLS.findIndex((s) => s.id === skill.id);
                  const isHovered = hoveredSkillId === skill.id || touchActiveId === skill.id;
                  const isDimmed = hoveredSkillId !== null && !isHovered;

                  const centerDist = getCenterDistance(rowIdx, colIdx, row.length);
                  const entranceDelay = centerDist * 0.025;

                  const scatter = SCATTER_OFFSETS[globalIdx % SCATTER_OFFSETS.length];
                  const floatParam = FLOAT_PARAMS[globalIdx % FLOAT_PARAMS.length];

                  return (
                    <SkillTile
                      key={skill.id}
                      skill={skill}
                      isHovered={isHovered}
                      isDimmed={isDimmed}
                      isDarkTheme={isDark}
                      entranceDelay={entranceDelay}
                      scatter={scatter}
                      float={floatParam}
                      isInView={isInView}
                      prefersReduced={prefersReduced}
                      onActivate={handleTileActivate}
                      onDeactivate={handleTileDeactivate}
                      onTouchTap={() => {
                        setTouchActiveId(skill.id);
                        setTimeout(() => setTouchActiveId(null), 600);
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ================= INDIVIDUAL SKILL TILE =================
interface SkillTileProps {
  skill: SkillItem;
  isHovered: boolean;
  isDimmed: boolean;
  isDarkTheme: boolean;
  entranceDelay: number;
  scatter: { x: number; y: number };
  float: { y: number; duration: number; delay: number };
  isInView: boolean;
  prefersReduced: boolean;
  onActivate: (skill: SkillItem, el: HTMLElement) => void;
  onDeactivate: () => void;
  onTouchTap: () => void;
}

const SkillTile: React.FC<SkillTileProps> = ({
  skill,
  isHovered,
  isDimmed,
  isDarkTheme,
  entranceDelay,
  scatter,
  float,
  isInView,
  prefersReduced,
  onActivate,
  onDeactivate,
  onTouchTap,
}) => {
  const tileRef = useRef<any>(null);

  const handleMouseEnter = () => {
    if (tileRef.current) {
      onActivate(skill, tileRef.current);
    }
  };

  const handleFocus = () => {
    if (tileRef.current) {
      onActivate(skill, tileRef.current);
    }
  };

  // Common interactive wrapper classes
  const tileClasses = `
    group relative flex flex-col items-center justify-center
    w-[64px] h-[64px] sm:w-[80px] sm:h-[80px]
    rounded-[14px]
    transition-[border-color,box-shadow,opacity] duration-250
    will-change-transform cursor-pointer outline-none
    ${
      isHovered
        ? 'border-[#B79CFF] shadow-[0_0_24px_rgba(183,156,255,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] z-20'
        : 'border-white/[0.12] dark:border-white/[0.12] border-black/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
    }
  `;

  // Transparent glass tile so the dotted globe shows through
  const glassStyle: React.CSSProperties = {
    backgroundColor: isHovered
      ? 'rgba(183, 156, 255, 0.16)'
      : isDarkTheme
      ? 'rgba(255, 255, 255, 0.07)'
      : 'rgba(15, 17, 23, 0.04)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderWidth: '1px',
    borderStyle: 'solid',
  };

  // Resolve Icon style & color:
  // Brand SVGs: crossfade to official brand color (or currentColor for GitHub)
  // Non-brand / concepts: on hover paint with lilac->sky-blue gradient stroke
  const isSvg = skill.isBrandSvg;
  let iconColor: string | undefined = undefined;
  let iconFilter: string | undefined = undefined;
  let iconStroke: string | undefined = undefined;

  if (isHovered) {
    if (isSvg) {
      iconColor =
        skill.brandColor === 'currentColor'
          ? isDarkTheme
            ? '#FFFFFF'
            : '#1E1B2E'
          : skill.brandColor;
      iconFilter = 'none';
    } else {
      iconColor = '#B79CFF';
      iconStroke = 'url(#lilac-sky-gradient)';
      iconFilter = 'drop-shadow(0 0 6px rgba(183,156,255,0.5))';
    }
  } else {
    // Default monochrome off-white at ~75% in dark theme, dark gray in light theme
    iconColor = isDarkTheme ? 'rgba(230, 232, 238, 0.75)' : 'rgba(30, 27, 46, 0.70)';
    iconFilter = 'grayscale(100%)';
  }

  // Content inside the tile
  const tileContent = (
    <>
      {/* Icon */}
      <div
        className="flex items-center justify-center transition-all duration-200 mb-1"
        style={{
          color: iconColor,
          filter: iconFilter,
          stroke: iconStroke,
          transform: isHovered ? 'scale(1.10)' : 'scale(1)',
        }}
      >
        <span>{skill.icon}</span>
      </div>

      {/* Label: 10px (9px on mobile), max 2 lines, centered */}
      <div
        className="font-mono text-[9px] sm:text-[10px] leading-[1.15] text-center font-medium max-w-[58px] sm:max-w-[70px] select-none transition-colors duration-200"
        style={{
          color: isHovered
            ? isDarkTheme
              ? '#E6E8EE'
              : '#1E1B2E'
            : isDarkTheme
            ? '#A3A9B8'
            : '#5B6173',
        }}
      >
        {skill.displayName.map((line, idx) => (
          <span key={idx} className="block whitespace-nowrap">
            {line}
          </span>
        ))}
      </div>
    </>
  );

  // Entrance animation: scatter in from random offsets (±40px, scale 0.6, opacity 0)
  const initialAnim = prefersReduced
    ? { opacity: 0 }
    : {
        x: scatter.x,
        y: scatter.y,
        scale: 0.6,
        opacity: 0,
      };

  // Idle float at full opacity 1, dim to ~55% when another tile is hovered
  let animateTarget: any;
  if (prefersReduced) {
    animateTarget = {
      opacity: isDimmed ? 0.55 : 1,
    };
  } else if (isHovered) {
    animateTarget = {
      x: 0,
      y: -8,
      scale: 1.12,
      opacity: 1,
    };
  } else if (isDimmed) {
    animateTarget = {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 0.55,
    };
  } else {
    animateTarget = {
      x: 0,
      y: isInView ? [0, float.y, -float.y, 0] : 0,
      scale: 1,
      opacity: 1,
    };
  }

  const transitionSettings: any = prefersReduced
    ? { duration: 0.4, delay: entranceDelay * 0.5 }
    : isHovered || isDimmed
    ? {
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1],
      }
    : {
        x: { type: 'spring', stiffness: 280, damping: 22, delay: entranceDelay },
        scale: { type: 'spring', stiffness: 280, damping: 22, delay: entranceDelay },
        opacity: { duration: 0.4, delay: entranceDelay },
        y: {
          duration: float.duration,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: entranceDelay + float.delay,
        },
      };

  // Tool tiles are links with external targets; Concept tiles are interactive buttons
  if (skill.isTool && skill.url) {
    return (
      <motion.a
        ref={tileRef}
        href={skill.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={skill.ariaLabel}
        initial={initialAnim}
        animate={isInView ? animateTarget : initialAnim}
        transition={transitionSettings}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onDeactivate}
        onFocus={handleFocus}
        onBlur={onDeactivate}
        onTouchStart={onTouchTap}
        style={glassStyle}
        className={tileClasses}
      >
        {tileContent}
      </motion.a>
    );
  }

  return (
    <motion.div
      ref={tileRef}
      role="button"
      tabIndex={0}
      aria-label={skill.ariaLabel}
      initial={initialAnim}
      animate={isInView ? animateTarget : initialAnim}
      transition={transitionSettings}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onDeactivate}
      onFocus={handleFocus}
      onBlur={onDeactivate}
      onTouchStart={onTouchTap}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleFocus();
        }
      }}
      style={glassStyle}
      className={tileClasses}
    >
      {tileContent}
    </motion.div>
  );
};
