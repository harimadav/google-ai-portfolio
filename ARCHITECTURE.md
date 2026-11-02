# System Architecture (`ARCHITECTURE.md`)

## 1. Frontend & Route Structure
The frontend is a modular React 19 + TypeScript application routed via `react-router-dom` inside a shared `SiteShell`:
- `/` (`HomePage.tsx`): Cinematic overview with 11 sections including Hero, About & Honours preview, Highlighted Skills, Featured Case Studies, Experience & Education previews, Featured Certifications, Resume Download & PDF Preview section, and Contact CTA.
- `/projects` (`ProjectsPage.tsx`): Filterable archive of all published projects.
- `/projects/:slug` (`ProjectDetailPage.tsx`): Full engineering case study page (Overview, Problem/Goal, Solution, Features, Stack, Architecture Notes, Challenges, Learnings, GitHub, and conditional Live Demo link).
- `/skills` (`SkillsPage.tsx`): Categorized skills and verified hackathon/research honours.
- `/experience` (`ExperiencePage.tsx`): Timeline cards of internships at Heavy Vehicles Factory (HVF) and CODTECH IT Solutions.
- `/education` (`EducationPage.tsx`): Academic history at Rajalakshmi Institute of Technology and Sudharsanam Vidyaashram.
- `/certifications` (`CertificationsPage.tsx`): Verified certifications with interactive document viewer modal.
- `/contact` (`ContactPage.tsx`): Direct coordinates, social links, and database-backed contact message form.
- `/admin` (`AdminPage.tsx`): Protected Admin Control Center for full CRUD and controlled file uploads.

## 2. Server / Client Boundary
- **Server (`server.ts`, `src/db/*`, `src/middleware/auth.ts`, `src/lib/firebase-admin.ts`)**: Holds all PostgreSQL credentials (`SQL_USER`, `SQL_PASSWORD`, `SQL_HOST`) and Firebase Admin verification. Never exposes database credentials to the browser.
- **Client (`src/pages/*`, `src/components/*`, `src/context/PortfolioContext.tsx`)**: Reads public data via `GET /api/portfolio` and `GET /api/projects/:slug`, and performs authenticated Admin mutations via `/api/admin/*` with a `Bearer` token.

## 3. Database Access & Schema (`src/db/schema.ts`)
Uses `pg.Pool` (configured via the Object Method with global caching in `src/db/index.ts`) and `drizzle-orm` in `src/db/repository.ts`. All queries use two-layer error handling: repository functions catch and sanitize database errors, and Express route handlers return structured JSON status codes.

## 4. Controlled File Storage Flow
When Admin uploads a replacement Resume PDF or Certificate file:
1. Client validates file selection and encodes payload to base64.
2. Server (`POST /api/admin/upload`) verifies Admin authorization and validates MIME type (`application/pdf`, `image/png`, `image/jpeg`, `image/webp`) and size (`<= 8MB`) via `validateFileUpload()`.
3. File is persisted in the `uploaded_files` PostgreSQL table and assigned a deterministic `/api/storage/<timestamp>_<filename>` URL.
4. `GET /api/storage/:filename` streams the binary buffer with appropriate `Content-Type` and `Content-Disposition` headers.

## 5. Cache & Revalidation Flow
`PortfolioCache` (`src/utils/portfolioLogic.ts`) caches public reads (`public_portfolio` and `project_<slug>`) in server memory. Every successful Admin mutation calls `portfolioCache.invalidate(...)`, incrementing the cache version and evicting affected keys so subsequent public requests immediately read fresh PostgreSQL state.
