import React from 'react';
import { GraduationCap } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.tsx';

export const EducationPage: React.FC = () => {
  const { data, theme } = usePortfolio();
  const isDark = theme === 'dark';
  const upperName = (data.profile.name || 'S HARI SHANKAR').toUpperCase();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-14">
      {/* Header */}
      <div className="max-w-3xl">
        <p className="text-xs font-mono uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
          {upperName} · Academic Background
        </p>
        <h1 className="mt-2 text-3xl sm:text-5xl font-display font-bold tracking-tight text-balance">
          Education & Academic Record
        </h1>
        <p
          className={`mt-4 text-base sm:text-lg leading-[1.8] ${
            isDark ? 'text-stone-300' : 'text-stone-600'
          }`}
        >
          My degree program in Computer Science and Engineering along with my senior
          secondary and high school academic milestones.
        </p>
      </div>

      {/* Clean, Welcoming Academic Cards */}
      <div className="space-y-8">
        {data.education.map((edu) => (
          <article
            key={edu.id}
            className={`p-8 rounded-3xl border ${
              isDark
                ? 'bg-[#111A15]/90 border-emerald-900/60'
                : 'bg-white border-stone-200 shadow-sm'
            }`}
          >
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-5 ${
                isDark ? 'border-emerald-950/80' : 'border-stone-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-sm font-medium text-stone-400">
                  {edu.startDate} – {edu.endDate}
                </span>
              </div>

              <span
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold tabular-nums self-start sm:self-auto ${
                  isDark
                    ? 'bg-orange-500/15 text-amber-300 border border-orange-500/30'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                {edu.academicInformation}
              </span>
            </div>

            <div className="mt-5">
              <h2 className="text-2xl font-display font-bold">{edu.program}</h2>
              <p
                className={`mt-1.5 text-base font-semibold ${
                  isDark ? 'text-emerald-400' : 'text-emerald-700'
                }`}
              >
                {edu.institution}
              </p>
            </div>

            <p
              className={`mt-4 text-base leading-[1.8] ${
                isDark ? 'text-stone-300' : 'text-stone-600'
              }`}
            >
              {edu.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
};
