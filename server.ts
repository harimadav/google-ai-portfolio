import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  getPublicPortfolioData,
  getPublicProjectBySlug,
  getAdminPortfolioData,
  updateProfileRecord,
  updateAboutRecord,
  createOrUpdateProject,
  deleteProjectRecord,
  saveSkillRecord,
  deleteSkillRecord,
  saveExperienceRecord,
  deleteExperienceRecord,
  saveEducationRecord,
  deleteEducationRecord,
  saveCertificationRecord,
  deleteCertificationRecord,
  updateSiteSettingsRecord,
  saveSocialLinkRecord,
  deleteSocialLinkRecord,
  storeControlledFile,
  getStoredFileByPath,
  createContactMessage,
  portfolioCache,
} from './src/db/repository.ts';
import {
  validateProjectInput,
  validateCertificationInput,
  validateFileUpload,
} from './src/utils/portfolioLogic.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for controlled PDF/image base64 uploads
  app.use(express.json({ limit: '15mb' }));

  // SEO: robots.txt and sitemap.xml
  app.get('/robots.txt', (_req, res) => {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${appUrl}/sitemap.xml\n`);
  });

  app.get('/sitemap.xml', async (_req, res) => {
    try {
      const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
      const data = (await getPublicPortfolioData()) as {
        projects?: Array<{ slug: string }>;
      };
      const staticRoutes = [
        '',
        '/projects',
        '/skills',
        '/experience',
        '/education',
        '/certifications',
        '/contact',
      ];
      const projectRoutes = (data.projects || []).map((p) => `/projects/${p.slug}`);
      const urls = [...staticRoutes, ...projectRoutes]
        .map(
          (route) =>
            `  <url><loc>${appUrl}${route}</loc><changefreq>weekly</changefreq></url>`
        )
        .join('\n');
      res
        .type('application/xml')
        .send(
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
        );
    } catch {
      res.status(500).send('Failed to generate sitemap');
    }
  });

  // Public Read Routes
  app.get('/api/portfolio', async (_req, res) => {
    try {
      const data = await getPublicPortfolioData();
      res.json(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load portfolio data';
      res.status(500).json({ error: message });
    }
  });

  app.get('/api/projects/:slug', async (req, res) => {
    try {
      const project = await getPublicProjectBySlug(req.params.slug);
      if (!project) {
        return res.status(404).json({ error: 'Project case study not found.' });
      }
      return res.json(project);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load project';
      return res.status(500).json({ error: message });
    }
  });

  // Serve controlled storage files from PostgreSQL
  app.get('/api/storage/:filename', async (req, res) => {
    try {
      const storagePath = `/api/storage/${req.params.filename}`;
      const fileRecord = await getStoredFileByPath(storagePath);
      if (!fileRecord) {
        return res.status(404).json({ error: 'Stored file not found.' });
      }
      const buffer = Buffer.from(fileRecord.dataBase64, 'base64');
      res.setHeader('Content-Type', fileRecord.mimeType);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${fileRecord.fileName.replace(/"/g, '')}"`
      );
      return res.send(buffer);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to serve stored file';
      return res.status(500).json({ error: message });
    }
  });

  // Public Contact Form submission
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, subject, message } = req.body || {};
      if (!name || String(name).trim().length < 2) {
        return res.status(400).json({ error: 'Please enter your name (at least 2 characters).' });
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
      }
      if (!subject || String(subject).trim().length < 3) {
        return res.status(400).json({ error: 'Please enter a subject (at least 3 characters).' });
      }
      if (!message || String(message).trim().length < 10) {
        return res.status(400).json({ error: 'Message must be at least 10 characters.' });
      }

      const saved = await createContactMessage({
        name: String(name).trim(),
        email: String(email).trim(),
        subject: String(subject).trim(),
        message: String(message).trim(),
      });
      return res.status(201).json({ success: true, record: saved });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to send message';
      return res.status(500).json({ error: msg });
    }
  });

  // ============================================================================
  // Protected Admin Routes (Requires Server-Side Authentication & Authorization)
  // ============================================================================

  app.get('/api/admin/portfolio', requireAuth, async (req: AuthRequest, res) => {
    try {
      const data = await getAdminPortfolioData();
      res.json({ ...data, adminUser: req.user });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch admin data';
      res.status(500).json({ error: message });
    }
  });

  app.put('/api/admin/profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { name, headline, profileImageUrl, shortBio, location, email, phone, linkedinUrl, githubUrl } =
        req.body || {};
      if (!name || String(name).trim().length < 2) {
        return res.status(400).json({ error: 'Name is required.' });
      }
      if (!headline || String(headline).trim().length < 4) {
        return res.status(400).json({ error: 'Headline is required.' });
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
        return res.status(400).json({ error: 'Valid email is required.' });
      }
      const result = await updateProfileRecord({
        name: String(name).trim(),
        headline: String(headline).trim(),
        profileImageUrl: String(profileImageUrl || '/assets/aistudio/BLAZER_PROFILE_PHOTO_b36c8952.png').trim(),
        shortBio: String(shortBio || '').trim(),
        location: String(location || '').trim(),
        email: String(email).trim(),
        phone: String(phone || '').trim(),
        linkedinUrl: String(linkedinUrl || '').trim(),
        githubUrl: String(githubUrl || '').trim(),
      });
      return res.json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      return res.status(500).json({ error: message });
    }
  });

  app.put('/api/admin/about', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { content, highlights, achievements, displaySettings } = req.body || {};
      if (!content || String(content).trim().length < 15) {
        return res.status(400).json({ error: 'About content must be at least 15 characters.' });
      }
      const result = await updateAboutRecord({
        content: String(content).trim(),
        highlights: Array.isArray(highlights) ? highlights : [],
        achievements: Array.isArray(achievements) ? achievements : [],
        displaySettings: displaySettings || { showAchievementsOnHome: true, showLocation: true },
      });
      return res.json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update about section';
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/admin/projects', requireAuth, async (req: AuthRequest, res) => {
    try {
      const validation = validateProjectInput(req.body || {});
      if (!validation.valid) {
        return res.status(400).json({
          error: Object.values(validation.errors)[0] || 'Invalid project data.',
          validationErrors: validation.errors,
        });
      }
      const b = req.body;
      const result = await createOrUpdateProject(
        undefined,
        {
          title: String(b.title).trim(),
          slug: String(b.slug || b.title).trim(),
          shortDescription: String(b.shortDescription).trim(),
          fullDescription: String(b.fullDescription || b.shortDescription).trim(),
          problemGoal: String(b.problemGoal).trim(),
          solution: String(b.solution).trim(),
          features: Array.isArray(b.features) ? b.features.map(String) : [],
          technicalStack: Array.isArray(b.technicalStack) ? b.technicalStack.map(String) : [],
          challenges: String(b.challenges || '').trim(),
          learnings: String(b.learnings || '').trim(),
          architectureNotes: String(b.architectureNotes || '').trim(),
          githubUrl: String(b.githubUrl).trim(),
          liveUrl: b.liveUrl && String(b.liveUrl).trim() !== '' ? String(b.liveUrl).trim() : null,
          featured: Boolean(b.featured),
          displayOrder: Number(b.displayOrder) || 0,
          status: b.status === 'draft' ? 'draft' : 'published',
        },
        b.images
      );
      return res.status(201).json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create project';
      return res.status(500).json({ error: message });
    }
  });

  app.put('/api/admin/projects/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ error: 'Valid project ID required.' });
      const validation = validateProjectInput(req.body || {});
      if (!validation.valid) {
        return res.status(400).json({
          error: Object.values(validation.errors)[0] || 'Invalid project data.',
          validationErrors: validation.errors,
        });
      }
      const b = req.body;
      const result = await createOrUpdateProject(
        id,
        {
          title: String(b.title).trim(),
          slug: String(b.slug || b.title).trim(),
          shortDescription: String(b.shortDescription).trim(),
          fullDescription: String(b.fullDescription || b.shortDescription).trim(),
          problemGoal: String(b.problemGoal).trim(),
          solution: String(b.solution).trim(),
          features: Array.isArray(b.features) ? b.features.map(String) : [],
          technicalStack: Array.isArray(b.technicalStack) ? b.technicalStack.map(String) : [],
          challenges: String(b.challenges || '').trim(),
          learnings: String(b.learnings || '').trim(),
          architectureNotes: String(b.architectureNotes || '').trim(),
          githubUrl: String(b.githubUrl).trim(),
          liveUrl: b.liveUrl && String(b.liveUrl).trim() !== '' ? String(b.liveUrl).trim() : null,
          featured: Boolean(b.featured),
          displayOrder: Number(b.displayOrder) || 0,
          status: b.status === 'draft' ? 'draft' : 'published',
        },
        b.images
      );
      return res.json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update project';
      return res.status(500).json({ error: message });
    }
  });

  app.delete('/api/admin/projects/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ error: 'Valid project ID required.' });
      const result = await deleteProjectRecord(id);
      return res.json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete project';
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/admin/skills', requireAuth, async (req: AuthRequest, res) => {
    try {
      const b = req.body || {};
      if (!b.name || String(b.name).trim().length < 2) {
        return res.status(400).json({ error: 'Skill name is required.' });
      }
      if (!b.category || String(b.category).trim().length < 2) {
        return res.status(400).json({ error: 'Skill category is required.' });
      }
      const result = await saveSkillRecord(undefined, {
        category: String(b.category).trim(),
        name: String(b.name).trim(),
        description: b.description ? String(b.description).trim() : null,
        displayOrder: Number(b.displayOrder) || 0,
        published: b.published !== false,
        featured: Boolean(b.featured),
      });
      return res.status(201).json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create skill';
      return res.status(500).json({ error: message });
    }
  });

  app.put('/api/admin/skills/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const b = req.body || {};
      if (!id || !b.name || !b.category) {
        return res.status(400).json({ error: 'Valid skill ID, name, and category are required.' });
      }
      const result = await saveSkillRecord(id, {
        category: String(b.category).trim(),
        name: String(b.name).trim(),
        description: b.description ? String(b.description).trim() : null,
        displayOrder: Number(b.displayOrder) || 0,
        published: b.published !== false,
        featured: Boolean(b.featured),
      });
      return res.json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update skill';
      return res.status(500).json({ error: message });
    }
  });

  app.delete('/api/admin/skills/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ error: 'Valid skill ID required.' });
      const result = await deleteSkillRecord(id);
      return res.json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete skill';
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/admin/experience', requireAuth, async (req: AuthRequest, res) => {
    try {
      const b = req.body || {};
      if (!b.organization || !b.role || !b.startDate) {
        return res
          .status(400)
          .json({ error: 'Organization, role, and start date are required.' });
      }
      const result = await saveExperienceRecord(undefined, {
        organization: String(b.organization).trim(),
        role: String(b.role).trim(),
        startDate: String(b.startDate).trim(),
        endDate: String(b.endDate || 'Present').trim(),
        description: String(b.description || '').trim(),
        responsibilities: Array.isArray(b.responsibilities)
          ? b.responsibilities.map(String)
          : [],
        technologies: Array.isArray(b.technologies) ? b.technologies.map(String) : [],
        displayOrder: Number(b.displayOrder) || 0,
        status: b.status === 'draft' ? 'draft' : 'published',
      });
      return res.status(201).json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create experience';
      return res.status(500).json({ error: message });
    }
  });

  app.put('/api/admin/experience/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const b = req.body || {};
      if (!id || !b.organization || !b.role) {
        return res.status(400).json({ error: 'Valid ID, organization, and role are required.' });
      }
      const result = await saveExperienceRecord(id, {
        organization: String(b.organization).trim(),
        role: String(b.role).trim(),
        startDate: String(b.startDate || '').trim(),
        endDate: String(b.endDate || 'Present').trim(),
        description: String(b.description || '').trim(),
        responsibilities: Array.isArray(b.responsibilities)
          ? b.responsibilities.map(String)
          : [],
        technologies: Array.isArray(b.technologies) ? b.technologies.map(String) : [],
        displayOrder: Number(b.displayOrder) || 0,
        status: b.status === 'draft' ? 'draft' : 'published',
      });
      return res.json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update experience';
      return res.status(500).json({ error: message });
    }
  });

  app.delete('/api/admin/experience/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ error: 'Valid experience ID required.' });
      const result = await deleteExperienceRecord(id);
      return res.json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete experience';
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/admin/education', requireAuth, async (req: AuthRequest, res) => {
    try {
      const b = req.body || {};
      if (!b.institution || !b.program) {
        return res.status(400).json({ error: 'Institution and program are required.' });
      }
      const result = await saveEducationRecord(undefined, {
        institution: String(b.institution).trim(),
        program: String(b.program).trim(),
        boardUniversity: String(b.boardUniversity || '').trim(),
        startDate: String(b.startDate || '').trim(),
        endDate: String(b.endDate || '').trim(),
        academicInformation: String(b.academicInformation || '').trim(),
        description: String(b.description || '').trim(),
        displayOrder: Number(b.displayOrder) || 0,
        status: b.status === 'draft' ? 'draft' : 'published',
      });
      return res.status(201).json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create education';
      return res.status(500).json({ error: message });
    }
  });

  app.put('/api/admin/education/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const b = req.body || {};
      if (!id || !b.institution || !b.program) {
        return res.status(400).json({ error: 'Valid ID, institution, and program are required.' });
      }
      const result = await saveEducationRecord(id, {
        institution: String(b.institution).trim(),
        program: String(b.program).trim(),
        boardUniversity: String(b.boardUniversity || '').trim(),
        startDate: String(b.startDate || '').trim(),
        endDate: String(b.endDate || '').trim(),
        academicInformation: String(b.academicInformation || '').trim(),
        description: String(b.description || '').trim(),
        displayOrder: Number(b.displayOrder) || 0,
        status: b.status === 'draft' ? 'draft' : 'published',
      });
      return res.json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update education';
      return res.status(500).json({ error: message });
    }
  });

  app.delete('/api/admin/education/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ error: 'Valid education ID required.' });
      const result = await deleteEducationRecord(id);
      return res.json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete education';
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/admin/certifications', requireAuth, async (req: AuthRequest, res) => {
    try {
      const validation = validateCertificationInput(req.body || {});
      if (!validation.valid) {
        return res.status(400).json({
          error: Object.values(validation.errors)[0] || 'Invalid certification input.',
          validationErrors: validation.errors,
        });
      }
      const b = req.body;
      const result = await saveCertificationRecord(undefined, {
        title: String(b.title).trim(),
        issuer: String(b.issuer).trim(),
        description: String(b.description).trim(),
        completionDate: String(b.completionDate).trim(),
        credentialId: b.credentialId ? String(b.credentialId).trim() : null,
        fileStoragePath: String(b.fileStoragePath).trim(),
        thumbnailStoragePath: b.thumbnailStoragePath ? String(b.thumbnailStoragePath).trim() : null,
        featured: Boolean(b.featured),
        displayOrder: Number(b.displayOrder) || 0,
        status: b.status === 'draft' ? 'draft' : 'published',
      });
      return res.status(201).json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create certification';
      return res.status(500).json({ error: message });
    }
  });

  app.put('/api/admin/certifications/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ error: 'Valid certification ID required.' });
      const validation = validateCertificationInput(req.body || {});
      if (!validation.valid) {
        return res.status(400).json({
          error: Object.values(validation.errors)[0] || 'Invalid certification input.',
          validationErrors: validation.errors,
        });
      }
      const b = req.body;
      const result = await saveCertificationRecord(id, {
        title: String(b.title).trim(),
        issuer: String(b.issuer).trim(),
        description: String(b.description).trim(),
        completionDate: String(b.completionDate).trim(),
        credentialId: b.credentialId ? String(b.credentialId).trim() : null,
        fileStoragePath: String(b.fileStoragePath).trim(),
        thumbnailStoragePath: b.thumbnailStoragePath ? String(b.thumbnailStoragePath).trim() : null,
        featured: Boolean(b.featured),
        displayOrder: Number(b.displayOrder) || 0,
        status: b.status === 'draft' ? 'draft' : 'published',
      });
      return res.json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update certification';
      return res.status(500).json({ error: message });
    }
  });

  app.delete('/api/admin/certifications/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ error: 'Valid certification ID required.' });
      const result = await deleteCertificationRecord(id);
      return res.json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete certification';
      return res.status(500).json({ error: message });
    }
  });

  app.put('/api/admin/settings', requireAuth, async (req: AuthRequest, res) => {
    try {
      const b = req.body || {};
      const result = await updateSiteSettingsRecord({
        resumeFilePath: b.resumeFilePath ? String(b.resumeFilePath).trim() : undefined,
        resumeFileName: b.resumeFileName ? String(b.resumeFileName).trim() : undefined,
        resumeUpdatedAt: b.resumeFilePath ? new Date() : undefined,
        siteTitle: b.siteTitle ? String(b.siteTitle).trim() : undefined,
        siteDescription: b.siteDescription ? String(b.siteDescription).trim() : undefined,
        enableIntro: typeof b.enableIntro === 'boolean' ? b.enableIntro : undefined,
        enable3dBackground:
          typeof b.enable3dBackground === 'boolean' ? b.enable3dBackground : undefined,
        defaultTheme: b.defaultTheme === 'light' ? 'light' : 'dark',
      });
      return res.json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update settings';
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/admin/social-links', requireAuth, async (req: AuthRequest, res) => {
    try {
      const b = req.body || {};
      if (!b.platform || !b.label || !b.url) {
        return res.status(400).json({ error: 'Platform, label, and URL are required.' });
      }
      const result = await saveSocialLinkRecord(undefined, {
        platform: String(b.platform).trim(),
        label: String(b.label).trim(),
        url: String(b.url).trim(),
        displayOrder: Number(b.displayOrder) || 0,
        published: b.published !== false,
      });
      return res.status(201).json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create social link';
      return res.status(500).json({ error: message });
    }
  });

  app.put('/api/admin/social-links/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const b = req.body || {};
      if (!id || !b.platform || !b.label || !b.url) {
        return res.status(400).json({ error: 'Valid ID, platform, label, and URL are required.' });
      }
      const result = await saveSocialLinkRecord(id, {
        platform: String(b.platform).trim(),
        label: String(b.label).trim(),
        url: String(b.url).trim(),
        displayOrder: Number(b.displayOrder) || 0,
        published: b.published !== false,
      });
      return res.json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update social link';
      return res.status(500).json({ error: message });
    }
  });

  app.delete('/api/admin/social-links/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ error: 'Valid social link ID required.' });
      const result = await deleteSocialLinkRecord(id);
      return res.json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete social link';
      return res.status(500).json({ error: message });
    }
  });

  // Controlled Storage Upload Endpoint (Resume PDF, Certificates, Project Images)
  app.post('/api/admin/upload', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { fileName, mimeType, sizeBytes, dataBase64, category } = req.body || {};
      const validation = validateFileUpload({
        fileName,
        mimeType,
        sizeBytes: Number(sizeBytes),
        dataBase64,
      });
      if (!validation.valid) {
        return res.status(400).json({
          error: Object.values(validation.errors)[0] || 'File validation failed.',
          validationErrors: validation.errors,
        });
      }

      const stored = await storeControlledFile({
        fileName: String(fileName).trim(),
        mimeType: String(mimeType).trim(),
        sizeBytes: Number(sizeBytes),
        dataBase64: String(dataBase64).trim(),
        category: String(category || 'general').trim(),
      });

      return res.status(201).json({
        success: true,
        file: {
          id: stored.id,
          fileName: stored.fileName,
          mimeType: stored.mimeType,
          sizeBytes: stored.sizeBytes,
          storagePath: stored.storagePath,
          createdAt: stored.createdAt,
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'File upload failed';
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/admin/revalidate', requireAuth, (_req: AuthRequest, res) => {
    const result = portfolioCache.invalidate();
    res.json({ success: true, revalidation: result });
  });

  // Vite middleware for development / static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Portfolio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
