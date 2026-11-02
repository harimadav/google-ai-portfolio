import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { ProjectItem } from '../types/portfolio.ts';
import { ProjectSystemPreview } from '../components/ProjectSystemPreview.tsx';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, theme } = usePortfolio();
  const isDark = theme === 'dark';
  const upperName = (data.profile.name || 'S HARI SHANKAR').toUpperCase();

  const existingFromContext = data.projects.find((p) => p.slug === slug);
  const [project, setProject] = useState<ProjectItem | null>(existingFromContext || null);
  const [loading, setLoading] = useState<boolean>(!existingFromContext);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    if (!slug) return;
    const found = data.projects.find((p) => p.slug === slug);
    if (found) {
      setProject(found);
      setLoading(false);
      setNotFound(false);
      document.title = `${found.title} — Case Study | ${upperName}`;
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetch(`/api/projects/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Not found');
        }
        return res.json();
      })
      .then((proj: ProjectItem) => {
        if (!cancelled) {
          setProject(proj);
          setNotFound(false);
          document.title = `${proj.title} — Case Study | ${upperName}`;
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, data.projects, upperName]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <div className="h-8 w-48 bg-emerald-950 rounded animate-pulse" />
        <div className="h-14 w-3/4 bg-emerald-950 rounded animate-pulse" />
        <div className="h-64 w-full bg-[#111A15] rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-6">
        <p className="text-xs font-mono text-orange-500">Case Study Not Found</p>
        <h1 className="text-3xl font-display font-bold">
          The requested project case study could not be found.
        </h1>
        <p className="text-sm text-stone-400">
          It may have been renamed or set to draft.
        </p>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Back navigation */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-mono text-stone-400 hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Projects</span>
        </Link>
      </div>

      {/* Case Study Header */}
      <header
        className={`space-y-6 border-b pb-8 ${
          isDark ? 'border-emerald-950/80' : 'border-stone-200'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-500 dark:text-emerald-400">
          <span>{upperName}</span>
          <span aria-hidden="true">·</span>
          <span>Project Case Study</span>
          <span aria-hidden="true">·</span>
          <span>{(project.technicalStack || []).join(' · ')}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-balance">
          {project.title}
        </h1>

        <div className="rounded-3xl overflow-hidden border border-emerald-900/60">
          <ProjectSystemPreview
            slug={project.slug}
            title={project.title}
            isDark={isDark}
          />
        </div>

        <p
          className={`text-base sm:text-lg leading-[1.85] max-w-3xl ${
            isDark ? 'text-stone-300' : 'text-stone-700'
          }`}
        >
          {project.fullDescription || project.shortDescription}
        </p>

        {/* External Links */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 transition-colors whitespace-nowrap shrink-0"
            >
              <span>View Source on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {project.liveUrl && project.liveUrl.trim() !== '' && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap shrink-0 ${
                isDark
                  ? 'border-orange-500/50 bg-orange-500/10 text-amber-300 hover:bg-orange-500/20'
                  : 'border-orange-500 bg-orange-50 text-orange-800 hover:bg-orange-100'
              }`}
            >
              <span>Launch Live Demo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </header>

      {/* Problem / Goal & Solution Split (Unnumbered Headings) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          className={`p-7 rounded-3xl border ${
            isDark ? 'bg-[#111A15]/90 border-emerald-900/60' : 'bg-white border-stone-200'
          }`}
        >
          <p className="text-xs font-mono uppercase tracking-wider text-orange-500 dark:text-amber-400">
            Objective
          </p>
          <h2 className="mt-2 text-xl font-display font-bold">Problem & Goal</h2>
          <p
            className={`mt-3 text-base leading-[1.8] ${
              isDark ? 'text-stone-300' : 'text-stone-600'
            }`}
          >
            {project.problemGoal}
          </p>
        </div>

        <div
          className={`p-7 rounded-3xl border ${
            isDark ? 'bg-[#111A15]/90 border-emerald-900/60' : 'bg-white border-stone-200'
          }`}
        >
          <p className="text-xs font-mono uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
            Approach
          </p>
          <h2 className="mt-2 text-xl font-display font-bold">How It Works</h2>
          <p
            className={`mt-3 text-base leading-[1.8] ${
              isDark ? 'text-stone-300' : 'text-stone-600'
            }`}
          >
            {project.solution}
          </p>
        </div>
      </section>

      {/* Key Features & Technical Stack */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div
          className={`lg:col-span-7 p-7 rounded-3xl border ${
            isDark ? 'bg-[#111A15]/90 border-emerald-900/60' : 'bg-white border-stone-200'
          }`}
        >
          <p className="text-xs font-mono uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
            Highlights
          </p>
          <h2 className="mt-2 text-xl font-display font-bold">Key Features</h2>
          <ul className="mt-4 space-y-3">
            {(project.features || []).map((feat, idx) => (
              <li
                key={idx}
                className={`text-base flex items-start gap-3 leading-[1.75] ${
                  isDark ? 'text-stone-300' : 'text-stone-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className={`lg:col-span-5 p-7 rounded-3xl border ${
            isDark ? 'bg-[#111A15]/90 border-emerald-900/60' : 'bg-white border-stone-200'
          }`}
        >
          <p className="text-xs font-mono uppercase tracking-wider text-orange-500 dark:text-amber-400">
            Built With
          </p>
          <h2 className="mt-2 text-xl font-display font-bold">
            Technologies Used
          </h2>
          <ul
            className={`mt-4 divide-y ${
              isDark ? 'divide-emerald-950/70' : 'divide-stone-200'
            }`}
          >
            {(project.technicalStack || []).map((tech, idx) => (
              <li
                key={idx}
                className="py-3 first:pt-0 last:pb-0 text-sm font-medium flex items-center justify-between"
              >
                <span>{tech}</span>
                <span className="text-xs font-mono text-emerald-500">Core</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Architecture Notes, Challenges, and Learnings */}
      <section className="space-y-6">
        <div
          className={`p-7 rounded-3xl border ${
            isDark ? 'bg-[#111A15]/90 border-emerald-900/60' : 'bg-white border-stone-200'
          }`}
        >
          <p className="text-xs font-mono uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
            Design Overview
          </p>
          <h2 className="mt-2 text-xl font-display font-bold">
            System Architecture
          </h2>
          <p
            className={`mt-3 text-base leading-[1.8] ${
              isDark ? 'text-stone-300' : 'text-stone-600'
            }`}
          >
            {project.architectureNotes}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            className={`p-7 rounded-3xl border ${
              isDark ? 'bg-[#111A15]/90 border-emerald-900/60' : 'bg-white border-stone-200'
            }`}
          >
            <p className="text-xs font-mono uppercase tracking-wider text-orange-500 dark:text-amber-400">
              Obstacles Solved
            </p>
            <h2 className="mt-2 text-xl font-display font-bold">Challenges</h2>
            <p
              className={`mt-3 text-base leading-[1.8] ${
                isDark ? 'text-stone-300' : 'text-stone-600'
              }`}
            >
              {project.challenges}
            </p>
          </div>

          <div
            className={`p-7 rounded-3xl border ${
              isDark ? 'bg-[#111A15]/90 border-emerald-900/60' : 'bg-white border-stone-200'
            }`}
          >
            <p className="text-xs font-mono uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
              Key Takeaways
            </p>
            <h2 className="mt-2 text-xl font-display font-bold">What I Learned</h2>
            <p
              className={`mt-3 text-base leading-[1.8] ${
                isDark ? 'text-stone-300' : 'text-stone-600'
              }`}
            >
              {project.learnings}
            </p>
          </div>
        </div>
      </section>

      {/* Project Images Gallery */}
      {project.images && project.images.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-display font-bold">Project Visuals & Diagrams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.images.map((img, idx) => (
              <figure
                key={idx}
                className={`rounded-3xl border overflow-hidden ${
                  isDark ? 'bg-[#111A15] border-emerald-900/60' : 'bg-white border-stone-200'
                }`}
              >
                <img
                  src={img.storagePath}
                  alt={img.altText || project.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-64 object-cover"
                />
                {img.altText && (
                  <figcaption className="px-4 py-3 text-xs text-stone-400">
                    {img.altText}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
