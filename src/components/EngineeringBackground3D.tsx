import React, { useEffect, useRef } from 'react';

interface EngineeringBackground3DProps {
  theme: 'dark' | 'light';
  enabled?: boolean;
}

const MATH_AND_SOFTWARE_LABELS = [
  { text: '∫ e^(-x²) dx = √π / 2', kind: 'math' },
  { text: 'f(t) = ∑ c(n) · e^(i·n·ω·t)', kind: 'math' },
  { text: 'O(N log N) · Divide & Conquer', kind: 'code' },
  { text: 'dx/dt = σ(y - x), dy/dt = x(ρ - z) - y', kind: 'math' },
  { text: 'verifyAuthRole(user, "ADMIN") => true', kind: 'code' },
  { text: 'det(A - λI) = 0 · Eigenvalues', kind: 'math' },
  { text: 'SELECT * FROM projects WHERE published = true;', kind: 'code' },
  { text: '∇ × F = (∂Fz/∂y - ∂Fy/∂z)i', kind: 'math' },
  { text: 'predictWaterLevel(dwlrSensorStream)', kind: 'code' },
  { text: 'P(A|B) = [P(B|A) · P(A)] / P(B)', kind: 'math' },
  { text: 'async function commitBallot(voterId) {}', kind: 'code' },
  { text: 'φ = (1 + √5) / 2 ≈ 1.61803', kind: 'math' },
];

const SOFTWARE_NODES = [
  { label: 'Auth & RBAC', rx: -0.34, ry: -0.24, rz: 0.2 },
  { label: 'REST API Core', rx: -0.14, ry: -0.32, rz: -0.15 },
  { label: 'PostgreSQL DB', rx: 0.18, ry: -0.26, rz: 0.1 },
  { label: 'DWLR Telemetry', rx: 0.36, ry: -0.1, rz: -0.2 },
  { label: 'Predictive Model', rx: 0.28, ry: 0.24, rz: 0.18 },
  { label: 'State Machine', rx: -0.26, ry: 0.22, rz: -0.12 },
];

const SOFTWARE_EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 4],
  [3, 4],
  [0, 5],
  [5, 2],
  [1, 3],
];

