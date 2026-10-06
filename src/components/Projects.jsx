import React, { useState, useEffect } from 'react';
import { getStoredProjects, subscribeDataChanges } from '../data/storage';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Initial load
    setProjects(getStoredProjects());

    // Subscribe to admin storage edits in real-time
    const unsubscribe = subscribeDataChanges(() => {
      setProjects(getStoredProjects());
    });

    return () => unsubscribe();
  }, []);

  // Compute available categories dynamically
  const categories = [
    { id: 'all', label: '[ALL]' },
    { id: 'ai-ml', label: '[AI / ML]' },
    { id: 'fullstack', label: '[FULL STACK]' },
    { id: 'systems', label: '[ALGO & TOOLS]' },
  ];

  // Also include any custom categories that user added
  projects.forEach((p) => {
    if (p.category && !categories.some((c) => c.id === p.category)) {
      categories.push({
        id: p.category,
        label: `[${(p.categoryLabel || p.category).toUpperCase()}]`
      });
    }
  });

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter((p) => p.category === filter);

  return (
    <section id="projects" className="pt-14 pb-8 scroll-mt-20">
      {/* Section Title */}
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-dashed border-ink-blue/25 pb-2 mb-8">
        <h2 className="font-typewriter text-3xl md:text-4xl text-ink-blue tracking-wide">
          <span className="text-ink-red text-2xl md:text-3xl mr-2">01 //</span>
          SELECTED PROJECTS
        </h2>
        <span className="font-handwritten text-xl text-ink-muted -rotate-1">
          "built from scratch with clean code" ✨
        </span>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2.5 mb-8">
        {categories.map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id)}
            className={`font-mono text-sm font-bold px-4 py-1.5 rounded-[2px] transition-all border border-ink-blue cursor-pointer ${
              filter === btn.id
                ? 'bg-ink-blue text-white shadow-[2px_2px_0px_rgba(15,44,89,0.3)]'
                : 'bg-transparent text-ink-blue hover:bg-ink-blue hover:text-white'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-8 border border-dashed border-ink-blue/30 text-center font-mono text-ink-muted">
          No projects found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="relative bg-white p-7 rounded-[3px] border border-ink-blue/20 shadow-card-soft hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(24,65,126,0.15)] transition-all duration-300 flex flex-col"
            >
              {/* Washi tape on top */}
              <div 
                className="absolute -top-2 left-7 w-20 h-4 bg-washi opacity-85 -rotate-1 pointer-events-none"
                style={{ clipPath: 'polygon(0% 0%, 100% 4%, 97% 100%, 3% 96%)' }}
              />

              {/* Header info */}
              <div className="flex justify-between items-center mb-3">
                <span className="font-mono text-xs font-bold text-ink-red tracking-widest">
                  {project.id}
                </span>
                <span className="font-mono text-xs font-bold bg-ink-blue/10 text-ink-blue px-2 py-0.5 rounded-[2px]">
                  {project.categoryLabel || project.category}
                </span>
              </div>

              {/* Title & description */}
              <h3 className="font-typewriter text-xl text-ink-blue mb-2.5 leading-snug">
                {project.title}
              </h3>
              <p className="font-mono text-sm leading-relaxed text-[#1a2838] mb-4">
                {project.description}
              </p>

              {/* Highlights */}
              {project.highlights && project.highlights.length > 0 && (
                <div className="flex flex-col gap-1 text-xs text-ink-muted mb-5 border-l-2 border-ink-blue/30 pl-3">
                  {project.highlights.map((h, i) => (
                    <span key={i} className="leading-snug">
                      • {h}
                    </span>
                  ))}
                </div>
              )}

              {/* Tech tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-auto mb-5">
                  {project.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="font-mono text-xs bg-[#f0f4f9] text-ink-dark border border-ink-blue/15 px-2 py-0.5 rounded-[2px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Links */}
              <div className="flex items-center gap-4 pt-3 border-t border-dashed border-ink-blue/20">
                {project.githubUrl && project.githubUrl !== '#' && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm font-bold text-ink-blue hover:text-ink-red transition-colors"
                  >
                    [ GitHub Repo &rarr; ]
                  </a>
                )}
                {project.liveUrl && project.liveUrl !== '#' && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm font-bold text-ink-blue hover:text-ink-red transition-colors"
                  >
                    [ Live Demo &#x2197; ]
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
