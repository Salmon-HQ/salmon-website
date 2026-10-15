/**
 * SVG glyphs for the wallet home mock.
 *
 * The app renders Phosphor (regular weight) via apps/mobile/src/icons.ts, so
 * these are Phosphor's 256-unit grid with the same 16-unit stroke; only the RN
 * wrapper changed to a plain <svg> with a CSS size so they scale inside the
 * phone mock.
 */

interface IconProps {
  size: string;
  color: string;
}

const svgProps = (size: string) => ({
  style: { width: size, height: size, flexShrink: 0 },
  'aria-hidden': true as const,
});

const strokeProps = (color: string, weight = 16) => ({
  stroke: color,
  strokeWidth: weight,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none',
});

/** `iconWeight="bold"` on the Send circle; Phosphor's bold is a 24-unit stroke. */
export function ArrowUpRightIcon({ size, color, bold }: IconProps & { bold?: boolean }) {
  return (
    <svg {...svgProps(size)} viewBox="0 0 256 256">
      <g {...strokeProps(color, bold ? 24 : 16)}>
        <line x1="64" y1="192" x2="192" y2="64" />
        <polyline points="94 64 192 64 192 162" />
      </g>
    </svg>
  );
}

export function ArrowDownLeftIcon({ size, color }: IconProps) {
  return (
    <svg {...svgProps(size)} viewBox="0 0 256 256">
      <g {...strokeProps(color)}>
        <line x1="192" y1="64" x2="64" y2="192" />
        <polyline points="162 192 64 192 64 94" />
      </g>
    </svg>
  );
}

export function ClockIcon({ size, color }: IconProps) {
  return (
    <svg {...svgProps(size)} viewBox="0 0 256 256">
      <g {...strokeProps(color)}>
        <circle cx="128" cy="128" r="96" />
        <polyline points="128 72 128 128 174 156" />
      </g>
    </svg>
  );
}

export function EyeIcon({ size, color }: IconProps) {
  return (
    <svg {...svgProps(size)} viewBox="0 0 256 256">
      <g {...strokeProps(color)}>
        <path d="M128,56C48,56,16,128,16,128s32,72,112,72,112-72,112-72S208,56,128,56Z" />
        <circle cx="128" cy="128" r="40" />
      </g>
    </svg>
  );
}

export function CopyIcon({ size, color }: IconProps) {
  return (
    <svg {...svgProps(size)} viewBox="0 0 256 256">
      <g {...strokeProps(color)}>
        <rect x="88" y="88" width="128" height="128" rx="12" />
        <path d="M168,88V48a8,8,0,0,0-8-8H48a8,8,0,0,0-8,8V160a8,8,0,0,0,8,8H88" />
      </g>
    </svg>
  );
}

/** Phosphor FadersHorizontal — the header's settings bubble. */
export function FadersHorizontalIcon({ size, color }: IconProps) {
  return (
    <svg {...svgProps(size)} viewBox="0 0 256 256">
      <g {...strokeProps(color)}>
        <line x1="40" y1="64" x2="216" y2="64" />
        <line x1="40" y1="128" x2="216" y2="128" />
        <line x1="40" y1="192" x2="216" y2="192" />
        <circle cx="164" cy="64" r="20" fill={color} />
        <circle cx="92" cy="128" r="20" fill={color} />
        <circle cx="180" cy="192" r="20" fill={color} />
      </g>
    </svg>
  );
}

/** Phosphor Faders — the portfolio sub-tabs' reorder bubble. */
export function FadersIcon({ size, color }: IconProps) {
  return (
    <svg {...svgProps(size)} viewBox="0 0 256 256">
      <g {...strokeProps(color)}>
        <line x1="64" y1="40" x2="64" y2="216" />
        <line x1="128" y1="40" x2="128" y2="216" />
        <line x1="192" y1="40" x2="192" y2="216" />
        <circle cx="64" cy="164" r="20" fill={color} />
        <circle cx="128" cy="92" r="20" fill={color} />
        <circle cx="192" cy="140" r="20" fill={color} />
      </g>
    </svg>
  );
}
