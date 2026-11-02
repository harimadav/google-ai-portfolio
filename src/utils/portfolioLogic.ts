export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface ProjectInput {
  title?: string;
  slug?: string;
  shortDescription?: string;
  fullDescription?: string;
  problemGoal?: string;
  solution?: string;
  features?: string[];
  technicalStack?: string[];
  challenges?: string;
  learnings?: string;
  architectureNotes?: string;
  githubUrl?: string;
  liveUrl?: string | null;
  featured?: boolean;
  displayOrder?: number;
  status?: string;
}

export function validateProjectInput(input: ProjectInput): ValidationResult {
  const errors: Record<string, string> = {};
  if (!input.title || input.title.trim().length < 3) {
    errors.title = 'Project title is required (minimum 3 characters).';
  }
  const slug = input.slug ? slugify(input.slug) : input.title ? slugify(input.title) : '';
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    errors.slug = 'A valid URL slug is required.';
  }
  if (!input.shortDescription || input.shortDescription.trim().length < 10) {
    errors.shortDescription = 'Short description must be at least 10 characters.';
  }
  if (!input.problemGoal || input.problemGoal.trim().length < 10) {
    errors.problemGoal = 'Problem / Goal statement is required.';
  }
  if (!input.solution || input.solution.trim().length < 10) {
    errors.solution = 'Solution overview is required.';
  }
  if (!input.githubUrl || !/^https?:\/\/.+/.test(input.githubUrl.trim())) {
    errors.githubUrl = 'Valid GitHub URL (starting with http:// or https://) is required.';
  }
  if (input.liveUrl && input.liveUrl.trim() !== '' && !/^https?:\/\/.+/.test(input.liveUrl.trim())) {
    errors.liveUrl = 'Live URL must start with http:// or https:// when provided.';
  }
  if (input.status && !['published', 'draft'].includes(input.status)) {
    errors.status = 'Status must be either published or draft.';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export interface CertificationInput {
  title?: string;
  issuer?: string;
  description?: string;
  completionDate?: string;
  credentialId?: string | null;
  fileStoragePath?: string;
  status?: string;
}

export function validateCertificationInput(input: CertificationInput): ValidationResult {
  const errors: Record<string, string> = {};
  if (!input.title || input.title.trim().length < 3) {
    errors.title = 'Certification title is required.';
  }
  if (!input.issuer || input.issuer.trim().length < 2) {
    errors.issuer = 'Issuing organization is required.';
  }
  if (!input.description || input.description.trim().length < 5) {
    errors.description = 'Description is required.';
  }
  if (!input.completionDate || input.completionDate.trim().length < 2) {
    errors.completionDate = 'Completion date or year is required.';
  }
  if (!input.fileStoragePath || input.fileStoragePath.trim().length < 1) {
    errors.fileStoragePath = 'Certificate file or document reference is required.';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export interface FileUploadInput {
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  dataBase64?: string;
  allowedTypes?: string[];
  maxSizeBytes?: number;
}

export function validateFileUpload(input: FileUploadInput): ValidationResult {
  const errors: Record<string, string> = {};
  const maxBytes = input.maxSizeBytes ?? 8 * 1024 * 1024; // 8 MB default
  const allowed = input.allowedTypes ?? [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
  ];

  if (!input.fileName || input.fileName.trim().length === 0) {
    errors.fileName = 'File name is required.';
  }
  if (!input.mimeType || !allowed.includes(input.mimeType)) {
    errors.mimeType = `Unsupported file type. Allowed: ${allowed.join(', ')}`;
  }
  if (typeof input.sizeBytes !== 'number' || input.sizeBytes <= 0) {
    errors.sizeBytes = 'File cannot be empty.';
  } else if (input.sizeBytes > maxBytes) {
    errors.sizeBytes = `File size exceeds maximum limit of ${Math.round(maxBytes / (1024 * 1024))}MB.`;
  }
  if (!input.dataBase64 || input.dataBase64.trim().length < 8) {
    errors.dataBase64 = 'Valid file payload is required.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function groupSkillsByCategory<
  T extends { category: string; published?: boolean; displayOrder?: number }
>(items: T[], onlyPublished = true): Record<string, T[]> {
  const filtered = onlyPublished ? items.filter((item) => item.published !== false) : items;
  const sorted = [...filtered].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  return sorted.reduce<Record<string, T[]>>((acc, item) => {
    const key = item.category || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

export class PortfolioCache {
  private store = new Map<string, { data: unknown; timestamp: number; version: number }>();
  private version = 1;
  private ttlMs: number;

  constructor(ttlMs = 60_000) {
    this.ttlMs = ttlMs;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      version: this.version,
    });
  }

  invalidate(affectedKeys?: string[]): { version: number; clearedKeys: string[] } {
    this.version += 1;
    if (!affectedKeys || affectedKeys.length === 0) {
      const keys = Array.from(this.store.keys());
      this.store.clear();
      return { version: this.version, clearedKeys: keys };
    }
    const cleared: string[] = [];
    for (const key of affectedKeys) {
      if (this.store.delete(key)) {
        cleared.push(key);
      }
    }
    // Always invalidate the aggregate public bundle when any entity changes
    if (this.store.delete('public_portfolio')) {
      cleared.push('public_portfolio');
    }
    return { version: this.version, clearedKeys: cleared };
  }

  getVersion(): number {
    return this.version;
  }
}

export const INITIAL_PORTFOLIO_SEED = {
  profile: {
    name: 'S HARI SHANKAR',
    headline: 'Computer Science Engineering Student & Software Developer',
    profileImageUrl: '/assets/aistudio/BLAZER_PROFILE_PHOTO_b36c8952.png',
    shortBio:
      'Computer Science Engineering student interested in software development and learning how technology can be used to build useful solutions. Looking for opportunities to enhance my skills, gain practical experience, and contribute to real world projects.',
    location: 'Chennai, Tamil Nadu, India',
    email: 'harishankarism@gmail.com',
    phone: '8124607922',
    linkedinUrl: 'https://linkedin.com/in/harishankar2803',
    githubUrl: 'https://github.com/harimadav',
  },
  about: {
    content:
      'I am a Computer Science and Engineering student (2024–2028) at Rajalakshmi Institute of Technology with an 8.49 CGPA. I enjoy building practical web applications, working with real-world sensor data, and solving everyday problems through clean code. Through hackathons, research presentations, and internships at CODTECH IT Solutions and Heavy Vehicles Factory (HVF), I focus on building software that is reliable and easy to use.',
    highlights: [
      'B.E. Computer Science & Engineering at Rajalakshmi Institute of Technology (CGPA: 8.49)',
      'First Place Winner at Freshothon & Madha Engineering College Inter-College Hackathon',
      'Best Paper Award for Research Presentation on "Fault Tolerance"',
      'Internships at CODTECH IT Solutions Pvt. Ltd. & Heavy Vehicles Factory (HVF)',
    ],
    achievements: [
      {
        title: 'First Place — Freshothon',
        organization: 'Rajalakshmi Institute of Technology',
        detail: 'Won First Place for building a fast, working software prototype to solve a real-world campus challenge.',
      },
      {
        title: 'First Place — Inter-College Hackathon (₹2,000 Cash Prize)',
        organization: 'Madha Engineering College',
        detail: 'Secured 1st place and a ₹2,000 cash prize competing against engineering teams from multiple colleges.',
      },
      {
        title: 'Best Paper Award — "Fault Tolerance"',
        organization: 'Rajalakshmi Institute of Technology',
        detail: 'Received the Best Paper Award for presenting practical ways to keep computer systems running reliably.',
      },
    ],
    displaySettings: {
      showAchievementsOnHome: true,
      showLocation: true,
    },
  },
  skills: [
    {
      category: 'Web & Software Development',
      name: 'Full-Stack Web Development',
      description: 'Building complete, responsive web apps with user login, role-based dashboards, and clean APIs.',
      displayOrder: 1,
      published: true,
      featured: true,
    },
    {
      category: 'Web & Software Development',
      name: 'Algorithms & Data Structures',
      description: 'Writing fast, logical code to solve complex problems efficiently (NPTEL Certified).',
      displayOrder: 2,
      published: true,
      featured: true,
    },
    {
      category: 'Web & Software Development',
      name: 'Reliable System Design',
      description: 'Designing software that handles errors gracefully and stays dependable (Best Paper Award).',
      displayOrder: 3,
      published: true,
      featured: false,
    },
    {
      category: 'Data & Databases',
      name: 'MongoDB & SQL Databases',
      description: 'Designing structured databases, storing application records safely, and writing fast queries.',
      displayOrder: 4,
      published: true,
      featured: true,
    },
    {
      category: 'Data & Databases',
      name: 'Data Analysis & Live Dashboards',
      description: 'Turning raw sensor readings and historical data into clear, interactive charts and predictions.',
      displayOrder: 5,
      published: true,
      featured: true,
    },
    {
      category: 'Data & Databases',
      name: 'Satellite & Geospatial Image Analysis',
      description: 'Analyzing satellite and map imagery to extract useful visual insights (ISRO Certified).',
      displayOrder: 6,
      published: true,
      featured: true,
    },
    {
      category: 'Smart Automation & Tools',
      name: 'Workflow Automation (UiPath)',
      description: 'Automating repetitive computer tasks and business workflows using UiPath RPA.',
      displayOrder: 7,
      published: true,
      featured: true,
    },
    {
      category: 'Smart Automation & Tools',
      name: 'Git, Version Control & Project Workflows',
      description: 'Managing code with Git and GitHub, tracking changes, and working smoothly in development teams.',
      displayOrder: 8,
      published: true,
      featured: false,
    },
    {
      category: 'Problem Solving & Teamwork',
      name: 'Practical Problem Solving',
      description: 'Breaking down real-world challenges into simple, actionable steps during hackathons and projects.',
      displayOrder: 9,
      published: true,
      featured: true,
    },
    {
      category: 'Problem Solving & Teamwork',
      name: 'Teamwork & Clear Communication',
      description: 'Collaborating effectively with teammates, sharing ideas clearly, and presenting technical work.',
      displayOrder: 10,
      published: true,
      featured: true,
    },
    {
      category: 'Problem Solving & Teamwork',
      name: 'Quick & Continuous Learning',
      description: 'Picking up new programming tools, frameworks, and concepts quickly to get things built.',
      displayOrder: 11,
      published: true,
      featured: false,
    },
  ],
  projects: [
    {
      title: 'Water Level Predicting System',
      slug: 'water-level-predicting-system',
      shortDescription:
        'Smart groundwater prediction system using DWLR sensor data with real-time visualization and predictive analytics based on historical datasets.',
      fullDescription:
        'Developed a smart groundwater monitoring and prediction system built around Digital Water Level Recorder (DWLR) sensor data. The platform reads historical and live water-level measurements, displays clear charts across monitoring stations, and predicts upcoming water-table trends.',
      problemGoal:
        'Groundwater levels change across seasons and regions, and manual checks make it hard to spot water shortages early. The goal was to use DWLR sensor data to show live water levels and predict future trends.',
      solution:
        'Built an easy-to-read dashboard and data pipeline that cleans historical DWLR sensor readings, plots live water-level changes, and forecasts upcoming groundwater levels.',
      features: [
        'Cleans and organizes historical DWLR water-level sensor readings',
        'Interactive charts showing real-time groundwater depth and seasonal changes',
        'Predictive model that forecasts upcoming water-level trends',
        'Early warning highlights for stations with rapid water-level drops',
      ],
      technicalStack: [
        'Predictive Analytics',
        'DWLR Sensor Data',
        'Time-Series Visualization',
        'Data Processing Pipeline',
        'Web Dashboard',
      ],
      challenges:
        'Cleaning uneven historical sensor readings and keeping the live charts smooth when viewing multiple seasons of data.',
      learnings:
        'Learned how to prepare real-world sensor data, run trend predictions, and present data clearly on a web dashboard.',
      architectureNotes:
        'Organized into three clean layers: sensor data cleaning, trend prediction logic, and an interactive chart dashboard.',
      githubUrl: 'https://github.com/harimadav',
      liveUrl: null,
      featured: true,
      displayOrder: 1,
      status: 'published',
    },
    {
      title: 'Learning Management System (LMS)',
      slug: 'learning-management-system',
      shortDescription:
        'Role-based academic platform for students and teachers featuring course management, assignments, progress tracking, and grading.',
      fullDescription:
        'Designed and built a role-based Learning Management System (LMS) for students and teachers. The platform brings course materials, assignments, student submissions, progress tracking, and grading together in one clean web application.',
      problemGoal:
        'Scattered messages between teachers and students often cause missed deadlines and unclear grading feedback. The goal was to bring courses, assignments, and grades into one simple platform.',
      solution:
        'Created separate, easy-to-use dashboards for teachers and students so educators can post lessons and grade work while students submit assignments and track their progress.',
      features: [
        'Separate login views and permissions for Students and Teachers',
        'Simple course creation, lesson organization, and study material sharing',
        'Complete assignment workflow from posting to student submission and grading',
        'Clear progress tracking so students can see their completed work and scores',
      ],
      technicalStack: [
        'Role-Based Access Control',
        'Full-Stack Web',
        'Relational & Document Data Modeling',
        'RESTful APIs',
        'Responsive UI',
      ],
      challenges:
        'Keeping student and teacher permissions strictly separated while updating course progress immediately after every submission.',
      learnings:
        'Learned how to build multi-role login systems, structure course and assignment databases, and design user-friendly dashboards.',
      architectureNotes:
        'Role-based web architecture with dedicated routes for teacher actions (creating courses and grading) and student actions (enrolling and submitting work).',
      githubUrl: 'https://github.com/harimadav',
      liveUrl: null,
      featured: true,
      displayOrder: 2,
      status: 'published',
    },
    {
      title: 'E-Voting System',
      slug: 'e-voting-system',
      shortDescription:
        'Role-based online voting platform with Voters, Candidates, and Admin modules enabling authenticated voting and Admin-controlled result publication.',
      fullDescription:
        'Developed a secure online voting platform organized around three roles: Voters, Candidates, and Admin. Verified voters can view candidate profiles and cast a single ballot, while the election admin manages when voting closes and when official results are published.',
      problemGoal:
        'Paper ballots and basic online forms make it difficult to guarantee one-vote-per-person and keep results private until voting ends. The goal was to build a trustworthy digital voting system with clear role separation.',
      solution:
        'Built a three-role platform (Voter, Candidate, Admin) with verified voter login, one-vote-per-user protection, and an Admin control panel to manage election status and publish final results.',
      features: [
        'Dedicated dashboards for Voters, Candidates, and Election Admins',
        'Verified voter login that ensures each person can vote only once',
        'Candidate profile pages with manifestos and details',
        'Admin controls to close voting and publish verified final results',
      ],
      technicalStack: [
        'Authentication & Authorization',
        'State Machine Design',
        'Role-Based Modules',
        'Database Transactions',
        'Web Security',
      ],
      challenges:
        'Preventing duplicate votes and keeping vote counts hidden until the Admin officially marks the election as completed.',
      learnings:
        'Gained hands-on experience in secure user verification, database rules that prevent duplicate entries, and clear role-based interfaces.',
      architectureNotes:
        'Three-module web system using server-side verification and unique voter checks to keep every election accurate and fair.',
      githubUrl: 'https://github.com/harimadav',
      liveUrl: null,
      featured: true,
      displayOrder: 3,
      status: 'published',
    },
    {
      title: 'Library Management System',
      slug: 'library-management-system',
      shortDescription:
        'Application for managing book catalog records, member borrowing, returns, and real-time availability status.',
      fullDescription:
        'Developed a clean Library Management System to organize book catalogs, record member borrowing and returns, track due dates, and show live book availability.',
      problemGoal:
        'Manual paper registers in libraries make it slow to search for books and easy to lose track of borrowed copies. The goal was to digitize the book catalog and automatically update availability.',
      solution:
        'Built a database-backed library app that lets staff and members search books quickly and updates available copies automatically whenever a book is borrowed or returned.',
      features: [
        'Searchable book catalog sorted by title, author, and category',
        'Quick book issue and return recording for library members',
        'Live availability status showing whether a book is in stock',
        'Borrowing history and due-date tracking',
      ],
      technicalStack: [
        'Database CRUD Architecture',
        'Inventory State Management',
        'Search & Filtering',
        'Application Engineering',
      ],
      challenges:
        'Keeping book availability counts accurate when multiple books are issued and returned back-to-back.',
      learnings:
        'Strengthened my foundation in database CRUD operations, search filtering, and clean table layouts.',
      architectureNotes:
        'Connected book catalog table and borrowing records so availability updates automatically on every transaction.',
      githubUrl: 'https://github.com/harimadav',
      liveUrl: null,
      featured: false,
      displayOrder: 4,
      status: 'published',
    },
  ],
  experience: [
    {
      organization: 'Heavy Vehicles Factory (HVF)',
      role: 'Inplant Trainee',
      startDate: 'Jul 2025',
      endDate: 'Jul 2025',
      description:
        'Completed in-plant industrial training at Heavy Vehicles Factory (HVF), seeing firsthand how large-scale manufacturing teams coordinate production, quality checks, and engineering systems.',
      responsibilities: [
        'Observed end-to-end production lines and saw how large engineering units operate day to day.',
        'Learned how different technical departments coordinate workflows and quality inspections.',
        'Understood how standard operating procedures and technical documentation keep production reliable.',
      ],
      technologies: [
        'Industrial Operations',
        'Production Workflows',
        'Quality Standards',
        'Team Coordination',
      ],
      displayOrder: 1,
      status: 'published',
    },
    {
      organization: 'CODTECH IT Solutions Private Limited',
      role: 'Software Development Intern',
      startDate: 'Jun 2025',
      endDate: 'Jun 2025',
      description:
        'Worked as a Software Development Intern building practical application modules, writing clean code, and following structured development and testing steps.',
      responsibilities: [
        'Built and tested functional software modules using clean, readable coding practices.',
        'Used Git version control and step-by-step development workflows to manage code updates.',
        'Practiced debugging, testing features, and improving user-facing functionality.',
      ],
      technologies: [
        'Software Development',
        'Clean Coding',
        'Git & Version Control',
        'Application Testing',
      ],
      displayOrder: 2,
      status: 'published',
    },
  ],
  education: [
    {
      institution: 'Rajalakshmi Institute of Technology',
      program: 'B.E. Computer Science and Engineering',
      boardUniversity: 'B.E. CSE',
      startDate: '2024',
      endDate: '2028',
      academicInformation: 'CGPA: 8.49',
      description:
        'Pursuing my Bachelor of Engineering in Computer Science and Engineering with an 8.49 CGPA. Actively building software projects, participating in inter-college hackathons (winning 1st Place at Freshothon and Madha Engineering College), and presenting technical research.',
      displayOrder: 1,
      status: 'published',
    },
    {
      institution: 'Sudharsanam Vidyaashram',
      program: 'Class XII (Senior Secondary — CBSE)',
      boardUniversity: 'CBSE',
      startDate: '2023',
      endDate: '2024',
      academicInformation: 'Score: 85.0%',
      description:
        'Completed Class XII under the CBSE board with a strong focus on Mathematics, Physics, and Computer Science.',
      displayOrder: 2,
      status: 'published',
    },
    {
      institution: 'Sudharsanam Vidyaashram',
      program: 'Class X (Secondary — CBSE)',
      boardUniversity: 'CBSE',
      startDate: '2021',
      endDate: '2022',
      academicInformation: 'Score: 93.4%',
      description:
        'Completed Class X board examinations under CBSE with an overall score of 93.4%.',
      displayOrder: 3,
      status: 'published',
    },
  ],
  certifications: [
    {
      title: 'Automation Developer Associate Training',
      issuer: 'UiPath Academy',
      description:
        'Comprehensive training in Robotic Process Automation (RPA), workflow design, selector automation, and enterprise automation development practices.',
      completionDate: '2025',
      credentialId: 'UIPATH-ADA-SHS',
      fileStoragePath: '/assets/aistudio/S_HARI_SHANKAR_RESUME_12ccab42.pdf',
      thumbnailStoragePath: null,
      featured: true,
      displayOrder: 1,
      status: 'published',
    },
    {
      title: 'Advanced Image Analysis for Geospatial Professionals',
      issuer: 'ISRO (Indian Space Research Organisation)',
      description:
        'Specialized program covering remote sensing imagery, geospatial data processing, spectral analysis, and advanced image interpretation methodologies.',
      completionDate: '2025',
      credentialId: 'ISRO-GEO-SHS',
      fileStoragePath: '/assets/aistudio/S_HARI_SHANKAR_RESUME_12ccab42.pdf',
      thumbnailStoragePath: null,
      featured: true,
      displayOrder: 2,
      status: 'published',
    },
    {
      title: 'Design and Analysis of Algorithms',
      issuer: 'NPTEL',
      description:
        'Rigorous academic certification in asymptotic complexity, divide-and-conquer, greedy algorithms, dynamic programming, graph algorithms, and NP-completeness.',
      completionDate: '2025',
      credentialId: 'NPTEL-DAA-SHS',
      fileStoragePath: '/assets/aistudio/S_HARI_SHANKAR_RESUME_12ccab42.pdf',
      thumbnailStoragePath: null,
      featured: true,
      displayOrder: 3,
      status: 'published',
    },
    {
      title: 'MongoDB Basics for Students',
      issuer: 'MongoDB',
      description:
        'Foundational certification in document databases, BSON data modeling, CRUD operations, aggregation pipelines, and indexing strategies in MongoDB.',
      completionDate: '2025',
      credentialId: 'MONGODB-STU-SHS',
      fileStoragePath: '/assets/aistudio/S_HARI_SHANKAR_RESUME_12ccab42.pdf',
      thumbnailStoragePath: null,
      featured: true,
      displayOrder: 4,
      status: 'published',
    },
  ],
  siteSettings: {
    resumeFilePath: '/assets/aistudio/S_HARI_SHANKAR_RESUME_12ccab42.pdf',
    resumeFileName: 'S_HARI_SHANKAR_RESUME.pdf',
    siteTitle: 'S Hari Shankar — Engineering Portfolio',
    siteDescription:
      'Personal engineering portfolio and case study platform of S Hari Shankar — Computer Science Engineering student, software developer, and systems builder.',
    enableIntro: true,
    enable3dBackground: true,
    defaultTheme: 'dark',
  },
  socialLinks: [
    {
      platform: 'GitHub',
      label: 'github.com/harimadav',
      url: 'https://github.com/harimadav',
      displayOrder: 1,
      published: true,
    },
    {
      platform: 'LinkedIn',
      label: 'linkedin.com/in/harishankar2803',
      url: 'https://linkedin.com/in/harishankar2803',
      displayOrder: 2,
      published: true,
    },
    {
      platform: 'Email',
      label: 'harishankarism@gmail.com',
      url: 'mailto:harishankarism@gmail.com',
      displayOrder: 3,
      published: true,
    },
    {
      platform: 'Phone',
      label: '+91 8124607922',
      url: 'tel:+918124607922',
      displayOrder: 4,
      published: true,
    },
  ],
};
