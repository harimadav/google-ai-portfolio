import React, { useEffect, useRef } from 'react';

interface DropletPortraitProps {
  imageUrl: string;
  alt: string;
  isDark: boolean;
}

interface Droplet {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speedY: number;
  color: string;
  radius: number;
  columnDelay: number;
  phaseOffset: number;
}

export const DropletPortrait: React.FC<DropletPortraitProps> = ({
  imageUrl,
  alt,
  isDark,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 300;
    const height = 350;
    canvas.width = width;
    canvas.height = height;

    let rafId = 0;
    let isCancelled = false;
    const droplets: Droplet[] = [];

    const createDropletsFromImage = (img?: HTMLImageElement) => {
      droplets.length = 0;
      const off = document.createElement('canvas');
      off.width = width;
      off.height = height;
      const octx = off.getContext('2d');

      if (octx && img) {
        const scale = Math.max(width / img.width, height / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const offsetX = (width - drawW) / 2;
        octx.drawImage(img, offsetX, 0, drawW, drawH);

        const imgData = octx.getImageData(0, 0, width, height).data;
        // High-density 4px grid so the portrait is unmistakably formed by droplets alone (no static photo underlay!)
        const step = 4;

        for (let y = 0; y < height; y += step) {
          for (let x = 0; x < width; x += step) {
            const idx = (y * width + x) * 4;
            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            const a = imgData[idx + 3];

            if (a > 35) {
              const startY = -12 - Math.random() * 190 - (height - y) * 0.45;
              droplets.push({
                x: x + (Math.random() - 0.5) * 2.5,
                y: startY,
                targetX: x,
                targetY: y,
                speedY: 3.4 + Math.random() * 2.6,
                color: `rgb(${r},${g},${b})`,
                radius: 2.1,
                columnDelay: (x / width) * 18 + Math.random() * 14,
                phaseOffset: Math.random() * Math.PI * 2,
              });
            }
          }
        }
      } else {
        for (let y = 8; y < height; y += 5) {
          for (let x = 8; x < width; x += 5) {
            droplets.push({
              x,
              y: -Math.random() * height,
              targetX: x,
              targetY: y,
              speedY: 3.5 + Math.random() * 2.2,
              color: (x + y) % 2 === 0 ? '#10b981' : '#f97316',
              radius: 2.1,
              columnDelay: (x / width) * 18,
              phaseOffset: Math.random() * Math.PI * 2,
            });
          }
        }
      }
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (isCancelled) return;
      createDropletsFromImage(img);
    };
    img.onerror = () => {
      if (isCancelled) return;
      createDropletsFromImage();
    };
    img.src = imageUrl;

    // Continuous cycle:
    // 0..115 frames: droplets rain downward from top to assemble portrait
    // 115..220 frames: portrait shimmers with a continuous top-to-bottom droplet wave & active streams
    // 220..265 frames: droplets cascade downward out the bottom and immediately reset to top for next cycle!
    const CYCLE_LENGTH = 265;
    let cycleFrame = 0;

    const resetDropletsForNewCycle = () => {
      for (let i = 0; i < droplets.length; i++) {
        const d = droplets[i];
        d.x = d.targetX + (Math.random() - 0.5) * 3;
        d.y = -10 - Math.random() * 170 - (height - d.targetY) * 0.4;
        d.speedY = 3.6 + Math.random() * 2.6;
      }
    };

    const render = () => {
      if (isCancelled) return;
      cycleFrame = (cycleFrame + 1) % CYCLE_LENGTH;
      if (cycleFrame === 0) {
        resetDropletsForNewCycle();
      }

      ctx.clearRect(0, 0, width, height);

      // Travelling horizontal scan wave that flows from top to bottom continuously
      const waveY = ((cycleFrame * 3.2) % (height + 80)) - 40;

      for (let i = 0; i < droplets.length; i++) {
        const d = droplets[i];

        if (cycleFrame < 220) {
          // Forming & shimmering phase
          if (cycleFrame >= d.columnDelay) {
            if (d.y < d.targetY) {
              d.y = Math.min(d.targetY, d.y + d.speedY);
              d.x += (d.targetX - d.x) * 0.25;
            } else {
              d.x = d.targetX;
              d.y = d.targetY;
            }
          }
        } else {
          // Cascading downward phase before next top-to-bottom rain cycle
          const exitAccel = (cycleFrame - 220) * 0.32;
          d.y += d.speedY * 0.85 + exitAccel;
        }

        // Check if droplet is still falling or affected by the top-to-bottom ripple wave
        const isFalling = d.y < d.targetY - 1.5 || cycleFrame >= 220;
        const distToWave = Math.abs(d.y - waveY);
        const waveBoost = distToWave < 22 ? (1 - distToWave / 22) * 0.85 : 0;

        ctx.fillStyle = d.color;
        ctx.beginPath();
        if (isFalling) {
          // Elongated falling droplet
          ctx.ellipse(
            d.x,
            d.y,
            d.radius * 0.78,
            d.radius * 1.48,
            0,
            0,
            Math.PI * 2
          );
        } else {
          // Settled droplet with subtle top-to-bottom wave pulse
          const r = d.radius + waveBoost * 0.65;
          ctx.arc(d.x, d.y + waveBoost * 1.6, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      // Continuous foreground emerald & orange droplets flowing top-to-bottom
      const streamCount = 18;
      for (let s = 0; s < streamCount; s++) {
        const sx = ((s * 19 + cycleFrame * 0.2) % (width - 12)) + 6;
        const sy = ((cycleFrame * (3.2 + (s % 4) * 0.65) + s * 37) % (height + 50)) - 25;
        ctx.fillStyle =
          s % 2 === 0 ? 'rgba(16, 185, 129, 0.72)' : 'rgba(249, 115, 22, 0.72)';
        ctx.beginPath();
        ctx.ellipse(sx, sy, 1.9, 4.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      isCancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [imageUrl]);

  return (
    <div
      className={`relative mx-auto w-[280px] h-[330px] sm:w-[300px] sm:h-[350px] rounded-2xl overflow-hidden border shadow-lg ${
        isDark
          ? 'border-emerald-500/40 bg-[#0A110E]'
          : 'border-emerald-700/25 bg-[#121A16]'
      }`}
    >
      <canvas
        ref={canvasRef}
        aria-label={alt}
        role="img"
        className="w-full h-full object-cover block"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-between px-3.5 pb-2.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          DROPLET STREAM
        </span>
        <span className="text-[11px] font-mono font-semibold text-amber-300">
          S HARI SHANKAR
        </span>
      </div>
    </div>
  );
};
