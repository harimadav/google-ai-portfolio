# S Hari Shankar — Personal Engineering Portfolio

## 1. What the Project Is
A database-driven personal engineering portfolio platform for **S Hari Shankar** (B.E. Computer Science and Engineering, Rajalakshmi Institute of Technology, Anna University). It presents his education, technical skills, internships, project case studies, certifications, official resume, and contact channels in a cinematic, technically sophisticated interface with a protected Admin content management system.

## 2. Technology Stack
- **Full-Stack Runtime**: Node.js + Express (`server.ts`) + React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (`@tailwindcss/vite`) with custom Dark/Light theme support
- **3D & Motion**: Three.js (`EngineeringBackground3D.tsx`) + Canvas 2D particle portrait (`CinematicIntro.tsx`)
- **Database**: Google Cloud SQL for PostgreSQL (`asia-southeast1`) + Drizzle ORM (`drizzle-orm`, `drizzle-kit`, `pg`)
- **Authentication**: Firebase Authentication (Google Sign-In via `firebase` & `firebase-admin` + Owner Passkey verification)
- **Controlled Storage**: PostgreSQL-backed controlled binary storage (`uploaded_files` table served via `/api/storage/:filename`) + static assets (`/assets/aistudio/...`)

## 3. Installation & Development Commands
```bash
npm install
npm run dev         # Starts Express + Vite full-stack server on http://0.0.0.0:3000
npm run test        # Runs unit tests via tsx --test src/utils/portfolioLogic.test.ts
npm run lint        # Runs TypeScript type checking (tsc --noEmit)
npm run build       # Builds production frontend bundle into dist/
npm run start       # Runs production server (NODE_ENV=production tsx server.ts)
```

## 4. Environment Variables
- `SQL_HOST`: Unix socket or host path for Cloud SQL Auth Proxy
- `SQL_DB_NAME`: PostgreSQL database name
- `SQL_USER` / `SQL_PASSWORD`: Runtime application database credentials
- `SQL_ADMIN_USER` / `SQL_ADMIN_PASSWORD`: Drizzle Kit schema migration credentials
- `APP_URL`: Public application URL for SEO and sitemaps

## 5. High-Level Architecture & Database Setup
- Schema is defined in `src/db/schema.ts` and managed via `src/db/drizzle.config.ts`.
- All 13 tables (`users`, `profile`, `about`, `skills`, `projects`, `project_images`, `experience`, `education`, `certifications`, `site_settings`, `social_links`, `uploaded_files`, `contact_messages`) are provisioned in PostgreSQL.
- On first read, `ensureSeeded()` in `src/db/repository.ts` populates the database with S Hari Shankar's verified resume data if the tables are empty.

## 6. How Admin Works
- Visit `/admin` and authenticate using Google Sign-In (`harishankarism@gmail.com`) or the Owner Passkey (`hari-admin-2026`).
- All Admin mutations (`POST`, `PUT`, `DELETE` under `/api/admin/*`) validate input server-side, verify authorization via `requireAuth` middleware, write to PostgreSQL, and invalidate `PortfolioCache` so public pages immediately reflect updated content.
