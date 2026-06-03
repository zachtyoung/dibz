import React from "react";

/**
 * DIBZ hand-stamped SVG wordmark.
 * Each letter is drawn as a filled path with subtle ink-bleed imperfections —
 * thick strokes, slightly uneven edges, like a rubber stamp pressed hard.
 *
 * Props:
 *   size   — controls overall width (height scales proportionally at ~3:1 ratio)
 *   color  — fill color (default: ink black)
 *   className / style — passed to outer <svg>
 */
export function DibzLogo({
  size = 120,
  color = "oklch(0.14 0.02 240)",
  className,
  style,
}: {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const h = Math.round(size * 0.38);

  return (
    <svg
      viewBox="0 0 240 92"
      width={size}
      height={h}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Dibz"
      role="img"
    >
      {/* Ink noise / grain filter for stamp feel */}
      <defs>
        <filter id="stamp" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" seed="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feComposite in="displaced" in2="SourceGraphic" operator="in" />
        </filter>
      </defs>

      <g fill={color} filter="url(#stamp)">
        {/*
          D — wide stroke left bar + rounded right bump
          Deliberately thick, slightly uneven curves
        */}
        <path d="
          M 4 6
          L 4 86
          L 38 86
          C 62 86 78 70 78 46
          C 78 22 62 6 38 6
          Z
          M 20 20
          L 36 20
          C 52 20 62 30 62 46
          C 62 62 52 72 36 72
          L 20 72
          Z
        " />

        {/*
          I — tall slab with chunky top/bottom serifs, very slightly tilted via transform
        */}
        <path
          d="M 92 6 L 92 86 L 108 86 L 108 6 Z"
          transform="rotate(-0.8 100 46)"
        />
        {/* Top serif */}
        <path d="M 85 6 L 115 6 L 115 18 L 85 18 Z" transform="rotate(-0.8 100 12)" />
        {/* Bottom serif */}
        <path d="M 85 74 L 115 74 L 115 86 L 85 86 Z" transform="rotate(0.5 100 80)" />

        {/*
          B — left bar + two bumps, slightly uneven top vs bottom bump
        */}
        <path d="
          M 126 6
          L 126 86
          L 160 86
          C 174 86 184 78 184 67
          C 184 59 179 53 172 50
          C 179 47 183 41 183 33
          C 183 19 174 6 158 6
          Z
          M 141 20
          L 156 20
          C 163 20 168 25 168 33
          C 168 41 163 46 156 46
          L 141 46
          Z
          M 141 56
          L 158 56
          C 166 56 170 61 170 68
          C 170 75 165 72 158 72
          L 141 72
          Z
        " />

        {/*
          Z — thick diagonal, slab top/bottom bars
          Slightly imperfect: top bar a hair longer than bottom
        */}
        {/* Top bar */}
        <path d="M 198 6 L 238 6 L 238 20 L 198 20 Z" transform="rotate(0.4 218 13)" />
        {/* Diagonal slash */}
        <path d="M 236 6 L 238 20 L 202 72 L 198 86 L 196 72 Z" />
        {/* Bottom bar */}
        <path d="M 197 72 L 238 72 L 238 86 L 197 86 Z" transform="rotate(-0.6 217 79)" />
      </g>
    </svg>
  );
}

/**
 * The teal accent version — "DIBZ" with the Z in teal, used in the hero.
 */
export function DibzLogoAccent({
  size = 120,
  inkColor = "oklch(0.14 0.02 240)",
  tealColor = "oklch(0.52 0.14 178)",
  className,
  style,
}: {
  size?: number;
  inkColor?: string;
  tealColor?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const h = Math.round(size * 0.38);

  return (
    <svg
      viewBox="0 0 240 92"
      width={size}
      height={h}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Dibz"
      role="img"
    >
      <defs>
        <filter id="stamp2" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" seed="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feComposite in="displaced" in2="SourceGraphic" operator="in" />
        </filter>
      </defs>

      <g filter="url(#stamp2)">
        {/* D */}
        <path fill={inkColor} d="M 4 6 L 4 86 L 38 86 C 62 86 78 70 78 46 C 78 22 62 6 38 6 Z M 20 20 L 36 20 C 52 20 62 30 62 46 C 62 62 52 72 36 72 L 20 72 Z" />
        {/* I */}
        <path fill={inkColor} d="M 92 6 L 92 86 L 108 86 L 108 6 Z" transform="rotate(-0.8 100 46)" />
        <path fill={inkColor} d="M 85 6 L 115 6 L 115 18 L 85 18 Z" transform="rotate(-0.8 100 12)" />
        <path fill={inkColor} d="M 85 74 L 115 74 L 115 86 L 85 86 Z" transform="rotate(0.5 100 80)" />
        {/* B */}
        <path fill={inkColor} d="M 126 6 L 126 86 L 160 86 C 174 86 184 78 184 67 C 184 59 179 53 172 50 C 179 47 183 41 183 33 C 183 19 174 6 158 6 Z M 141 20 L 156 20 C 163 20 168 25 168 33 C 168 41 163 46 156 46 L 141 46 Z M 141 56 L 158 56 C 166 56 170 61 170 68 C 170 75 165 72 158 72 L 141 72 Z" />
        {/* Z — teal accent */}
        <path fill={tealColor} d="M 198 6 L 238 6 L 238 20 L 198 20 Z" transform="rotate(0.4 218 13)" />
        <path fill={tealColor} d="M 236 6 L 238 20 L 202 72 L 198 86 L 196 72 Z" />
        <path fill={tealColor} d="M 197 72 L 238 72 L 238 86 L 197 86 Z" transform="rotate(-0.6 217 79)" />
      </g>
    </svg>
  );
}
