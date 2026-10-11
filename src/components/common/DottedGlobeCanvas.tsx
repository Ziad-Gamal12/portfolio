import React, { useRef, useEffect, useCallback } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useAdaptiveLiteMode } from '../../hooks/useAdaptiveLiteMode';

export interface ActiveTileInfo {
  id: string;
  brandColor: string;
  x: number; // viewport X
  y: number; // viewport Y
}

interface DottedGlobeCanvasProps {
  activeTile: ActiveTileInfo | null;
  isDarkTheme?: boolean;
}

interface Point3D {
  x0: number;
  y0: number;
  z0: number;
  currX: number;
  currY: number;
  currZ: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  u: number; // 0 to 1 latitude factor for gradient
}

interface RingParticle {
  angle: number;
  speed: number;
  radius: number;
  size: number;
  isSatellite: boolean;
}

interface PulseRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export const DottedGlobeCanvas: React.FC<DottedGlobeCanvasProps> = ({
  activeTile,
  isDarkTheme = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();
  const isLiteMode = useAdaptiveLiteMode();

  // Internal animation state refs (no react re-renders inside frame loop)
  const stateRef = useRef({
    width: 560,
    height: 560,
    dpr: 1,
    isInView: true,
    rotY: 0,
    rotX: 18 * (Math.PI / 180), // 18 deg axial tilt
    targetTiltX: 0,
    targetTiltY: 0,
    tiltX: 0,
    tiltY: 0,
    velY: 0.0035,
    isDragging: false,
    dragStartX: 0,
    dragLastX: 0,
    sphereRadius: 210,
    entranceProgress: 0, // 0 to 1
    // Color tint interpolation
    currentTint: { r: 183, g: 156, b: 255 }, // #B79CFF
    targetTint: { r: 183, g: 156, b: 255 },
    // Wave pulse
    waveActive: false,
    waveY: -1, // -1 to 1 latitude
    waveStartTime: 0,
    // Skill arc
    arcProgress: 0,
    arcParticles: [0.1, 0.35, 0.6, 0.85],
    pulseRings: [] as PulseRing[],
    mouseCanvasX: -1000,
    mouseCanvasY: -1000,
  });

  // Precomputed points ref
  const pointsRef = useRef<Point3D[]>([]);
  const ringRef = useRef<RingParticle[]>([]);

  // Parse hex color into RGB
  const hexToRgb = useCallback((hex: string) => {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }, []);

  // Update target tint on activeTile change
  useEffect(() => {
    const s = stateRef.current;
    if (activeTile?.brandColor) {
      s.targetTint = hexToRgb(activeTile.brandColor);
      // Spawn a pulse ring at landing point on sphere
      const landingX = s.width / 2;
      const landingY = s.height / 2;
      s.pulseRings.push({
        x: landingX,
        y: landingY,
        radius: 4,
        maxRadius: 36,
        alpha: 0.9,
        color: activeTile.brandColor,
      });
    } else {
      // Default Lilac
      s.targetTint = { r: 183, g: 156, b: 255 };
    }
  }, [activeTile, hexToRgb]);

  // Initialize Precomputed Fibonacci Sphere & Ring
  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    const dotCount = isLiteMode ? 500 : isMobile ? 700 : 1000;
    const points: Point3D[] = [];

    // Precompute Fibonacci sphere
    for (let i = 0; i < dotCount; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / dotCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      const x = Math.cos(theta) * Math.sin(phi);
      const y = Math.cos(phi);
      const z = Math.sin(theta) * Math.sin(phi);

      // Random initial exploded position for entrance
      const explodeDist = 1.8 + Math.random() * 1.5;
      const exAngle1 = Math.random() * Math.PI * 2;
      const exAngle2 = Math.random() * Math.PI;

      points.push({
        x0: x,
        y0: y,
        z0: z,
        currX: Math.cos(exAngle1) * Math.sin(exAngle2) * explodeDist,
        currY: Math.cos(exAngle2) * explodeDist,
        currZ: Math.sin(exAngle1) * Math.sin(exAngle2) * explodeDist,
        targetX: x,
        targetY: y,
        targetZ: z,
        u: (y + 1) / 2, // latitude 0 to 1
      });
    }
    pointsRef.current = points;

    // Precompute Orbital Ring Particles (half in lite mode)
    const ringCount = isLiteMode ? 120 : 240;
    const ring: RingParticle[] = [];
    for (let i = 0; i < ringCount; i++) {
      const isSatellite = i % 42 === 0; // 5-6 satellite dots
      ring.push({
        angle: (i / ringCount) * Math.PI * 2,
        speed: 0.007 + (Math.random() - 0.5) * 0.002,
        radius: 1.34 + (Math.random() - 0.5) * 0.05,
        size: isSatellite ? 3.2 : 1.1 + Math.random() * 0.8,
        isSatellite,
      });
    }
    ringRef.current = ring;
  }, [isLiteMode]);

  // IntersectionObserver to pause rendering when off-screen
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        stateRef.current.isInView = entry.isIntersecting;
      },
      { rootMargin: '120px' }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let entranceStart = performance.now();
    let nextWaveTime = performance.now() + 3000;

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const diameter = Math.min(
        Math.max(280, rect.width),
        window.innerWidth * 0.78,
        560
      );

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      stateRef.current.width = diameter;
      stateRef.current.height = diameter;
      stateRef.current.dpr = dpr;
      stateRef.current.sphereRadius = diameter * 0.38;

      canvas.width = diameter * dpr;
      canvas.height = diameter * dpr;
      canvas.style.width = `${diameter}px`;
      canvas.style.height = `${diameter}px`;
    };

    resize();
    window.addEventListener('resize', resize);

    // Mouse tilt tracking
    const handlePointerMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (e.clientX - cx) / (rect.width / 2);
      const ny = (e.clientY - cy) / (rect.height / 2);

      // Max ±12 deg tilt
      stateRef.current.targetTiltX = -ny * 0.2;
      stateRef.current.targetTiltY = nx * 0.2;

      // Mouse position projected in canvas coordinates
      stateRef.current.mouseCanvasX = e.clientX - rect.left;
      stateRef.current.mouseCanvasY = e.clientY - rect.top;

      // Drag handling
      if (stateRef.current.isDragging) {
        const deltaX = e.clientX - stateRef.current.dragLastX;
        stateRef.current.rotY += deltaX * 0.008;
        stateRef.current.velY = deltaX * 0.004;
        stateRef.current.dragLastX = e.clientX;
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      stateRef.current.isDragging = true;
      stateRef.current.dragStartX = e.clientX;
      stateRef.current.dragLastX = e.clientX;
    };

    const handlePointerUp = () => {
      stateRef.current.isDragging = false;
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mouseup', handlePointerUp);

    // Render Frame Function
    const render = (now: number) => {
      animId = requestAnimationFrame(render);

      const s = stateRef.current;
      if (!s.isInView || document.hidden) return;

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Entrance animation over 1.2s
      if (s.entranceProgress < 1) {
        const elapsed = (now - entranceStart) / 1200;
        s.entranceProgress = Math.min(1, elapsed);
      }

      // Smooth color tint ease (500ms ease)
      s.currentTint.r += (s.targetTint.r - s.currentTint.r) * 0.08;
      s.currentTint.g += (s.targetTint.g - s.currentTint.g) * 0.08;
      s.currentTint.b += (s.targetTint.b - s.currentTint.b) * 0.08;

      // Sphere tilt lerp with inertia
      s.tiltX += (s.targetTiltX - s.tiltX) * 0.06;
      s.tiltY += (s.targetTiltY - s.tiltY) * 0.06;

      // Rotation & Drag inertia
      if (!prefersReduced) {
        if (!s.isDragging) {
          // Ease velocity back to base auto-rotation
          s.velY += (0.0035 - s.velY) * 0.03;
          s.rotY += s.velY;
        }
      }

      // Trigger wave pulse every ~6s
      if (now > nextWaveTime && !s.waveActive) {
        s.waveActive = true;
        s.waveStartTime = now;
        nextWaveTime = now + 6500;
      }

      if (s.waveActive) {
        const waveElapsed = (now - s.waveStartTime) / 1400; // 1.4s duration
        if (waveElapsed >= 1) {
          s.waveActive = false;
        } else {
          s.waveY = -1 + waveElapsed * 2; // latitude travel from -1 to +1
        }
      }

      // Clear Canvas
      ctx.save();
      ctx.scale(s.dpr, s.dpr);
      ctx.clearRect(0, 0, s.width, s.height);

      const centerX = s.width / 2;
      const centerY = s.height / 2;
      const R = s.sphereRadius;

      // ================= 1. HALO & INNER CORE =================
      const haloRadius = R * 1.35;
      const haloGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        R * 0.4,
        centerX,
        centerY,
        haloRadius
      );
      const tintR = Math.round(s.currentTint.r);
      const tintG = Math.round(s.currentTint.g);
      const tintB = Math.round(s.currentTint.b);

      if (isDarkTheme) {
        haloGrad.addColorStop(0, `rgba(${tintR}, ${tintG}, ${tintB}, 0.16)`);
        haloGrad.addColorStop(0.6, `rgba(125, 211, 252, 0.06)`);
        haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        haloGrad.addColorStop(0, `rgba(${tintR}, ${tintG}, ${tintB}, 0.10)`);
        haloGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }

      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, haloRadius, 0, Math.PI * 2);
      ctx.fill();

      // Soft Inner Core Glow
      const coreGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        R * 0.75
      );
      coreGrad.addColorStop(0, `rgba(${tintR}, ${tintG}, ${tintB}, 0.12)`);
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, R * 0.75, 0, Math.PI * 2);
      ctx.fill();

      // Precalculate 3D Rotation Matrix with Axial Tilt + Cursor Tilt
      const totalRotX = s.rotX + s.tiltX;
      const totalRotY = s.rotY + s.tiltY;
      const cosY = Math.cos(totalRotY);
      const sinY = Math.sin(totalRotY);
      const cosX = Math.cos(totalRotX);
      const sinX = Math.sin(totalRotX);

      // ================= 2. DEPTH SORTED OBJECTS (DOTS + RING) =================
      interface RenderItem {
        type: 'dot' | 'ring';
        projX: number;
        projY: number;
        depthZ: number;
        size: number;
        color: string;
        alpha: number;
      }

      const renderQueue: RenderItem[] = [];

      // A. Transform Sphere Dots
      const points = pointsRef.current;
      const easeP = s.entranceProgress;

      for (let i = 0; i < points.length; i++) {
        const pt = points[i];

        // Interpolate entrance position
        const targetX = pt.targetX;
        const targetY = pt.targetY;
        const targetZ = pt.targetZ;

        const curX = pt.currX + (targetX - pt.currX) * easeP;
        const curY = pt.currY + (targetY - pt.currY) * easeP;
        const curZ = pt.currZ + (targetZ - pt.currZ) * easeP;

        // Rotate Y
        const rx1 = curX * cosY + curZ * sinY;
        const ry1 = curY;
        const rz1 = -curX * sinY + curZ * cosY;

        // Rotate X (axial tilt)
        const rx = rx1;
        const ry = ry1 * cosX - rz1 * sinX;
        const rz = ry1 * sinX + rz1 * cosX;

        // Base screen projection
        let screenX = centerX + rx * R;
        let screenY = centerY + ry * R;

        // Cursor Repulsion in Canvas Space (radius ~90px)
        const distToMouse = Math.hypot(screenX - s.mouseCanvasX, screenY - s.mouseCanvasY);
        if (distToMouse < 90 && distToMouse > 0) {
          const repelForce = (1 - distToMouse / 90) * 14;
          const angle = Math.atan2(screenY - s.mouseCanvasY, screenX - s.mouseCanvasX);
          screenX += Math.cos(angle) * repelForce;
          screenY += Math.sin(angle) * repelForce;
        }

        // Depth Shading (rz: -1 back to +1 front)
        const depthFactor = (rz + 1) / 2; // 0 to 1
        let dotSize = 0.8 + depthFactor * 1.5;
        let alpha = 0.15 + depthFactor * 0.75;

        // Wave Pulse brightening
        if (s.waveActive) {
          const waveDist = Math.abs(ry - s.waveY);
          if (waveDist < 0.22) {
            const waveBoost = (1 - waveDist / 0.22);
            dotSize += waveBoost * 0.9;
            alpha = Math.min(1, alpha + waveBoost * 0.4);
          }
        }

        // Latitude color interpolation: sky-blue (#7DD3FC) to lilac (#B79CFF)
        // Lerped with current custom tint
        const latT = Math.max(0, Math.min(1, pt.u));
        const dotR = Math.round(125 + (s.currentTint.r - 125) * latT);
        const dotG = Math.round(211 + (s.currentTint.g - 211) * latT);
        const dotB = Math.round(252 + (s.currentTint.b - 252) * latT);

        renderQueue.push({
          type: 'dot',
          projX: screenX,
          projY: screenY,
          depthZ: rz,
          size: dotSize,
          color: `rgb(${dotR}, ${dotG}, ${dotB})`,
          alpha,
        });
      }

      // B. Transform Orbital Ring Particles
      const ringTilt = 70 * (Math.PI / 180);
      const ringCos = Math.cos(ringTilt);
      const ringSin = Math.sin(ringTilt);
      const ringList = ringRef.current;

      for (let i = 0; i < ringList.length; i++) {
        const rp = ringList[i];
        if (!prefersReduced) {
          rp.angle += rp.speed;
        }

        const ringRadius = R * rp.radius;
        const ringX = Math.cos(rp.angle) * ringRadius;
        const ringY = Math.sin(rp.angle) * ringRadius * ringCos;
        const ringZ = Math.sin(rp.angle) * ringRadius * ringSin;

        // Rotate along totalRotY and totalRotX
        const rx1 = ringX * cosY + ringZ * sinY;
        const ry1 = ringY;
        const rz1 = -ringX * sinY + ringZ * cosY;

        const rx = rx1;
        const ry = ry1 * cosX - rz1 * sinX;
        const rz = ry1 * sinX + rz1 * cosX;

        const screenX = centerX + rx;
        const screenY = centerY + ry;
        const normZ = rz / (R * 1.4); // normalize depth

        renderQueue.push({
          type: 'ring',
          projX: screenX,
          projY: screenY,
          depthZ: normZ,
          size: rp.size,
          color: rp.isSatellite
            ? `rgb(${tintR}, ${tintG}, ${tintB})`
            : 'rgb(183, 156, 255)',
          alpha: rp.isSatellite ? 0.95 : 0.28 + (normZ + 1) * 0.25,
        });
      }

      // Sort render queue back-to-front (depthZ ascending)
      renderQueue.sort((a, b) => a.depthZ - b.depthZ);

      // Render all items
      for (let i = 0; i < renderQueue.length; i++) {
        const item = renderQueue[i];
        ctx.fillStyle = item.color;
        ctx.globalAlpha = item.alpha;

        ctx.beginPath();
        ctx.arc(item.projX, item.projY, item.size, 0, Math.PI * 2);
        ctx.fill();

        // Extra satellite glow
        if (item.type === 'ring' && item.size > 2.5) {
          ctx.strokeStyle = `rgba(${tintR}, ${tintG}, ${tintB}, 0.4)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(item.projX, item.projY, item.size * 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;

      // ================= 3. SKILL CONNECTION ARC (Signature Effect) =================
      if (activeTile && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Convert tile viewport coordinates to canvas local
        const tileLocalX = activeTile.x - rect.left;
        const tileLocalY = activeTile.y - rect.top;

        // Find nearest landing point on the sphere boundary
        const dx = tileLocalX - centerX;
        const dy = tileLocalY - centerY;
        const angleToTile = Math.atan2(dy, dx);
        const landingX = centerX + Math.cos(angleToTile) * (R * 0.92);
        const landingY = centerY + Math.sin(angleToTile) * (R * 0.92);

        // Quadratic Bezier Control Point (bowed outwards)
        const midX = (tileLocalX + landingX) / 2;
        const midY = (tileLocalY + landingY) / 2;
        const normalX = -(landingY - tileLocalY) * 0.25;
        const normalY = (landingX - tileLocalX) * 0.25;
        const ctrlX = midX + normalX;
        const ctrlY = midY + normalY;

        // Animate arc draw-in
        s.arcProgress = Math.min(1, s.arcProgress + dt * 3.5);

        // Draw Arc Glow Line
        ctx.save();
        ctx.strokeStyle = activeTile.brandColor;
        ctx.shadowColor = activeTile.brandColor;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.7 * s.arcProgress;

        ctx.beginPath();
        ctx.moveTo(tileLocalX, tileLocalY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, landingX, landingY);
        ctx.stroke();

        // Traveling Light Particles along Arc
        for (let p = 0; p < s.arcParticles.length; p++) {
          s.arcParticles[p] = (s.arcParticles[p] + dt * 1.2) % 1;
          const t = s.arcParticles[p];

          // Quadratic Bezier position formula
          const invT = 1 - t;
          const px =
            invT * invT * tileLocalX +
            2 * invT * t * ctrlX +
            t * t * landingX;
          const py =
            invT * invT * tileLocalY +
            2 * invT * t * ctrlY +
            t * t * landingY;

          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#FFFFFF';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(px, py, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else {
        s.arcProgress = Math.max(0, s.arcProgress - dt * 4);
      }

      // ================= 4. PULSE RINGS AT LANDING POINT =================
      for (let r = s.pulseRings.length - 1; r >= 0; r--) {
        const ring = s.pulseRings[r];
        ring.radius += dt * 32;
        ring.alpha -= dt * 1.1;

        if (ring.alpha <= 0 || ring.radius >= ring.maxRadius) {
          s.pulseRings.splice(r, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = ring.alpha;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      canvas.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isDarkTheme, prefersReduced]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center select-none pointer-events-none"
      style={{
        width: 'min(78vw, 560px)',
        height: 'min(78vw, 560px)',
      }}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-auto cursor-grab active:cursor-grabbing block"
      />
    </div>
  );
};
