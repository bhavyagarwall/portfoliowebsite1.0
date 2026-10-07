import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Milestones from './components/Milestones';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Admin from './components/Admin';
import { initCloudSync } from './data/storage';

// Clean Notebook Separator with Washi tape accent
function NotebookSeparator() {
  return (
    <div className="relative w-full h-[1px] bg-ink-blue/20 my-16">
      <span 
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-washi opacity-80 shadow-sm rotate-1 pointer-events-none" 
      />
    </div>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  useEffect(() => {
    // Start background sync with Supabase cloud database
    initCloudSync();

    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    const cleanHash = () => {
      if (window.location.pathname !== '/adminbhavya' && window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', cleanHash);
    cleanHash();

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', cleanHash);
    };
  }, []);

  const navigateTo = (path) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If visiting /adminbhavya, render the Admin dashboard
  if (currentPath === '/adminbhavya') {
    return <Admin onNavigateHome={() => navigateTo('/')} />;
  }

  // Otherwise render the main single-page portfolio
  return (
    <div className="min-h-screen bg-notebook text-ink-dark font-mono antialiased relative overflow-x-hidden selection:bg-ink-blue selection:text-white">
      {/* Red margin spine line */}
      <div className="hidden md:block fixed top-0 left-8 w-[1px] h-full bg-red-400/15 pointer-events-none z-0" />

      {/* Navigation */}
      <Navbar />

      {/* Main Container */}
      <main className="max-w-[1140px] mx-auto px-6 pb-16 relative z-10">
        <Hero />
        <NotebookSeparator />
        <Projects />
        <NotebookSeparator />
        <Skills />
        <NotebookSeparator />
        <Milestones />
        <NotebookSeparator />
        <Contact />
      </main>

      {/* Footer with Admin portal trigger */}
      <Footer onNavigateAdmin={() => navigateTo('/adminbhavya')} />
    </div>
  );
}
