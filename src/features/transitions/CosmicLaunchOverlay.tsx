'use client';

import { Component, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Starfield } from '@/features/home/starfield/Starfield';

export type CosmicLaunchPhase = 'departure' | 'ignition' | 'acceleration' | 'holding' | 'arrival';

export type TransitionOverlayMode = 'cosmic' | 'quick-fade';

export interface CosmicLaunchOverlayProps {
  mode: TransitionOverlayMode;
  phase: CosmicLaunchPhase;
  fadingOutQuick?: boolean;
  onRuntimeError?: () => void;
}

interface OverlayErrorBoundaryProps {
  onError?: () => void;
  children: ReactNode;
}

interface OverlayErrorBoundaryState {
  hasError: boolean;
}

class OverlayErrorBoundary extends Component<OverlayErrorBoundaryProps, OverlayErrorBoundaryState> {
  constructor(props: OverlayErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): OverlayErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(): void {
    this.props.onError?.();
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

function getStarfieldParams(phase: CosmicLaunchPhase): {
  speedMultiplier: number;
  trailStrength: number;
} {
  switch (phase) {
    case 'departure':
      return { speedMultiplier: 1, trailStrength: 1 };
    case 'ignition':
      return { speedMultiplier: 2.5, trailStrength: 1.35 };
    case 'acceleration':
      return { speedMultiplier: 7, trailStrength: 2.35 };
    case 'holding':
      return { speedMultiplier: 3, trailStrength: 1.35 };
    case 'arrival':
      return { speedMultiplier: 1.4, trailStrength: 1 };
  }
}

function getCraftTransformStyle(phase: CosmicLaunchPhase, entered: boolean): CSSProperties {
  if (!entered || phase === 'departure') {
    return {
      opacity: entered ? 1 : 0,
      transform: 'translate3d(12vw, 86vh, 0) rotate(-38deg) scale(0.92)',
      transition: 'opacity 420ms var(--ease), transform 500ms var(--ease)',
    };
  }
  if (phase === 'ignition') {
    return {
      opacity: 1,
      transform: 'translate3d(17vw, 81vh, 0) rotate(-38deg) scale(1)',
      transition: 'opacity 320ms var(--ease), transform 800ms var(--ease)',
    };
  }
  if (phase === 'acceleration') {
    return {
      opacity: 1,
      transform: 'translate3d(83vw, 16vh, 0) rotate(-38deg) scale(0.86)',
      transition: 'opacity 300ms var(--ease), transform 1000ms var(--ease-in)',
    };
  }
  if (phase === 'holding') {
    return {
      opacity: 0.94,
      transform: 'translate3d(84vw, 15vh, 0) rotate(-38deg) scale(0.82)',
      transition: 'opacity 400ms var(--ease), transform 600ms var(--ease)',
    };
  }
  // arrival (2300–3000ms): shrinks to ~40% and vanishes into the distance
  return {
    opacity: 0,
    transform: 'translate3d(90vw, 9vh, 0) rotate(-38deg) scale(0.38)',
    transition: 'opacity 540ms var(--ease), transform 680ms var(--ease)',
  };
}

function getExhaustStyle(phase: CosmicLaunchPhase): CSSProperties {
  switch (phase) {
    case 'departure':
      return {
        opacity: 0,
        transform: 'scaleX(0.05)',
        transition: 'opacity 300ms var(--ease), transform 300ms var(--ease)',
      };
    case 'ignition':
      return {
        opacity: 0.72,
        transform: 'scaleX(0.28)',
        transition: 'opacity 500ms var(--ease), transform 750ms var(--ease)',
      };
    case 'acceleration':
      return {
        opacity: 0.92,
        transform: 'scaleX(1)',
        transition: 'opacity 350ms var(--ease), transform 950ms var(--ease-in)',
      };
    case 'holding':
      return {
        opacity: 0.52,
        transform: 'scaleX(0.46)',
        transition: 'opacity 450ms var(--ease), transform 550ms var(--ease)',
      };
    case 'arrival':
      return {
        opacity: 0,
        transform: 'scaleX(0.14)',
        transition: 'opacity 480ms var(--ease), transform 580ms var(--ease)',
      };
  }
}

function getEngineGlowStyle(phase: CosmicLaunchPhase): CSSProperties {
  switch (phase) {
    case 'departure':
      return {
        opacity: 0.16,
        transform: 'scale(0.65)',
        transition: 'opacity 380ms var(--ease), transform 380ms var(--ease)',
      };
    case 'ignition':
      return {
        opacity: 0.8,
        transform: 'scale(1)',
        transition: 'opacity 550ms var(--ease), transform 550ms var(--ease)',
      };
    case 'acceleration':
      return {
        opacity: 1,
        transform: 'scale(1.2)',
        transition: 'opacity 400ms var(--ease), transform 650ms var(--ease)',
      };
    case 'holding':
      return {
        opacity: 0.68,
        transform: 'scale(0.96)',
        transition: 'opacity 500ms var(--ease), transform 500ms var(--ease)',
      };
    case 'arrival':
      return {
        opacity: 0,
        transform: 'scale(0.4)',
        transition: 'opacity 480ms var(--ease), transform 520ms var(--ease)',
      };
  }
}

function CosmicLaunchStage({
  mode,
  phase,
  fadingOutQuick = false,
}: Omit<CosmicLaunchOverlayProps, 'onRuntimeError'>) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      setEntered(true);
    });
    return () => window.cancelAnimationFrame(raf);
  }, []);

  if (mode === 'quick-fade') {
    return (
      <div
        aria-hidden="true"
        data-testid="cosmic-launch-quick-fade"
        style={{
          zIndex: 'var(--z-transition)',
          opacity: fadingOutQuick ? 0 : entered ? 0.92 : 0,
          transition: 'opacity 220ms var(--ease)',
          backgroundColor: 'var(--cosmos-bg-0)',
        }}
        className="pointer-events-none fixed inset-0"
      />
    );
  }

  const { speedMultiplier, trailStrength } = getStarfieldParams(phase);
  const overlayVisible = entered && phase !== 'arrival';

  return (
    <div
      aria-hidden="true"
      data-testid="cosmic-launch-overlay"
      data-phase={phase}
      style={{
        zIndex: 'var(--z-transition)',
        opacity: overlayVisible ? 1 : 0,
        transition: phase === 'arrival' ? 'opacity 680ms var(--ease)' : 'opacity 440ms var(--ease)',
        background:
          'linear-gradient(180deg, var(--cosmos-bg-0) 0%, var(--cosmos-bg-1) 68%, var(--cosmos-bg-2) 100%)',
      }}
      className="pointer-events-auto fixed inset-0 overflow-hidden select-none"
    >
      {/* Shared StarfieldEngine instance */}
      <Starfield
        mode="absolute"
        enableParallax={false}
        speedMultiplier={speedMultiplier}
        trailStrength={trailStrength}
      />

      {/* Minimal geometric spacecraft + engine glow + soft exhaust (composited transforms only) */}
      <div
        data-testid="cosmic-launch-spacecraft"
        style={getCraftTransformStyle(phase, entered)}
        className="pointer-events-none fixed top-0 left-0 -ml-6 -mt-3.5 flex items-center will-change-transform"
      >
        {/* Soft exhaust trail extending behind the tail (-X in local craft frame) */}
        <div
          style={{
            ...getExhaustStyle(phase),
            width: '220px',
            height: '6px',
            marginRight: '-4px',
            transformOrigin: 'right center',
            background:
              'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--cosmos-exhaust) 38%, transparent) 55%, color-mix(in srgb, var(--cosmos-engine-glow) 78%, transparent) 100%)',
            borderRadius: 'var(--radius-pill)',
          }}
          className="will-change-transform"
        />

        {/* Tail radial engine glow */}
        <div className="relative flex items-center">
          <div
            style={{
              ...getEngineGlowStyle(phase),
              background:
                'radial-gradient(circle, color-mix(in srgb, var(--cosmos-engine-glow) 82%, transparent) 0%, color-mix(in srgb, var(--cosmos-exhaust) 28%, transparent) 52%, transparent 74%)',
            }}
            className="pointer-events-none absolute -left-3.5 top-1/2 h-7 w-7 -translate-y-1/2 rounded-pill will-change-transform"
          />

          {/* Slim geometric capsule silhouette (46px long, soft white/silver, icy-blue viewport window) */}
          <svg
            width="46"
            height="20"
            viewBox="0 0 64 28"
            fill="none"
            aria-hidden="true"
            className="relative block"
          >
            {/* Swept upper & lower tail fins */}
            <path
              d="M 18 9 L 6 2 L 13 11 Z"
              fill="color-mix(in srgb, var(--cosmos-text) 76%, var(--cosmos-star-pale))"
            />
            <path
              d="M 18 19 L 6 26 L 13 17 Z"
              fill="color-mix(in srgb, var(--cosmos-text) 76%, var(--cosmos-star-pale))"
            />
            {/* Tail nozzle collar */}
            <rect
              x="9"
              y="11"
              width="5"
              height="6"
              rx="1.5"
              fill="color-mix(in srgb, var(--cosmos-star-pale) 72%, var(--cosmos-bg-2))"
            />
            {/* Main tapered geometric capsule body */}
            <path
              d="M 13 9.5 C 24 8.2, 42 8.6, 57 14 C 42 19.4, 24 19.8, 13 18.5 Z"
              fill="var(--cosmos-text)"
            />
            {/* Subtle architectural hull seam */}
            <line
              x1="16"
              y1="14"
              x2="48"
              y2="14"
              stroke="color-mix(in srgb, var(--cosmos-bg-2) 22%, var(--cosmos-text))"
              strokeWidth="0.75"
            />
            {/* Tiny icy-blue viewport window */}
            <ellipse cx="40" cy="14" rx="3.2" ry="1.7" fill="var(--cosmos-star-blue)" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function CosmicLaunchOverlay(props: CosmicLaunchOverlayProps) {
  return (
    <OverlayErrorBoundary onError={props.onRuntimeError}>
      <CosmicLaunchStage
        mode={props.mode}
        phase={props.phase}
        fadingOutQuick={props.fadingOutQuick}
      />
    </OverlayErrorBoundary>
  );
}
