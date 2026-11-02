import React from 'react';
import { Activity, BookOpen, ShieldCheck, Layers } from 'lucide-react';

interface ProjectSystemPreviewProps {
  slug: string;
  title: string;
  isDark: boolean;
}

export const ProjectSystemPreview: React.FC<ProjectSystemPreviewProps> = ({
  slug,
  title,
  isDark,
}) => {
  const s = slug.toLowerCase();

  if (s.includes('water')) {
    return (
      <div
        className={`p-5 border-b relative overflow-hidden ${
          isDark
            ? 'bg-[#0D1713] border-emerald-900/60'
            : 'bg-emerald-950 text-stone-100 border-stone-200'
        }`}
      >
        <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 mb-3">
          <span className="inline-flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            DWLR SENSOR TELEMETRY · LIVE PREVIEW
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
            FORECAST ACTIVE
          </span>
        </div>

        {/* Animated SVG Groundwater Time-Series & Prediction Curve */}
        <svg
          viewBox="0 0 360 88"
          className="w-full h-22 overflow-visible"
          aria-label={`${title} animated preview`}
        >
          <defs>
            <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            y1="22"
            x2="360"
            y2="22"
            stroke="rgba(16,185,129,0.15)"
            strokeDasharray="3 3"
          />
          <line
            x1="0"
            y1="56"
            x2="360"
            y2="56"
            stroke="rgba(16,185,129,0.15)"
            strokeDasharray="3 3"
          />
          <path
            d="M 0 62 Q 45 36, 90 48 T 180 34 T 250 42 L 250 84 L 0 84 Z"
            fill="url(#waterGrad)"
          />
          <path
            d="M 0 62 Q 45 36, 90 48 T 180 34 T 250 42"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
          />
          <path
            d="M 250 42 Q 295 24, 355 28"
            fill="none"
            stroke="#f97316"
            strokeWidth="2.5"
            strokeDasharray="5 4"
          />
          <circle cx="90" cy="48" r="3.5" fill="#10b981" />
          <circle cx="180" cy="34" r="3.5" fill="#10b981" />
          <circle cx="250" cy="42" r="4" fill="#f97316">
            <animate
              attributeName="r"
              values="3.5;6;3.5"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="355" cy="28" r="3.5" fill="#f97316" />
        </svg>

        <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-stone-300">
          <span>Historical DWLR Readings (Green)</span>
          <span className="text-amber-300">Predicted Water Table (Orange)</span>
        </div>
      </div>
    );
  }

  if (s.includes('learning') || s.includes('lms')) {
    return (
      <div
        className={`p-5 border-b relative overflow-hidden ${
          isDark
            ? 'bg-[#0D1713] border-emerald-900/60'
            : 'bg-emerald-950 text-stone-100 border-stone-200'
        }`}
      >
        <div className="flex items-center justify-between text-[11px] font-mono text-amber-300 mb-3">
          <span className="inline-flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            ROLE-BASED ACADEMIC WORKSPACE
          </span>
          <span className="px-2 py-0.5 rounded bg-orange-500/20 text-amber-300">
            TEACHER & STUDENT ROLES
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-black/35 border border-emerald-500/25">
            <p className="text-[10px] text-emerald-400">INSTRUCTOR PORTAL</p>
            <p className="mt-1 text-stone-100 font-semibold">Course & Grading</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-stone-800 overflow-hidden">
              <div className="h-full w-4/5 bg-emerald-500 animate-pulse" />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-black/35 border border-orange-500/25">
            <p className="text-[10px] text-amber-300">STUDENT PORTAL</p>
            <p className="mt-1 text-stone-100 font-semibold">Assignments & Progress</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-stone-800 overflow-hidden">
              <div className="h-full w-11/12 bg-orange-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (s.includes('voting')) {
    return (
      <div
        className={`p-5 border-b relative overflow-hidden ${
          isDark
            ? 'bg-[#0D1713] border-emerald-900/60'
            : 'bg-emerald-950 text-stone-100 border-stone-200'
        }`}
      >
        <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 mb-3">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
            3-TIER ELECTION STATE ENGINE
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
            1 VOTER = 1 BALLOT
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono py-2">
          <div className="p-2.5 rounded-xl bg-black/35 border border-emerald-500/30">
            <p className="text-emerald-400 font-semibold">1. VOTER</p>
            <p className="text-[10px] text-stone-300 mt-0.5">Verified Auth</p>
          </div>
          <div className="p-2.5 rounded-xl bg-black/35 border border-orange-500/30">
            <p className="text-amber-300 font-semibold">2. CANDIDATE</p>
            <p className="text-[10px] text-stone-300 mt-0.5">Ballot Roster</p>
          </div>
          <div className="p-2.5 rounded-xl bg-black/35 border border-emerald-500/30">
            <p className="text-emerald-400 font-semibold">3. ADMIN</p>
            <p className="text-[10px] text-stone-300 mt-0.5">Result Lock</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-5 border-b relative overflow-hidden ${
        isDark
          ? 'bg-[#0D1713] border-emerald-900/60'
          : 'bg-emerald-950 text-stone-100 border-stone-200'
      }`}
    >
      <div className="flex items-center justify-between text-[11px] font-mono text-amber-300 mb-3">
        <span className="inline-flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          CATALOG & CIRCULATION ENGINE
        </span>
        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
          LIVE INVENTORY
        </span>
      </div>

      <div className="space-y-2 text-[11px] font-mono">
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-black/35 border border-emerald-500/25">
          <span className="text-stone-200">Catalog Search & Issue</span>
          <span className="text-emerald-400">● IN STOCK</span>
        </div>
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-black/35 border border-orange-500/25">
          <span className="text-stone-200">Borrower Return Sync</span>
          <span className="text-amber-300">AUTO-UPDATED</span>
        </div>
      </div>
    </div>
  );
};
