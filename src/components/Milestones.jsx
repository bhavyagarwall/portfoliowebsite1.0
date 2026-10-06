import React, { useState, useEffect } from 'react';
import { getStoredMilestones, getStoredAchievements, subscribeDataChanges } from '../data/storage';

export default function Milestones() {
  const [flippedCards, setFlippedCards] = useState({});
  const [milestones, setMilestones] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    // Initial load
    setMilestones(getStoredMilestones());
    setAchievements(getStoredAchievements());

    // Subscribe to admin storage edits in real-time
    const unsubscribe = subscribeDataChanges(() => {
      setMilestones(getStoredMilestones());
      setAchievements(getStoredAchievements());
    });

    return () => unsubscribe();
  }, []);

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section id="milestones" className="pt-14 pb-8 scroll-mt-20">
      {/* Section Title & Achievements Bullets */}
      <div className="border-b-2 border-dashed border-ink-blue/25 pb-4 mb-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-typewriter text-3xl md:text-4xl text-ink-blue tracking-wide">
            <span className="text-ink-red text-2xl md:text-3xl mr-2">03 //</span>
            MILESTONES &amp; HONORS
          </h2>
          <span className="font-handwritten text-xl text-ink-muted -rotate-1">
            "hover card to reveal notes" ↺
          </span>
        </div>

        {/* Dynamic Achievements Bullet Points */}
        {achievements && achievements.length > 0 && (
          <ul className="mt-5 space-y-2.5 font-mono text-sm md:text-base text-[#1a2838]">
            {achievements.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-ink-red font-bold select-none">–</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Grid of 3D Flip Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {milestones.map((item) => {
          const isFlipped = flippedCards[item.id];

          return (
            <div
              key={item.id}
              onClick={() => toggleFlip(item.id)}
              className="group h-[240px] [perspective:1000px] cursor-pointer"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleFlip(item.id);
                }
              }}
            >
              <div
                className={`relative w-full h-full text-center transition-transform duration-700 [transform-style:preserve-3d] ${
                  isFlipped ? '[transform:rotateY(180deg)]' : 'group-hover:[transform:rotateY(180deg)]'
                }`}
              >
                {/* FRONT FACE: Icon & Heading ONLY */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white border border-ink-blue/25 rounded-[3px] p-5 shadow-card-soft flex flex-col items-center justify-center">
                  <span className="text-4xl mb-3">{item.icon}</span>
                  <h3 className="font-typewriter text-base sm:text-lg text-ink-blue leading-snug mb-2 font-bold">
                    {item.title}
                  </h3>
                  <span className="font-handwritten text-sm text-ink-muted opacity-80 mt-1">
                    [ hover to flip ↺ ]
                  </span>
                </div>

                {/* BACK FACE: Reveals details on hover/flip */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-card-yellow border-2 border-dashed border-ink-blue rounded-[3px] p-4 flex flex-col items-center justify-center gap-2 text-center shadow-card-soft">
                  <span className="font-typewriter text-[11px] font-bold text-ink-red tracking-widest border border-ink-red px-2 py-0.5">
                    {item.stamp}
                  </span>
                  <p className="font-mono text-xs leading-relaxed text-[#1a2838]">
                    {item.description}
                  </p>
                  <span className="font-mono text-xs font-bold text-ink-blue bg-ink-blue/10 px-2 py-0.5 rounded-[2px] mt-auto">
                    {item.tag}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
