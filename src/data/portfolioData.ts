import type { Project, Service, ExperienceItem, SkillCategory } from '../types';

export const PERSONAL_INFO = {
  name: 'Ziad Gamal',
  title: 'Flutter Developer',
  location: 'Menoufia, Egypt',
  email: 'ziadgamal.work@gmail.com',
  github: 'https://github.com/Ziad-Gamal12',
  linkedin: 'https://linkedin.com/in/ziad-gamal-54b052375/',
  cvUrl: '/Ziad_Gamal_CV.pdf',
  summary:
    'Flutter Developer with 2+ years of hands-on experience building cross-platform mobile and web apps using Dart and Flutter. Built a 77-screen multilingual educational platform and data-driven admin systems using BLoC/Cubit, MVVM/Clean Architecture, Firebase, Supabase, REST APIs, and payment integrations. Focused on scalable architecture, responsive UI, secure access control, and maintainable code.',
  education: {
    institution: 'Menoufia University',
    faculty: 'Faculty of Computers & Information',
    degree: "Bachelor's (in progress)",
    location: 'Shebin El-Kom, Egypt',
    expectedGraduation: 'Expected graduation 2030',
  },
  languages: [
    { language: 'Arabic', proficiency: 'Native' },
    { language: 'English', proficiency: 'Professional Working Proficiency' },
  ],
};

export const STATS = [
  { value: 77, suffix: '', label: 'Screens in Sintir' },
  { value: 3, suffix: '', label: 'App languages' },
  { value: 5, suffix: '', label: 'Projects' },
  { value: 2, suffix: '+', label: 'Years of Flutter' },
];

export const SERVICES: Service[] = [
  {
    number: '01',
    title: 'MOBILE DEVELOPMENT (FLUTTER)',
    tagline: 'Cross-platform apps built with Dart and Flutter.',
    bullets: [
      'Multilingual apps (Arabic, English, French) with light/dark themes',
      'Responsive & adaptive UI and custom animations',
      'Payment gateway integration (Paymob, Fawaterak)',
      'Device-based authentication and screenshot prevention',
    ],
  },
  {
    number: '02',
    title: 'FLUTTER WEB & ADMIN PANELS',
    tagline: 'Data-driven dashboards for running real products.',
    bullets: [
      'Role-Based Access Control with granular view/edit permissions',
      'Real-time CRUD modules for destinations, bookings, courses and users',
      'Search, filtering, support tickets and messaging',
      'Responsive sidebar dashboards deployed on Vercel',
    ],
  },
  {
    number: '03',
    title: 'ARCHITECTURE & BACKEND INTEGRATION',
    tagline: 'Scalable, maintainable code from day one.',
    bullets: [
      'MVVM, Clean Architecture and Repository Pattern',
      'BLoC/Cubit with GetIt dependency injection',
      'Firebase (Auth, Firestore, Cloud Storage, FCM) and Supabase (Storage, Edge Functions)',
      'REST and third-party API integration',
    ],
  },
];

export const EXPERIENCES: ExperienceItem[] = [
  {
    id: 'exp-1',
    period: 'Feb 2026 – Apr 2026',
    role: 'Flutter Web Developer',
    project: 'SINTIR ADMIN PANEL',
    description:
      'Responsive web admin platform for courses, users, payments, analytics and support.',
  },
  {
    id: 'exp-2',
    period: 'Jul 2025 – Dec 2025',
    role: 'Flutter Web Developer',
    project: 'IN EGYPT ADMIN PANEL',
    description:
      'Web management system for tourism operations with real-time CRUD for destinations and bookings.',
  },
  {
    id: 'exp-3',
    period: 'Jul 2025 – Sep 2025',
    role: 'Flutter Developer',
    project: 'IN EGYPT',
    description:
      'Tourism platform connecting travelers with cultural landmarks, with a multi-step booking flow.',
  },
  {
    id: 'exp-4',
    period: 'May 2025 – Jun 2025',
    role: 'Flutter Developer',
    project: 'FRUITHUB',
    description:
      'E-commerce app covering onboarding, product browsing, cart and orders.',
  },
  {
    id: 'exp-5',
    period: 'Jan 2024 – Dec 2025',
    role: 'Flutter Developer',
    project: 'SINTIR',
    description:
      '77-screen educational app in Arabic, English and French with separate student & instructor flows.',
  },
];

