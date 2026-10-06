import React, { useState, useEffect } from 'react';

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Clean any hash from URL on initial load
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'projects', 'skills', 'milestones', 'contact'];
      const scrollPos = window.scrollY + 140;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      const yOffset = -75;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);

    // Keep URL clean as http://localhost:3000
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const navItems = [
    { label: 'HOME', id: 'home' },
    { label: 'PROJECTS', id: 'projects' },
    { label: 'SKILLS', id: 'skills' },
    { label: 'HONORS', id: 'milestones' },
    { label: 'CONTACT', id: 'contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#f8f9fa]/95 backdrop-blur-sm pt-4">
      <div className="max-w-[1140px] mx-auto px-6 pb-3 flex justify-end items-center">

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden font-mono text-ink-blue font-bold text-sm tracking-wider cursor-pointer bg-transparent border-0 p-1"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? '[CLOSE]' : '[MENU]'}
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-5">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={(e) => scrollToSection(e, item.id)}
                className={`font-mono text-sm tracking-wider font-bold transition-all px-1 py-0.5 cursor-pointer bg-transparent border-0 ${
                  isActive
                    ? 'text-ink-dark drop-shadow-[0_0_1px_rgba(24,65,126,0.5)]'
                    : 'text-ink-blue hover:text-ink-dark'
                }`}
              >
                <span className={isActive ? 'text-ink-red' : 'text-ink-light/70'}>[</span>
                {item.label}
                <span className={isActive ? 'text-ink-red' : 'text-ink-light/70'}>]</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <nav className="md:hidden flex flex-col gap-4 bg-[#f8f9fa] border-b-2 border-ink-blue px-6 py-5 shadow-lg">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={(e) => scrollToSection(e, item.id)}
                className={`font-mono text-sm tracking-wider font-bold text-left cursor-pointer bg-transparent border-0 p-0 ${
                  isActive ? 'text-ink-dark' : 'text-ink-blue'
                }`}
              >
                <span className={isActive ? 'text-ink-red' : 'text-ink-light/70'}>[</span>
                {item.label}
                <span className={isActive ? 'text-ink-red' : 'text-ink-light/70'}>]</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Hand-drawn divider line */}
      <div className="w-full h-2 overflow-hidden text-ink-blue opacity-90">
        <svg className="w-full h-2" viewBox="0 0 1200 8" preserveAspectRatio="none">
          <path d="M0,4 Q150,1 300,5 T600,3 T900,5 T1200,4" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    </header>
  );
}
