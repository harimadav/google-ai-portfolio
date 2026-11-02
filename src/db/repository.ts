import { asc, desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import {
  about,
  certifications,
  contactMessages,
  education,
  experience,
  profile,
  projectImages,
  projects,
  siteSettings,
  skills,
  socialLinks,
  uploadedFiles,
} from './schema.ts';
import { INITIAL_PORTFOLIO_SEED, PortfolioCache, slugify } from '../utils/portfolioLogic.ts';

export const portfolioCache = new PortfolioCache(120_000);

let isSeeded = false;

export async function ensureSeeded(): Promise<void> {
  if (isSeeded) return;
  try {
    const existingProfiles = await db.select().from(profile);
    if (existingProfiles.length === 0) {
      await db.insert(profile).values(INITIAL_PORTFOLIO_SEED.profile);
    }

    const existingAbout = await db.select().from(about);
    if (existingAbout.length === 0) {
      await db.insert(about).values(INITIAL_PORTFOLIO_SEED.about);
    }

    const existingSkills = await db.select().from(skills);
    if (existingSkills.length === 0) {
      await db.insert(skills).values(INITIAL_PORTFOLIO_SEED.skills);
    }

    const existingProjects = await db.select().from(projects);
    if (existingProjects.length === 0) {
      await db.insert(projects).values(INITIAL_PORTFOLIO_SEED.projects);
    }

    const existingExperience = await db.select().from(experience);
    if (existingExperience.length === 0) {
      await db.insert(experience).values(INITIAL_PORTFOLIO_SEED.experience);
    }

    const existingEducation = await db.select().from(education);
    if (existingEducation.length === 0) {
      await db.insert(education).values(INITIAL_PORTFOLIO_SEED.education);
    }

    const existingCertifications = await db.select().from(certifications);
    if (existingCertifications.length === 0) {
      await db.insert(certifications).values(INITIAL_PORTFOLIO_SEED.certifications);
    }

    const existingSettings = await db.select().from(siteSettings);
    if (existingSettings.length === 0) {
      await db.insert(siteSettings).values(INITIAL_PORTFOLIO_SEED.siteSettings);
    }

    const existingSocials = await db.select().from(socialLinks);
    if (existingSocials.length === 0) {
      await db.insert(socialLinks).values(INITIAL_PORTFOLIO_SEED.socialLinks);
    }

    isSeeded = true;
  } catch (error) {
    console.error('Database seed check failed:', error);
    throw new Error('Failed to initialize portfolio database state.', { cause: error });
  }
}

export async function getPublicPortfolioData() {
  try {
    await ensureSeeded();
    const cached = portfolioCache.get<Record<string, unknown>>('public_portfolio');
    if (cached) {
      return cached;
    }

    const [
      profileRows,
      aboutRows,
      skillRows,
      projectRows,
      imageRows,
      experienceRows,
      educationRows,
      certificationRows,
      settingsRows,
      socialRows,
    ] = await Promise.all([
      db.select().from(profile),
      db.select().from(about),
      db.select().from(skills).orderBy(asc(skills.displayOrder)),
      db.select().from(projects).orderBy(asc(projects.displayOrder)),
      db.select().from(projectImages).orderBy(asc(projectImages.displayOrder)),
      db.select().from(experience).orderBy(asc(experience.displayOrder)),
      db.select().from(education).orderBy(asc(education.displayOrder)),
      db.select().from(certifications).orderBy(asc(certifications.displayOrder)),
      db.select().from(siteSettings),
      db.select().from(socialLinks).orderBy(asc(socialLinks.displayOrder)),
    ]);

    const publishedProjects = projectRows
      .filter((p) => p.status === 'published')
      .map((p) => ({
        ...p,
        images: imageRows.filter((img) => img.projectId === p.id),
      }));

    const payload = {
      profile: profileRows[0] || INITIAL_PORTFOLIO_SEED.profile,
      about: aboutRows[0] || INITIAL_PORTFOLIO_SEED.about,
      skills: skillRows.filter((s) => s.published),
      projects: publishedProjects,
      experience: experienceRows.filter((e) => e.status === 'published'),
      education: educationRows.filter((ed) => ed.status === 'published'),
      certifications: certificationRows.filter((c) => c.status === 'published'),
      siteSettings: settingsRows[0] || INITIAL_PORTFOLIO_SEED.siteSettings,
      socialLinks: socialRows.filter((s) => s.published && s.url && s.url.trim().length > 0),
      cacheVersion: portfolioCache.getVersion(),
    };

    portfolioCache.set('public_portfolio', payload);
    return payload;
  } catch (error) {
    console.error('Database query failed in getPublicPortfolioData:', error);
    throw new Error('Failed to load portfolio data from database.', { cause: error });
  }
}

export async function getPublicProjectBySlug(slug: string) {
  try {
    await ensureSeeded();
    const cacheKey = `project_${slug}`;
    const cached = portfolioCache.get<Record<string, unknown>>(cacheKey);
    if (cached) return cached;

    const rows = await db.select().from(projects).where(eq(projects.slug, slug));
    const proj = rows[0];
    if (!proj || proj.status !== 'published') {
      return null;
    }
    const imgs = await db
      .select()
      .from(projectImages)
      .where(eq(projectImages.projectId, proj.id))
      .orderBy(asc(projectImages.displayOrder));

    const result = { ...proj, images: imgs };
    portfolioCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Database query failed in getPublicProjectBySlug:', error);
    throw new Error('Failed to load project details.', { cause: error });
  }
}

export async function getAdminPortfolioData() {
  try {
    await ensureSeeded();
    const [
      profileRows,
      aboutRows,
      skillRows,
      projectRows,
      imageRows,
      experienceRows,
      educationRows,
      certificationRows,
      settingsRows,
      socialRows,
      messageRows,
    ] = await Promise.all([
      db.select().from(profile),
      db.select().from(about),
      db.select().from(skills).orderBy(asc(skills.displayOrder)),
      db.select().from(projects).orderBy(asc(projects.displayOrder)),
      db.select().from(projectImages).orderBy(asc(projectImages.displayOrder)),
      db.select().from(experience).orderBy(asc(experience.displayOrder)),
      db.select().from(education).orderBy(asc(education.displayOrder)),
      db.select().from(certifications).orderBy(asc(certifications.displayOrder)),
      db.select().from(siteSettings),
      db.select().from(socialLinks).orderBy(asc(socialLinks.displayOrder)),
      db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)),
    ]);

    return {
      profile: profileRows[0],
      about: aboutRows[0],
      skills: skillRows,
      projects: projectRows.map((p) => ({
        ...p,
        images: imageRows.filter((img) => img.projectId === p.id),
      })),
      experience: experienceRows,
      education: educationRows,
      certifications: certificationRows,
      siteSettings: settingsRows[0],
      socialLinks: socialRows,
      contactMessages: messageRows,
      cacheVersion: portfolioCache.getVersion(),
    };
  } catch (error) {
    console.error('Database query failed in getAdminPortfolioData:', error);
    throw new Error('Failed to load Admin control center data.', { cause: error });
  }
}

