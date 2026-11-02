import React, { useEffect, useState, useCallback } from 'react';
import {
  ShieldCheck,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import {
  CertificationItem,
  ContactMessageItem,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  SkillItem,
  SocialLinkItem,
} from '../types/portfolio.ts';
import { slugify } from '../utils/portfolioLogic.ts';

type AdminTab =
  | 'projects'
  | 'certifications'
  | 'resume'
  | 'skills'
  | 'experience'
  | 'education'
  | 'profile'
  | 'settings';

export const AdminPage: React.FC = () => {
  const {
    theme,
    adminToken,
    adminEmail,
    signInWithGoogleAdmin,
    signInWithPasskeyAdmin,
    signOutAdmin,
    refreshPortfolio,
  } = usePortfolio();

  const isDark = theme === 'dark';

  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('projects');

  const [adminLoading, setAdminLoading] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Admin Loaded State
  const [projectsList, setProjectsList] = useState<ProjectItem[]>([]);
  const [certificationsList, setCertificationsList] = useState<CertificationItem[]>([]);
  const [skillsList, setSkillsList] = useState<SkillItem[]>([]);
  const [experienceList, setExperienceList] = useState<ExperienceItem[]>([]);
  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [socialLinksList, setSocialLinksList] = useState<SocialLinkItem[]>([]);
  const [messagesList, setMessagesList] = useState<ContactMessageItem[]>([]);

  const [profileForm, setProfileForm] = useState({
    name: '',
    headline: '',
    profileImageUrl: '',
    shortBio: '',
    location: '',
    email: '',
    phone: '',
    linkedinUrl: '',
    githubUrl: '',
  });

  const [aboutForm, setAboutForm] = useState({
    content: '',
    highlightsText: '',
  });

  const [settingsForm, setSettingsForm] = useState({
    resumeFilePath: '',
    resumeFileName: '',
    siteTitle: '',
    siteDescription: '',
    enableIntro: true,
    enable3dBackground: true,
    defaultTheme: 'dark',
  });

  // Project Form State
  const [editingProjectId, setEditingProjectId] = useState<number | undefined>(undefined);
  const [projectForm, setProjectForm] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    fullDescription: '',
    problemGoal: '',
    solution: '',
    featuresText: '',
    stackText: '',
    challenges: '',
    learnings: '',
    architectureNotes: '',
    githubUrl: 'https://github.com/harimadav',
    liveUrl: '',
    featured: true,
    displayOrder: 1,
    status: 'published',
  });

  // Certification Form State
  const [editingCertId, setEditingCertId] = useState<number | undefined>(undefined);
  const [certForm, setCertForm] = useState({
    title: '',
    issuer: '',
    description: '',
    completionDate: '2025',
    credentialId: '',
    fileStoragePath: '/assets/aistudio/S_HARI_SHANKAR_RESUME_12ccab42.pdf',
    featured: true,
    displayOrder: 1,
    status: 'published',
  });

  // Skill Form State
  const [editingSkillId, setEditingSkillId] = useState<number | undefined>(undefined);
  const [skillForm, setSkillForm] = useState({
    category: 'Software Engineering & Development',
    name: '',
    description: '',
    displayOrder: 1,
    published: true,
    featured: true,
  });

  // Experience Form State
  const [editingExpId, setEditingExpId] = useState<number | undefined>(undefined);
  const [expForm, setExpForm] = useState({
    organization: '',
    role: '',
    startDate: '',
    endDate: '',
    description: '',
    responsibilitiesText: '',
    technologiesText: '',
    displayOrder: 1,
    status: 'published',
  });

  // Education Form State
  const [editingEduId, setEditingEduId] = useState<number | undefined>(undefined);
  const [eduForm, setEduForm] = useState({
    institution: '',
    program: '',
    boardUniversity: '',
    startDate: '',
    endDate: '',
    academicInformation: '',
    description: '',
    displayOrder: 1,
    status: 'published',
  });

  // Intentional Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{
    entity: 'projects' | 'certifications' | 'skills' | 'experience' | 'education';
    id: number;
    label: string;
  } | null>(null);

  const [uploadingFile, setUploadingFile] = useState(false);

  const fetchAdminData = useCallback(async () => {
    if (!adminToken) return;
    try {
      setAdminLoading(true);
      const res = await fetch('/api/admin/portfolio', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to load Admin data');
      }
      const d = await res.json();
      setProjectsList(d.projects || []);
      setCertificationsList(d.certifications || []);
      setSkillsList(d.skills || []);
      setExperienceList(d.experience || []);
      setEducationList(d.education || []);
      setSocialLinksList(d.socialLinks || []);
      setMessagesList(d.contactMessages || []);

      if (d.profile) {
        setProfileForm({
          name: d.profile.name || '',
          headline: d.profile.headline || '',
          profileImageUrl: d.profile.profileImageUrl || '',
          shortBio: d.profile.shortBio || '',
          location: d.profile.location || '',
          email: d.profile.email || '',
          phone: d.profile.phone || '',
          linkedinUrl: d.profile.linkedinUrl || '',
          githubUrl: d.profile.githubUrl || '',
        });
      }
      if (d.about) {
        setAboutForm({
          content: d.about.content || '',
          highlightsText: (d.about.highlights || []).join('\n'),
        });
      }
      if (d.siteSettings) {
        setSettingsForm({
          resumeFilePath: d.siteSettings.resumeFilePath || '',
          resumeFileName: d.siteSettings.resumeFileName || '',
          siteTitle: d.siteSettings.siteTitle || '',
          siteDescription: d.siteSettings.siteDescription || '',
          enableIntro: d.siteSettings.enableIntro !== false,
          enable3dBackground: d.siteSettings.enable3dBackground !== false,
          defaultTheme: d.siteSettings.defaultTheme || 'dark',
        });
      }
    } catch (err: unknown) {
      setStatusBanner({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error loading admin state',
      });
    } finally {
      setAdminLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    if (adminToken) {
      fetchAdminData();
    }
  }, [adminToken, fetchAdminData]);

  const handlePasskeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const ok = await signInWithPasskeyAdmin(passkeyInput);
    if (!ok) {
      setAuthError('Invalid Admin Passkey. Please verify your credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithGoogleAdmin();
    } catch (err: unknown) {
      setAuthError(
        err instanceof Error ? err.message : 'Google Sign-In could not complete.'
      );
    }
  };

  // Controlled Storage Upload Helper
  const handleControlledFileUpload = async (
    file: File,
    category: string
  ): Promise<{ storagePath: string; fileName: string } | null> => {
    try {
      setUploadingFile(true);
      setStatusBanner(null);

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || '');
          const commaIndex = result.indexOf(',');
          resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || 'application/pdf',
          sizeBytes: file.size,
          dataBase64: base64,
          category,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'File upload failed');
      }
      return {
        storagePath: json.file.storagePath,
        fileName: json.file.fileName,
      };
    } catch (err: unknown) {
      setStatusBanner({
        type: 'error',
        message: err instanceof Error ? err.message : 'Upload failed',
      });
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  // Project Save Handler
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);

    const payload = {
      title: projectForm.title,
      slug: projectForm.slug || slugify(projectForm.title),
      shortDescription: projectForm.shortDescription,
      fullDescription: projectForm.fullDescription || projectForm.shortDescription,
      problemGoal: projectForm.problemGoal,
      solution: projectForm.solution,
      features: projectForm.featuresText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      technicalStack: projectForm.stackText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      challenges: projectForm.challenges,
      learnings: projectForm.learnings,
      architectureNotes: projectForm.architectureNotes,
      githubUrl: projectForm.githubUrl,
      liveUrl: projectForm.liveUrl.trim() || null,
      featured: projectForm.featured,
      displayOrder: Number(projectForm.displayOrder) || 1,
      status: projectForm.status,
    };

    try {
      const url = editingProjectId
        ? `/api/admin/projects/${editingProjectId}`
        : '/api/admin/projects';
      const method = editingProjectId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to save project.');
      }

      setStatusBanner({
        type: 'success',
        message: `Project "${json.record.title}" saved to PostgreSQL and public cache revalidated.`,
      });
      setEditingProjectId(undefined);
      setProjectForm({
        title: '',
        slug: '',
        shortDescription: '',
        fullDescription: '',
        problemGoal: '',
        solution: '',
        featuresText: '',
        stackText: '',
        challenges: '',
        learnings: '',
        architectureNotes: '',
        githubUrl: 'https://github.com/harimadav',
        liveUrl: '',
        featured: true,
        displayOrder: projectsList.length + 1,
        status: 'published',
      });
      await fetchAdminData();
      await refreshPortfolio();
    } catch (err: unknown) {
      setStatusBanner({
        type: 'error',
        message: err instanceof Error ? err.message : 'Project save failed.',
      });
    }
  };

  // Certification Save Handler
  const handleSaveCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);

    try {
      const url = editingCertId
        ? `/api/admin/certifications/${editingCertId}`
        : '/api/admin/certifications';
      const method = editingCertId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(certForm),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to save certification.');
      }

      setStatusBanner({
        type: 'success',
        message: `Certification "${json.record.title}" saved and public pages revalidated.`,
      });
      setEditingCertId(undefined);
      setCertForm({
        title: '',
        issuer: '',
        description: '',
        completionDate: '2025',
        credentialId: '',
        fileStoragePath: '/assets/aistudio/S_HARI_SHANKAR_RESUME_12ccab42.pdf',
        featured: true,
        displayOrder: certificationsList.length + 1,
        status: 'published',
      });
      await fetchAdminData();
      await refreshPortfolio();
    } catch (err: unknown) {
      setStatusBanner({
        type: 'error',
        message: err instanceof Error ? err.message : 'Certification save failed.',
      });
    }
  };

  // Skill Save Handler
  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);
    try {
      const url = editingSkillId
        ? `/api/admin/skills/${editingSkillId}`
        : '/api/admin/skills';
      const method = editingSkillId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(skillForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save skill.');

      setStatusBanner({
        type: 'success',
        message: `Skill "${json.record.name}" saved and public pages revalidated.`,
      });
      setEditingSkillId(undefined);
      setSkillForm({
        category: 'Software Engineering & Development',
        name: '',
        description: '',
        displayOrder: skillsList.length + 1,
        published: true,
        featured: true,
      });
      await fetchAdminData();
      await refreshPortfolio();
    } catch (err: unknown) {
      setStatusBanner({
        type: 'error',
        message: err instanceof Error ? err.message : 'Skill save failed.',
      });
    }
  };

  // Experience Save Handler
  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);
    try {
      const url = editingExpId
        ? `/api/admin/experience/${editingExpId}`
        : '/api/admin/experience';
      const method = editingExpId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          organization: expForm.organization,
          role: expForm.role,
          startDate: expForm.startDate,
          endDate: expForm.endDate,
          description: expForm.description,
          responsibilities: expForm.responsibilitiesText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          technologies: expForm.technologiesText
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          displayOrder: Number(expForm.displayOrder) || 1,
          status: expForm.status,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save experience.');

      setStatusBanner({
        type: 'success',
        message: `Experience at "${json.record.organization}" saved and public pages revalidated.`,
      });
      setEditingExpId(undefined);
      setExpForm({
        organization: '',
        role: '',
        startDate: '',
        endDate: '',
        description: '',
        responsibilitiesText: '',
        technologiesText: '',
        displayOrder: experienceList.length + 1,
        status: 'published',
      });
      await fetchAdminData();
      await refreshPortfolio();
    } catch (err: unknown) {
      setStatusBanner({
        type: 'error',
        message: err instanceof Error ? err.message : 'Experience save failed.',
      });
    }
  };

  // Education Save Handler
  const handleSaveEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);
    try {
      const url = editingEduId
        ? `/api/admin/education/${editingEduId}`
        : '/api/admin/education';
      const method = editingEduId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(eduForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save education.');

      setStatusBanner({
        type: 'success',
        message: `Education record "${json.record.program}" saved and public pages revalidated.`,
      });
      setEditingEduId(undefined);
      setEduForm({
        institution: '',
        program: '',
        boardUniversity: '',
        startDate: '',
        endDate: '',
        academicInformation: '',
        description: '',
        displayOrder: educationList.length + 1,
        status: 'published',
      });
      await fetchAdminData();
      await refreshPortfolio();
    } catch (err: unknown) {
      setStatusBanner({
        type: 'error',
        message: err instanceof Error ? err.message : 'Education save failed.',
      });
    }
  };

  // Profile & About Save Handler
  const handleSaveProfileAndAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);
    try {
      const resProf = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(profileForm),
      });
      const jsonProf = await resProf.json();
      if (!resProf.ok) throw new Error(jsonProf.error || 'Failed to update profile.');

      const resAbout = await fetch('/api/admin/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          content: aboutForm.content,
          highlights: aboutForm.highlightsText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const jsonAbout = await resAbout.json();
      if (!resAbout.ok) throw new Error(jsonAbout.error || 'Failed to update about.');

      setStatusBanner({
        type: 'success',
        message: 'Profile & About content updated in PostgreSQL and revalidated.',
      });
      await fetchAdminData();
      await refreshPortfolio();
    } catch (err: unknown) {
      setStatusBanner({
        type: 'error',
        message: err instanceof Error ? err.message : 'Update failed.',
      });
    }
  };

  // Settings / Resume Save Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(settingsForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update settings.');

      setStatusBanner({
        type: 'success',
        message: 'Resume & Site Settings saved and Home page revalidated.',
      });
      await fetchAdminData();
      await refreshPortfolio();
    } catch (err: unknown) {
      setStatusBanner({
        type: 'error',
        message: err instanceof Error ? err.message : 'Settings update failed.',
      });
    }
  };

  // Confirmed Delete Execution
  const confirmDeleteEntity = async () => {
    if (!deleteTarget) return;
    setStatusBanner(null);
    try {
      const res = await fetch(
        `/api/admin/${deleteTarget.entity}/${deleteTarget.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Delete operation failed.');

      setStatusBanner({
        type: 'success',
        message: `Deleted "${deleteTarget.label}" and revalidated public routes.`,
      });
      setDeleteTarget(null);
      await fetchAdminData();
      await refreshPortfolio();
    } catch (err: unknown) {
      setStatusBanner({
        type: 'error',
        message: err instanceof Error ? err.message : 'Delete failed.',
      });
      setDeleteTarget(null);
    }
  };

  // Unauthenticated View -> Protected Login Gate
  if (!adminToken) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div
          className={`p-8 rounded-2xl border space-y-6 ${
            isDark
              ? 'bg-slate-900/85 border-slate-800'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2.5 text-blue-500">
            <ShieldCheck className="w-6 h-6" />
            <span className="text-xs font-mono uppercase tracking-wider">
              Protected Admin Boundary
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-display font-bold">
              Portfolio Admin Authentication
            </h1>
            <p
              className={`mt-2 text-xs leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Sign in with the owner Google account (harishankarism@gmail.com) or
              enter the owner Admin Passkey to manage database content.
            </p>
          </div>

          {authError && (
            <div
              role="alert"
              className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-xs text-rose-300"
            >
              {authError}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors cursor-pointer"
          >
            Sign in with Google (Owner Account)
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800" />
            <span className="flex-shrink mx-3 text-xs font-mono text-slate-500">
              OR OWNER PASSKEY
            </span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          <form onSubmit={handlePasskeySubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-passkey-input"
                className="block text-xs font-medium mb-1.5"
              >
                Admin Passkey
              </label>
              <input
                id="admin-passkey-input"
                type="password"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="Enter admin passkey (e.g. hari-admin-2026)"
                className={`w-full px-3.5 py-2.5 text-sm rounded-lg border focus:outline-none focus:border-blue-500 ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <button
              id="admin-unlock-btn"
              type="submit"
              className={`w-full py-2.5 px-4 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'
                  : 'border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
            >
              Unlock Admin Control Center
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Top Header */}
      <div
        className={`p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isDark
            ? 'bg-slate-900/80 border-slate-800'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-500">
            <ShieldCheck className="w-4 h-4" />
            <span>AUTHENTICATED ADMIN SESSION · {adminEmail}</span>
          </div>
          <h1 className="mt-1 text-2xl font-display font-bold">
            Portfolio Content Control Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchAdminData}
            aria-label="Refresh Admin database records"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${adminLoading ? 'animate-spin' : ''}`} />
            <span>Sync DB</span>
          </button>

          <button
            type="button"
            onClick={signOutAdmin}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-400 border border-rose-500/40 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {statusBanner && (
        <div
          role="status"
          className={`p-4 rounded-xl border flex items-center justify-between gap-4 text-xs font-medium ${
            statusBanner.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusBanner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusBanner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div
        role="tablist"
        aria-label="Admin Content Sections"
        className={`flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl border ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}
      >
        {(
          [
            { id: 'projects', label: `Projects (${projectsList.length})` },
            { id: 'certifications', label: `Certifications (${certificationsList.length})` },
            { id: 'resume', label: 'Resume PDF' },
            { id: 'skills', label: `Skills (${skillsList.length})` },
            { id: 'experience', label: `Experience (${experienceList.length})` },
            { id: 'education', label: `Education (${educationList.length})` },
            { id: 'profile', label: 'Profile & About' },
            { id: 'settings', label: `Settings & Inbox (${messagesList.length})` },
          ] as Array<{ id: AdminTab; label: string }>
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={activeTab === t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === t.id
                ? 'bg-blue-600 text-white'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PROJECTS CRUD */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6">
            <form
              onSubmit={handleSaveProject}
              className={`p-6 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-900/75 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display font-bold">
                  {editingProjectId ? 'Edit Project Case Study' : 'Create New Project'}
                </h2>
                {editingProjectId && (
                  <button
                    type="button"
                    onClick={() => setEditingProjectId(undefined)}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="proj-title" className="block text-xs font-medium mb-1">
                    Project Title *
                  </label>
                  <input
                    id="proj-title"
                    type="text"
                    required
                    value={projectForm.title}
                    onChange={(e) =>
                      setProjectForm((p) => ({
                        ...p,
                        title: e.target.value,
                        slug: p.slug ? p.slug : slugify(e.target.value),
                      }))
                    }
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label htmlFor="proj-slug" className="block text-xs font-medium mb-1">
                    URL Slug *
                  </label>
                  <input
                    id="proj-slug"
                    type="text"
                    required
                    value={projectForm.slug}
                    onChange={(e) =>
                      setProjectForm((p) => ({ ...p, slug: slugify(e.target.value) }))
                    }
                    className={`w-full px-3 py-2 text-sm rounded-lg border font-mono ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="proj-short" className="block text-xs font-medium mb-1">
                  Short Description (Card Summary) *
                </label>
                <textarea
                  id="proj-short"
                  rows={2}
                  required
                  value={projectForm.shortDescription}
                  onChange={(e) =>
                    setProjectForm((p) => ({ ...p, shortDescription: e.target.value }))
                  }
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="proj-problem" className="block text-xs font-medium mb-1">
                    Problem / Goal *
                  </label>
                  <textarea
                    id="proj-problem"
                    rows={3}
                    required
                    value={projectForm.problemGoal}
                    onChange={(e) =>
                      setProjectForm((p) => ({ ...p, problemGoal: e.target.value }))
                    }
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label htmlFor="proj-solution" className="block text-xs font-medium mb-1">
                    Engineered Solution *
                  </label>
                  <textarea
                    id="proj-solution"
                    rows={3}
                    required
                    value={projectForm.solution}
                    onChange={(e) =>
                      setProjectForm((p) => ({ ...p, solution: e.target.value }))
                    }
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="proj-features" className="block text-xs font-medium mb-1">
                    Features (One per line)
                  </label>
                  <textarea
                    id="proj-features"
                    rows={3}
                    value={projectForm.featuresText}
                    onChange={(e) =>
                      setProjectForm((p) => ({ ...p, featuresText: e.target.value }))
                    }
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label htmlFor="proj-stack" className="block text-xs font-medium mb-1">
                    Technical Stack (Comma-separated)
                  </label>
                  <textarea
                    id="proj-stack"
                    rows={3}
                    value={projectForm.stackText}
                    onChange={(e) =>
                      setProjectForm((p) => ({ ...p, stackText: e.target.value }))
                    }
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="proj-github" className="block text-xs font-medium mb-1">
                    GitHub URL *
                  </label>
                  <input
                    id="proj-github"
                    type="url"
                    required
                    value={projectForm.githubUrl}
                    onChange={(e) =>
                      setProjectForm((p) => ({ ...p, githubUrl: e.target.value }))
                    }
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label htmlFor="proj-live" className="block text-xs font-medium mb-1">
                    Live Demo URL (Leave blank to hide button)
                  </label>
                  <input
                    id="proj-live"
                    type="url"
                    value={projectForm.liveUrl}
                    onChange={(e) =>
                      setProjectForm((p) => ({ ...p, liveUrl: e.target.value }))
                    }
                    placeholder="Optional https://..."
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projectForm.featured}
                    onChange={(e) =>
                      setProjectForm((p) => ({ ...p, featured: e.target.checked }))
                    }
                  />
                  <span>Feature on Home Page</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-medium">
                  <span>Status:</span>
                  <select
                    value={projectForm.status}
                    onChange={(e) =>
                      setProjectForm((p) => ({ ...p, status: e.target.value }))
                    }
                    className={`px-2.5 py-1 rounded border text-xs ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors cursor-pointer"
              >
                {editingProjectId ? 'Update Project in Database' : 'Save New Project'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-lg font-display font-bold">
              Existing Projects ({projectsList.length})
            </h2>
            {projectsList.map((proj) => (
              <div
                key={proj.id}
                className={`p-5 rounded-2xl border flex items-start justify-between gap-4 ${
                  isDark ? 'bg-slate-900/75 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span>/{proj.slug}</span>
                    <span>·</span>
                    <span className="uppercase">{proj.status}</span>
                    {proj.featured && (
                      <>
                        <span>·</span>
                        <span className="text-blue-500">FEATURED</span>
                      </>
                    )}
                  </div>
                  <h3 className="mt-1 text-base font-display font-bold">{proj.title}</h3>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                    {proj.shortDescription}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    aria-label={`Edit project ${proj.title}`}
                    onClick={() => {
                      setEditingProjectId(proj.id);
                      setProjectForm({
                        title: proj.title,
                        slug: proj.slug,
                        shortDescription: proj.shortDescription,
                        fullDescription: proj.fullDescription,
                        problemGoal: proj.problemGoal,
                        solution: proj.solution,
                        featuresText: (proj.features || []).join('\n'),
                        stackText: (proj.technicalStack || []).join(', '),
                        challenges: proj.challenges,
                        learnings: proj.learnings,
                        architectureNotes: proj.architectureNotes,
                        githubUrl: proj.githubUrl,
                        liveUrl: proj.liveUrl || '',
                        featured: proj.featured,
                        displayOrder: proj.displayOrder,
                        status: proj.status,
                      });
                    }}
                    className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete project ${proj.title}`}
                    onClick={() =>
                      setDeleteTarget({
                        entity: 'projects',
                        id: proj.id,
                        label: proj.title,
                      })
                    }
                    className="p-2 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CERTIFICATIONS CRUD + FILE STORAGE */}
      {activeTab === 'certifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <form
              onSubmit={handleSaveCertification}
              className={`p-6 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-900/75 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <h2 className="text-lg font-display font-bold">
                {editingCertId ? 'Edit Certification' : 'Add Certification'}
              </h2>

              <div>
                <label htmlFor="cert-title" className="block text-xs font-medium mb-1">
                  Certification Title *
                </label>
                <input
                  id="cert-title"
                  type="text"
                  required
                  value={certForm.title}
                  onChange={(e) => setCertForm((c) => ({ ...c, title: e.target.value }))}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cert-issuer" className="block text-xs font-medium mb-1">
                    Issuing Organization *
                  </label>
                  <input
                    id="cert-issuer"
                    type="text"
                    required
                    value={certForm.issuer}
                    onChange={(e) =>
                      setCertForm((c) => ({ ...c, issuer: e.target.value }))
                    }
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label htmlFor="cert-date" className="block text-xs font-medium mb-1">
                    Completion Date / Year *
                  </label>
                  <input
                    id="cert-date"
                    type="text"
                    required
                    value={certForm.completionDate}
                    onChange={(e) =>
                      setCertForm((c) => ({ ...c, completionDate: e.target.value }))
                    }
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cert-desc" className="block text-xs font-medium mb-1">
                  Description *
                </label>
                <textarea
                  id="cert-desc"
                  rows={3}
                  required
                  value={certForm.description}
                  onChange={(e) =>
                    setCertForm((c) => ({ ...c, description: e.target.value }))
                  }
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Upload Certificate File (PDF/PNG/JPG → Controlled Storage)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const uploaded = await handleControlledFileUpload(
                      file,
                      'certification'
                    );
                    if (uploaded) {
                      setCertForm((c) => ({
                        ...c,
                        fileStoragePath: uploaded.storagePath,
                      }));
                      setStatusBanner({
                        type: 'success',
                        message: `Uploaded "${uploaded.fileName}" to controlled storage (${uploaded.storagePath}).`,
                      });
                    }
                  }}
                  className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                />
                <p className="mt-1 text-xs font-mono text-slate-500 truncate">
                  Current Path: {certForm.fileStoragePath}
                </p>
              </div>

              <button
                type="submit"
                disabled={uploadingFile}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors cursor-pointer"
              >
                {editingCertId ? 'Update Certification' : 'Save Certification'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-lg font-display font-bold">
              Stored Certifications ({certificationsList.length})
            </h2>
            {certificationsList.map((cert) => (
              <div
                key={cert.id}
                className={`p-5 rounded-2xl border flex items-start justify-between gap-4 ${
                  isDark ? 'bg-slate-900/75 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <p className="text-xs font-mono text-blue-500">
                    {cert.issuer} · {cert.completionDate}
                  </p>
                  <h3 className="mt-1 text-base font-display font-bold">{cert.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{cert.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    aria-label={`Edit certification ${cert.title}`}
                    onClick={() => {
                      setEditingCertId(cert.id);
                      setCertForm({
                        title: cert.title,
                        issuer: cert.issuer,
                        description: cert.description,
                        completionDate: cert.completionDate,
                        credentialId: cert.credentialId || '',
                        fileStoragePath: cert.fileStoragePath,
                        featured: cert.featured,
                        displayOrder: cert.displayOrder,
                        status: cert.status,
                      });
                    }}
                    className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete certification ${cert.title}`}
                    onClick={() =>
                      setDeleteTarget({
                        entity: 'certifications',
                        id: cert.id,
                        label: cert.title,
                      })
                    }
                    className="p-2 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RESUME ADMIN FLOW */}
      {activeTab === 'resume' && (
        <div className="max-w-2xl">
          <form
            onSubmit={handleSaveSettings}
            className={`p-8 rounded-2xl border space-y-6 ${
              isDark ? 'bg-slate-900/75 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div>
              <p className="text-xs font-mono text-blue-500">CONTROLLED RESUME STORAGE</p>
              <h2 className="mt-1 text-xl font-display font-bold">
                Replace or Update Official Resume PDF
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Select a replacement PDF to upload to controlled PostgreSQL storage and
                automatically update the Home page Resume section.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1 text-xs font-mono">
              <p className="text-slate-300">
                Active Resume Name: {settingsForm.resumeFileName}
              </p>
              <p className="text-slate-500 truncate">
                Storage Path: {settingsForm.resumeFilePath}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2">
                Select Replacement Resume PDF (Max 8MB)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const uploaded = await handleControlledFileUpload(file, 'resume');
                    if (uploaded) {
                      setSettingsForm((s) => ({
                        ...s,
                        resumeFilePath: uploaded.storagePath,
                        resumeFileName: uploaded.fileName,
                      }));
                      setStatusBanner({
                        type: 'success',
                        message: `Uploaded new resume "${uploaded.fileName}". Click Save Resume Metadata to publish.`,
                      });
                    }
                  }}
                  className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="resume-filename" className="block text-xs font-medium mb-1">
                Public Download File Name
              </label>
              <input
                id="resume-filename"
                type="text"
                required
                value={settingsForm.resumeFileName}
                onChange={(e) =>
                  setSettingsForm((s) => ({ ...s, resumeFileName: e.target.value }))
                }
                className={`w-full px-3.5 py-2 text-sm rounded-lg border ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={uploadingFile}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Save Resume Metadata & Revalidate Home</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: SKILLS CRUD */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <form
              onSubmit={handleSaveSkill}
              className={`p-6 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-900/75 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <h2 className="text-lg font-display font-bold">
                {editingSkillId ? 'Edit Skill' : 'Add Skill'}
              </h2>
              <div>
                <label htmlFor="skill-cat" className="block text-xs font-medium mb-1">
                  Category *
                </label>
                <input
                  id="skill-cat"
                  type="text"
                  required
                  value={skillForm.category}
                  onChange={(e) =>
                    setSkillForm((s) => ({ ...s, category: e.target.value }))
                  }
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label htmlFor="skill-name" className="block text-xs font-medium mb-1">
                  Skill Name *
                </label>
                <input
                  id="skill-name"
                  type="text"
                  required
                  value={skillForm.name}
                  onChange={(e) => setSkillForm((s) => ({ ...s, name: e.target.value }))}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label htmlFor="skill-desc" className="block text-xs font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="skill-desc"
                  rows={2}
                  value={skillForm.description}
                  onChange={(e) =>
                    setSkillForm((s) => ({ ...s, description: e.target.value }))
                  }
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 cursor-pointer"
              >
                {editingSkillId ? 'Update Skill' : 'Add Skill'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            {skillsList.map((sk) => (
              <div
                key={sk.id}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                  isDark ? 'bg-slate-900/75 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <p className="text-xs font-mono text-blue-500">{sk.category}</p>
                  <p className="text-sm font-semibold">{sk.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Edit skill ${sk.name}`}
                    onClick={() => {
                      setEditingSkillId(sk.id);
                      setSkillForm({
                        category: sk.category,
                        name: sk.name,
                        description: sk.description || '',
                        displayOrder: sk.displayOrder,
                        published: sk.published,
                        featured: sk.featured,
                      });
                    }}
                    className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete skill ${sk.name}`}
                    onClick={() =>
                      setDeleteTarget({
                        entity: 'skills',
                        id: sk.id,
                        label: sk.name,
                      })
                    }
                    className="p-2 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EXPERIENCE CRUD */}
      {activeTab === 'experience' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <form
              onSubmit={handleSaveExperience}
              className={`p-6 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-900/75 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <h2 className="text-lg font-display font-bold">
                {editingExpId ? 'Edit Experience' : 'Add Experience'}
              </h2>
              <div>
                <label htmlFor="exp-org" className="block text-xs font-medium mb-1">
                  Organization *
                </label>
                <input
                  id="exp-org"
                  type="text"
                  required
                  value={expForm.organization}
                  onChange={(e) =>
                    setExpForm((x) => ({ ...x, organization: e.target.value }))
                  }
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label htmlFor="exp-role" className="block text-xs font-medium mb-1">
                  Role *
                </label>
                <input
                  id="exp-role"
                  type="text"
                  required
                  value={expForm.role}
                  onChange={(e) => setExpForm((x) => ({ ...x, role: e.target.value }))}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="exp-start" className="block text-xs font-medium mb-1">
                    Start Date *
                  </label>
                  <input
                    id="exp-start"
                    type="text"
                    required
                    value={expForm.startDate}
                    onChange={(e) =>
                      setExpForm((x) => ({ ...x, startDate: e.target.value }))
                    }
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label htmlFor="exp-end" className="block text-xs font-medium mb-1">
                    End Date
                  </label>
                  <input
                    id="exp-end"
                    type="text"
                    value={expForm.endDate}
                    onChange={(e) =>
                      setExpForm((x) => ({ ...x, endDate: e.target.value }))
                    }
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="exp-desc" className="block text-xs font-medium mb-1">
                  Description *
                </label>
                <textarea
                  id="exp-desc"
                  rows={3}
                  required
                  value={expForm.description}
                  onChange={(e) =>
                    setExpForm((x) => ({ ...x, description: e.target.value }))
                  }
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 cursor-pointer"
              >
                {editingExpId ? 'Update Experience' : 'Save Experience'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {experienceList.map((exp) => (
              <div
                key={exp.id}
                className={`p-5 rounded-2xl border flex items-start justify-between gap-4 ${
                  isDark ? 'bg-slate-900/75 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <p className="text-xs font-mono text-blue-500">
                    {exp.organization} · {exp.startDate}
                  </p>
                  <h3 className="mt-1 text-base font-display font-bold">{exp.role}</h3>
                  <p className="mt-1 text-xs text-slate-400">{exp.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Edit experience ${exp.role}`}
                    onClick={() => {
                      setEditingExpId(exp.id);
                      setExpForm({
                        organization: exp.organization,
                        role: exp.role,
                        startDate: exp.startDate,
                        endDate: exp.endDate,
                        description: exp.description,
                        responsibilitiesText: (exp.responsibilities || []).join('\n'),
                        technologiesText: (exp.technologies || []).join(', '),
                        displayOrder: exp.displayOrder,
                        status: exp.status,
                      });
                    }}
                    className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete experience ${exp.role}`}
                    onClick={() =>
                      setDeleteTarget({
                        entity: 'experience',
                        id: exp.id,
                        label: `${exp.role} at ${exp.organization}`,
                      })
                    }
                    className="p-2 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: EDUCATION CRUD */}
      {activeTab === 'education' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <form
              onSubmit={handleSaveEducation}
              className={`p-6 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-900/75 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <h2 className="text-lg font-display font-bold">
                {editingEduId ? 'Edit Education' : 'Add Education'}
              </h2>
              <div>
                <label htmlFor="edu-inst" className="block text-xs font-medium mb-1">
                  Institution *
                </label>
                <input
                  id="edu-inst"
                  type="text"
                  required
                  value={eduForm.institution}
                  onChange={(e) =>
                    setEduForm((ed) => ({ ...ed, institution: e.target.value }))
                  }
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label htmlFor="edu-prog" className="block text-xs font-medium mb-1">
                  Program / Qualification *
                </label>
                <input
                  id="edu-prog"
                  type="text"
                  required
                  value={eduForm.program}
                  onChange={(e) =>
                    setEduForm((ed) => ({ ...ed, program: e.target.value }))
                  }
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edu-board" className="block text-xs font-medium mb-1">
                    Board / University
                  </label>
                  <input
                    id="edu-board"
                    type="text"
                    value={eduForm.boardUniversity}
                    onChange={(e) =>
                      setEduForm((ed) => ({ ...ed, boardUniversity: e.target.value }))
                    }
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label htmlFor="edu-grade" className="block text-xs font-medium mb-1">
                    CGPA / Percentage
                  </label>
                  <input
                    id="edu-grade"
                    type="text"
                    value={eduForm.academicInformation}
                    onChange={(e) =>
                      setEduForm((ed) => ({
                        ...ed,
                        academicInformation: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 cursor-pointer"
              >
                {editingEduId ? 'Update Education' : 'Save Education'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {educationList.map((edu) => (
              <div
                key={edu.id}
                className={`p-5 rounded-2xl border flex items-start justify-between gap-4 ${
                  isDark ? 'bg-slate-900/75 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <p className="text-xs font-mono text-blue-500">
                    {edu.institution} · {edu.academicInformation}
                  </p>
                  <h3 className="mt-1 text-base font-display font-bold">{edu.program}</h3>
                  <p className="mt-1 text-xs text-slate-400">{edu.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Edit education ${edu.program}`}
                    onClick={() => {
                      setEditingEduId(edu.id);
                      setEduForm({
                        institution: edu.institution,
                        program: edu.program,
                        boardUniversity: edu.boardUniversity,
                        startDate: edu.startDate,
                        endDate: edu.endDate,
                        academicInformation: edu.academicInformation,
                        description: edu.description,
                        displayOrder: edu.displayOrder,
                        status: edu.status,
                      });
                    }}
                    className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete education ${edu.program}`}
                    onClick={() =>
                      setDeleteTarget({
                        entity: 'education',
                        id: edu.id,
                        label: edu.program,
                      })
                    }
                    className="p-2 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: PROFILE & ABOUT */}
      {activeTab === 'profile' && (
        <form
          onSubmit={handleSaveProfileAndAbout}
          className={`max-w-3xl p-8 rounded-2xl border space-y-5 ${
            isDark ? 'bg-slate-900/75 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <h2 className="text-xl font-display font-bold">Profile & About Management</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prof-name" className="block text-xs font-medium mb-1">
                Full Name *
              </label>
              <input
                id="prof-name"
                type="text"
                required
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, name: e.target.value }))
                }
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label htmlFor="prof-email" className="block text-xs font-medium mb-1">
                Email *
              </label>
              <input
                id="prof-email"
                type="email"
                required
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, email: e.target.value }))
                }
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="prof-headline" className="block text-xs font-medium mb-1">
              Headline *
            </label>
            <input
              id="prof-headline"
              type="text"
              required
              value={profileForm.headline}
              onChange={(e) =>
                setProfileForm((p) => ({ ...p, headline: e.target.value }))
              }
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label htmlFor="prof-bio" className="block text-xs font-medium mb-1">
              Hero Short Bio *
            </label>
            <textarea
              id="prof-bio"
              rows={3}
              required
              value={profileForm.shortBio}
              onChange={(e) =>
                setProfileForm((p) => ({ ...p, shortBio: e.target.value }))
              }
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label htmlFor="about-content" className="block text-xs font-medium mb-1">
              Detailed About Narrative *
            </label>
            <textarea
              id="about-content"
              rows={4}
              required
              value={aboutForm.content}
              onChange={(e) =>
                setAboutForm((a) => ({ ...a, content: e.target.value }))
              }
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 cursor-pointer"
          >
            Save Profile & About Changes
          </button>
        </form>
      )}

      {/* TAB 8: SITE SETTINGS & INBOX */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <form
              onSubmit={handleSaveSettings}
              className={`p-6 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-900/75 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <h2 className="text-lg font-display font-bold">Global Site Settings</h2>
              <div>
                <label htmlFor="set-title" className="block text-xs font-medium mb-1">
                  Site Title
                </label>
                <input
                  id="set-title"
                  type="text"
                  value={settingsForm.siteTitle}
                  onChange={(e) =>
                    setSettingsForm((s) => ({ ...s, siteTitle: e.target.value }))
                  }
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.enableIntro}
                    onChange={(e) =>
                      setSettingsForm((s) => ({ ...s, enableIntro: e.target.checked }))
                    }
                  />
                  <span>Enable Cinematic Boot Sequence on First Visit</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.enable3dBackground}
                    onChange={(e) =>
                      setSettingsForm((s) => ({
                        ...s,
                        enable3dBackground: e.target.checked,
                      }))
                    }
                  />
                  <span>Enable Three.js 3D Engineering Background</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 cursor-pointer"
              >
                Save Site Configuration
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-lg font-display font-bold">
              Contact Messages Inbox ({messagesList.length})
            </h2>
            {messagesList.length === 0 ? (
              <p className="text-xs text-slate-500">
                No visitor messages submitted yet.
              </p>
            ) : (
              messagesList.map((m) => (
                <div
                  key={m.id}
                  className={`p-5 rounded-2xl border space-y-2 ${
                    isDark ? 'bg-slate-900/75 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                    <span>
                      {m.name} ({m.email})
                    </span>
                    <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm font-semibold">{m.subject}</p>
                  <p className="text-xs text-slate-400">{m.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Intentional Destructive Action Confirmation Modal (Section 25) */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Deletion"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div
            className={`w-full max-w-md p-6 rounded-2xl border space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-rose-400 text-xs font-mono">
              <AlertTriangle className="w-4 h-4" />
              <span>DESTRUCTIVE OPERATION CONFIRMATION</span>
            </div>
            <h3 className="text-lg font-display font-bold">
              Delete "{deleteTarget.label}"?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This will permanently remove the record and any linked controlled storage
              assets from PostgreSQL, and immediately revalidate public pages.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteEntity}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
              >
                Confirm Permanent Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
