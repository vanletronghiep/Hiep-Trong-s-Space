export type StarfieldQuality = 'low' | 'medium' | 'high';

export interface StarfieldEngineOptions {
  canvas: HTMLCanvasElement;
  reducedMotion?: boolean;
  enableParallax?: boolean;
  initialQuality?: StarfieldQuality;
  seed?: number;
  maxDpr?: number;
}

const NEAR_Z = 20;
const FAR_Z = 1000;
const DEPTH_SPAN = FAR_Z - NEAR_Z;
const DEFAULT_SEED = 0x485453; // "HTS"

const QUALITY_SCALE: Record<StarfieldQuality, number> = {
  high: 1,
  medium: 0.65,
  low: 0.4,
};

function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function readStarPaletteFromTokens(): [string, string, string] {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return ['white', 'white', 'white'];
  }
  const styles = window.getComputedStyle(document.documentElement);
  const starWhite = styles.getPropertyValue('--cosmos-star-white').trim() || 'white';
  const starPale = styles.getPropertyValue('--cosmos-star-pale').trim() || starWhite;
  const starBlue = styles.getPropertyValue('--cosmos-star-blue').trim() || starPale;
  return [starWhite, starPale, starBlue];
}

export function computeTargetStarCount(
  width: number,
  height: number,
  hardwareConcurrency: number = 8,
): number {
  let baseCount = 2500;
  if (width < 640) {
    baseCount = 800;
  } else if (width < 1024) {
    baseCount = 1500;
  }

  const referenceArea = width < 640 ? 390 * 844 : width < 1024 ? 820 * 1180 : 1440 * 900;
  const areaRatio = clamp((width * height) / Math.max(1, referenceArea), 0.7, 1.25);

  let cpuScale = 1;
  if (hardwareConcurrency <= 2) {
    cpuScale = 0.6;
  } else if (hardwareConcurrency <= 4) {
    cpuScale = 0.85;
  }

  return Math.max(240, Math.round(baseCount * areaRatio * cpuScale));
}

/**
 * Framework-free 2D Canvas 3D-perspective starfield engine (§9.7 & ui_readme.md §10.5).
 * Preallocates typed arrays, reads colours from CSS tokens once, and performs zero per-frame allocations.
 */
