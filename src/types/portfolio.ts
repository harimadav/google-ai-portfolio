export interface ProfileData {
  id?: number;
  name: string;
  headline: string;
  profileImageUrl: string;
  shortBio: string;
  location: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  githubUrl: string;
}

export interface AchievementItem {
  title: string;
  organization: string;
  detail: string;
}

export interface AboutData {
  id?: number;
  content: string;
  highlights: string[];
  achievements: AchievementItem[];
  displaySettings: {
    showAchievementsOnHome: boolean;
    showLocation: boolean;
  };
}

export interface SkillItem {
  id: number;
  category: string;
  name: string;
  description: string | null;
  displayOrder: number;
  published: boolean;
  featured: boolean;
}

export interface ProjectImageItem {
  id?: number;
  projectId?: number;
  storagePath: string;
  altText: string;
  displayOrder: number;
}

export interface ProjectItem {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  problemGoal: string;
  solution: string;
  features: string[];
  technicalStack: string[];
  challenges: string;
  learnings: string;
  architectureNotes: string;
  githubUrl: string;
  liveUrl: string | null;
  featured: boolean;
  displayOrder: number;
  status: string;
  images?: ProjectImageItem[];
}

export interface ExperienceItem {
  id: number;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
  displayOrder: number;
  status: string;
}

export interface EducationItem {
  id: number;
  institution: string;
  program: string;
  boardUniversity: string;
  startDate: string;
  endDate: string;
  academicInformation: string;
  description: string;
  displayOrder: number;
  status: string;
}

export interface CertificationItem {
  id: number;
  title: string;
  issuer: string;
  description: string;
  completionDate: string;
  credentialId: string | null;
  fileStoragePath: string;
  thumbnailStoragePath: string | null;
  featured: boolean;
  displayOrder: number;
  status: string;
}

export interface SiteSettingsData {
  id?: number;
  resumeFilePath: string;
  resumeFileName: string;
  resumeUpdatedAt?: string;
  siteTitle: string;
  siteDescription: string;
  enableIntro: boolean;
  enable3dBackground: boolean;
  defaultTheme: string;
}

export interface SocialLinkItem {
  id: number;
  platform: string;
  label: string;
  url: string;
  displayOrder: number;
  published: boolean;
}

export interface ContactMessageItem {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface PortfolioPayload {
  profile: ProfileData;
  about: AboutData;
  skills: SkillItem[];
  projects: ProjectItem[];
  experience: ExperienceItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  siteSettings: SiteSettingsData;
  socialLinks: SocialLinkItem[];
  cacheVersion?: number;
}
