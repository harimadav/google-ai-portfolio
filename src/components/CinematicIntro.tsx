import React, { useEffect, useRef, useState } from 'react';
import { FastForward } from 'lucide-react';

interface CinematicIntroProps {
  profileImageUrl: string;
  onComplete: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({
  profileImageUrl,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<'loading' | 'droplets' | 'portrait' | 'fading'>('loading');
  const [revealedCount, setRevealedCount] = useState(0);

  const line1 = 'LOADING';
  const line2 = 'PORTFOLIO';
  const totalLetters = line1.length + line2.length;

  // Snappy, fast intro sequence (~1.85 seconds total)
  useEffect(() => {
    const stepMs = 24;
    const interval = window.setInterval(() => {
      setRevealedCount((prev) => {
        if (prev >= totalLetters) {
          window.clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, stepMs);

    const toDropletsTimer = window.setTimeout(() => {
      setPhase('droplets');
    }, totalLetters * stepMs + 160);

    const toPortraitTimer = window.setTimeout(() => {
      setPhase('portrait');
    }, totalLetters * stepMs + 950);

    const toFadeTimer = window.setTimeout(() => {
      setPhase('fading');
    }, totalLetters * stepMs + 1350);

    const toCompleteTimer = window.setTimeout(() => {
      onComplete();
    }, totalLetters * stepMs + 1650);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(toDropletsTimer);
      window.clearTimeout(toPortraitTimer);
      window.clearTimeout(toFadeTimer);
      window.clearTimeout(toCompleteTimer);
    };
  }, [totalLetters, onComplete]);

  // Fast upward-to-downward flowing droplets forming the portrait
  useEffect(() => {
    if (phase !== 'droplets' && phase !== 'portrait') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = Math.min(window.innerWidth, 880));
    const height = (canvas.height = Math.min(window.innerHeight, 520));

    interface DropletParticle {
      x: number;
      y: number;
      tx: number;
      ty: number;
      vy: number;
      color: string;
      size: number;
    }

    const particles: DropletParticle[] = [];
    const portraitSize = 230;
    const cx = width / 2;
    const cy = height / 2;

    const buildDropletsFromImage = (img?: HTMLImageElement) => {
      const off = document.createElement('canvas');
      off.width = portraitSize;
      off.height = portraitSize;
      const octx = off.getContext('2d');
      if (octx && img) {
        octx.drawImage(img, 0, 0, portraitSize, portraitSize);
        const imgData = octx.getImageData(0, 0, portraitSize, portraitSize).data;
        const step = 4;
        for (let y = 0; y < portraitSize; y += step) {
          for (let x = 0; x < portraitSize; x += step) {
            const idx = (y * portraitSize + x) * 4;
            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            const a = imgData[idx + 3];
            const dx = x - portraitSize / 2;
            const dy = y - portraitSize / 2;
            if (a > 60 && dx * dx + dy * dy <= (portraitSize / 2) ** 2) {
              const targetX = cx - portraitSize / 2 + x;
              const targetY = cy - portraitSize / 2 + y;
              particles.push({
                x: targetX + (Math.random() - 0.5) * 20,
                y: -10 - Math.random() * 180 - (portraitSize - y) * 0.35,
                tx: targetX,
                ty: targetY,
                vy: 9.5 + Math.random() * 6.5,
                color: `rgb(${r},${g},${b})`,
                size: 2.6,
              });
            }
          }
        }
      } else {
        for (let i = 0; i < 650; i++) {
          const angle = Math.random() * Math.PI * 2;
          const rad = Math.sqrt(Math.random()) * (portraitSize / 2);
          const targetX = cx + Math.cos(angle) * rad;
          const targetY = cy + Math.sin(angle) * rad;
          particles.push({
            x: targetX + (Math.random() - 0.5) * 20,
            y: -10 - Math.random() * 180,
            tx: targetX,
            ty: targetY,
            vy: 9.5 + Math.random() * 6,
            color: i % 2 === 0 ? '#10b981' : '#f97316',
            size: 2.5,
          });
        }
      }
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => buildDropletsFromImage(img);
    img.onerror = () => buildDropletsFromImage();
    img.src = profileImageUrl;

    let rafId = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.y < p.ty) {
          p.y = Math.min(p.ty, p.y + p.vy);
          p.x += (p.tx - p.x) * 0.25;
        } else {
          p.x = p.tx;
          p.y = p.ty;
        }
        ctx.fillStyle = p.color;
        ctx.beginPath();
        const isFalling = p.y < p.ty - 2;
        if (isFalling) {
          ctx.ellipse(p.x, p.y, p.size * 0.72, p.size * 1.45, 0, 0, Math.PI * 2);
        } else {
          ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(rafId);
  }, [phase, profileImageUrl]);

  const l1Visible = line1.slice(0, Math.min(revealedCount, line1.length));
  const l2Visible =
    revealedCount > line1.length
      ? line2.slice(0, revealedCount - line1.length)
      : '';
  const progressPct = Math.min(100, Math.round((revealedCount / totalLetters) * 100));

  return (
    <div
      data-testid="cinematic-intro-overlay"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B110E] text-[#F4F3EF] transition-opacity duration-300 ${
        phase === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top-right Skip Intro button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          type="button"
          onClick={onComplete}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-stone-200 bg-[#141F1A] border border-emerald-500/30 rounded-lg hover:bg-emerald-950/70 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>Skip Intro</span>
          <FastForward className="w-3.5 h-3.5 text-orange-400" />
        </button>
      </div>

      {/* Phase 1: Loading Portfolio */}
      {phase === 'loading' && (
        <div className="text-center px-6 select-none max-w-md w-full">
          <div className="text-xs font-mono tracking-[0.35em] text-emerald-400 mb-3 h-5">
            {l1Visible.split('').map((ch, idx) => (
              <span key={idx} className="inline-block">
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </div>
          <div className="text-3xl sm:text-5xl font-display font-bold tracking-[0.14em] text-[#F4F3EF] min-h-[3.5rem]">
            {l2Visible.split('').map((ch, idx) => (
              <span key={idx} className="inline-block">
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </div>
          <div className="mt-6 w-56 mx-auto h-1.5 rounded-full bg-stone-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-orange-500 transition-all duration-100"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Phase 2 & 3: Fast Upward-to-Downward Droplet Convergence into Profile Photo */}
      {(phase === 'droplets' || phase === 'portrait' || phase === 'fading') && (
        <div className="relative flex flex-col items-center justify-center w-full max-w-4xl h-[420px]">
          <canvas
            ref={canvasRef}
            className={`w-full h-full object-contain transition-opacity duration-300 ${
              phase === 'portrait' || phase === 'fading' ? 'opacity-35' : 'opacity-100'
            }`}
          />
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 ${
              phase === 'portrait' || phase === 'fading'
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-95'
            }`}
          >
            <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-2 border-emerald-500/70 shadow-2xl bg-[#121C17]">
              <img
                src={profileImageUrl}
                alt="S HARI SHANKAR Portrait"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <p className="mt-5 text-sm font-mono tracking-widest text-emerald-400">
              S HARI SHANKAR
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