export async function updateProfileRecord(data: Partial<typeof profile.$inferInsert>) {
  try {
    const existing = await db.select().from(profile);
    let updated;
    if (existing.length > 0) {
      const res = await db
        .update(profile)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(profile.id, existing[0].id))
        .returning();
      updated = res[0];
    } else {
      const res = await db
        .insert(profile)
        .values({ ...INITIAL_PORTFOLIO_SEED.profile, ...data })
        .returning();
      updated = res[0];
    }
    const revalidation = portfolioCache.invalidate(['public_portfolio']);
    return { record: updated, revalidation };
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw new Error('Database update failed for profile.', { cause: error });
  }
}

export async function updateAboutRecord(data: Partial<typeof about.$inferInsert>) {
  try {
    const existing = await db.select().from(about);
    let updated;
    if (existing.length > 0) {
      const res = await db
        .update(about)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(about.id, existing[0].id))
        .returning();
      updated = res[0];
    } else {
      const res = await db
        .insert(about)
        .values({ ...INITIAL_PORTFOLIO_SEED.about, ...data })
        .returning();
      updated = res[0];
    }
    const revalidation = portfolioCache.invalidate(['public_portfolio']);
    return { record: updated, revalidation };
  } catch (error) {
    console.error('Failed to update about:', error);
    throw new Error('Database update failed for about section.', { cause: error });
  }
}

