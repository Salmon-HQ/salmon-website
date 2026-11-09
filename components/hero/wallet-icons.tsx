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

export function CopyIcon({ size, color, bold }: IconProps & { bold?: boolean }) {
  return (
    <svg {...svgProps(size)} viewBox="0 0 256 256">
      <g {...strokeProps(color, bold ? 24 : 16)}>
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

/** Phosphor ArrowsLeftRight — the Swap Powerup's mark (swap/manifest.ts). */
export function ArrowsLeftRightIcon({ size, color, bold }: IconProps & { bold?: boolean }) {
  return (
    <svg {...svgProps(size)} viewBox="0 0 256 256">
      <g {...strokeProps(color, bold ? 24 : 16)}>
        <polyline points="176 144 208 176 176 208" />
        <line x1="48" y1="176" x2="208" y2="176" />
        <polyline points="80 112 48 80 80 48" />
        <line x1="208" y1="80" x2="48" y2="80" />
      </g>
    </svg>
  );
}

/** Phosphor QrCode — the Payments Powerup's mark (payments/manifest.ts). */
export function QrCodeIcon({ size, color, bold }: IconProps & { bold?: boolean }) {
  return (
    <svg {...svgProps(size)} viewBox="0 0 256 256">
      <g {...strokeProps(color, bold ? 24 : 16)}>
        <rect x="48" y="48" width="64" height="64" rx="8" />
        <rect x="48" y="144" width="64" height="64" rx="8" />
        <rect x="144" y="48" width="64" height="64" rx="8" />
        <line x1="144" y1="144" x2="144" y2="176" />
        <polyline points="144 208 176 208 176 144" />
        <line x1="176" y1="160" x2="208" y2="160" />
        <line x1="208" y1="192" x2="208" y2="208" />
      </g>
    </svg>
  );
}

export function CaretRightIcon({ size, color }: IconProps) {
  return (
    <svg {...svgProps(size)} viewBox="0 0 256 256">
      <g {...strokeProps(color)}>
        <polyline points="96 48 176 128 96 208" />
      </g>
    </svg>
  );
}

/** The Powerups FAB glyph, bold like every accent-filled control. */
export function PlusIcon({ size, color }: IconProps) {
  return (
    <svg {...svgProps(size)} viewBox="0 0 256 256">
      <g {...strokeProps(color, 24)}>
        <line x1="40" y1="128" x2="216" y2="128" />
        <line x1="128" y1="40" x2="128" y2="216" />
      </g>
    </svg>
  );
}

export function CaretLeftIcon({ size, color }: IconProps) {
  return (
    <svg {...svgProps(size)} viewBox="0 0 256 256">
      <g {...strokeProps(color)}>
        <polyline points="160 208 80 128 160 48" />
      </g>
    </svg>
  );
}

export function CaretDownIcon({ size, color }: IconProps) {
  return (
    <svg {...svgProps(size)} viewBox="0 0 256 256">
      <g {...strokeProps(color)}>
        <polyline points="208 96 128 176 48 96" />
      </g>
    </svg>
  );
}

/** Bold, like the arrow between the two sides of a swap review. */
export function ArrowRightIcon({ size, color }: IconProps) {
  return (
    <svg {...svgProps(size)} viewBox="0 0 256 256">
      <g {...strokeProps(color, 24)}>
        <line x1="40" y1="128" x2="216" y2="128" />
        <polyline points="144 56 216 128 144 200" />
      </g>
    </svg>
  );
}

/** Phosphor Warning — WarningNotice's mark. */
export function WarningIcon({ size, color }: IconProps) {
  return (
    <svg {...svgProps(size)} viewBox="0 0 256 256">
      <g {...strokeProps(color)}>
        <path d="M142.41,40.22l87.46,151.87C236,202.79,228.08,216,215.46,216H40.54C27.92,216,20,202.79,26.13,192.09L113.59,40.22C119.89,29.26,136.11,29.26,142.41,40.22Z" />
        <line x1="128" y1="104" x2="128" y2="144" />
      </g>
      <circle cx="128" cy="180" r="12" fill={color} />
    </svg>
  );
}

/*
 * The Coming soon Powerups' marks: Phosphor bold (phosphor-react-native defs, the weight the Powerup tiles use),
 * filled outlines on the same 256 grid.
 */
function PhosphorBold({ size, color, d }: IconProps & { d: string }) {
  return (
    <svg {...svgProps(size)} viewBox="0 0 256 256">
      <path d={d} fill={color} />
    </svg>
  );
}

export const MoneyIcon = (props: IconProps) => (
  <PhosphorBold
    {...props}
    d="M240 52H16A12 12 0 0 0 4 64v128a12 12 0 0 0 12 12h224a12 12 0 0 0 12-12V64a12 12 0 0 0-12-12m-58.79 128H74.79A60.18 60.18 0 0 0 28 133.21v-10.42A60.18 60.18 0 0 0 74.79 76h106.42A60.18 60.18 0 0 0 228 122.79v10.42A60.18 60.18 0 0 0 181.21 180M228 97.94A36.23 36.23 0 0 1 206.06 76H228ZM49.94 76A36.23 36.23 0 0 1 28 97.94V76ZM28 158.06A36.23 36.23 0 0 1 49.94 180H28ZM206.06 180A36.23 36.23 0 0 1 228 158.06V180ZM128 88a40 40 0 1 0 40 40 40 40 0 0 0-40-40m0 56a16 16 0 1 1 16-16 16 16 0 0 1-16 16"
  />
);

export const ChartLineUpIcon = (props: IconProps) => (
  <PhosphorBold
    {...props}
    d="M236 208a12 12 0 0 1-12 12H32a12 12 0 0 1-12-12V48a12 12 0 0 1 24 0v99l43.51-43.52a12 12 0 0 1 17 0L128 127l43-43h-11a12 12 0 0 1 0-24h40a12 12 0 0 1 12 12v40a12 12 0 0 1-24 0v-11l-51.51 51.52a12 12 0 0 1-17 0L96 129l-52 52v15h180a12 12 0 0 1 12 12"
  />
);

export const TrendUpIcon = (props: IconProps) => (
  <PhosphorBold
    {...props}
    d="M244 56v64a12 12 0 0 1-24 0V85l-75.51 75.52a12 12 0 0 1-17 0L96 129l-63.51 63.49a12 12 0 0 1-17-17l72-72a12 12 0 0 1 17 0L136 135l67-67h-35a12 12 0 0 1 0-24h64a12 12 0 0 1 12 12"
  />
);

export const HandCoinsIcon = (props: IconProps) => (
  <PhosphorBold
    {...props}
    d="M232.76 137.88a28.39 28.39 0 0 0-24.63-4.88L172 141.26V140a32 32 0 0 0-32-32H89.94a35.76 35.76 0 0 0-25.45 10.54L43 140H20a20 20 0 0 0-20 20v40a20 20 0 0 0 20 20h100a12 12 0 0 0 2.91-.36l64-16a11.4 11.4 0 0 0 1.79-.6l38.82-16.54c.23-.09.45-.19.67-.3a28.61 28.61 0 0 0 4.57-48.32M36 196H24v-32h12Zm181.68-31.39-37.51 16L118.52 196H60v-39l21.46-21.46a11.93 11.93 0 0 1 8.48-3.54H140a8 8 0 0 1 0 16h-28a12 12 0 0 0 0 24h32a12.2 12.2 0 0 0 2.69-.3l67-15.41.47-.12a4.61 4.61 0 0 1 5.82 4.44 4.58 4.58 0 0 1-2.3 4M164 100a40 40 0 0 0 5.18-.34 40 40 0 1 0 29.67-59.32A40 40 0 1 0 164 100m40-36a16 16 0 1 1-16 16 16 16 0 0 1 16-16m-40-20a16 16 0 0 1 12.94 6.58A39.9 39.9 0 0 0 164.2 76h-.2a16 16 0 0 1 0-32"
  />
);

export const CpuIcon = (props: IconProps) => (
  <PhosphorBold
    {...props}
    d="M156 88h-56a12 12 0 0 0-12 12v56a12 12 0 0 0 12 12h56a12 12 0 0 0 12-12v-56a12 12 0 0 0-12-12m-12 56h-32v-32h32Zm88-4h-12v-24h12a12 12 0 0 0 0-24h-12V56a20 20 0 0 0-20-20h-36V24a12 12 0 0 0-24 0v12h-24V24a12 12 0 0 0-24 0v12H56a20 20 0 0 0-20 20v36H24a12 12 0 0 0 0 24h12v24H24a12 12 0 0 0 0 24h12v36a20 20 0 0 0 20 20h36v12a12 12 0 0 0 24 0v-12h24v12a12 12 0 0 0 24 0v-12h36a20 20 0 0 0 20-20v-36h12a12 12 0 0 0 0-24m-36 56H60V60h136Z"
  />
);
