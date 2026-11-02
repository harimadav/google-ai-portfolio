import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PortfolioProvider } from './context/PortfolioContext.tsx';
import { SiteShell } from './components/SiteShell.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { ProjectsPage } from './pages/ProjectsPage.tsx';
import { ProjectDetailPage } from './pages/ProjectDetailPage.tsx';
import { SkillsPage } from './pages/SkillsPage.tsx';
import { ExperiencePage } from './pages/ExperiencePage.tsx';
import { EducationPage } from './pages/EducationPage.tsx';
import { CertificationsPage } from './pages/CertificationsPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';

export default function App() {
  return (
    <PortfolioProvider>
      <BrowserRouter>
        <SiteShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:slug" element={<ProjectDetailPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/experience" element={<ExperiencePage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/certifications" element={<CertificationsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </SiteShell>
      </BrowserRouter>
    </PortfolioProvider>
  );
}
