import React from 'react';

export default function Footer({ onNavigateAdmin }) {
  return (
    <footer className="border-t border-ink-blue/20 bg-[#f8f9fa]/90 py-8 mt-12 relative z-10">
      <div className="max-w-[1140px] mx-auto px-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="font-mono text-sm mb-1">
            <span className="font-typewriter font-bold text-ink-blue">Bhavya Agarwal</span>
            <span className="mx-2">•</span>
            <span className="font-handwritten text-lg text-ink-muted">
              Handcrafted with code, curiosity &amp; coffee
            </span>
          </p>
          <div className="flex items-center gap-3">
            <p className="font-mono text-xs text-ink-muted">
              &copy; 2025 Bhavya Agarwal. All rights reserved.
            </p>
            <span className="text-ink-muted/40">•</span>
          </div>
        </div>

        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (window.location.hash) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }}
          className="font-mono text-xs sm:text-sm font-bold text-ink-blue border border-ink-blue px-3.5 py-1.5 rounded-[2px] hover:bg-ink-blue hover:text-white transition-all cursor-pointer bg-transparent"
        >
          [ &uarr; BACK TO TOP ]
        </button>
      </div>
    </footer>
  );
}
