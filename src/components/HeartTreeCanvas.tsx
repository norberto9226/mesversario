import React, { useRef, useEffect, useState } from 'react';
import { Heart, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { romanticAudio } from '../utils/audioSynthesizer';

interface HeartTreeCanvasProps {
  onScrollToLetter?: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface BranchSegment {
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
  widthStart: number;
  widthEnd: number;
  delay: number;
  duration: number;
  color: string;
}

interface HeartBlossom {
  x: number;
  y: number;
  baseSize: number;
  color: string;
  rotation: number;
  delay: number;
  duration: number;
  swaySpeed: number;
  swayAmp: number;
  swayPhase: number;
  isTrailing?: boolean;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  color: string;
  opacity: number;
  swingAngle: number;
  swingSpeed: number;
  swingRadius: number;
  flipSpeed: number;
  isBokeh?: boolean;
}

// Colors extracted directly from user's reference artwork (image_83ff7c8b.png):
// Rich, vibrant, pure romantic reds (no baby pinks - pure passionate scarlet, ruby, and crimson)
const RED_PALETTE = [
  '#d61320', // Classic vibrant red
  '#e61926', // Bright scarlet
  '#c00f1b', // Deep crimson
  '#b30b16', // Rich dark ruby
  '#f02937', // Vivid cherry red
  '#eb2130', // Warm romantic red
  '#9e0712', // Shadow red
  '#f73b49', // Highlight red
  '#cf1522', // Intense red
];

// Reusable SVG Heart path for high-performance Canvas 2D rendering
const HEART_PATH_2D = new Path2D(
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
);

// Elastic pop ease-out for blooming blossoms
function elasticOut(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const p = 0.35;
  return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1;
}

function cubicBezier(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
  const oneMinusT = 1 - t;
  const oneMinusT2 = oneMinusT * oneMinusT;
  const oneMinusT3 = oneMinusT2 * oneMinusT;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x:
      oneMinusT3 * p0.x +
      3 * oneMinusT2 * t * p1.x +
      3 * oneMinusT * t2 * p2.x +
      t3 * p3.x,
    y:
      oneMinusT3 * p0.y +
      3 * oneMinusT2 * t * p1.y +
      3 * oneMinusT * t2 * p2.y +
      t3 * p3.y,
  };
}

export const HeartTreeCanvas: React.FC<HeartTreeCanvasProps> = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Growth animation state & responsive resize trigger
  const [growthKey] = useState(0);
  const [resizeKey, setResizeKey] = useState(0);

  useEffect(() => {
    let resizeTimer: number;
    const handleWindowResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setResizeKey((k) => k + 1);
      }, 250);
    };
    window.addEventListener('resize', handleWindowResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  // Floating hearts particles for JavaScript rendering
  const floatingHeartsRef = useRef<FloatingHeart[]>([]);
  const nextParticleIdRef = useRef(1);

  // Envelope Open / Closed State
  const [isLetterOpen, setIsLetterOpen] = useState(false);

  // Letter State
  const defaultTo = 'Mi Amor Eterno';
  const defaultFrom = 'Tu novio que te adora con todo el corazón';
  const defaultMessage = `Hoy celebramos nuestro primer mes juntos, y mi corazón no podría sentirse más afortunado y pleno.

Aquel 3 de octubre de 2026 comenzó lo que hoy es mi lugar favorito en el mundo: tus brazos, tus risas y tu mirada. Han sido 30 días llenos de magia, de complicidad y de esa certeza hermosa de saber que encontré a la persona correcta.

Dicen que el tiempo vuela cuando eres feliz, y este mes ha pasado como un suspiro lleno de luz. Pero a la vez, siento como si te conociera de toda la vida. Gracias por ser mi refugio, mi mejor amiga y el amor más dulce.

Te amo hoy más que ayer, y menos que mañana. ¡Feliz 1er mes de novios!`;

  const [toName] = useState(() => localStorage.getItem('love_letter_to') || defaultTo);
  const [fromName] = useState(() => localStorage.getItem('love_letter_from') || defaultFrom);
  const [letterBody] = useState(() => localStorage.getItem('love_letter_body') || defaultMessage);

  const handleOpenEnvelope = () => {
    setIsLetterOpen(true);
    confetti({
      particleCount: 55,
      spread: 75,
      origin: { x: 0.25, y: 0.7 },
      colors: ['#d61320', '#e61926', '#b30b16', '#ff3847'],
    });
  };

  const handleCloseEnvelope = () => {
    setIsLetterOpen(false);
  };

  // Mini Nota Romántica Profunda (Al tocar la flor amarilla)
  const [showMiniNote, setShowMiniNote] = useState(false);
  const flowerTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (flowerTimerRef.current) {
        clearTimeout(flowerTimerRef.current);
      }
    };
  }, []);

  const handleFlowerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMiniNote(true);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { x: 0.3, y: 0.72 },
      colors: ['#fde047', '#facc15', '#f59e0b', '#fda4af', '#f43f5e'],
    });

    if (flowerTimerRef.current) {
      clearTimeout(flowerTimerRef.current);
    }

    // A los 3 segundos exactos de haber tocado la flor, cambiar a la melodía alegre sin mostrar aviso
    flowerTimerRef.current = window.setTimeout(() => {
      const current = romanticAudio.getCurrentSong();
      const nextId = current.id === 'alegria-amarilla' ? 'primer-mes' : 'alegria-amarilla';
      romanticAudio.setSong(nextId);
      if (!romanticAudio.getIsPlaying()) {
        romanticAudio.start();
      }
    }, 3000);
  };

  // Time elapsed counter since 03/10/2026
  const [timeTogether, setTimeTogether] = useState({
    days: 31,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const startDate = new Date('2026-10-03T00:00:00');
    const updateTime = () => {
      const now = new Date();
      const diffMs = Math.max(0, now.getTime() - startDate.getTime());
      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeTogether({
        days: days > 0 ? days : 31,
        hours,
        minutes,
        seconds,
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Interactive Click / Tap: Spawns bursts of floating red hearts
  const handleInteractionClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const newHearts: FloatingHeart[] = [];
    for (let i = 0; i < 6; i++) {
      newHearts.push({
        id: nextParticleIdRef.current++,
        x: clickX + (Math.random() - 0.5) * 24,
        y: clickY + (Math.random() - 0.5) * 24,
        size: Math.random() * 16 + 10,
        vx: -(Math.random() * 2.4 + 1.2),
        vy: (Math.random() - 0.5) * 1.2 - 0.3,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 3,
        color: RED_PALETTE[Math.floor(Math.random() * RED_PALETTE.length)],
        opacity: 1,
        swingAngle: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.05 + 0.03,
        swingRadius: Math.random() * 3.0 + 1.0,
        flipSpeed: Math.random() * 0.04 + 0.02,
      });
    }

    floatingHeartsRef.current.push(...newHearts);
  };

  // Canvas Engine: Procedural Tree Growth in JavaScript matching image_83ff7c8b.png
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.clientWidth || 1000;
    let height = container.clientHeight || 750;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      if (!container || !canvas) return;
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', handleResize);

    const isMobile = width < 768;

    // Tree Anchor Geometry matching image_83ff7c8b.png
    // The trunk stands on the right side with a soft horizontal ground shadow beneath it
    const scale = isMobile
      ? Math.min(width / 460, height / 580) * 0.95
      : Math.min(width / 750, height / 640) * 1.08;

    const trunkBaseX = isMobile ? width * 0.72 : width * 0.74;
    const trunkBaseY = isMobile ? height * 0.88 : height * 0.89;

    // 1. Procedural Trunk and Curved Branches Hierarchy
    const branchColor = '#361912'; // Sleek dark chocolate brown from the image
    const branches: BranchSegment[] = [];

    // Main Trunk (Curves gently to the right, matching the reference image)
    branches.push({
      p0: { x: 0, y: 0 },
      p1: { x: 2 * scale, y: -45 * scale },
      p2: { x: 8 * scale, y: -90 * scale },
      p3: { x: 3 * scale, y: -130 * scale },
      widthStart: 24 * scale,
      widthEnd: 15 * scale,
      delay: 0.15,
      duration: 0.85,
      color: branchColor,
    });

    // Main Fork Left (Reaches leftwards into the heart canopy)
    branches.push({
      p0: { x: 3 * scale, y: -130 * scale },
      p1: { x: -15 * scale, y: -155 * scale },
      p2: { x: -35 * scale, y: -180 * scale },
      p3: { x: -60 * scale, y: -210 * scale },
      widthStart: 13 * scale,
      widthEnd: 7 * scale,
      delay: 0.75,
      duration: 0.75,
      color: branchColor,
    });

    // Fork Left-Sub 1 (Spreads far left where hearts trail off into the wind)
    branches.push({
      p0: { x: -35 * scale, y: -180 * scale },
      p1: { x: -65 * scale, y: -195 * scale },
      p2: { x: -95 * scale, y: -205 * scale },
      p3: { x: -125 * scale, y: -215 * scale },
      widthStart: 7 * scale,
      widthEnd: 3.5 * scale,
      delay: 1.15,
      duration: 0.65,
      color: branchColor,
    });

    // Fork Left-Sub 2 (Curving upwards)
    branches.push({
      p0: { x: -60 * scale, y: -210 * scale },
      p1: { x: -75 * scale, y: -240 * scale },
      p2: { x: -70 * scale, y: -270 * scale },
      p3: { x: -55 * scale, y: -295 * scale },
      widthStart: 6 * scale,
      widthEnd: 3 * scale,
      delay: 1.25,
      duration: 0.6,
      color: branchColor,
    });

    // Main Fork Center (Rising into the upper heart canopy)
    branches.push({
      p0: { x: 3 * scale, y: -130 * scale },
      p1: { x: 5 * scale, y: -165 * scale },
      p2: { x: -5 * scale, y: -210 * scale },
      p3: { x: -15 * scale, y: -260 * scale },
      widthStart: 12 * scale,
      widthEnd: 6 * scale,
      delay: 0.8,
      duration: 0.75,
      color: branchColor,
    });

    // Center-Sub (Top center crown bough)
    branches.push({
      p0: { x: -5 * scale, y: -210 * scale },
      p1: { x: 5 * scale, y: -250 * scale },
      p2: { x: 10 * scale, y: -285 * scale },
      p3: { x: 5 * scale, y: -320 * scale },
      widthStart: 6 * scale,
      widthEnd: 3 * scale,
      delay: 1.2,
      duration: 0.65,
      color: branchColor,
    });

    // Main Fork Right (Reaches up and right into the crown)
    branches.push({
      p0: { x: 3 * scale, y: -130 * scale },
      p1: { x: 18 * scale, y: -155 * scale },
      p2: { x: 38 * scale, y: -185 * scale },
      p3: { x: 55 * scale, y: -220 * scale },
      widthStart: 11 * scale,
      widthEnd: 5.5 * scale,
      delay: 0.85,
      duration: 0.7,
      color: branchColor,
    });

    // Right-Sub 1 (Spreading out to the far right crown)
    branches.push({
      p0: { x: 38 * scale, y: -185 * scale },
      p1: { x: 60 * scale, y: -205 * scale },
      p2: { x: 80 * scale, y: -225 * scale },
      p3: { x: 95 * scale, y: -245 * scale },
      widthStart: 5.5 * scale,
      widthEnd: 2.5 * scale,
      delay: 1.2,
      duration: 0.6,
      color: branchColor,
    });

    // Right-Sub 2 (Curving up)
    branches.push({
      p0: { x: 55 * scale, y: -220 * scale },
      p1: { x: 50 * scale, y: -260 * scale },
      p2: { x: 42 * scale, y: -290 * scale },
      p3: { x: 35 * scale, y: -315 * scale },
      widthStart: 5 * scale,
      widthEnd: 2.5 * scale,
      delay: 1.3,
      duration: 0.55,
      color: branchColor,
    });

    // 2. Procedural Red Hearts Blossoms (Matching image_83ff7c8b.png)
    // The canopy is composed of hundreds of vibrant red hearts forming a lush rounded crown,
    // plus the characteristic stream of hearts blowing away to the left into the wind!
    const blossoms: HeartBlossom[] = [];

    // Seeded pseudo-random generator for consistent, gorgeous tree shape every bloom
    let seed = 42;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Center and Scale of the Heart Canopy (The blooming hearts form a giant romantic heart)
    const canopyOffsetX = 0;
    const canopyOffsetY = -235 * scale;
    const heartScale = 9.2 * scale;

    // Standard parametric heart curve: t in [0, 2*PI]
    // Negative y represents up in canvas coordinates
    const getHeartPoint = (t: number) => {
      const sinT = Math.sin(t);
      const cosT = Math.cos(t);
      const hx = 16 * Math.pow(sinT, 3);
      const hy = -(13 * cosT - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      return { hx, hy };
    };

    // (A1) Contour hearts tracing the crisp perimeter of the giant heart
    const outlineCount = isMobile ? 70 : 95;
    for (let i = 0; i < outlineCount; i++) {
      const t = (i / outlineCount) * Math.PI * 2 + (random() - 0.5) * 0.04;
      const { hx, hy } = getHeartPoint(t);
      const r = 0.94 + random() * 0.08;
      const x = canopyOffsetX + hx * heartScale * r + (random() - 0.5) * 4 * scale;
      const y = canopyOffsetY + hy * heartScale * r + (random() - 0.5) * 4 * scale;

      const distFromBase = Math.hypot(x, y);
      const delay = 1.3 + (distFromBase / (380 * scale)) * 1.3 + random() * 0.35;
      const size = (random() * 11 + 13) * scale;
      const color = RED_PALETTE[Math.floor(random() * RED_PALETTE.length)];
      const rotation = (random() - 0.5) * 40;

      blossoms.push({
        x,
        y,
        baseSize: size,
        color,
        rotation,
        delay,
        duration: 0.65 + random() * 0.3,
        swaySpeed: random() * 0.025 + 0.015,
        swayAmp: random() * 1.8 + 0.6,
        swayPhase: random() * Math.PI * 2,
      });
    }

    // (A2) Dense inner hearts lushly filling the interior of the heart
    const fillCount = isMobile ? 210 : 290;
    for (let i = 0; i < fillCount; i++) {
      const t = random() * Math.PI * 2;
      const { hx, hy } = getHeartPoint(t);
      // Area-proportional random distribution
      const r = Math.pow(random(), 0.56) * 0.94;
      const x = canopyOffsetX + hx * heartScale * r + (random() - 0.5) * 7 * scale;
      const y = canopyOffsetY + hy * heartScale * r + (random() - 0.5) * 7 * scale;

      const distFromBase = Math.hypot(x, y);
      const delay = 1.25 + (distFromBase / (380 * scale)) * 1.4 + random() * 0.45;
      const size = (random() * 14 + 11) * scale;
      const color = RED_PALETTE[Math.floor(random() * RED_PALETTE.length)];
      const rotation = (random() - 0.5) * 55;

      blossoms.push({
        x,
        y,
        baseSize: size,
        color,
        rotation,
        delay,
        duration: 0.65 + random() * 0.35,
        swaySpeed: random() * 0.025 + 0.015,
        swayAmp: random() * 1.8 + 0.6,
        swayPhase: random() * Math.PI * 2,
      });
    }

    // (B) The Trailing Wind Stream of Red Hearts blowing off the left lobe into the wind
    const trailingCount = isMobile ? 32 : 46;
    for (let i = 0; i < trailingCount; i++) {
      const spreadX = (random() * 220 + 35) * scale;
      // Trailing hearts float away from the left lobe of the heart tree
      const x = canopyOffsetX - (13.5 * heartScale) - spreadX;
      const y = canopyOffsetY + (random() - 0.5) * (130 * scale) + (spreadX * 0.1);

      const progress = spreadX / (255 * scale);
      const size = Math.max(5 * scale, (20 - progress * 13 + (random() - 0.5) * 4) * scale);
      const color = RED_PALETTE[Math.floor(random() * RED_PALETTE.length)];
      const delay = 2.0 + progress * 0.9 + random() * 0.35;

      blossoms.push({
        x,
        y,
        baseSize: size,
        color,
        rotation: (random() - 0.5) * 60,
        delay,
        duration: 0.6,
        swaySpeed: random() * 0.035 + 0.02,
        swayAmp: random() * 2.5 + 1.0,
        swayPhase: random() * Math.PI * 2,
        isTrailing: true,
      });
    }

    // 3. Dynamic Real-time Floating Hearts (Blow continuously to the left)
    const initialFloating: FloatingHeart[] = [];
    const floatingSpawnX = trunkBaseX + canopyOffsetX - (13.5 * heartScale);
    const floatingSpawnY = trunkBaseY + canopyOffsetY;

    for (let i = 0; i < 26; i++) {
      const spreadX = Math.random() * (width * 0.4);
      initialFloating.push({
        id: nextParticleIdRef.current++,
        x: floatingSpawnX - spreadX,
        y: floatingSpawnY + (Math.random() - 0.5) * (180 * scale) + (spreadX * 0.08),
        size: Math.max(7, (18 - (spreadX / (width * 0.4)) * 9 + (Math.random() - 0.5) * 4) * scale),
        vx: -(Math.random() * 1.8 + 1.2),
        vy: (Math.random() - 0.5) * 0.6 + 0.15,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 2,
        color: RED_PALETTE[Math.floor(Math.random() * RED_PALETTE.length)],
        opacity: Math.random() * 0.3 + 0.7,
        swingAngle: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.04 + 0.02,
        swingRadius: Math.random() * 2.5 + 1.0,
        flipSpeed: Math.random() * 0.03 + 0.01,
      });
    }

    // Soft atmospheric background red bokeh hearts
    for (let i = 0; i < 8; i++) {
      initialFloating.push({
        id: nextParticleIdRef.current++,
        x: Math.random() * width,
        y: Math.random() * height * 0.85,
        size: (Math.random() * 26 + 16) * scale,
        vx: -(Math.random() * 0.35 + 0.15),
        vy: (Math.random() - 0.5) * 0.12,
        rotation: (Math.random() - 0.5) * 0.8,
        vRot: (Math.random() - 0.5) * 0.005,
        color: '#d61320',
        opacity: Math.random() * 0.1 + 0.05,
        swingAngle: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.015 + 0.005,
        swingRadius: Math.random() * 1.5 + 0.5,
        flipSpeed: Math.random() * 0.02 + 0.01,
        isBokeh: true,
      });
    }

    floatingHeartsRef.current = initialFloating;

    // Animation Render Loop
    const startTime = performance.now();
    let animId: number;
    let frame = 0;
    let celebrated = false;

    const render = (now: number) => {
      frame++;
      const elapsed = (now - startTime) / 1000;

      if (elapsed >= 3.4 && !celebrated) {
        celebrated = true;
        confetti({
          particleCount: 45,
          spread: 70,
          origin: { x: isMobile ? 0.72 : 0.74, y: 0.5 },
          colors: ['#d61320', '#e61926', '#b30b16', '#ff3847'],
        });
      }

      ctx.clearRect(0, 0, width, height);

      // (A) Draw Ground Shadow beneath the trunk (Replicating image_83ff7c8b.png)
      // Soft horizontal blurred ellipse right beneath the base
      const shadowProgress = Math.min(1, elapsed / 0.8);
      if (shadowProgress > 0) {
        ctx.save();
        ctx.translate(trunkBaseX, trunkBaseY);
        const shadowGrad = ctx.createRadialGradient(
          0,
          2 * scale,
          2 * scale,
          0,
          2 * scale,
          85 * scale
        );
        shadowGrad.addColorStop(0, `rgba(40, 20, 16, ${0.45 * shadowProgress})`);
        shadowGrad.addColorStop(0.3, `rgba(50, 25, 20, ${0.25 * shadowProgress})`);
        shadowGrad.addColorStop(0.7, `rgba(80, 40, 30, ${0.08 * shadowProgress})`);
        shadowGrad.addColorStop(1, 'rgba(80, 40, 30, 0)');

        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(0, 2 * scale, 85 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // (B) Draw Procedural Trunk and Branches Growing in Real-Time
      ctx.save();
      ctx.translate(trunkBaseX, trunkBaseY);

      branches.forEach((b) => {
        if (elapsed < b.delay) return;
        const bProgress = Math.min(1, (elapsed - b.delay) / b.duration);
        if (bProgress <= 0) return;

        ctx.strokeStyle = b.color;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const steps = 30;
        const currentSteps = Math.ceil(steps * bProgress);

        for (let i = 0; i < currentSteps; i++) {
          const tA = i / steps;
          const tB = Math.min(bProgress, (i + 1) / steps);
          const pA = cubicBezier(tA, b.p0, b.p1, b.p2, b.p3);
          const pB = cubicBezier(tB, b.p0, b.p1, b.p2, b.p3);
          const currentWidth = b.widthStart + (b.widthEnd - b.widthStart) * tA;

          ctx.beginPath();
          ctx.lineWidth = currentWidth;
          ctx.moveTo(pA.x, pA.y);
          ctx.lineTo(pB.x, pB.y);
          ctx.stroke();
        }
      });

      // (C) Draw Hundreds of Red Heart Blossoms Blooming in Real-Time
      blossoms.forEach((blossom) => {
        if (elapsed < blossom.delay) return;
        const rawProgress = (elapsed - blossom.delay) / blossom.duration;
        if (rawProgress <= 0) return;

        const pop = elasticOut(Math.min(1, rawProgress));
        const size = blossom.baseSize * pop;

        // Subtle gentle living breeze sway
        const sway = Math.sin(now * blossom.swaySpeed + blossom.swayPhase) * blossom.swayAmp;
        const currentRot = ((blossom.rotation + sway) * Math.PI) / 180;

        ctx.save();
        ctx.translate(blossom.x, blossom.y);
        ctx.rotate(currentRot);
        const s = size / 24;
        ctx.scale(s, s);
        ctx.translate(-12, -12); // Center SVG heart path

        ctx.fillStyle = blossom.color;
        ctx.globalAlpha = Math.min(1, rawProgress * 1.8);
        ctx.fill(HEART_PATH_2D);

        // Highlight sheen on larger hearts
        if (size > 18 * scale) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
          ctx.beginPath();
          ctx.arc(8, 8, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      ctx.restore(); // Restore trunkBase coordinates

      // (D) Update & Draw Floating / Drifting Hearts blowing to the left in real time
      const currentFloating = floatingHeartsRef.current;
      const nextFloating: FloatingHeart[] = [];

      for (let i = 0; i < currentFloating.length; i++) {
        const heart = currentFloating[i];
        heart.swingAngle += heart.swingSpeed;
        const waveY = Math.sin(heart.swingAngle) * heart.swingRadius;

        heart.x += heart.vx;
        heart.y += heart.vy + waveY * 0.25;
        heart.rotation += heart.vRot;

        // Recycle hearts when they drift off left screen edge
        if (heart.x < -heart.size * 2 || heart.y > height + 40 || heart.y < -30) {
          if (heart.isBokeh) {
            heart.x = width + heart.size;
            heart.y = Math.random() * height * 0.8;
          } else {
            // Respawn from the left edge of the tree canopy (exactly where hearts blow off in image_83ff7c8b.png)
            heart.x = floatingSpawnX - Math.random() * 40;
            heart.y = floatingSpawnY + (Math.random() - 0.5) * (180 * scale);
            heart.size = (Math.random() * 11 + 9) * scale;
            heart.vx = -(Math.random() * 1.8 + 1.2);
            heart.vy = (Math.random() - 0.5) * 0.6 + 0.15;
            heart.color = RED_PALETTE[Math.floor(Math.random() * RED_PALETTE.length)];
            heart.opacity = Math.random() * 0.25 + 0.75;
          }
        }

        nextFloating.push(heart);

        // Draw floating heart
        const flip = Math.cos(heart.swingAngle * 1.4);
        ctx.save();
        ctx.translate(heart.x, heart.y);
        ctx.rotate((heart.rotation * Math.PI) / 180);
        const s = (heart.size / 24) * flip;
        ctx.scale(s, heart.size / 24);
        ctx.translate(-12, -12);

        ctx.fillStyle = heart.color;
        ctx.globalAlpha = heart.opacity;
        ctx.fill(HEART_PATH_2D);
        ctx.restore();
      }

      // Shedding: periodically shed a heart from the canopy once it has started blossoming
      if (elapsed > 2.8 && frame % 42 === 0 && nextFloating.length < 38) {
        nextFloating.push({
          id: nextParticleIdRef.current++,
          x: floatingSpawnX - Math.random() * 30,
          y: floatingSpawnY + (Math.random() - 0.5) * (160 * scale),
          size: (Math.random() * 12 + 9) * scale,
          vx: -(Math.random() * 1.9 + 1.2),
          vy: (Math.random() - 0.5) * 0.7 + 0.2,
          rotation: Math.random() * 360,
          vRot: (Math.random() - 0.5) * 2,
          color: RED_PALETTE[Math.floor(Math.random() * RED_PALETTE.length)],
          opacity: 0.95,
          swingAngle: Math.random() * Math.PI * 2,
          swingSpeed: Math.random() * 0.04 + 0.02,
          swingRadius: Math.random() * 2.5 + 1.0,
          flipSpeed: Math.random() * 0.03 + 0.01,
        });
      }

      floatingHeartsRef.current = nextFloating;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [growthKey, resizeKey]);

  return (
    <div className="relative w-full min-h-screen h-screen bg-white text-stone-900 overflow-hidden select-none">
      {/* Container holding procedural canvas animation, romantic envelope, counter and flower note */}
      <div
        ref={containerRef}
        onClick={handleInteractionClick}
        className="relative w-full h-full min-h-screen flex flex-col justify-between cursor-pointer overflow-hidden"
        title="Toca en cualquier parte para liberar corazones con el efecto"
      >
        {/* Layer 0: High-Performance Canvas 2D Procedural Tree Blooming & Floating Hearts in JavaScript */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />

        {/* Top-Left: 1 Mes de Novios Title & Live Counter */}
        <div className="relative z-20 p-4 sm:p-6 md:p-8 max-w-lg pointer-events-auto">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-romantic text-rose-950 leading-tight drop-shadow-xs">
              1 Mes de Novios
            </h1>
          </div>

          {/* Live Counter Badges */}
          <div className="flex items-center gap-2 sm:gap-2.5 mt-2.5">
            <div className="flex flex-col items-center bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-rose-200/90 shadow-xs">
              <span className="text-sm sm:text-lg font-bold font-serif-title text-rose-800">
                {timeTogether.days}
              </span>
              <span className="text-[9px] text-stone-500 uppercase tracking-wider">
                Días
              </span>
            </div>

            <div className="flex flex-col items-center bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-rose-200/90 shadow-xs">
              <span className="text-sm sm:text-lg font-bold font-serif-title text-rose-800">
                {timeTogether.hours}
              </span>
              <span className="text-[9px] text-stone-500 uppercase tracking-wider">
                Horas
              </span>
            </div>

            <div className="flex flex-col items-center bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-rose-200/90 shadow-xs">
              <span className="text-sm sm:text-lg font-bold font-serif-title text-rose-800">
                {timeTogether.minutes}
              </span>
              <span className="text-[9px] text-stone-500 uppercase tracking-wider">
                Minutos
              </span>
            </div>

            <div className="flex flex-col items-center bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-rose-200/90 shadow-xs">
              <span className="text-sm sm:text-lg font-bold font-serif-title text-rose-800">
                {timeTogether.seconds}
              </span>
              <span className="text-[9px] text-stone-500 uppercase tracking-wider">
                Segundos
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM-LEFT: Either the Shaking Envelope OR the Open Letter */}
        <div className="relative z-20 p-4 sm:p-6 md:p-8 max-w-xl xl:max-w-2xl pointer-events-auto">
          {!isLetterOpen ? (
            /* 1. CLOSED ENVELOPE IN PASTEL CREAM WITH SHAKE ANIMATION */
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEnvelope();
              }}
              className="group relative inline-block cursor-pointer select-none animate-envelope-shake hover:scale-105 transition-transform duration-300"
              title="Haz clic para abrir la carta de amor"
              style={{
                paddingLeft: '20px',
                paddingRight: '10px',
                paddingTop: '10px',
                paddingBottom: '10px',
                marginLeft: '-5px',
                marginRight: '70px',
                marginTop: '0px',
                marginBottom: '50px',
                height: '317px',
                width: '310px',
                maxWidth: 'calc(100vw - 32px)',
                boxSizing: 'border-box',
                borderStyle: 'solid',
                borderRadius: '23px',
              }}
            >
              {/* 3D Wax-sealed Envelope Body in Pastel Cream */}
              <div
                className="relative rounded-2xl bg-gradient-to-br from-[#faf7ed] via-[#f5eed9] to-[#ebdcc2] border-2 border-[#ded1b6] shadow-xl shadow-stone-800/10 flex items-center justify-center overflow-hidden"
                style={{
                  paddingTop: '0px',
                  paddingLeft: '0px',
                  paddingRight: '0px',
                  paddingBottom: '0px',
                  marginLeft: '30px',
                  marginRight: '0px',
                  marginTop: '70px',
                  marginBottom: '40px',
                  width: '156px',
                  height: '130px',
                }}
              >
                {/* Envelope Flaps */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full border-t-[65px] border-t-[#efe5cf] border-x-[78px] border-x-transparent border-b-0" />
                  <div className="absolute bottom-0 left-0 w-full h-0 border-b-[55px] border-b-[#e4d6bc] border-x-[78px] border-x-transparent" />
                </div>

                {/* Subtle gold ribbon line */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />

                {/* Wax Seal stamped with heart */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="wax-seal w-12 h-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <div className="w-8 h-8 rounded-full border border-rose-200/40 flex flex-col items-center justify-center text-rose-100 shadow-inner">
                      <Heart className="w-4 h-4 fill-rose-100 text-rose-200 animate-pulse" />
                      <span className="text-[7px] font-serif-title uppercase tracking-widest">
                        1 Mes
                      </span>
                    </div>
                  </div>
                  <span className="mt-1 text-[10px] font-handwriting text-stone-800 bg-white/90 px-2 py-0.5 rounded-full border border-amber-200/80 shadow-2xs">
                    Para ti ♥
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* 2. OPEN LETTER INTEGRATED IN THE CANVAS BACKGROUND */
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative parchment-bg text-stone-900 border-2 border-amber-900/15 shadow-2xl backdrop-blur-xs transition-all duration-500 animate-fade-in flex flex-col"
              style={{
                paddingLeft: '20px',
                paddingRight: '10px',
                paddingTop: '10px',
                paddingBottom: '10px',
                marginLeft: '-5px',
                marginRight: '70px',
                marginTop: '0px',
                marginBottom: '50px',
                height: '317px',
                width: '310px',
                maxWidth: 'calc(100vw - 32px)',
                boxSizing: 'border-box',
                borderStyle: 'solid',
                borderRadius: '23px',
              }}
            >
              {/* Close Button to return to the envelope */}
              <button
                onClick={handleCloseEnvelope}
                className="absolute top-3.5 right-3.5 text-stone-400 hover:text-stone-700 bg-white/60 hover:bg-white p-1 rounded-full transition-colors cursor-pointer"
                title="Cerrar y volver al sobre"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Vintage Corner Ornaments */}
              <div className="absolute top-2.5 left-3 text-rose-900/20 font-serif-title text-lg select-none">
                ❧
              </div>

              {/* Watermark Flor Amarilla */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none select-none">
                <img
                  src="/assets/realistic_yellow_flower.png"
                  alt=""
                  className="w-56 h-56 object-contain select-none"
                />
              </div>

              {/* Salutation */}
              <div className="text-xl sm:text-2xl font-romantic text-rose-900 mb-1">
                {toName}:
              </div>

              {/* Letter Body */}
              <div className="text-xs sm:text-sm md:text-base font-handwriting leading-relaxed text-stone-800 whitespace-pre-line tracking-wide max-h-[170px] sm:max-h-[185px] overflow-y-auto pr-1">
                {letterBody}
              </div>

              {/* Signature & Flor Amarilla dibujo realista con sacudida sincronizada con el punto */}
              <div className="mt-4 pt-3 border-t border-amber-900/15 flex items-center justify-between">
                <div className="flex items-center gap-2 select-none">
                  <div
                    onClick={handleFlowerClick}
                    className="relative cursor-pointer group/flower p-1 -m-1"
                    title="Toca nuestra flor amarilla para abrir una nota secreta y activar la melodía alegre en 3 segundos 💛"
                    aria-label="Flor amarilla con nota de amor secreta"
                  >
                    {/* Contenedor con animación de sacudida que incluye tanto la flor como el punto parpadeante */}
                    <div className="relative animate-flower-shake group-hover/flower:scale-115 transition-transform duration-300">
                      <img
                        src="/assets/realistic_yellow_flower.png"
                        alt="Flor amarilla"
                        className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-md"
                      />
                      {/* Punto parpadeante que se sacude en perfecta sincronía con la flor */}
                      <span className="absolute top-0 right-0 flex h-3 w-3 pointer-events-none">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-85"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border border-white shadow-xs"></span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[11px] font-serif-title text-amber-900/75">
                    Siempre tuyo,
                  </p>
                  <p className="text-lg sm:text-xl font-romantic text-rose-900 font-semibold leading-tight">
                    {fromName}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MINI NOTA SECRETA Y PROFUNDA (Se abre al tocar la flor amarilla) */}
      {showMiniNote && (
        <div
          onClick={() => setShowMiniNote(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl parchment-bg p-6 sm:p-8 border-2 border-amber-400/50 shadow-2xl shadow-stone-950/40 text-stone-900 animate-scale-up"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowMiniNote(false)}
              className="absolute top-3.5 right-3.5 text-stone-400 hover:text-stone-700 bg-white/70 hover:bg-white p-1.5 rounded-full transition-colors cursor-pointer shadow-xs"
              title="Cerrar nota"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Vintage Corner Ornaments */}
            <div className="absolute top-3 left-4 text-amber-700/30 font-serif-title text-xl select-none">
              ❧
            </div>

            {/* Header with Glowing Animated Yellow Flower Drawing */}
            <div className="flex flex-col items-center text-center mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400/40 rounded-full blur-xl animate-pulse" />
                <img
                  src="/assets/realistic_yellow_flower.png"
                  alt="Flor amarilla"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain relative z-10 animate-flower-shake drop-shadow-md"
                />
              </div>
            </div>

            {/* Deep & Heartfelt Romantic Message */}
            <div className="space-y-3 font-handwriting text-xs sm:text-sm md:text-base leading-relaxed text-stone-800 text-justify sm:text-left px-1 sm:px-3 max-h-[340px] overflow-y-auto">
              <p>
                Dicen que las flores amarillas representan la luz que jamás se apaga, la alegría sincera y ese amor que llega para iluminar hasta el rincón más escondido del alma.
              </p>
              <p>
                En estos primeros 30 días juntos, me has enseñado que amar no es solo un sentimiento; es una decisión hermosa de cuidar tus sonrisas, abrazar tus silencios y encontrar en ti el hogar que siempre soñé. Cada conversación, cada risa compartida y cada mirada tuya han hecho que este mes sea el más bonito de mi vida.
              </p>
              <p>
                Esta flor es mi promesa silenciosa: la promesa de que siempre estaré a tu lado, celebrando tus logros, apoyándote en tus momentos difíciles y eligiéndote con la misma emoción del primer día. Eres mi pedacito de cielo en la tierra.
              </p>
              <p className="text-right font-romantic text-xl sm:text-2xl text-rose-900 pt-2 font-semibold">
                Te amo con todo mi ser, hoy, mañana y siempre. 💛
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