export const EngineeringBackground3D: React.FC<EngineeringBackground3DProps> = ({
  theme,
  enabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef<'dark' | 'light'>(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // Precompute 3D Lorenz Attractor points for 3D mathematical ribbon
    const lorenzPoints: { x: number; y: number; z: number }[] = [];
    let lx = 0.1;
    let ly = 0;
    let lz = 0;
    const sigma = 10;
    const rho = 28;
    const beta = 8 / 3;
    const dt = 0.008;
    for (let i = 0; i < 380; i++) {
      const dx = sigma * (ly - lx) * dt;
      const dy = (lx * (rho - lz) - ly) * dt;
      const dz = (lx * ly - beta * lz) * dt;
      lx += dx;
      ly += dy;
      lz += dz;
      lorenzPoints.push({
        x: lx * 8.5,
        y: ly * 8.5,
        z: (lz - 25) * 8.5,
      });
    }

    // Floating math & code expressions
    const floatingItems = MATH_AND_SOFTWARE_LABELS.map((item, idx) => ({
      ...item,
      x: ((idx * 211) % Math.max(width - 220, 200)) + 40,
      y: ((idx * 139) % Math.max(height - 100, 200)) + 50,
      vx: (idx % 2 === 0 ? 1 : -1) * (0.14 + (idx % 3) * 0.04),
      vy: -0.22 - (idx % 4) * 0.05,
    }));

    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / Math.max(width, 1) - 0.5) * 2;
      mouseY = (e.clientY / Math.max(height, 1) - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // 3D perspective projection helper
    const project3D = (
      x: number,
      y: number,
      z: number,
      cx: number,
      cy: number,
      fov = 520
    ) => {
      const depth = Math.max(fov + z, 80);
      const scale = fov / depth;
      return {
        px: cx + x * scale,
        py: cy + y * scale,
        scale,
      };
    };

    let rafId = 0;
    let time = 0;

    const render = () => {
      time += 0.016;
      const isDark = themeRef.current === 'dark';

      ctx.clearRect(0, 0, width, height);

      // 1. 3D Perspective Mathematical Wave Surface along lower horizon
      const cols = 18;
      const rows = 8;
      const spacingX = Math.max(width / (cols - 2), 70);
      const spacingZ = 55;
      const waveCenterX = width * 0.5 + mouseX * 18;
      const waveCenterY = height * 0.76 + mouseY * 12;

      ctx.lineWidth = 1;
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const wx = (c - cols / 2) * spacingX * 0.68;
          const wz = (r - 1) * spacingZ + 40;
          const wy =
            Math.sin(c * 0.45 + time * 1.3) * 26 +
            Math.cos(r * 0.6 - time * 1.1) * 18 +
            90;
          const { px, py } = project3D(wx, wy, wz, waveCenterX, waveCenterY, 540);
          if (c === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = isDark
          ? `rgba(16, 185, 129, ${0.19 - r * 0.018})`
          : `rgba(5, 150, 105, ${0.15 - r * 0.014})`;
        ctx.stroke();
      }

      // Draw glowing 3D vertices on the mathematical surface
      for (let r = 0; r < rows; r += 2) {
        for (let c = 0; c < cols; c += 2) {
          const wx = (c - cols / 2) * spacingX * 0.68;
          const wz = (r - 1) * spacingZ + 40;
          const wy =
            Math.sin(c * 0.45 + time * 1.3) * 26 +
            Math.cos(r * 0.6 - time * 1.1) * 18 +
            90;
          const { px, py, scale } = project3D(
            wx,
            wy,
            wz,
            waveCenterX,
            waveCenterY,
            540
          );
          ctx.fillStyle =
            (r + c) % 4 === 0
              ? isDark
                ? 'rgba(251, 146, 60, 0.38)'
                : 'rgba(234, 88, 12, 0.3)'
              : isDark
              ? 'rgba(52, 211, 153, 0.35)'
              : 'rgba(16, 185, 129, 0.28)';
          ctx.beginPath();
          ctx.arc(px, py, Math.max(1.4, 2.5 * scale), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. 3D Rotating Lorenz Attractor Mathematical Trajectory
      const attractorCx = width * 0.76 + mouseX * 22;
      const attractorCy = height * 0.34 + mouseY * 18;
      const rotY = time * 0.42;
      const rotX = 0.35 + Math.sin(time * 0.25) * 0.15;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      ctx.beginPath();
      const projectedAttractor: { px: number; py: number; scale: number }[] = [];
      for (let i = 0; i < lorenzPoints.length; i++) {
        const pt = lorenzPoints[i];
        // Rotate in 3D space
        const x1 = pt.x * cosY - pt.z * sinY;
        const z1 = pt.x * sinY + pt.z * cosY;
        const y2 = pt.y * cosX - z1 * sinX;
        const z2 = pt.y * sinX + z1 * cosX;

        const proj = project3D(x1, y2, z2 + 120, attractorCx, attractorCy, 480);
        projectedAttractor.push(proj);
        if (i === 0) ctx.moveTo(proj.px, proj.py);
        else ctx.lineTo(proj.px, proj.py);
      }
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = isDark
        ? 'rgba(52, 211, 153, 0.24)'
        : 'rgba(5, 150, 105, 0.18)';
      ctx.stroke();

      // Animated tracer particles moving along the 3D Lorenz differential curve
      for (let tIdx = 0; tIdx < 4; tIdx++) {
        const idx =
          Math.floor(time * 38 + tIdx * (lorenzPoints.length / 4)) %
          projectedAttractor.length;
        const p = projectedAttractor[idx];
        if (p) {
          ctx.fillStyle =
            tIdx % 2 === 0
              ? isDark
                ? 'rgba(251, 146, 60, 0.75)'
                : 'rgba(234, 88, 12, 0.65)'
              : isDark
              ? 'rgba(52, 211, 153, 0.75)'
              : 'rgba(5, 150, 105, 0.65)';
          ctx.beginPath();
          ctx.arc(p.px, p.py, 3.2 * p.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. 3D Software Architecture Nodes & Animated Data Packets
      const projectedNodes = SOFTWARE_NODES.map((n, idx) => {
        const nx = n.rx * width * 0.85 + Math.sin(time * 0.7 + idx) * 14;
        const ny = n.ry * height * 0.75 + Math.cos(time * 0.6 + idx) * 12;
        const nz = n.rz * 180 + Math.sin(time * 0.5 + idx) * 30;
        return {
          label: n.label,
          ...project3D(
            nx,
            ny,
            nz,
            width * 0.48 + mouseX * 15,
            height * 0.45 + mouseY * 15,
            600
          ),
        };
      });

      // Draw edges & flowing software data packets
      ctx.lineWidth = 1.1;
      for (let eIdx = 0; eIdx < SOFTWARE_EDGES.length; eIdx++) {
        const [a, b] = SOFTWARE_EDGES[eIdx];
        const na = projectedNodes[a];
        const nb = projectedNodes[b];
        if (!na || !nb) continue;

        ctx.strokeStyle = isDark
          ? 'rgba(16, 185, 129, 0.14)'
          : 'rgba(15, 118, 110, 0.11)';
        ctx.beginPath();
        ctx.moveTo(na.px, na.py);
        ctx.lineTo(nb.px, nb.py);
        ctx.stroke();

        // Data packet flowing along the software edge
        const progress = (time * 0.45 + eIdx * 0.23) % 1;
        const pktX = na.px + (nb.px - na.px) * progress;
        const pktY = na.py + (nb.py - na.py) * progress;
        ctx.fillStyle =
          eIdx % 2 === 0
            ? isDark
              ? 'rgba(251, 146, 60, 0.65)'
              : 'rgba(234, 88, 12, 0.55)'
            : isDark
            ? 'rgba(52, 211, 153, 0.65)'
            : 'rgba(5, 150, 105, 0.55)';
        ctx.beginPath();
        ctx.arc(pktX, pktY, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw software architecture nodes
      ctx.font = '600 10px "JetBrains Mono", monospace';
      for (let i = 0; i < projectedNodes.length; i++) {
        const n = projectedNodes[i];
        ctx.fillStyle = isDark
          ? 'rgba(16, 185, 129, 0.28)'
          : 'rgba(5, 150, 105, 0.22)';
        ctx.beginPath();
        ctx.arc(n.px, n.py, 4 * n.scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isDark
          ? 'rgba(214, 211, 205, 0.26)'
          : 'rgba(63, 73, 67, 0.24)';
        ctx.fillText(`[${n.label}]`, n.px + 8, n.py + 3);
      }

      // 4. Floating Mathematical Formulas & Software Code Snippets
      ctx.font = '500 12px "JetBrains Mono", monospace';
      for (let i = 0; i < floatingItems.length; i++) {
        const item = floatingItems[i];
        if (!prefersReducedMotion) {
          item.x += item.vx;
          item.y += item.vy;
          if (item.y < -30) item.y = height + 30;
          if (item.x < -180) item.x = width + 40;
          if (item.x > width + 80) item.x = -140;
        }

        ctx.fillStyle =
          item.kind === 'math'
            ? isDark
              ? 'rgba(251, 146, 60, 0.24)'
              : 'rgba(234, 88, 12, 0.20)'
            : isDark
            ? 'rgba(52, 211, 153, 0.24)'
            : 'rgba(5, 150, 105, 0.20)';

        ctx.fillText(item.text, item.x + mouseX * 10, item.y + mouseY * 10);
      }

      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      data-testid="engineering-3d-background"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    />
  );
};
