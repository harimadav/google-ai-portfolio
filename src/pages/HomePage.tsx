import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Download,
  ExternalLink,
  FileText,
  Award,
  GraduationCap,
  Code2,
  Briefcase,
  FileCheck2,
  X,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { CinematicIntro } from '../components/CinematicIntro.tsx';
import { DropletPortrait } from '../components/DropletPortrait.tsx';
import { ProjectSystemPreview } from '../components/ProjectSystemPreview.tsx';

export const HomePage: React.FC = () => {
  const {
    data,
    loading,
    error,
    refreshPortfolio,
    theme,
    introCompleted,
    completeIntro,
  } = usePortfolio();

  const [resumePreviewOpen, setResumePreviewOpen] = useState(false);

  const isDark = theme === 'dark';
  const upperName = (data.profile.name || 'S HARI SHANKAR').toUpperCase();
  // Keep 2 featured project showcase posters on the Home page with link to explore all 4
  const featuredProjects = data.projects.slice(0, 2);

  return (
    <>
      {/* Fast Loading Portfolio + Droplet Portrait Intro on every load */}
      {!introCompleted && data.siteSettings?.enableIntro !== false && (
        <CinematicIntro
          profileImageUrl={data.profile.profileImageUrl}
          onComplete={completeIntro}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-24">
        {/* Error Banner with Retry if database fetch had an issue */}
        {error && (
          <div
            role="alert"
            className="p-4 rounded-xl border border-orange-500/40 bg-orange-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="text-sm">
              <p className="font-semibold text-orange-400">
                Database synchronization notice
              </p>
              <p className="text-stone-300 mt-0.5">{error}</p>
            </div>
            <button
              type="button"
              onClick={refreshPortfolio}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-orange-500 text-stone-950 hover:bg-orange-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* 1. Hero Section with Continuous Upward-to-Downward Droplet Portrait */}
        <section aria-labelledby="hero-heading" className="pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Clean, Easy-to-Read Introduction */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-500 dark:text-emerald-400 mb-4">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>B.E. Computer Science & Engineering</span>
              </div>

              <h1
                id="hero-heading"
                className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold uppercase tracking-wide text-balance leading-[1.12]"
              >
                {upperName}
              </h1>

              <p
                className={`mt-4 text-xl sm:text-2xl font-medium text-balance ${
                  isDark ? 'text-emerald-300' : 'text-emerald-800'
                }`}
              >
                {data.profile.headline}
              </p>

              <p
                className={`mt-6 text-base sm:text-lg leading-[1.85] max-w-2xl ${
                  isDark ? 'text-stone-300' : 'text-stone-700'
                }`}
              >
                {data.profile.shortBio}
              </p>

              {/* Primary & Secondary Actions */}
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 shadow-sm transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Explore the Projects</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#resume-section"
                  className={`inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold rounded-xl border transition-colors whitespace-nowrap shrink-0 ${
                    isDark
                      ? 'border-orange-500/40 bg-[#141F1A] text-amber-300 hover:bg-orange-500/15 hover:border-orange-400'
                      : 'border-orange-400 bg-orange-50/70 text-orange-800 hover:bg-orange-100/80'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Resume & Credentials</span>
                </a>
              </div>
            </div>

            {/* Right Column: Continuous Droplet Portrait Showcase */}
            <div className="lg:col-span-5 flex items-stretch">
              <div
                className={`w-full rounded-3xl border p-6 flex flex-col justify-between relative overflow-hidden ${
                  isDark
                    ? 'bg-[#111A15]/90 border-emerald-900/60 shadow-xl'
                    : 'bg-white border-stone-200/90 shadow-md'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-4">
                  <span className={isDark ? 'text-emerald-400' : 'text-emerald-700'}>
                    {upperName}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-md font-semibold tabular-nums ${
                      isDark
                        ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    CGPA 8.49
                  </span>
                </div>

                {/* Continuous top-to-bottom droplet portrait */}
                <DropletPortrait
                  imageUrl={data.profile.profileImageUrl}
                  alt={`${upperName} portrait`}
                  isDark={isDark}
                />

                <div
                  className={`mt-5 pt-4 border-t flex items-center justify-between text-xs ${
                    isDark ? 'border-emerald-950/90' : 'border-stone-200'
                  }`}
                >
                  <span className={isDark ? 'text-stone-300' : 'text-stone-700'}>
                    Rajalakshmi Institute of Technology
                  </span>
                  <Link
                    to="/contact"
                    className="font-semibold text-orange-500 dark:text-amber-400 hover:underline whitespace-nowrap shrink-0"
                  >
                    Get in Touch →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Featured Projects — Two Interactive Project Posters with Explore Link */}
        <section aria-labelledby="projects-heading" className="space-y-8">
          <div
            className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-4 ${
              isDark ? 'border-emerald-950/80' : 'border-stone-200'
            }`}
          >
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-orange-500 dark:text-amber-400">
                Selected Works · {upperName}
              </p>
              <h2
                id="projects-heading"
                className="mt-1 text-2xl sm:text-3xl font-display font-bold tracking-tight"
              >
                Featured Projects
              </h2>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Explore All {data.projects.length} Projects</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="h-80 rounded-3xl border border-emerald-950 bg-[#121C17]/50 animate-pulse p-8"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredProjects.map((project) => (
                <article
                  key={project.id}
                  className={`group rounded-3xl border overflow-hidden flex flex-col justify-between transition-all ${
                    isDark
                      ? 'bg-[#111A15]/90 border-emerald-900/60 hover:border-emerald-500/60'
                      : 'bg-white border-stone-200 hover:border-emerald-600/60 shadow-sm'
                  }`}
                >
                  <div>
                    {/* Interactive Animated System Preview */}
                    <ProjectSystemPreview
                      slug={project.slug}
                      title={project.title}
                      isDark={isDark}
                    />

                    {/* Clear Project Overview & Tech Badges */}
                    <div className="p-7 pb-4">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-500 dark:text-emerald-400">
                        <span>{(project.technicalStack || []).slice(0, 3).join(' · ')}</span>
                      </div>

                      <h3 className="mt-2.5 text-2xl font-display font-bold tracking-tight">
                        <Link
                          to={`/projects/${project.slug}`}
                          className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                        >
                          {project.title}
                        </Link>
                      </h3>

                      <p
                        className={`mt-3 text-base leading-[1.8] ${
                          isDark ? 'text-stone-300' : 'text-stone-600'
                        }`}
                      >
                        {project.fullDescription || project.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="px-7 pb-7 pt-3 flex items-center justify-between gap-4">
                    <Link
                      to={`/projects/${project.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Open Full Case Study</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <div className="flex items-center gap-3 text-xs font-medium">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-400 hover:text-orange-400 transition-colors whitespace-nowrap shrink-0"
                        >
                          GitHub ↗
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
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* 3. Academics & Honours Section */}
        <section aria-labelledby="academics-honours-heading" className="space-y-8">
          <div
            className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-4 ${
              isDark ? 'border-emerald-950/80' : 'border-stone-200'
            }`}
          >
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
                Foundation & Recognition · {upperName}
              </p>
              <h2
                id="academics-honours-heading"
                className="mt-1 text-2xl sm:text-3xl font-display font-bold tracking-tight"
              >
                Academics & Honours
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-5 text-sm font-semibold">
              <Link
                to="/education"
                className="text-emerald-600 dark:text-emerald-400 hover:underline whitespace-nowrap"
              >
                Academic Details →
              </Link>
              <Link
                to="/skills"
                className="text-orange-600 dark:text-amber-400 hover:underline whitespace-nowrap"
              >
                Skills & Honours →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Academic Milestones Summary */}
            <div className="lg:col-span-6 space-y-4">
              {data.education.slice(0, 3).map((edu) => (
                <div
                  key={edu.id}
                  className={`p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDark
                      ? 'bg-[#111A15]/85 border-emerald-900/50'
                      : 'bg-white border-stone-200 shadow-xs'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 dark:text-emerald-400">
                      <GraduationCap className="w-4 h-4 shrink-0" />
                      <span>
                        {edu.startDate} – {edu.endDate}
                      </span>
                    </div>
                    <h3 className="text-lg font-display font-bold">{edu.program}</h3>
                    <p
                      className={`text-sm ${
                        isDark ? 'text-stone-300' : 'text-stone-600'
                      }`}
                    >
                      {edu.institution}
                    </p>
                  </div>

                  <div
                    className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold shrink-0 self-start sm:self-center ${
                      isDark
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {edu.academicInformation}
                  </div>
                </div>
              ))}
            </div>

            {/* Honours & Awards Summary */}
            <div className="lg:col-span-6 space-y-4">
              {(data.about.achievements || []).map((ach, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl border ${
                    isDark
                      ? 'bg-[#111A15]/85 border-emerald-900/50'
                      : 'bg-white border-stone-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-mono text-orange-500 dark:text-amber-400">
                    <Award className="w-4 h-4 shrink-0" />
                    <span>{ach.organization}</span>
                  </div>
                  <h3 className="mt-1.5 text-lg font-display font-bold">
                    {ach.title}
                  </h3>
                  <p
                    className={`mt-1.5 text-sm leading-relaxed ${
                      isDark ? 'text-stone-300' : 'text-stone-600'
                    }`}
                  >
                    {ach.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Clean Redirect Cards to Explore Dedicated Pages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">
            <Link
              to="/skills"
              className={`p-5 rounded-2xl border flex items-center justify-between group transition-colors ${
                isDark
                  ? 'bg-[#111A15]/70 border-emerald-900/50 hover:border-emerald-500/60'
                  : 'bg-white border-stone-200 hover:border-emerald-600/50 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Code2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-base font-display font-bold">Technical Skills</p>
                  <p className="text-xs text-stone-400">Explore core strengths</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/experience"
              className={`p-5 rounded-2xl border flex items-center justify-between group transition-colors ${
                isDark
                  ? 'bg-[#111A15]/70 border-emerald-900/50 hover:border-orange-500/60'
                  : 'bg-white border-stone-200 hover:border-orange-600/50 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Briefcase className="w-5 h-5 text-orange-500 shrink-0" />
                <div>
                  <p className="text-base font-display font-bold">Internships</p>
                  <p className="text-xs text-stone-400">HVF & CODTECH training</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/certifications"
              className={`p-5 rounded-2xl border flex items-center justify-between group transition-colors ${
                isDark
                  ? 'bg-[#111A15]/70 border-emerald-900/50 hover:border-emerald-500/60'
                  : 'bg-white border-stone-200 hover:border-emerald-600/50 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <FileCheck2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-base font-display font-bold">Certifications</p>
                  <p className="text-xs text-stone-400">ISRO, NPTEL, UiPath, MongoDB</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* 4. Resume Download & Preview Section */}
        <section
          id="resume-section"
          aria-labelledby="resume-heading"
          className={`p-8 sm:p-10 rounded-3xl border ${
            isDark
              ? 'bg-[#111A15]/90 border-emerald-900/60'
              : 'bg-white border-stone-200 shadow-sm'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <p className="text-xs font-mono uppercase tracking-wider text-orange-500 dark:text-amber-400">
                Curriculum Vitae · {upperName}
              </p>
              <h2
                id="resume-heading"
                className="mt-1.5 text-2xl sm:text-3xl font-display font-bold tracking-tight"
              >
                Resume & Credentials
              </h2>
              <p
                className={`mt-3 text-base leading-[1.8] ${
                  isDark ? 'text-stone-300' : 'text-stone-600'
                }`}
              >
                View or download {upperName}’s complete PDF resume covering academic
                performance, software projects, industrial internships, and verified
                certifications.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <button
                type="button"
                onClick={() => setResumePreviewOpen(true)}
                className={`inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold rounded-xl border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isDark
                    ? 'border-emerald-800 bg-[#16231C] text-stone-100 hover:bg-emerald-950'
                    : 'border-stone-300 bg-stone-100 text-stone-900 hover:bg-stone-200'
                }`}
              >
                <FileText className="w-4 h-4 text-orange-500" />
                <span>Preview Resume</span>
              </button>

              <a
                href={data.siteSettings.resumeFilePath}
                download={data.siteSettings.resumeFileName || 'S_HARI_SHANKAR_RESUME.pdf'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download Resume PDF</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Accessible Resume PDF Preview Modal */}
      {resumePreviewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Resume PDF Preview"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div
            className={`w-full max-w-4xl h-[85vh] rounded-2xl border flex flex-col overflow-hidden ${
              isDark ? 'bg-[#111A15] border-emerald-900' : 'bg-white border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-950/60">
              <div>
                <h3 className="text-base font-display font-bold">
                  {data.siteSettings.resumeFileName}
                </h3>
                <p className="text-xs text-stone-400">Official Resume Document · {upperName}</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={data.siteSettings.resumeFilePath}
                  download={data.siteSettings.resumeFileName}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                >
                  Download PDF
                </a>
                <button
                  type="button"
                  onClick={() => setResumePreviewOpen(false)}
                  aria-label="Close resume preview"
                  className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-stone-950">
              <iframe
                src={data.siteSettings.resumeFilePath}
                title="S HARI SHANKAR Resume PDF"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
