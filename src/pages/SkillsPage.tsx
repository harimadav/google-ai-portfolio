import React from 'react';
import { Award } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { groupSkillsByCategory } from '../utils/portfolioLogic.ts';

const FRIENDLY_CATEGORY_MAP: Record<string, string> = {
  'Software Engineering & Development': 'Web & Software Development',
  'Data, Analytics & Databases': 'Data & Databases',
  'Automation & Workflows': 'Smart Automation & Tools',
  'Soft Skills & Leadership': 'Problem Solving & Teamwork',
};

const FRIENDLY_SKILL_NAME_MAP: Record<string, string> = {
  'Full-Stack Web Application Design': 'Full-Stack Web Development',
  'Design and Analysis of Algorithms': 'Algorithms & Data Structures',
  'Fault-Tolerant Systems Research': 'Reliable System Design',
  'MongoDB & Database Management': 'MongoDB & SQL Databases',
  'Predictive Analytics & Sensor Data Visualization': 'Data Analysis & Live Dashboards',
  'Geospatial Image Analysis': 'Satellite & Geospatial Image Analysis',
  'Robotic Process Automation (UiPath)': 'Workflow Automation (UiPath)',
  'Industrial & Software Development Workflows': 'Git, Version Control & Project Workflows',
};

export const SkillsPage: React.FC = () => {
  const { data, theme } = usePortfolio();
  const isDark = theme === 'dark';
  const upperName = (data.profile.name || 'S HARI SHANKAR').toUpperCase();

  const groupedSkills = groupSkillsByCategory(data.skills);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Header */}
      <div className="max-w-3xl">
        <p className="text-xs font-mono uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
          {upperName} · Technical Strengths
        </p>
        <h1 className="mt-2 text-3xl sm:text-5xl font-display font-bold tracking-tight text-balance">
          Skills & Strengths
        </h1>
        <p
          className={`mt-4 text-base sm:text-lg leading-[1.8] ${
            isDark ? 'text-stone-300' : 'text-stone-600'
          }`}
        >
          Practical technologies, development tools, and teamwork strengths I use to
          build reliable applications and solve real-world problems.
        </p>
      </div>

      {/* Categorized Skills with Friendly, Ready-to-Use Headings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Object.entries(groupedSkills).map(([category, items]) => {
          const friendlyCategory = FRIENDLY_CATEGORY_MAP[category] || category;
          return (
            <section
              key={category}
              className={`p-8 rounded-3xl border ${
                isDark
                  ? 'bg-[#111A15]/90 border-emerald-900/60'
                  : 'bg-white border-stone-200 shadow-sm'
              }`}
            >
              <div
                className={`flex items-center justify-between border-b pb-4 ${
                  isDark ? 'border-emerald-950/80' : 'border-stone-200'
                }`}
              >
                <h2 className="text-2xl font-display font-bold text-emerald-500 dark:text-emerald-400">
                  {friendlyCategory}
                </h2>
                <span className="text-xs font-mono text-orange-500 dark:text-amber-400 tabular-nums">
                  {items.length} {items.length === 1 ? 'skill' : 'skills'}
                </span>
              </div>

              <div
                className={`mt-6 divide-y ${
                  isDark ? 'divide-emerald-950/60' : 'divide-stone-200'
                }`}
              >
                {items.map((skill) => {
                  const friendlyName = FRIENDLY_SKILL_NAME_MAP[skill.name] || skill.name;
                  return (
                    <div key={skill.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-base sm:text-lg font-semibold">
                          {friendlyName}
                        </h3>
                        {skill.featured && (
                          <span
                            className={`text-xs font-mono px-2.5 py-0.5 rounded-md shrink-0 ${
                              isDark
                                ? 'bg-orange-500/15 text-amber-300'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            Ready to Use
                          </span>
                        )}
                      </div>
                      {skill.description && (
                        <p
                          className={`mt-2 text-sm sm:text-base leading-[1.75] ${
                            isDark ? 'text-stone-300' : 'text-stone-600'
                          }`}
                        >
                          {skill.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Achievements & Recognition */}
      {(data.about.achievements || []).length > 0 && (
        <section className="space-y-6 pt-4">
          <div
            className={`border-b pb-4 ${
              isDark ? 'border-emerald-950/80' : 'border-stone-200'
            }`}
          >
            <p className="text-xs font-mono uppercase tracking-wider text-orange-500 dark:text-amber-400">
              Honours & Awards
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-display font-bold">
              Hackathon Wins & Best Paper Recognition
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.about.achievements.map((ach, idx) => (
              <div
                key={idx}
                className={`p-7 rounded-3xl border ${
                  isDark
                    ? 'bg-[#111A15]/90 border-emerald-900/60'
                    : 'bg-white border-stone-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-mono text-orange-500 dark:text-amber-400">
                  <Award className="w-4 h-4 shrink-0" />
                  <span>{ach.organization}</span>
                </div>
                <h3 className="mt-3 text-lg font-display font-bold">{ach.title}</h3>
                <p
                  className={`mt-2 text-sm sm:text-base leading-[1.75] ${
                    isDark ? 'text-stone-300' : 'text-stone-600'
                  }`}
                >
                  {ach.detail}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
