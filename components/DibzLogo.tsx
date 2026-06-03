import React from "react";

const INK = "oklch(0.14 0.02 240)";
const TEAL = "oklch(0.52 0.14 178)";

/**
 * DIBZ wordmark — Bebas Neue via CSS font-face, teal Z accent.
 * The mark is a rotated price tag square with a dot cutout.
 */
export function DibzLogo({
  size = 80,
  color = INK,
  className,
  style,
}: {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const tagSize = size * 0.38;
  const fontSize = size * 0.33;

  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: size * 0.09, ...style }}
    >
      {/* Price tag mark */}
      <svg
        width={tagSize}
        height={tagSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Tag body — rotated square */}
        <rect
          x="3" y="3" width="22" height="22" rx="3"
          fill={TEAL}
          transform="rotate(45 16 16)"
          style={{ transformOrigin: "16px 16px" }}
        />
        {/* Hole */}
        <circle cx="16" cy="7" r="2.2" fill={color} opacity="0.9" />
        {/* Dollar/tag line */}
        <line x1="11" y1="16" x2="21" y2="16" stroke={color} strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
        <line x1="11" y1="20" x2="18" y2="20" stroke={color} strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
      </svg>

      {/* Wordmark */}
      <span
        style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize,
          letterSpacing: "0.06em",
          lineHeight: 1,
          color,
          userSelect: "none",
        }}
      >
        DIB<span style={{ color: TEAL }}>Z</span>
      </span>
    </span>
  );
}

/** White version for dark backgrounds */
export function DibzLogoAccent({
  size = 80,
  inkColor = "white",
  tealColor = TEAL,
  className,
  style,
}: {
  size?: number;
  inkColor?: string;
  tealColor?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <DibzLogo
      size={size}
      color={inkColor}
      className={className}
      style={style}
    />
  );
}
