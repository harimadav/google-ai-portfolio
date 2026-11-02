import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { EngineeringBackground3D } from './EngineeringBackground3D.tsx';

const NAV_ITEMS = [
  { label: 'Projects', to: '/projects' },
  { label: 'Skills', to: '/skills' },
  { label: 'Experience', to: '/experience' },
  { label: 'Education', to: '/education' },
  { label: 'Certifications', to: '/certifications' },
  { label: 'Contact', to: '/contact' },
];

export const SiteShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, theme, toggleTheme } = usePortfolio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });

    const displayName = (data.profile.name || 'S HARI SHANKAR').toUpperCase();
    const baseTitle = `${displayName} — Engineering Portfolio`;
    const path = location.pathname;
    let pageTitle = baseTitle;
    if (path === '/projects') pageTitle = `Projects | ${displayName}`;
    else if (path.startsWith('/projects/')) pageTitle = `Project Case Study | ${displayName}`;
    else if (path === '/skills') pageTitle = `Skills & Honours | ${displayName}`;
    else if (path === '/experience') pageTitle = `Experience & Internships | ${displayName}`;
    else if (path === '/education') pageTitle = `Education | ${displayName}`;
    else if (path === '/certifications') pageTitle = `Certifications | ${displayName}`;
    else if (path === '/contact') pageTitle = `Contact | ${displayName}`;
    else if (path.startsWith('/admin')) pageTitle = `Portfolio Editor | ${displayName}`;

    document.title = pageTitle;
  }, [location.pathname, data.siteSettings?.siteTitle, data.profile.name]);

  const isDark = theme === 'dark';
  const upperName = (data.profile.name || 'S HARI SHANKAR').toUpperCase();

  return (
    <div
      className={`min-h-screen flex flex-col relative transition-colors duration-200 ${
        isDark ? 'bg-[#0B110E] text-[#F4F3EF]' : 'bg-[#FAF8F5] text-[#141E19]'
      }`}
    >
      {/* 3D Mathematics & Software Architecture Background */}
      <EngineeringBackground3D
        theme={theme}
        enabled={data.siteSettings?.enable3dBackground !== false}
      />

      {/* Shared Header (No explicit Admin button; Admin is accessed via /admin URL) */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
          isDark
            ? 'bg-[#0B110E]/90 border-emerald-950/80 text-[#F4F3EF]'
            : 'bg-[#FAF8F5]/95 border-stone-200 text-[#141E19]'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
          {/* Zone 1: Left-Corner Mobile Hamburger + Single-Line Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className={`md:hidden p-2 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'text-stone-300 hover:bg-emerald-950/60 hover:text-white'
                  : 'text-stone-700 hover:bg-stone-200/70 hover:text-stone-950'
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link
              to="/"
              className="text-lg sm:text-xl font-display font-bold tracking-wider uppercase whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-500 rounded flex items-center gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-emerald-500 to-orange-500 shrink-0" />
              <span>{upperName}</span>
            </Link>
          </div>

          {/* Zone 2: Clean Single-Line Text Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                    isActive
                      ? 'border-orange-500 text-emerald-500 dark:text-emerald-400 font-semibold'
                      : isDark
                      ? 'border-transparent text-stone-300 hover:text-white hover:border-emerald-500/50'
                      : 'border-transparent text-stone-600 hover:text-stone-950 hover:border-emerald-600/40'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Theme Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="theme-toggle-btn"
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? 'border-emerald-900/60 bg-[#121C17] text-amber-300 hover:text-amber-200 hover:border-emerald-600/50'
                  : 'border-stone-300 bg-white text-orange-600 hover:text-orange-700 hover:border-emerald-600/40 shadow-xs'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Accessible Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile Navigation"
            className={`md:hidden border-b px-4 pt-2 pb-4 space-y-1 ${
              isDark ? 'bg-[#0F1713] border-emerald-950' : 'bg-[#FAF8F5] border-stone-200'
            }`}
          >
            <Link
              to="/"
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                location.pathname === '/'
                  ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
                  : isDark
                  ? 'text-stone-300 hover:bg-emerald-950/50'
                  : 'text-stone-700 hover:bg-stone-200/60'
              }`}
            >
              Home
            </Link>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 font-semibold'
                      : isDark
                      ? 'text-stone-300 hover:bg-emerald-950/50'
                      : 'text-stone-700 hover:bg-stone-200/60'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">{children}</main>

      {/* Clean Shared Footer without copyright year, all rights reserved, or tech boilerplate */}
      <footer
        className={`relative z-10 border-t mt-20 transition-colors ${
          isDark
            ? 'bg-[#080D0B] border-emerald-950/70 text-stone-300'
            : 'bg-[#F2EFE9] border-stone-200/90 text-stone-700'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <p
                className={`text-lg font-display font-bold uppercase tracking-wider ${
                  isDark ? 'text-[#F4F3EF]' : 'text-[#141E19]'
                }`}
              >
                {upperName}
              </p>
              <p className="mt-2.5 text-sm leading-relaxed max-w-sm">
                {data.profile.headline}
              </p>
              {data.about?.displaySettings?.showLocation !== false && data.profile.location && (
                <p className="mt-2.5 text-xs font-mono text-emerald-500 dark:text-emerald-400">
                  {data.profile.location}
                </p>
              )}
            </div>

            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-wider mb-3.5 ${
                  isDark ? 'text-amber-400' : 'text-orange-700'
                }`}
              >
                Directory
              </p>
              <div className="grid grid-cols-2 gap-2.5 text-sm">
                <Link to="/" className="hover:text-emerald-500 transition-colors">
                  Home
                </Link>
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="hover:text-emerald-500 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-wider mb-3.5 ${
                  isDark ? 'text-amber-400' : 'text-orange-700'
                }`}
              >
                Professional Contact
              </p>
              <ul className="space-y-2.5 text-sm">
                {data.socialLinks
                  .filter((s) => s.published && s.url)
                  .map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.url}
                        target={link.url.startsWith('http') ? '_blank' : undefined}
                        rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="hover:text-emerald-500 transition-colors inline-flex items-center gap-2"
                      >
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {link.platform}:
                        </span>
                        <span className="underline underline-offset-4">{link.label}</span>
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
