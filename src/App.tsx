import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { CursorProvider } from './context/CursorContext';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { CustomCursor } from './components/common/CustomCursor';
import { IntroCurtain } from './components/common/IntroCurtain';
import { ScrollProgress } from './components/layout/ScrollProgress';
import { Navbar } from './components/layout/Navbar';
import { SocialRail } from './components/layout/SocialRail';
import { ResumePill } from './components/layout/ResumePill';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Services } from './components/sections/Services';
import { Experience } from './components/sections/Experience';
import { Footer } from './components/sections/Footer';

// Code-split below-the-fold heavy sections
const Work = lazy(() =>
  import('./components/sections/Work').then((module) => ({ default: module.Work }))
);
const TechStack = lazy(() =>
  import('./components/sections/TechStack').then((module) => ({ default: module.TechStack }))
);
const Contact = lazy(() =>
  import('./components/sections/Contact').then((module) => ({ default: module.Contact }))
);

const MainLayout: React.FC = () => {
  useSmoothScroll();
  const [isWorkActive, setIsWorkActive] = useState(false);

  // Idle Prefetcher: loads chunks when main thread is idle
  useEffect(() => {
    const prefetch = () => {
      import('./components/sections/Work');
      import('./components/sections/TechStack');
      import('./components/sections/Contact');
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prefetch, { timeout: 2500 });
    } else {
      setTimeout(prefetch, 1200);
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-text selection:bg-primary/20 selection:text-primary">
      {/* Page Load Intro Curtain */}
      <IntroCurtain onComplete={() => {}} />

      {/* Global Scroll Progress Bar (2px top) */}
      <ScrollProgress />

      {/* Custom Cursor System */}
      <CustomCursor />

      {/* Fixed UI */}
      <Navbar />
      <SocialRail />
      <ResumePill isWorkActive={isWorkActive} />

      {/* Main Single-Page Sections (with reserved left gutter on >= 1100px) */}
      <main className="w-full relative min-[1100px]:pl-16">
        <Hero />
        <About />
        <Services />
        <Experience />

        <Suspense fallback={<div className="min-h-[600px] w-full" />}>
          <Work onSectionActiveChange={setIsWorkActive} />
        </Suspense>

        <Suspense fallback={<div className="min-h-[600px] w-full" />}>
          <TechStack />
        </Suspense>

        <Suspense fallback={<div className="min-h-[400px] w-full" />}>
          <Contact />
        </Suspense>
      </main>

      {/* Footer */}
      <div className="min-[1100px]:pl-16">
        <Footer />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CursorProvider>
        <MainLayout />
      </CursorProvider>
    </ThemeProvider>
  );
};

export default App;
