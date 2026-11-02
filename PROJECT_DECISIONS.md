# Project Decisions (`PROJECT_DECISIONS.md`)

## 1. Platform & Stack Adaptation
- **Full-Stack Express + Vite + React Router SPA/SSR-API Hybrid**: Preserves the repository's native AI Studio runtime (`express` + `vite` + `tsx server.ts` on port 3000) while implementing all required multi-page routes (`/`, `/projects`, `/projects/:slug`, `/skills`, `/experience`, `/education`, `/certifications`, `/contact`, `/admin`) and strict server/client security boundaries.
- **Cloud SQL for PostgreSQL + Drizzle ORM + Firebase Auth**: The Master Prompt specifies PostgreSQL persistence, authentication, and controlled file storage. In the AI Studio environment, Cloud SQL (PostgreSQL in `asia-southeast1`) with Drizzle ORM and Firebase Authentication provides a real, managed relational PostgreSQL instance and verified Google OAuth + passkey authentication.

## 2. Database-Driven Content & Automatic Initial Seeding
- All portfolio entities (`profile`, `about`, `skills`, `projects`, `project_images`, `experience`, `education`, `certifications`, `site_settings`, `social_links`) live in PostgreSQL.
- Initial seed data in `src/utils/portfolioLogic.ts` is sourced strictly from S Hari Shankar's attached resume (`S_HARI_SHANKAR_RESUME_12ccab42.pdf`) and profile photo (`BLAZER_PROFILE_PHOTO_b36c8952.png`) with zero fabricated facts.

## 3. Why Resume Is a Home Section
- Per Section 8, 11, and 54 of the Master Prompt, Resume is modeled as a dedicated section on the Home page (`/#resume-section`) with inline PDF preview and direct download rather than a standalone `/resume` route, keeping the primary user journey cohesive.

## 4. Why OCR Is Excluded
- Per Section 2 and 23 of the Master Prompt, certifications use deterministic manual metadata entry and controlled file storage without OCR/AI extraction complexity.

## 5. Performance & Software-WebGL Safeguards
- `EngineeringBackground3D.tsx` detects software WebGL (`SwiftShader`/`llvmpipe`) from the WebGL2 renderer string and paces frames using `gl.fenceSync` (`afterDraw`) so CPU-rendered headless browsers and low-power devices never stall.
- `CinematicIntro.tsx` provides an immediate `"Skip Intro"` button, honors `prefers-reduced-motion`, and supports `?autostart=1` for instant access.
