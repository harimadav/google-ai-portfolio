import React from 'react';
import { Briefcase } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.tsx';

export const ExperiencePage: React.FC = () => {
  const { data, theme } = usePortfolio();
  const isDark = theme === 'dark';
  const upperName = (data.profile.name || 'S HARI SHANKAR').toUpperCase();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-14">
      {/* Header */}
      <div className="max-w-3xl">
        <p className="text-xs font-mono uppercase tracking-wider text-orange-500 dark:text-amber-400">
          {upperName} · Practical Training
        </p>
        <h1 className="mt-2 text-3xl sm:text-5xl font-display font-bold tracking-tight text-balance">
          Internships & Industry Experience
        </h1>
        <p
          className={`mt-4 text-base sm:text-lg leading-[1.8] ${
            isDark ? 'text-stone-300' : 'text-stone-600'
          }`}
        >
          Real-world experience gained through software development internships and
          in-plant industrial training.
        </p>
      </div>

      {/* Clear, Friendly Experience Cards */}
      <div className="relative space-y-8">
        {data.experience.map((exp) => (
          <article
            key={exp.id}
            className={`p-8 rounded-3xl border transition-colors ${
              isDark
                ? 'bg-[#111A15]/90 border-emerald-900/60'
                : 'bg-white border-stone-200 shadow-sm'
            }`}
          >
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4 ${
                isDark ? 'border-emerald-950/80' : 'border-stone-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-sm font-semibold text-emerald-500 dark:text-emerald-400">
                  {exp.organization}
                </span>
              </div>
              <span
                className={`text-xs font-mono px-3 py-1 rounded-md tabular-nums self-start sm:self-auto ${
                  isDark
                    ? 'bg-orange-500/15 text-amber-300'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                {exp.startDate}
                {exp.endDate && exp.endDate !== exp.startDate
                  ? ` – ${exp.endDate}`
                  : ''}
              </span>
            </div>

            <h2 className="mt-5 text-2xl font-display font-bold">{exp.role}</h2>

            <p
              className={`mt-3 text-base leading-[1.8] ${
                isDark ? 'text-stone-200' : 'text-stone-700'
              }`}
            >
              {exp.description}
            </p>

            {(exp.responsibilities || []).length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-mono uppercase tracking-wider text-orange-500 dark:text-amber-400 mb-3">
                  What I Did & Learned
                </p>
                <ul className="space-y-2.5">
                  {exp.responsibilities.map((resp, rIdx) => (
                    <li
                      key={rIdx}
                      className={`text-base flex items-start gap-3 leading-[1.75] ${
                        isDark ? 'text-stone-300' : 'text-stone-600'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(exp.technologies || []).length > 0 && (
              <div
                className={`mt-6 pt-4 border-t flex flex-wrap items-center gap-2 text-xs font-mono ${
                  isDark
                    ? 'border-emerald-950/70 text-emerald-400'
                    : 'border-stone-200 text-emerald-700'
                }`}
              >
                <span className="text-stone-400">Key Areas:</span>
                <span>{exp.technologies.join(' · ')}</span>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};