export async function createOrUpdateProject(
  id: number | undefined,
  data: Omit<typeof projects.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
  images?: Array<{ storagePath: string; altText: string; displayOrder?: number }>
) {
  try {
    const cleanSlug = slugify(data.slug || data.title);
    const payload = {
      ...data,
      slug: cleanSlug,
      liveUrl: data.liveUrl && data.liveUrl.trim() !== '' ? data.liveUrl.trim() : null,
      updatedAt: new Date(),
    };

    let savedProject;
    if (id) {
      const res = await db
        .update(projects)
        .set(payload)
        .where(eq(projects.id, id))
        .returning();
      savedProject = res[0];
    } else {
      const res = await db.insert(projects).values(payload).returning();
      savedProject = res[0];
    }

    if (images && Array.isArray(images) && savedProject) {
      await db.delete(projectImages).where(eq(projectImages.projectId, savedProject.id));
      if (images.length > 0) {
        await db.insert(projectImages).values(
          images.map((img, idx) => ({
            projectId: savedProject.id,
            storagePath: img.storagePath,
            altText: img.altText || savedProject.title,
            displayOrder: img.displayOrder ?? idx + 1,
          }))
        );
      }
    }

    const revalidation = portfolioCache.invalidate([
      'public_portfolio',
      `project_${cleanSlug}`,
    ]);
    return { record: savedProject, revalidation };
  } catch (error) {
    console.error('Failed to save project:', error);
    throw new Error('Database save failed for project.', { cause: error });
  }
}

export async function deleteProjectRecord(id: number) {
  try {
    const existing = await db.select().from(projects).where(eq(projects.id, id));
    if (existing.length === 0) {
      throw new Error('Project not found.');
    }
    const proj = existing[0];
    const imgs = await db
      .select()
      .from(projectImages)
      .where(eq(projectImages.projectId, id));

    // Delete controlled storage files associated with project images
    for (const img of imgs) {
      if (img.storagePath.startsWith('/api/storage/')) {
        await db
          .delete(uploadedFiles)
          .where(eq(uploadedFiles.storagePath, img.storagePath));
      }
    }

    await db.delete(projects).where(eq(projects.id, id));
    const revalidation = portfolioCache.invalidate([
      'public_portfolio',
      `project_${proj.slug}`,
    ]);
    return { deletedId: id, revalidation };
  } catch (error) {
    console.error('Failed to delete project:', error);
    throw new Error('Database delete failed for project.', { cause: error });
  }
}

export async function saveSkillRecord(
  id: number | undefined,
  data: Omit<typeof skills.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    let saved;
    if (id) {
      const res = await db
        .update(skills)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(skills.id, id))
        .returning();
      saved = res[0];
    } else {
      const res = await db.insert(skills).values(data).returning();
      saved = res[0];
    }
    const revalidation = portfolioCache.invalidate(['public_portfolio']);
    return { record: saved, revalidation };
  } catch (error) {
    console.error('Failed to save skill:', error);
    throw new Error('Database save failed for skill.', { cause: error });
  }
}

export async function deleteSkillRecord(id: number) {
  try {
    await db.delete(skills).where(eq(skills.id, id));
    const revalidation = portfolioCache.invalidate(['public_portfolio']);
    return { deletedId: id, revalidation };
  } catch (error) {
    console.error('Failed to delete skill:', error);
    throw new Error('Database delete failed for skill.', { cause: error });
  }
}

export async function saveExperienceRecord(
  id: number | undefined,
  data: Omit<typeof experience.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    let saved;
    if (id) {
      const res = await db
        .update(experience)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(experience.id, id))
        .returning();
      saved = res[0];
    } else {
      const res = await db.insert(experience).values(data).returning();
      saved = res[0];
    }
    const revalidation = portfolioCache.invalidate(['public_portfolio']);
    return { record: saved, revalidation };
  } catch (error) {
    console.error('Failed to save experience:', error);
    throw new Error('Database save failed for experience.', { cause: error });
  }
}

export async function deleteExperienceRecord(id: number) {
  try {
    await db.delete(experience).where(eq(experience.id, id));
    const revalidation = portfolioCache.invalidate(['public_portfolio']);
    return { deletedId: id, revalidation };
  } catch (error) {
    console.error('Failed to delete experience:', error);
    throw new Error('Database delete failed for experience.', { cause: error });
  }
}

export async function saveEducationRecord(
  id: number | undefined,
  data: Omit<typeof education.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    let saved;
    if (id) {
      const res = await db
        .update(education)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(education.id, id))
        .returning();
      saved = res[0];
    } else {
      const res = await db.insert(education).values(data).returning();
      saved = res[0];
    }
    const revalidation = portfolioCache.invalidate(['public_portfolio']);
    return { record: saved, revalidation };
  } catch (error) {
    console.error('Failed to save education:', error);
    throw new Error('Database save failed for education.', { cause: error });
  }
}

export async function deleteEducationRecord(id: number) {
  try {
    await db.delete(education).where(eq(education.id, id));
    const revalidation = portfolioCache.invalidate(['public_portfolio']);
    return { deletedId: id, revalidation };
  } catch (error) {
    console.error('Failed to delete education:', error);
    throw new Error('Database delete failed for education.', { cause: error });
  }
}