export class StarfieldEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D | null;
  private readonly maxDpr: number;
  private readonly seed: number;
  private readonly rng: () => number;
  private readonly palette: [string, string, string];

  private width = 0;
  private height = 0;
  private dpr = 1;
  private focal = 600;
  private halfSpanX = 900;
  private halfSpanY = 650;

  private quality: StarfieldQuality;
  private reducedMotion: boolean;
  private enableParallax: boolean;

  private capacity = 0;
  private activeCount = 0;

  // Preallocated star buffers
  private x = new Float32Array(0);
  private y = new Float32Array(0);
  private z = new Float32Array(0);
  private prevSx = new Float32Array(0);
  private prevSy = new Float32Array(0);
  private baseSize = new Float32Array(0);
  private baseBrightness = new Float32Array(0);
  private speed = new Float32Array(0);
  private twinklePhase = new Float32Array(0);
  private twinkleSpeed = new Float32Array(0);
  private colorIndex = new Uint8Array(0);
  private hasTrail = new Uint8Array(0);

  private speedMultiplier = 1;
  private trailStrength = 1;

  private parallaxX = 0;
  private parallaxY = 0;
  private targetParallaxX = 0;
  private targetParallaxY = 0;

  private rafId: number | null = null;
  private running = false;
  private destroyed = false;
  private lastTimestamp = 0;
  private elapsedSeconds = 0;
  private slowFrameStreak = 0;

  private resizeObserver: ResizeObserver | null = null;
  private readonly handleVisibilityChange: () => void;
  private readonly handlePointerMove: (event: MouseEvent) => void;

  constructor(options: StarfieldEngineOptions) {
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.maxDpr = options.maxDpr ?? 2;
    this.seed = options.seed ?? DEFAULT_SEED;
    this.rng = createSeededRng(this.seed);
    this.quality = options.initialQuality ?? 'high';
    this.reducedMotion = options.reducedMotion ?? false;
    this.enableParallax = options.enableParallax ?? true;
    this.palette = readStarPaletteFromTokens();

    this.handleVisibilityChange = () => {
      if (this.destroyed) {
        return;
      }
      if (document.hidden) {
        this.pauseLoop();
      } else if (this.running && !this.reducedMotion) {
        this.lastTimestamp = 0;
        this.scheduleNextFrame();
      }
    };

    this.handlePointerMove = (event: MouseEvent) => {
      if (!this.enableParallax || this.reducedMotion || this.width <= 0 || this.height <= 0) {
        return;
      }
      const normX = (event.clientX / this.width) * 2 - 1;
      const normY = (event.clientY / this.height) * 2 - 1;
      // Shift vanishing centre by at most 12px (§9.7)
      this.targetParallaxX = clamp(-normX * 12, -12, 12);
      this.targetParallaxY = clamp(-normY * 12, -12, 12);
    };

    this.measureAndAllocate(true);
    this.attachObservers();
  }

  public start(): void {
    if (this.destroyed) {
      return;
    }
    if (this.reducedMotion) {
      this.running = false;
      this.pauseLoop();
      this.renderFrame(0);
      return;
    }
    this.running = true;
    this.renderFrame(0);
    if (typeof document === 'undefined' || !document.hidden) {
      this.lastTimestamp = 0;
      this.scheduleNextFrame();
    }
  }

  public stop(): void {
    this.running = false;
    this.pauseLoop();
  }

  public setReducedMotion(reduced: boolean): void {
    if (this.destroyed || this.reducedMotion === reduced) {
      return;
    }
    this.reducedMotion = reduced;
    if (reduced) {
      this.targetParallaxX = 0;
      this.targetParallaxY = 0;
      this.parallaxX = 0;
      this.parallaxY = 0;
      this.pauseLoop();
      this.renderFrame(0);
    } else if (this.running) {
      this.lastTimestamp = 0;
      this.scheduleNextFrame();
    }
  }

  public setQuality(quality: StarfieldQuality): void {
    if (this.destroyed || this.quality === quality) {
      return;
    }
    this.quality = quality;
    this.activeCount = Math.max(
      120,
      Math.min(this.capacity, Math.round(this.capacity * QUALITY_SCALE[quality])),
    );
    if (this.reducedMotion || !this.running) {
      this.renderFrame(0);
    }
  }

  public getQuality(): StarfieldQuality {
    return this.quality;
  }

  public getActiveStarCount(): number {
    return this.activeCount;
  }

  public setSpeedMultiplier(multiplier: number): void {
    this.speedMultiplier = clamp(multiplier, 0, 8);
  }

  public getSpeedMultiplier(): number {
    return this.speedMultiplier;
  }

  public setTrailStrength(strength: number): void {
    this.trailStrength = clamp(strength, 0, 4);
  }

  /**
   * Advances simulation by `dtSeconds` and renders one frame.
   * Exposed publicly so deterministic unit tests can step simulation without real timers.
   */
  public stepFrame(dtSeconds: number): void {
    if (this.destroyed) {
      return;
    }
    const clampedDt = clamp(dtSeconds, 0, 0.05);
    this.updateStars(clampedDt);
    this.renderFrame(clampedDt);
  }

  public destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.running = false;
    this.pauseLoop();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this.handlePointerMove);
    }
  }

  private attachObservers(): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        if (!this.destroyed) {
          this.measureAndAllocate(false);
          if (this.reducedMotion || !this.running) {
            this.renderFrame(0);
          }
        }
      });
      this.resizeObserver.observe(this.canvas);
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    const isFinePointer =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(pointer: fine)').matches
        : false;
    if (isFinePointer && this.enableParallax) {
      window.addEventListener('mousemove', this.handlePointerMove, { passive: true });
    }
  }

  private measureAndAllocate(initial: boolean): void {
    const rect = this.canvas.getBoundingClientRect();
    const fallbackW =
      typeof window !== 'undefined' && window.innerWidth > 0 ? window.innerWidth : 1280;
    const fallbackH =
      typeof window !== 'undefined' && window.innerHeight > 0 ? window.innerHeight : 800;

    const nextWidth = Math.max(1, Math.round(rect.width || this.canvas.clientWidth || fallbackW));
    const nextHeight = Math.max(
      1,
      Math.round(rect.height || this.canvas.clientHeight || fallbackH),
    );
    const rawDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const nextDpr = clamp(rawDpr, 1, this.maxDpr);

    this.width = nextWidth;
    this.height = nextHeight;
    this.dpr = nextDpr;

    this.canvas.width = Math.round(nextWidth * nextDpr);
    this.canvas.height = Math.round(nextHeight * nextDpr);

    if (this.ctx) {
      this.ctx.setTransform(nextDpr, 0, 0, nextDpr, 0, 0);
    }

    this.focal = Math.max(260, Math.min(nextWidth, nextHeight) * 0.85);
    const farScale = FAR_Z / this.focal;
    this.halfSpanX = nextWidth * 0.58 * farScale;
    this.halfSpanY = nextHeight * 0.58 * farScale;

    const cores =
      typeof navigator !== 'undefined' && navigator.hardwareConcurrency
        ? navigator.hardwareConcurrency
        : 8;
    const desiredCapacity = computeTargetStarCount(nextWidth, nextHeight, cores);

    if (initial || desiredCapacity > this.capacity) {
      this.allocateBuffers(desiredCapacity);
    }

    this.activeCount = Math.max(
      120,
      Math.min(this.capacity, Math.round(desiredCapacity * QUALITY_SCALE[this.quality])),
    );
  }

  private allocateBuffers(count: number): void {
    this.capacity = count;
    this.x = new Float32Array(count);
    this.y = new Float32Array(count);
    this.z = new Float32Array(count);
    this.prevSx = new Float32Array(count);
    this.prevSy = new Float32Array(count);
    this.baseSize = new Float32Array(count);
    this.baseBrightness = new Float32Array(count);
    this.speed = new Float32Array(count);
    this.twinklePhase = new Float32Array(count);
    this.twinkleSpeed = new Float32Array(count);
    this.colorIndex = new Uint8Array(count);
    this.hasTrail = new Uint8Array(count);

    for (let i = 0; i < count; i += 1) {
      this.spawnStar(i, true);
    }
  }

  private spawnStar(index: number, randomDepth: boolean): void {
    const rLayer = this.rng();
    // 3 depth/character layers: 0 = distant (62%), 1 = mid (28%), 2 = near (10%)
    let layer = 0;
    if (rLayer > 0.9) {
      layer = 2;
    } else if (rLayer > 0.62) {
      layer = 1;
    }

    this.x[index] = (this.rng() * 2 - 1) * this.halfSpanX;
    this.y[index] = (this.rng() * 2 - 1) * this.halfSpanY;
    this.z[index] = randomDepth ? NEAR_Z + this.rng() * DEPTH_SPAN : FAR_Z - this.rng() * 90;

    this.prevSx[index] = Number.NaN;
    this.prevSy[index] = Number.NaN;

    const isBrightAccent = this.rng() < 0.016; // ~1.6% brighter stars (§9.7)

    if (layer === 0) {
      this.baseSize[index] = 0.42 + this.rng() * 0.36;
      this.baseBrightness[index] = 0.22 + this.rng() * 0.32;
      this.speed[index] = 10 + this.rng() * 10;
      this.hasTrail[index] = 0;
    } else if (layer === 1) {
      this.baseSize[index] = 0.58 + this.rng() * 0.52;
      this.baseBrightness[index] = 0.38 + this.rng() * 0.38;
      this.speed[index] = 20 + this.rng() * 16;
      this.hasTrail[index] = this.rng() < 0.028 ? 1 : 0; // ~2.8% of mid stars get trails
    } else {
      this.baseSize[index] = isBrightAccent ? 1.15 + this.rng() * 0.55 : 0.78 + this.rng() * 0.55;
      this.baseBrightness[index] = isBrightAccent
        ? 0.78 + this.rng() * 0.22
        : 0.52 + this.rng() * 0.36;
      this.speed[index] = 34 + this.rng() * 22;
      this.hasTrail[index] = 1;
    }

    if (isBrightAccent && layer !== 2) {
      this.baseBrightness[index] = Math.min(0.95, (this.baseBrightness[index] ?? 0.5) + 0.35);
      this.baseSize[index] = (this.baseSize[index] ?? 0.6) + 0.35;
    }

    const rColor = this.rng();
    if (rColor < 0.78) {
      this.colorIndex[index] = 0; // --cosmos-star-white
    } else if (rColor < 0.93) {
      this.colorIndex[index] = 1; // --cosmos-star-pale
    } else {
      this.colorIndex[index] = 2; // --cosmos-star-blue
    }

    this.twinklePhase[index] = this.rng() * Math.PI * 2;
    this.twinkleSpeed[index] = 0.7 + this.rng() * 1.9;
  }

  private scheduleNextFrame(): void {
    if (this.rafId !== null || this.destroyed || !this.running || this.reducedMotion) {
      return;
    }
    this.rafId = window.requestAnimationFrame((timestamp) => {
      this.rafId = null;
      this.onAnimationFrame(timestamp);
    });
  }

  private pauseLoop(): void {
    if (this.rafId !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.rafId);
    }
    this.rafId = null;
  }

  private onAnimationFrame(timestamp: number): void {
    if (this.destroyed || !this.running || this.reducedMotion) {
      return;
    }

    let rawDtMs = 16.67;
    if (this.lastTimestamp > 0) {
      rawDtMs = timestamp - this.lastTimestamp;
    }
    this.lastTimestamp = timestamp;

    // Automatic quality step-down if frame time stays above ~28ms (<35 fps)
    if (rawDtMs > 28 && rawDtMs < 250) {
      this.slowFrameStreak += 1;
      if (this.slowFrameStreak >= 45) {
        this.slowFrameStreak = 0;
        if (this.quality === 'high') {
          this.setQuality('medium');
        } else if (this.quality === 'medium') {
          this.setQuality('low');
        }
      }
    } else if (rawDtMs <= 22) {
      this.slowFrameStreak = Math.max(0, this.slowFrameStreak - 1);
    }

    const dtSeconds = clamp(rawDtMs / 1000, 0, 0.05);
    this.updateStars(dtSeconds);
    this.renderFrame(dtSeconds);
    this.scheduleNextFrame();
  }

  private updateStars(dt: number): void {
    this.elapsedSeconds += dt;

    const easeFactor = Math.min(1, dt * 4.5);
    this.parallaxX += (this.targetParallaxX - this.parallaxX) * easeFactor;
    this.parallaxY += (this.targetParallaxY - this.parallaxY) * easeFactor;

    const cx = this.width * 0.5 + this.parallaxX;
    const cy = this.height * 0.5 + this.parallaxY;
    const margin = 36;
    const count = this.activeCount;
    const mult = this.speedMultiplier;

    for (let i = 0; i < count; i += 1) {
      const currentZ = this.z[i] ?? FAR_Z;
      const currentX = this.x[i] ?? 0;
      const currentY = this.y[i] ?? 0;
      const starSpeed = this.speed[i] ?? 18;

      // Save previous projected coordinates before advancing z
      const prevInvZ = this.focal / currentZ;
      this.prevSx[i] = cx + currentX * prevInvZ;
      this.prevSy[i] = cy + currentY * prevInvZ;

      const nextZ = currentZ - starSpeed * mult * dt;
      if (nextZ <= NEAR_Z) {
        this.spawnStar(i, false);
        continue;
      }

      const nextInvZ = this.focal / nextZ;
      const sx = cx + currentX * nextInvZ;
      const sy = cy + currentY * nextInvZ;

      if (sx < -margin || sx > this.width + margin || sy < -margin || sy > this.height + margin) {
        this.spawnStar(i, false);
        continue;
      }

      this.z[i] = nextZ;
    }
  }

  private renderFrame(_dt: number): void {
    void _dt;
    const ctx = this.ctx;
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.width * 0.5 + this.parallaxX;
    const cy = this.height * 0.5 + this.parallaxY;
    const count = this.activeCount;
    const elapsed = this.elapsedSeconds;
    const globalTrail = this.trailStrength;
    const forceStreaks = this.speedMultiplier > 1.8 && globalTrail > 1.1;

    ctx.lineCap = 'round';

    for (let i = 0; i < count; i += 1) {
      const z = this.z[i] ?? FAR_Z;
      const x = this.x[i] ?? 0;
      const y = this.y[i] ?? 0;

      const invZ = this.focal / z;
      const sx = cx + x * invZ;
      const sy = cy + y * invZ;

      if (sx < -8 || sx > this.width + 8 || sy < -8 || sy > this.height + 8) {
        continue;
      }

      const depthNorm = 1 - (z - NEAR_Z) / DEPTH_SPAN;
      const farFade = clamp((FAR_Z - z) / 140, 0, 1);
      const nearFade = clamp((z - NEAR_Z) / 35, 0, 1);
      const twinkle =
        0.87 + 0.13 * Math.sin(elapsed * (this.twinkleSpeed[i] ?? 1) + (this.twinklePhase[i] ?? 0));

      const alpha = clamp(
        (this.baseBrightness[i] ?? 0.4) * (0.45 + depthNorm * 0.75) * farFade * nearFade * twinkle,
        0.04,
        1,
      );

      const radius = (this.baseSize[i] ?? 0.5) * (0.55 + depthNorm * 1.15);
      const color = this.palette[this.colorIndex[i] ?? 0] ?? this.palette[0];

      const shouldDrawTrail = !this.reducedMotion && (this.hasTrail[i] === 1 || forceStreaks);
      if (shouldDrawTrail) {
        const psx = this.prevSx[i] ?? Number.NaN;
        const psy = this.prevSy[i] ?? Number.NaN;
        if (!Number.isNaN(psx) && !Number.isNaN(psy)) {
          const dx = sx - psx;
          const dy = sy - psy;
          const segLenSq = dx * dx + dy * dy;
          if (segLenSq > 0.15 && segLenSq < 3600) {
            const stretch = clamp(1.35 * globalTrail, 0.8, 5.5);
            ctx.strokeStyle = color;
            ctx.globalAlpha = alpha * 0.42;
            ctx.lineWidth = Math.max(0.6, radius * 0.85);
            ctx.beginPath();
            ctx.moveTo(sx - dx * stretch, sy - dy * stretch);
            ctx.lineTo(sx, sy);
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;

      if (radius < 1.05) {
        const size = radius * 1.75;
        ctx.fillRect(sx - size * 0.5, sy - size * 0.5, size, size);
      } else {
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }
}
