import React from 'react';
import { skillsData } from '../data/skillsData';

export default function Skills() {
  return (
    <section id="skills" className="pt-14 pb-8 scroll-mt-20">
      {/* Section Title */}
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-dashed border-ink-blue/25 pb-2 mb-8">
        <h2 className="font-typewriter text-3xl md:text-4xl text-ink-blue tracking-wide">
          <span className="text-ink-red text-2xl md:text-3xl mr-2">02 //</span>
          TECHNICAL SKILLS
        </h2>
        <span className="font-handwritten text-xl text-ink-muted -rotate-1">
          "tools of the craft" 🛠️
        </span>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        {skillsData.map((group, index) => (
          <div
            key={index}
            className="bg-white border border-ink-blue/25 rounded-[3px] p-6 shadow-sm relative"
          >
            {/* Folder tab title */}
            <div className="mb-4 pb-2 border-b border-ink-blue/15">
              <span className="font-typewriter text-lg font-bold text-ink-blue tracking-wider">
                [{group.category}]
              </span>
            </div>

            {/* Skill badges */}
            <div className="flex flex-wrap gap-2.5">
              {group.skills.map((skill, i) => (
                <span
                  key={i}
                  className="font-mono text-sm font-semibold text-ink-dark bg-[#f5f8fc] border border-dashed border-ink-blue px-3 py-1 rounded-[2px] transition-all hover:bg-ink-blue hover:text-white hover:border-solid hover:-translate-y-0.5 cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

