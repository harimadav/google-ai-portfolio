import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { PortfolioPayload } from '../types/portfolio.ts';
import { INITIAL_PORTFOLIO_SEED } from '../utils/portfolioLogic.ts';

interface PortfolioContextValue {
  data: PortfolioPayload;
  loading: boolean;
  error: string | null;
  refreshPortfolio: () => Promise<void>;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  introCompleted: boolean;
  completeIntro: () => void;
  replayIntro: () => void;
  firebaseUser: User | null;
  adminToken: string | null;
  adminEmail: string | null;
  signInWithGoogleAdmin: () => Promise<void>;
  signInWithPasskeyAdmin: (passkey: string) => Promise<boolean>;
  signOutAdmin: () => Promise<void>;
}

const fallbackPayload: PortfolioPayload = {
  profile: INITIAL_PORTFOLIO_SEED.profile,
  about: INITIAL_PORTFOLIO_SEED.about,
  skills: INITIAL_PORTFOLIO_SEED.skills.map((s, idx) => ({ ...s, id: idx + 1 })),
  projects: INITIAL_PORTFOLIO_SEED.projects.map((p, idx) => ({ ...p, id: idx + 1, images: [] })),
  experience: INITIAL_PORTFOLIO_SEED.experience.map((e, idx) => ({ ...e, id: idx + 1 })),
  education: INITIAL_PORTFOLIO_SEED.education.map((ed, idx) => ({ ...ed, id: idx + 1 })),
  certifications: INITIAL_PORTFOLIO_SEED.certifications.map((c, idx) => ({ ...c, id: idx + 1 })),
  siteSettings: INITIAL_PORTFOLIO_SEED.siteSettings,
  socialLinks: INITIAL_PORTFOLIO_SEED.socialLinks.map((s, idx) => ({ ...s, id: idx + 1 })),
};

const PortfolioContext = createContext<PortfolioContextValue | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PortfolioPayload>(fallbackPayload);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('hari_portfolio_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore storage errors
    }
    return 'dark';
  });

  const [introCompleted, setIntroCompleted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') return true;
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return true;
    }
    return false;
  });

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('hari_portfolio_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const completeIntro = useCallback(() => {
    setIntroCompleted(true);
  }, []);

  const replayIntro = useCallback(() => {
    setIntroCompleted(false);
  }, []);

  const refreshPortfolio = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/portfolio');
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status})`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load portfolio data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPortfolio();
  }, [refreshPortfolio]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          setAdminToken(token);
          setAdminEmail(user.email || 'harishankarism@gmail.com');
        } catch (err) {
          console.error('Failed to retrieve ID token:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogleAdmin = useCallback(async () => {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const token = await result.user.getIdToken();
    setAdminToken(token);
    setAdminEmail(result.user.email || 'harishankarism@gmail.com');
  }, []);

  const signInWithPasskeyAdmin = useCallback(async (passkey: string): Promise<boolean> => {
    const candidateToken = `passkey:${passkey.trim()}`;
    const res = await fetch('/api/admin/portfolio', {
      headers: {
        Authorization: `Bearer ${candidateToken}`,
      },
    });
    if (res.ok) {
      setAdminToken(candidateToken);
      setAdminEmail('harishankarism@gmail.com');
      return true;
    }
    return false;
  }, []);

  const signOutAdmin = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore if passkey session
    }
    setAdminToken(null);
    setAdminEmail(null);
  }, []);

  return (
    <PortfolioContext.Provider
      value={{
        data,
        loading,
        error,
        refreshPortfolio,
        theme,
        toggleTheme,
        introCompleted,
        completeIntro,
        replayIntro,
        firebaseUser,
        adminToken,
        adminEmail,
        signInWithGoogleAdmin,
        signInWithPasskeyAdmin,
        signOutAdmin,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return ctx;
}