export async function saveCertificationRecord(
  id: number | undefined,
  data: Omit<typeof certifications.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    let saved;
    if (id) {
      const res = await db
        .update(certifications)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(certifications.id, id))
        .returning();
      saved = res[0];
    } else {
      const res = await db.insert(certifications).values(data).returning();
      saved = res[0];
    }
    const revalidation = portfolioCache.invalidate(['public_portfolio']);
    return { record: saved, revalidation };
  } catch (error) {
    console.error('Failed to save certification:', error);
    throw new Error('Database save failed for certification.', { cause: error });
  }
}

export async function deleteCertificationRecord(id: number) {
  try {
    const existing = await db
      .select()
      .from(certifications)
      .where(eq(certifications.id, id));
    if (existing.length > 0) {
      const cert = existing[0];
      if (cert.fileStoragePath.startsWith('/api/storage/')) {
        await db
          .delete(uploadedFiles)
          .where(eq(uploadedFiles.storagePath, cert.fileStoragePath));
      }
      if (
        cert.thumbnailStoragePath &&
        cert.thumbnailStoragePath.startsWith('/api/storage/')
      ) {
        await db
          .delete(uploadedFiles)
          .where(eq(uploadedFiles.storagePath, cert.thumbnailStoragePath));
      }
    }
    await db.delete(certifications).where(eq(certifications.id, id));
    const revalidation = portfolioCache.invalidate(['public_portfolio']);
    return { deletedId: id, revalidation };
  } catch (error) {
    console.error('Failed to delete certification:', error);
    throw new Error('Database delete failed for certification.', { cause: error });
  }
}

export async function updateSiteSettingsRecord(
  data: Partial<typeof siteSettings.$inferInsert>
) {
  try {
    const existing = await db.select().from(siteSettings);
    let updated;
    if (existing.length > 0) {
      const res = await db
        .update(siteSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(siteSettings.id, existing[0].id))
        .returning();
      updated = res[0];
    } else {
      const res = await db
        .insert(siteSettings)
        .values({ ...INITIAL_PORTFOLIO_SEED.siteSettings, ...data })
        .returning();
      updated = res[0];
    }
    const revalidation = portfolioCache.invalidate(['public_portfolio']);
    return { record: updated, revalidation };
  } catch (error) {
    console.error('Failed to update site settings:', error);
    throw new Error('Database update failed for site settings.', { cause: error });
  }
}

export async function saveSocialLinkRecord(
  id: number | undefined,
  data: Omit<typeof socialLinks.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    let saved;
    if (id) {
      const res = await db
        .update(socialLinks)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(socialLinks.id, id))
        .returning();
      saved = res[0];
    } else {
      const res = await db.insert(socialLinks).values(data).returning();
      saved = res[0];
    }
    const revalidation = portfolioCache.invalidate(['public_portfolio']);
    return { record: saved, revalidation };
  } catch (error) {
    console.error('Failed to save social link:', error);
    throw new Error('Database save failed for social link.', { cause: error });
  }
}

export async function deleteSocialLinkRecord(id: number) {
  try {
    await db.delete(socialLinks).where(eq(socialLinks.id, id));
    const revalidation = portfolioCache.invalidate(['public_portfolio']);
    return { deletedId: id, revalidation };
  } catch (error) {
    console.error('Failed to delete social link:', error);
    throw new Error('Database delete failed for social link.', { cause: error });
  }
}

export async function storeControlledFile(input: {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  dataBase64: string;
  category: string;
}) {
  try {
    const cleanName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `${Date.now()}_${cleanName}`;
    const storagePath = `/api/storage/${storageKey}`;

    const res = await db
      .insert(uploadedFiles)
      .values({
        fileName: input.fileName,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        storagePath,
        dataBase64: input.dataBase64,
        category: input.category,
      })
      .returning();

    return res[0];
  } catch (error) {
    console.error('Failed to store uploaded file:', error);
    throw new Error('Controlled storage upload failed.', { cause: error });
  }
}

export async function getStoredFileByPath(storagePath: string) {
  try {
    const rows = await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.storagePath, storagePath));
    return rows[0] || null;
  } catch (error) {
    console.error('Failed to retrieve stored file:', error);
    throw new Error('Failed to read file from storage.', { cause: error });
  }
}

export async function createContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    const res = await db.insert(contactMessages).values(input).returning();
    return res[0];
  } catch (error) {
    console.error('Failed to store contact message:', error);
    throw new Error('Failed to submit contact message.', { cause: error });
  }
}
