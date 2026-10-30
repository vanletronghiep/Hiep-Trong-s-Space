'use client';

import type { ReactNode } from 'react';
import type { FeatureEntry, FeatureThumbnailPreset } from '@/features/registry';
import { cn } from '@/ui/cn';

export interface FeatureThumbnailProps {
  thumbnail: FeatureEntry['thumbnail'];
  className?: string;
}

function FourPointStar({
  x,
  y,
  size = 5.5,
  color,
}: {
  x: number;
  y: number;
  size?: number;
  color: string;
}) {
  const c = size * 0.22;
  const d = `M 0 ${-size} C ${c} ${-c} ${c} ${-c} ${size} 0 C ${c} ${c} ${c} ${c} 0 ${size} C ${-c} ${c} ${-c} ${c} ${-size} 0 C ${-c} ${-c} ${-c} ${-c} 0 ${-size} Z`;
  return <path d={d} transform={`translate(${x} ${y})`} fill={color} />;
}

function renderPresetArtwork(
  preset: FeatureThumbnailPreset,
  lineSoft: string,
  lineAccent: string,
  starColor: string,
  nodeColor: string,
): ReactNode {
  switch (preset) {
    case 'constellation-arc':
      return (
        <>
          <circle cx="160" cy="235" r="145" fill="none" stroke={lineSoft} strokeWidth="0.85" />
          <circle
            cx="160"
            cy="235"
            r="105"
            fill="none"
            stroke={lineAccent}
            strokeWidth="0.9"
            strokeDasharray="3 5"
          />
          <polyline
            points="72,138 124,96 184,108 242,68"
            fill="none"
            stroke={lineAccent}
            strokeWidth="0.95"
          />
          <circle cx="72" cy="138" r="1.8" fill={nodeColor} />
          <circle cx="124" cy="96" r="2" fill={nodeColor} />
          <circle cx="184" cy="108" r="1.8" fill={nodeColor} />
          <FourPointStar x={242} y={68} size={6} color={starColor} />
        </>
      );

    case 'dual-orbit':
      return (
        <>
          <ellipse
            cx="160"
            cy="100"
            rx="108"
            ry="44"
            transform="rotate(-14 160 100)"
            fill="none"
            stroke={lineSoft}
            strokeWidth="0.85"
          />
          <ellipse
            cx="160"
            cy="100"
            rx="72"
            ry="28"
            transform="rotate(18 160 100)"
            fill="none"
            stroke={lineAccent}
            strokeWidth="0.95"
          />
          <line x1="66" y1="126" x2="254" y2="74" stroke={lineSoft} strokeWidth="0.75" />
          <circle cx="160" cy="100" r="2.2" fill={nodeColor} />
          <circle cx="104" cy="84" r="1.6" fill={nodeColor} />
          <FourPointStar x={221} y={83} size={5.8} color={starColor} />
        </>
      );

    case 'meridian-grid':
      return (
        <>
          <circle cx="160" cy="100" r="64" fill="none" stroke={lineSoft} strokeWidth="0.85" />
          <ellipse
            cx="160"
            cy="100"
            rx="32"
            ry="64"
            fill="none"
            stroke={lineAccent}
            strokeWidth="0.85"
          />
          <line x1="80" y1="100" x2="240" y2="100" stroke={lineSoft} strokeWidth="0.8" />
          <line x1="160" y1="24" x2="160" y2="176" stroke={lineSoft} strokeWidth="0.8" />
          <circle cx="128" cy="100" r="1.8" fill={nodeColor} />
          <FourPointStar x={192} y={68} size={5.6} color={starColor} />
        </>
      );

    case 'neural-lattice':
      return (
        <>
          <line x1="78" y1="64" x2="158" y2="54" stroke={lineSoft} strokeWidth="0.8" />
          <line x1="78" y1="64" x2="148" y2="112" stroke={lineAccent} strokeWidth="0.9" />
          <line x1="78" y1="136" x2="158" y2="54" stroke={lineSoft} strokeWidth="0.8" />
          <line x1="78" y1="136" x2="148" y2="112" stroke={lineSoft} strokeWidth="0.8" />
          <line x1="158" y1="54" x2="238" y2="96" stroke={lineAccent} strokeWidth="0.95" />
          <line x1="148" y1="112" x2="238" y2="96" stroke={lineAccent} strokeWidth="0.95" />
          <line x1="148" y1="112" x2="224" y2="148" stroke={lineSoft} strokeWidth="0.8" />
          <circle cx="78" cy="64" r="2" fill={nodeColor} />
          <circle cx="78" cy="136" r="2" fill={nodeColor} />
          <circle cx="158" cy="54" r="2" fill={nodeColor} />
          <circle cx="148" cy="112" r="2.2" fill={nodeColor} />
          <circle cx="224" cy="148" r="1.8" fill={nodeColor} />
          <FourPointStar x={238} y={96} size={6} color={starColor} />
        </>
      );

    case 'manuscript-lines':
      return (
        <>
          <line x1="76" y1="68" x2="218" y2="68" stroke={lineAccent} strokeWidth="0.95" />
          <line x1="76" y1="92" x2="244" y2="92" stroke={lineSoft} strokeWidth="0.85" />
          <line x1="76" y1="116" x2="204" y2="116" stroke={lineSoft} strokeWidth="0.85" />
          <line x1="76" y1="140" x2="156" y2="140" stroke={lineSoft} strokeWidth="0.85" />
          <path
            d="M 214 148 A 56 56 0 0 0 246 62"
            fill="none"
            stroke={lineAccent}
            strokeWidth="0.85"
          />
          <FourPointStar x={234} y={68} size={5.5} color={starColor} />
        </>
      );

    case 'academic-compass':
      return (
        <>
          <circle cx="160" cy="102" r="58" fill="none" stroke={lineSoft} strokeWidth="0.85" />
          <polygon
            points="160,48 206,128 114,128"
            fill="none"
            stroke={lineAccent}
            strokeWidth="0.9"
          />
          <line
            x1="160"
            y1="32"
            x2="160"
            y2="168"
            stroke={lineSoft}
            strokeWidth="0.75"
            strokeDasharray="2 4"
          />
          <circle cx="114" cy="128" r="1.8" fill={nodeColor} />
          <circle cx="206" cy="128" r="1.8" fill={nodeColor} />
          <FourPointStar x={160} y={48} size={5.8} color={starColor} />
        </>
      );

    case 'paired-cards':
      return (
        <>
          <rect
            x="88"
            y="60"
            width="92"
            height="64"
            rx="8"
            fill="none"
            stroke={lineSoft}
            strokeWidth="0.85"
          />
          <rect
            x="136"
            y="78"
            width="96"
            height="66"
            rx="8"
            fill="none"
            stroke={lineAccent}
            strokeWidth="0.95"
          />
          <path
            d="M 112 52 A 74 74 0 0 1 218 70"
            fill="none"
            stroke={lineSoft}
            strokeWidth="0.8"
            strokeDasharray="3 4"
          />
          <FourPointStar x={184} y={111} size={5.6} color={starColor} />
        </>
      );

    case 'harmonic-waves':
      return (
        <>
          <path
            d="M 52 106 C 96 68, 144 142, 188 100 C 218 72, 246 86, 268 96"
            fill="none"
            stroke={lineAccent}
            strokeWidth="0.95"
          />
          <path
            d="M 52 122 C 98 92, 146 154, 194 114 C 224 90, 248 102, 268 110"
            fill="none"
            stroke={lineSoft}
            strokeWidth="0.8"
          />
          <circle cx="122" cy="105" r="1.7" fill={nodeColor} />
          <FourPointStar x={212} y={84} size={5.6} color={starColor} />
        </>
      );

    case 'pulse-timeline':
      return (
        <>
          <line x1="56" y1="112" x2="264" y2="112" stroke={lineSoft} strokeWidth="0.8" />
          <polyline
            points="66,112 108,112 128,76 154,132 178,92 204,112 254,112"
            fill="none"
            stroke={lineAccent}
            strokeWidth="1"
          />
          <circle cx="108" cy="112" r="1.8" fill={nodeColor} />
          <circle cx="178" cy="92" r="1.8" fill={nodeColor} />
          <FourPointStar x={128} y={76} size={5.8} color={starColor} />
        </>
      );

    case 'blueprint-vectors':
      return (
        <>
          <line x1="68" y1="146" x2="252" y2="146" stroke={lineSoft} strokeWidth="0.8" />
          <line x1="88" y1="44" x2="88" y2="162" stroke={lineSoft} strokeWidth="0.8" />
          <polyline
            points="88,146 146,98 196,112 238,60"
            fill="none"
            stroke={lineAccent}
            strokeWidth="0.95"
          />
          <path
            d="M 88 104 A 42 42 0 0 1 122 118"
            fill="none"
            stroke={lineSoft}
            strokeWidth="0.8"
          />
          <circle cx="146" cy="98" r="1.9" fill={nodeColor} />
          <circle cx="196" cy="112" r="1.9" fill={nodeColor} />
          <FourPointStar x={238} y={60} size={6} color={starColor} />
        </>
      );

    case 'summit-trajectory':
      return (
        <>
          <path d="M 64 150 Q 148 134 226 56" fill="none" stroke={lineAccent} strokeWidth="1" />
          <circle cx="226" cy="56" r="26" fill="none" stroke={lineSoft} strokeWidth="0.8" />
          <circle cx="114" cy="138" r="1.8" fill={nodeColor} />
          <circle cx="168" cy="108" r="1.9" fill={nodeColor} />
          <FourPointStar x={226} y={56} size={6} color={starColor} />
        </>
      );

    case 'focus-aperture':
      return (
        <>
          <circle cx="160" cy="100" r="66" fill="none" stroke={lineSoft} strokeWidth="0.8" />
          <circle cx="160" cy="100" r="40" fill="none" stroke={lineAccent} strokeWidth="0.95" />
          <circle cx="160" cy="100" r="16" fill="none" stroke={lineSoft} strokeWidth="0.8" />
          <line x1="160" y1="24" x2="160" y2="48" stroke={lineSoft} strokeWidth="0.8" />
          <line x1="160" y1="152" x2="160" y2="176" stroke={lineSoft} strokeWidth="0.8" />
          <line x1="84" y1="100" x2="108" y2="100" stroke={lineSoft} strokeWidth="0.8" />
          <line x1="212" y1="100" x2="236" y2="100" stroke={lineSoft} strokeWidth="0.8" />
          <FourPointStar x={160} y={100} size={5.8} color={starColor} />
        </>
      );

    case 'zenith-crown':
      return (
        <>
          <path
            d="M 74 138 A 96 96 0 0 1 246 138"
            fill="none"
            stroke={lineSoft}
            strokeWidth="0.85"
          />
          <polyline
            points="92,132 126,88 160,62 194,88 228,132"
            fill="none"
            stroke={lineAccent}
            strokeWidth="0.95"
          />
          <circle cx="92" cy="132" r="1.7" fill={nodeColor} />
          <circle cx="126" cy="88" r="1.9" fill={nodeColor} />
          <circle cx="194" cy="88" r="1.9" fill={nodeColor} />
          <circle cx="228" cy="132" r="1.7" fill={nodeColor} />
          <FourPointStar x={160} y={62} size={6.2} color={starColor} />
        </>
      );
  }
}

