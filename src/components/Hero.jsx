import React, { useState, useEffect } from 'react';

export default function Hero() {
  const [photoSrc, setPhotoSrc] = useState('profile.jpg');

  useEffect(() => {
    // Check if profile.heic is available and convert via heic2any
    const loadHeicImage = async () => {
      try {
        const response = await fetch('profile.heic');
        if (response.ok) {
          const blob = await response.blob();
          const heic2any = (await import('heic2any')).default;
          const convertedBlob = await heic2any({
            blob,
            toType: 'image/jpeg',
            quality: 0.92
          });
          const url = URL.createObjectURL(convertedBlob);
          setPhotoSrc(url);
        }
      } catch (err) {
        // Fallback to jpg or sample image
        console.log('Using default JPG portrait');
      }
    };

    loadHeicImage();
  }, []);

  return (
    <section id="home" className="pt-10 pb-8 scroll-mt-24">
      {/* Title Area */}
      <div className="mb-9">
        <p className="font-typewriter text-2xl text-ink-blue mb-0.5 tracking-wide">
          hi, i'm
        </p>
        <h1 className="font-typewriter text-5xl sm:text-6xl md:text-7xl font-bold text-ink-blue tracking-tight leading-none mb-3 drop-shadow-[0.5px_0.5px_0_rgba(15,44,89,0.25)]">
          Bhavya Agarwal
        </h1>
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs sm:text-sm font-bold text-ink-blue tracking-widest uppercase mb-1">
          <span>CS STUDENT</span>
          <span className="text-ink-light">•</span>
          <span>SOFTWARE DEVELOPER</span>
          <span className="text-ink-light">•</span>
          <span>AI/ML ENTHUSIAST</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs sm:text-sm font-bold text-ink-blue/95 tracking-widest uppercase">
          <span>PROBLEM SOLVER</span>
          <span className="text-ink-light">•</span>
          <span>PRODUCT EXPLORER</span>
        </div>
      </div>

      {/* Hero Content: Polaroid Photo Left, Bio Right */}
      <div className="grid grid-cols-1 md:grid-cols-[310px_1fr] gap-10 md:gap-14 items-start mt-4">
        
        {/* POLAROID PHOTO WRAPPER */}
        <div className="relative w-full max-w-[290px] mx-auto md:mx-0">
          {/* Washi tape snippet at top-left */}
          <div 
            className="absolute -top-3 left-4 w-24 h-7 bg-washi z-10 opacity-90 shadow-sm -rotate-[9deg] pointer-events-none"
            style={{
              clipPath: 'polygon(0% 4%, 2% 0%, 98% 3%, 100% 92%, 97% 99%, 4% 96%)'
            }}
          />

          {/* Doodle spark rays */}
          <div className="absolute -top-4 -right-3 text-ink-blue opacity-80 z-10 pointer-events-none" aria-hidden="true">
            <svg viewBox="0 0 45 45" width="36" height="36">
              <path d="M 5,20 L 25,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M 8,28 L 30,28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M 6,38 L 24,44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {/* Polaroid Frame */}
          <div className="bg-white p-3 pb-5 rounded-[2px] shadow-polaroid border border-black/10 -rotate-[2.5deg] hover:rotate-0 hover:scale-[1.02] transition-all duration-300">
            <div className="w-full aspect-[4/4.7] overflow-hidden bg-slate-100 border border-black/5">
              <img
                src={photoSrc}
                alt="Bhavya Agarwal"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'profile-sample.jpg';
                }}
              />
            </div>
            <div className="text-center pt-2.5">
              <span className="font-handwritten text-lg text-ink-muted tracking-wide">
                bhavya_2025.raw
              </span>
            </div>
          </div>
        </div>

        {/* BIO & ACTION BUTTONS */}
        <div className="flex flex-col gap-5 pt-1">
          <p className="font-mono text-base leading-relaxed text-[#1a2838] max-w-2xl">
            I'm a B.Tech Computer Science student at Thapar Institute of Engineering &amp; Technology, 
            passionate about building useful products, solving real-world problems with code, and exploring AI/ML.
          </p>

          <p className="font-mono text-base leading-relaxed text-[#1a2838] max-w-2xl">
            I enjoy working on projects that combine technology, design and impact — from web applications 
            for students to AI/ML projects in computer vision and NLP.
          </p>

          <p className="font-mono text-base leading-relaxed text-[#1a2838] max-w-2xl">
            Outside academics, you'll usually find me solving DSA problems, experimenting with new technologies, 
            designing UIs or at the gym.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <button
              onClick={() => {
                const el = document.getElementById('projects');
                if (el) {
                  const y = el.getBoundingClientRect().top + window.pageYOffset - 75;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
                if (window.location.hash) {
                  window.history.replaceState(null, '', window.location.pathname);
                }
              }}
              className="inline-flex items-center justify-center gap-2 font-mono text-sm sm:text-base font-bold px-6 py-3 bg-ink-blue text-white border-2 border-ink-blue shadow-btn-ink hover:bg-ink-dark hover:border-ink-dark hover:shadow-btn-ink-hover hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <span>View My Projects</span>
              <span>&rarr;</span>
            </button>

            <a
              href="Bhavya_Agarwal_Resume.pdf"
              download="Bhavya_Agarwal_Resume.pdf"
              className="inline-flex items-center justify-center gap-2 font-mono text-sm sm:text-base font-bold px-6 py-3 bg-transparent text-ink-blue border-2 border-ink-blue shadow-[2px_2px_0px_rgba(24,65,126,0.2)] hover:bg-ink-blue/5 hover:text-ink-dark hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              <span>Download Resume</span>
              <span>&darr;</span>
            </a>
          </div>

          {/* Social Badges Row */}
          <div className="flex items-center gap-2 mt-1">
            {/* GitHub */}
            <a
              href="https://github.com/bhavyagarwall"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-ink-blue font-bold text-base hover:text-ink-dark hover:-translate-y-0.5 transition-all p-1"
              title="GitHub Profile"
            >
              <span className="text-ink-blue">[</span>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span className="text-ink-blue">]</span>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/bhavyaagarwal24/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-ink-blue font-bold text-base hover:text-ink-dark hover:-translate-y-0.5 transition-all p-1"
              title="LinkedIn Profile"
            >
              <span className="text-ink-blue">[</span>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.39 9.74v-8.37H5.07v8.37h2.78z"/>
              </svg>
              <span className="text-ink-blue">]</span>
            </a>

            {/* LeetCode */}
            <a
              href="https://leetcode.com/u/bhavyaagarwall/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-ink-blue font-bold text-base hover:text-ink-dark hover:-translate-y-0.5 transition-all p-1"
              title="LeetCode Profile"
            >
              <span className="text-ink-blue">[</span>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.26a1.38 1.38 0 0 0-.004 1.954l5.412 5.42a1.38 1.38 0 0 0 1.952 0l5.414-5.42a1.38 1.38 0 0 0 0-1.954L14.484.438A1.375 1.375 0 0 0 13.483 0zm-5.01 10.428l-4.475 4.485a1.38 1.38 0 0 0 0 1.953l5.414 5.42a1.38 1.38 0 0 0 1.952 0l4.475-4.485-1.952-1.954-3.498 3.508-3.462-3.466 3.462-3.467-1.916-1.994z"/>
              </svg>
              <span className="text-ink-blue">]</span>
            </a>

            {/* Email */}
            <a
              href="mailto:bhavya.agarwal.career@gmail.com"
              className="inline-flex items-center gap-1 font-mono text-ink-blue font-bold text-base hover:text-ink-dark hover:-translate-y-0.5 transition-all p-1"
              title="Send Email"
            >
              <span className="text-ink-blue">[</span>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <span className="text-ink-blue">]</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}

