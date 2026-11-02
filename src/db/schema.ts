import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  role: text('role').notNull().default('admin'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const profile = pgTable('profile', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  headline: text('headline').notNull(),
  profileImageUrl: text('profile_image_url').notNull(),
  shortBio: text('short_bio').notNull(),
  location: text('location').notNull().default('Chennai, Tamil Nadu, India'),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  linkedinUrl: text('linkedin_url').notNull(),
  githubUrl: text('github_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const about = pgTable('about', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  highlights: jsonb('highlights').$type<string[]>().notNull().default([]),
  achievements: jsonb('achievements')
    .$type<Array<{ title: string; organization: string; detail: string }>>()
    .notNull()
    .default([]),
  displaySettings: jsonb('display_settings')
    .$type<{ showAchievementsOnHome: boolean; showLocation: boolean }>()
    .notNull()
    .default({ showAchievementsOnHome: true, showLocation: true }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  category: text('category').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  displayOrder: integer('display_order').notNull().default(0),
  published: boolean('published').notNull().default(true),
  featured: boolean('featured').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  shortDescription: text('short_description').notNull(),
  fullDescription: text('full_description').notNull(),
  problemGoal: text('problem_goal').notNull(),
  solution: text('solution').notNull(),
  features: jsonb('features').$type<string[]>().notNull().default([]),
  technicalStack: jsonb('technical_stack').$type<string[]>().notNull().default([]),
  challenges: text('challenges').notNull(),
  learnings: text('learnings').notNull(),
  architectureNotes: text('architecture_notes').notNull(),
  githubUrl: text('github_url').notNull(),
  liveUrl: text('live_url'),
  featured: boolean('featured').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  status: text('status').notNull().default('published'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projectImages = pgTable('project_images', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  storagePath: text('storage_path').notNull(),
  altText: text('alt_text').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const projectsRelations = relations(projects, ({ many }) => ({
  images: many(projectImages),
}));

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(projects, {
    fields: [projectImages.projectId],
    references: [projects.id],
  }),
}));

export const experience = pgTable('experience', {
  id: serial('id').primaryKey(),
  organization: text('organization').notNull(),
  role: text('role').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  description: text('description').notNull(),
  responsibilities: jsonb('responsibilities').$type<string[]>().notNull().default([]),
  technologies: jsonb('technologies').$type<string[]>().notNull().default([]),
  displayOrder: integer('display_order').notNull().default(0),
  status: text('status').notNull().default('published'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const education = pgTable('education', {
  id: serial('id').primaryKey(),
  institution: text('institution').notNull(),
  program: text('program').notNull(),
  boardUniversity: text('board_university').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  academicInformation: text('academic_information').notNull(),
  description: text('description').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  status: text('status').notNull().default('published'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const certifications = pgTable('certifications', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  issuer: text('issuer').notNull(),
  description: text('description').notNull(),
  completionDate: text('completion_date').notNull(),
  credentialId: text('credential_id'),
  fileStoragePath: text('file_storage_path').notNull(),
  thumbnailStoragePath: text('thumbnail_storage_path'),
  featured: boolean('featured').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  status: text('status').notNull().default('published'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  resumeFilePath: text('resume_file_path').notNull(),
  resumeFileName: text('resume_file_name').notNull(),
  resumeUpdatedAt: timestamp('resume_updated_at').defaultNow().notNull(),
  siteTitle: text('site_title').notNull(),
  siteDescription: text('site_description').notNull(),
  enableIntro: boolean('enable_intro').notNull().default(true),
  enable3dBackground: boolean('enable_3d_background').notNull().default(true),
  defaultTheme: text('default_theme').notNull().default('dark'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const socialLinks = pgTable('social_links', {
  id: serial('id').primaryKey(),
  platform: text('platform').notNull(),
  label: text('label').notNull(),
  url: text('url').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  published: boolean('published').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const uploadedFiles = pgTable('uploaded_files', {
  id: serial('id').primaryKey(),
  fileName: text('file_name').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  storagePath: text('storage_path').notNull().unique(),
  dataBase64: text('data_base64').notNull(),
  category: text('category').notNull().default('general'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