export function FeatureThumbnail({ thumbnail, className }: FeatureThumbnailProps) {
  const accentToken =
    thumbnail.accent === 'lavender' ? 'var(--cosmos-lavender)' : 'var(--cosmos-star-blue)';
  const lineSoft = 'color-mix(in srgb, var(--cosmos-text) 18%, transparent)';
  const lineAccent = `color-mix(in srgb, ${accentToken} 52%, transparent)`;
  const nodeColor = 'color-mix(in srgb, var(--cosmos-star-pale) 75%, transparent)';

  return (
    <div
      className={cn(
        'relative aspect-[16/10] w-full overflow-hidden rounded-card select-none',
        className,
      )}
      style={{
        background:
          'linear-gradient(145deg, var(--cosmos-bg-0) 0%, var(--cosmos-bg-1) 58%, var(--cosmos-bg-2) 100%)',
        boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--cosmos-text) 10%, transparent)',
      }}
    >
      <div
        className={cn(
          'h-full w-full transition-[transform,filter] duration-[260ms] ease-[var(--ease)]',
          '[@media(hover:hover)]:group-hover:brightness-[1.06] group-focus-visible:brightness-[1.06]',
          'motion-safe:[@media(hover:hover)]:group-hover:scale-[1.018] motion-safe:group-focus-visible:scale-[1.018]',
        )}
      >
        {thumbnail.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail.imageUrl}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
        ) : (
          <>
            {/* Faint radial tonal emphasis per feature */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(circle at 68% 36%, color-mix(in srgb, ${accentToken} 9%, transparent), transparent 66%)`,
              }}
            />
            <svg
              viewBox="0 0 320 200"
              aria-hidden="true"
              className="relative h-full w-full block"
              preserveAspectRatio="xMidYMid meet"
            >
              {renderPresetArtwork(thumbnail.preset, lineSoft, lineAccent, accentToken, nodeColor)}
            </svg>
          </>
        )}
      </div>

      {/* Preserve crisp inner hairline above scaled artwork */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-card"
        style={{
          boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--cosmos-text) 10%, transparent)',
        }}
      />
    </div>
  );
}