export const PROJECTS: Project[] = [
  {
    id: 'sintir-mobile',
    number: '01',
    name: 'Sintir',
    role: 'Flutter Developer',
    date: 'Jan 2024 – Dec 2025',
    tag: 'Mobile · Education',
    shortDescription:
      '77-screen educational app in Arabic/English/French with light/dark themes and separate student & instructor flows.',
    fullDescription: [
      'Developed a 77-screen educational application supporting Arabic, English, and French, with light/dark themes and dedicated student and instructor workflows.',
      'Built course, content, and assessment management workflows, including lectures, videos, enrollment, timed exams, attempt limits, mistake tracking, and performance analytics.',
      'Integrated Paymob-backed payment and wallet workflows for course purchases, wallet balances, payout requests, and transaction status tracking.',
      'Implemented device-based authentication and screenshot prevention mechanisms to protect educational content.',
    ],
    techTags: ['Flutter', 'Dart', 'BLoC/Cubit', 'Clean Architecture', 'Paymob'],
    githubUrl: 'https://github.com/Ziad-Gamal12/Sintir',
    logo: '/projects/sintir-logo.webp',
    coverGradient: 'from-[#171A2E] via-[#2A1D4A] to-[#141226]',
    highlights: [
      '77 screens with Arabic, English & French support',
      'Paymob wallet, checkout & payout tracking',
      'Timed exams, mistake review & student analytics',
      'Screenshot prevention & hardware device locking',
    ],
    accentColor: '#5B8CFF',
    keyFacts: [
      '77 screens',
      '3 languages',
      'Paymob wallet',
      'Screenshot protection',
    ],
  },
  {
    id: 'sintir-admin',
    number: '02',
    name: 'Sintir Admin Panel',
    role: 'Flutter Web Developer',
    date: 'Feb 2026 – Apr 2026',
    tag: 'Web · Admin',
    shortDescription:
      'Responsive web admin platform for courses, users, payments, analytics and support across the Sintir ecosystem.',
    fullDescription: [
      'Developed a responsive Flutter Web admin platform for managing courses, users, payments, analytics, and support operations across the Sintir educational ecosystem.',
      'Architected the application using MVVM, BLoC/Cubit, GetIt, and GoRouter, integrating Firebase Authentication, Cloud Firestore, Supabase Storage, and Supabase Edge Functions.',
      'Implemented database-driven Role-Based Access Control (RBAC) with granular view/edit permissions and immediate session invalidation when user permissions change.',
      'Built course and user management workflows, search and filtering, support tickets, messaging, enrollment analytics, and backend-driven payment and wallet monitoring.',
    ],
    techTags: [
      'Flutter Web',
      'MVVM',
      'BLoC/Cubit',
      'GetIt',
      'GoRouter',
      'Firebase',
      'Supabase',
    ],
    githubUrl: 'https://github.com/Ziad-Gamal12/Sintir_DashBoard',
    logo: '/projects/sintir-logo.webp',
    coverGradient: 'from-[#121B2B] via-[#1E2E4A] to-[#0F1424]',
    highlights: [
      'Database-driven RBAC with instant session revocation',
      'Courses, users, enrollments & payments management',
      'Firebase Auth & Firestore + Supabase Storage & Edge Functions',
      'Full search, filtering, support tickets & messaging',
    ],
    accentColor: '#36C5D6',
    keyFacts: [
      'RBAC',
      'Edge Functions',
      'Payments monitoring',
      'Support tickets',
    ],
  },
  {
    id: 'in-egypt-mobile',
    number: '03',
    name: 'In Egypt',
    role: 'Flutter Developer',
    date: 'Jul 2025 – Sep 2025',
    tag: 'Mobile · Tourism',
    shortDescription:
      'Tourism platform connecting travelers with cultural landmarks with multi-step booking and personalized dashboards.',
    fullDescription: [
      'Developed a comprehensive tourism platform connecting travelers with cultural landmarks, featuring a multi-step booking flow and personalized user dashboards.',
      'Implemented search and filtering functionality with optimized list rendering across multiple device breakpoints.',
      'Integrated Fawaterak Payment Gateway and social authentication (Google/Facebook) to streamline the user onboarding and reservation process.',
    ],
    techTags: ['Flutter', 'Dart', 'Fawaterak', 'Google/Facebook Sign-in'],
    githubUrl: 'https://github.com/Ziad-Gamal12/In_Egypt',
    logo: '/projects/inegypt-logo.webp',
    coverGradient: 'from-[#2B2314] via-[#4A3B1E] to-[#1A160F]',
    highlights: [
      'Multi-step booking flow & landmark discovery',
      'Fawaterak payment gateway integration',
      'Google & Facebook social login',
      'Adaptive layouts optimized across breakpoints',
    ],
    accentColor: '#E9B44C',
    keyFacts: [
      'Multi-step booking',
      'Fawaterak',
      'Google/Facebook sign-in',
    ],
  },
  {
    id: 'in-egypt-admin',
    number: '04',
    name: 'In Egypt Admin Panel',
    role: 'Flutter Web Developer',
    date: 'Jul 2025 – Dec 2025',
    tag: 'Web · Admin',
    shortDescription:
      'Web management system for tourism operations with real-time CRUD for destinations and bookings, deployed on Vercel.',
    fullDescription: [
      'Built a responsive Web-based management system to oversee tourism operations, featuring real-time CRUD modules for destination and booking management.',
      'Implemented Role-Based Access Control (RBAC) to secure administrative actions and guest record oversight.',
      'Deployed the Flutter Web admin panel on Vercel with a responsive sidebar-based dashboard architecture.',
    ],
    techTags: ['Flutter Web', 'RBAC', 'Vercel'],
    githubUrl: 'https://github.com/Ziad-Gamal12/In-Egypt-Admin-Panel',
    demoUrl: 'https://in-egypt-admin-panel.vercel.app',
    logo: '/projects/inegypt-logo.webp',
    coverGradient: 'from-[#1B2421] via-[#2A3E38] to-[#121A18]',
    highlights: [
      'Real-time CRUD operations for destinations & reservations',
      'Role-Based Access Control (RBAC) for administration',
      'Responsive sidebar dashboard architecture',
      'Continuous deployment live on Vercel',
    ],
    accentColor: '#D98F4E',
    keyFacts: [
      'Real-time CRUD',
      'RBAC',
      'Deployed on Vercel',
    ],
  },
  {
    id: 'fruithub-mobile',
    number: '05',
    name: 'FruitHub',
    role: 'Flutter Developer',
    date: 'May 2025 – Jun 2025',
    tag: 'Mobile · E-commerce',
    shortDescription:
      'E-commerce app: onboarding, product browsing, cart, and orders with Hive & Firebase integration.',
    fullDescription: [
      'Developed an E-Commerce application covering onboarding, product browsing, cart management, and order workflows.',
      'Implemented high-speed local storage using Hive and SharedPreferences for cart persistence and data caching.',
      'Integrated Firebase Authentication, Cloud Firestore, and Cloud Storage for user authentication, order data, and media management.',
      'Architected a Feature-First structure (Data/Domain/Presentation) to ensure code maintainability and scalable feature growth.',
    ],
    techTags: ['Flutter', 'Hive', 'SharedPreferences', 'Firebase'],
    githubUrl: 'https://github.com/Ziad-Gamal12/FruitHub',
    logo: '/projects/fruithub-logo.webp',
    coverGradient: 'from-[#2A161E] via-[#4A1E2B] to-[#190F14]',
    highlights: [
      'Feature-First Architecture (Data / Domain / Presentation)',
      'High-speed cart persistence & caching with Hive',
      'Firebase Auth, Firestore & Cloud Storage',
      'Complete checkout, browsing & order lifecycle',
    ],
    accentColor: '#7BC96F',
    keyFacts: [
      'Hive + SharedPreferences',
      'Firebase',
      'Feature-first architecture',
    ],
  },
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    category: 'LANGUAGES & FRAMEWORKS',
    skills: [
      { name: 'Dart', icon: 'SiDart', iconType: 'si' },
      { name: 'Flutter', icon: 'SiFlutter', iconType: 'si' },
    ],
  },
  {
    category: 'STATE MANAGEMENT',
    skills: [
      { name: 'BLoC', icon: 'SiFlutter', iconType: 'si' },
      { name: 'Cubit', icon: 'Layers', iconType: 'lucide' },
      { name: 'Provider', icon: 'Box', iconType: 'lucide' },
    ],
  },
  {
    category: 'ARCHITECTURE & PRINCIPLES',
    skills: [
      { name: 'Clean Architecture', icon: 'Boxes', iconType: 'lucide' },
      { name: 'MVVM', icon: 'Workflow', iconType: 'lucide' },
      { name: 'Repository Pattern', icon: 'Database', iconType: 'lucide' },
      { name: 'SOLID', icon: 'ShieldCheck', iconType: 'lucide' },
      { name: 'OOP', icon: 'Code2', iconType: 'lucide' },
      { name: 'Dependency Injection', icon: 'Cpu', iconType: 'lucide' },
    ],
  },
  {
    category: 'BACKEND & APIS',
    skills: [
      { name: 'Firebase (Auth, Firestore, Cloud Storage, FCM)', icon: 'SiFirebase', iconType: 'si' },
      { name: 'Supabase (Storage, Edge Functions)', icon: 'SiSupabase', iconType: 'si' },
      { name: 'REST APIs', icon: 'Globe', iconType: 'lucide' },
      { name: 'Third-party APIs', icon: 'Server', iconType: 'lucide' },
    ],
  },
  {
    category: 'LOCAL STORAGE',
    skills: [
      { name: 'Hive', icon: 'HardDrive', iconType: 'lucide' },
      { name: 'SharedPreferences', icon: 'Save', iconType: 'lucide' },
    ],
  },
  {
    category: 'NAVIGATION & DI',
    skills: [
      { name: 'GoRouter', icon: 'Compass', iconType: 'lucide' },
      { name: 'GetIt', icon: 'Share2', iconType: 'lucide' },
    ],
  },
  {
    category: 'DEVELOPMENT TOOLS',
    skills: [
      { name: 'Git', icon: 'SiGit', iconType: 'si' },
      { name: 'GitHub', icon: 'SiGithub', iconType: 'si' },
      { name: 'Postman', icon: 'SiPostman', iconType: 'si' },
      { name: 'Android Studio', icon: 'SiAndroidstudio', iconType: 'si' },
      { name: 'VS Code', icon: 'Code', iconType: 'lucide' },
      { name: 'Figma', icon: 'SiFigma', iconType: 'si' },
    ],
  },
  {
    category: 'MOBILE CAPABILITIES',
    skills: [
      { name: 'Responsive & Adaptive UI', icon: 'Smartphone', iconType: 'lucide' },
      { name: 'Localization', icon: 'Languages', iconType: 'lucide' },
      { name: 'Custom Animations', icon: 'Sparkles', iconType: 'lucide' },
      { name: 'Payment Gateway Integration', icon: 'CreditCard', iconType: 'lucide' },
    ],
  },
];
