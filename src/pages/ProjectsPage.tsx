import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, CheckCircle2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { ProjectSystemPreview } from '../components/ProjectSystemPreview.tsx';

export const ProjectsPage: React.FC = () => {
  const { data, loading, theme } = usePortfolio();
  const isDark = theme === 'dark';
  const upperName = (data.profile.name || 'S HARI SHANKAR').toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="max-w-3xl">
        <p className="text-xs font-mono uppercase tracking-wider text-orange-500 dark:text-amber-400">
          {upperName} · Complete Project Portfolio
        </p>
        <h1 className="mt-2 text-3xl sm:text-5xl font-display font-bold tracking-tight text-balance">
          Projects & Detailed Case Studies
        </h1>
        <p
          className={`mt-4 text-base sm:text-lg leading-[1.8] ${
            isDark ? 'text-stone-300' : 'text-stone-600'
          }`}
        >
          All {data.projects.length} software projects engineered by {upperName} are
          presented below with live architectural previews, problem & solution
          breakdown, core features, and full case studies.
        </p>
      </div>

      {/* Complete Projects Grid — All 4 Projects Always Displayed */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-96 rounded-3xl border border-emerald-950 bg-[#111A15]/50 animate-pulse p-8"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {data.projects.map((project) => (
            <article
              key={project.id}
              className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-colors ${
                isDark
                  ? 'bg-[#111A15]/90 border-emerald-900/60 hover:border-emerald-500/60'
                  : 'bg-white border-stone-200 hover:border-emerald-600/60 shadow-sm'
              }`}
            >
              <div>
                {/* Interactive Animated System Visual */}
                <ProjectSystemPreview
                  slug={project.slug}
                  title={project.title}
                  isDark={isDark}
                />

                <div className="p-8 space-y-5">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold">
                      <Link
                        to={`/projects/${project.slug}`}
                        className="hover:text-emerald-500 transition-colors"
                      >
                        {project.title}
                      </Link>
                    </h2>

                    <p
                      className={`mt-3 text-base leading-[1.8] ${
                        isDark ? 'text-stone-200' : 'text-stone-700'
                      }`}
                    >
                      {project.fullDescription || project.shortDescription}
                    </p>
                  </div>

                  {/* Problem & Solution Summary Box so each project can be studied right away */}
                  <div
                    className={`p-4 rounded-2xl border space-y-2.5 text-sm ${
                      isDark
                        ? 'bg-[#0C1410] border-emerald-950/90 text-stone-300'
                        : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    <p className="leading-relaxed">
                      <span className="font-semibold text-orange-500 dark:text-amber-400">
                        Objective:{' '}
                      </span>
                      {project.problemGoal}
                    </p>
                    <p className="leading-relaxed">
                      <span className="font-semibold text-emerald-500 dark:text-emerald-400">
                        Solution:{' '}
                      </span>
                      {project.solution}
                    </p>
                  </div>

                  {/* Core Capabilities */}
                  {(project.features || []).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-mono uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
                        Key Capabilities
                      </p>
                      <ul className="space-y-2">
                        {project.features.map((feat, fIdx) => (
                          <li
                            key={fIdx}
                            className={`text-sm flex items-start gap-2.5 leading-relaxed ${
                              isDark ? 'text-stone-300' : 'text-stone-600'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Technical Stack Tags */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {(project.technicalStack || []).map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className={`px-3 py-1 rounded-lg text-xs font-mono ${
                          isDark
                            ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/50'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className={`px-8 py-5 border-t flex items-center justify-between gap-4 ${
                  isDark ? 'border-emerald-950/80 bg-[#0E1612]' : 'border-stone-200 bg-stone-50/70'
                }`}
              >
                <Link
                  to={`/projects/${project.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Study Full Case Study</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-4 text-xs font-medium">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-400 hover:text-orange-400 transition-colors whitespace-nowrap shrink-0"
                    >
                      GitHub Source ↗
                    </a>
                  )}
                  {project.liveUrl && project.liveUrl.trim() !== '' && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-500 hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
