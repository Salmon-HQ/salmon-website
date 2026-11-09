import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import { u } from './phone-scale';
import { fleshFills, fleshTile } from './flesh';
import { seigaihaTile, seigaihaTileUrl } from './scales';
import { CaretLeftIcon, CaretRightIcon, CopyIcon, FadersHorizontalIcon } from './wallet-icons';

/**
 * The pieces every wallet screen mock is built from, measured against the
 * 440pt reference screen via u(). Colors are the resolved dark values of
 * packages/shared/src/theme/semantic.ts in salmon-wallet-frontend; motion
 * uses durations.ts.
 */

/** semantic.ts, dark. Names are the token's, not a local invention. */
export const COLORS = {
  depthAbyss: '#070911',
  waterTop: '#10131C',
  waterBottom: '#070911',
  /** Card tone `surface`: membraneThin over the ramp, hairline edge. */
  cardFill: 'rgba(11, 15, 25, 0.48)',
  hairline: 'rgba(199, 211, 232, 0.10)',
  borderDefault: '#58637B',
  borderRaised: '#6F7B95',
  textPrimary: '#EDF1F7',
  textSecondary: '#A7B1C4',
  textTertiary: '#8B96AD',
  textDisabled: '#6F7B95',
  accentFill: '#FF5C45',
  accentTint: 'rgba(255, 92, 69, 0.10)',
  accentOnFill: '#070911',
  changePositive: '#33D6A6',
  changeNegative: '#FF6B85',
  /** status.warning — warning-500. */
  warning: '#FFB020',
  surfaceCrest: '#1B2233',
  /** overlay.backdrop */
  backdrop: 'rgba(7, 9, 17, 0.84)',
  /** Thermocline tier="thick" — membraneThick */
  sheetFill: 'rgba(11, 15, 25, 0.66)',
  /** flesh.band — salmon-50, the pale myoseptal band inside a salmon fill. */
  fleshBand: '#FFF1EE',
  /** chainMarks.byChain.solana — the chain tab's underline. */
  chainSolana: '#8B5CF6',
} as const;

/** durations.ts — motionMs and the named curves. */
export const MOTION = {
  swell: 180,
  drift: 280,
  rise: 500,
  current: 'cubic-bezier(0.32, 0.72, 0, 1)',
  settle: 'cubic-bezier(0.22, 1, 0.36, 1)',
  sink: 'cubic-bezier(0.4, 0, 1, 1)',
} as const;

/** scales.deepFieldStroke / deepFieldScale / deepFieldFloor, dark. */
export const DEEP_FIELD = {
  stroke: 'rgba(199, 211, 232, 0.03)',
  scale: 3.2,
  floor: 0.35,
} as const;

/** The app's fonts ship patched for tabular figures; every number uses them. */
export const tabular = { fontVariantNumeric: 'tabular-nums' } as const;

export interface MockToken {
  name: string;
  symbol: string;
  logo: string;
  price: string;
  change: string;
  direction: 'up' | 'down';
  amount: string;
  usdValue: string;
}

export const TOKENS: MockToken[] = [
  {
    name: 'Solana',
    symbol: 'SOL',
    logo: '/images/tokens/sol.png',
    price: '$163.50',
    change: '+2.40%',
    direction: 'up',
    amount: '8.2 SOL',
    usdValue: '$1,340.70',
  },
  {
    name: 'USD Coin',
    symbol: 'USDC',
    logo: '/images/tokens/usdc.png',
    price: '$1.00',
    change: '+0.02%',
    direction: 'up',
    amount: '350 USDC',
    usdValue: '$350.00',
  },
  {
    name: 'Jupiter',
    symbol: 'JUP',
    logo: '/images/tokens/jup.png',
    price: '$0.52',
    change: '-1.80%',
    direction: 'down',
    amount: '412 JUP',
    usdValue: '$214.24',
  },
  {
    name: 'Bonk',
    symbol: 'BONK',
    logo: '/images/tokens/bonk.png',
    price: '$0.00',
    change: '+5.10%',
    direction: 'up',
    amount: '5.20M BONK',
    usdValue: '$106.60',
  },
];

export const changeColor = (direction: MockToken['direction']) =>
  direction === 'up' ? COLORS.changePositive : COLORS.changeNegative;

/**
 * IconBubble — one object behind the wallet thumb, the settings gear, the eye,
 * the money circles, the FAB and the Powerup tiles; the tones differ, nothing else.
 */
export type BubbleTone = 'ink' | 'surface' | 'accent' | 'accentTint' | 'outline' | 'ghost';

export const BUBBLE_TONES: Record<BubbleTone, { background: string; border?: string }> = {
  ink: { background: COLORS.depthAbyss },
  surface: { background: COLORS.cardFill, border: COLORS.hairline },
  accent: { background: COLORS.accentFill },
  accentTint: { background: COLORS.accentTint },
  outline: { background: 'transparent', border: COLORS.borderRaised },
  ghost: { background: 'transparent' },
};

/** componentSizes.bubbleFleshScale — the drawing at half size inside a bubble. */
const BUBBLE_FLESH_SCALE = 0.5;

/**
 * FleshBackground — the myosepta, drawn inside a salmon fill and nowhere else.
 * `showFlesh` defaults to `tone === 'accent'` in the app, so the Send circle
 * and the FAB carry it without asking: a filled control is mass, and mass has
 * an inside.
 */
export function FleshBackground({
  width,
  height = width,
  scale = BUBBLE_FLESH_SCALE,
}: {
  width: number;
  height?: number;
  /** componentSizes: bubbleFleshScale 0.5, buttonFleshScale 1. */
  scale?: number;
}) {
  const id = `flesh-${width}-${height}-${scale}`;
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      // The tile is authored in design points, so the viewBox is the bubble's
      // own point size: the texture then rides the phone's scale like every
      // other measurement here, instead of being fixed in CSS pixels.
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={fleshTile.width}
          height={fleshTile.height}
          patternTransform={`scale(${scale})`}
        >
          {fleshFills.map(([d, fillOpacity], i) => (
            <path key={i} d={d} fill={COLORS.fleshBand} fillOpacity={fillOpacity} />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

export function IconBubble({
  size,
  tone,
  radius,
  children,
}: {
  size: number;
  tone: BubbleTone;
  /** shape="rounded" — the Powerup tiles; circles otherwise. */
  radius?: number;
  children: ReactNode;
}) {
  const { background, border } = BUBBLE_TONES[tone];
  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden"
      style={{
        width: u(size),
        height: u(size),
        borderRadius: radius ? u(radius) : '9999px',
        backgroundColor: background,
        ...(border ? { border: `0.5px solid ${border}` } : {}),
      }}
    >
      {tone === 'accent' && <FleshBackground width={size} />}
      <span className="relative flex items-center justify-center">{children}</span>
    </span>
  );
}

/** A transition on several properties, each with the same timing. */
export const transition = (properties: string[], ms: number, curve: string): CSSProperties => ({
  transitionProperty: properties.join(', '),
  transitionDuration: `${ms}ms`,
  transitionTimingFunction: curve,
});

/** UnderlineTabs size md: 16pt labels, bold when active, a 2pt underline under the text. */
export function UnderlineTab({
  label,
  active,
  underline = COLORS.accentFill,
  size = 16,
}: {
  label: string;
  active: boolean;
  underline?: string;
  /** md 16, sm 12 (the token chart's ranges). */
  size?: number;
}) {
  return (
    <span className="relative flex flex-col items-center" style={{ paddingBottom: u(4) }}>
      <span
        style={{
          fontSize: u(size),
          lineHeight: 1.4,
          fontWeight: active ? 700 : 600,
          color: active ? COLORS.textPrimary : COLORS.textSecondary,
          ...transition(['color'], MOTION.drift, MOTION.current),
        }}
      >
        {label}
      </span>
      <span
        className="absolute bottom-0 left-0 w-full"
        style={{
          height: u(2),
          borderRadius: u(4),
          backgroundColor: underline,
          opacity: active ? 1 : 0,
          transform: `scaleX(${active ? 1 : 0.4})`,
          ...transition(['opacity', 'transform'], MOTION.drift, MOTION.current),
        }}
      />
    </span>
  );
}

/** SectionLabel variant="caps". */
export function CapsLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className="font-bold uppercase"
      style={{ fontSize: u(12), lineHeight: 1.4, letterSpacing: u(0.3), color: COLORS.textSecondary }}
    >
      {children}
    </p>
  );
}

export const cardStyle: CSSProperties = {
  padding: u(16),
  borderRadius: u(16),
  backgroundColor: COLORS.cardFill,
  border: `1px solid ${COLORS.hairline}`,
};

/** RN Switch on iOS: 51×31 track, 27pt thumb. Only the colours are the app's. */
export function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className="relative shrink-0"
      style={{
        width: u(51),
        height: u(31),
        borderRadius: '9999px',
        backgroundColor: on ? COLORS.accentFill : COLORS.borderDefault,
        ...transition(['background-color'], MOTION.drift, MOTION.current),
      }}
    >
      <span
        className="absolute"
        style={{
          top: u(2),
          left: u(2),
          width: u(27),
          height: u(27),
          borderRadius: '9999px',
          backgroundColor: COLORS.textPrimary,
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
          transform: `translateX(${on ? u(20) : '0'})`,
          ...transition(['transform'], MOTION.drift, MOTION.settle),
        }}
      />
    </span>
  );
}

export function PowerupRow({
  icon,
  title,
  subtitle,
  on,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  on: boolean;
}) {
  return (
    <div className="flex items-center" style={{ ...cardStyle, gap: u(12) }}>
      <IconBubble size={44} tone="accentTint" radius={16}>
        {icon}
      </IconBubble>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold" style={{ fontSize: u(16), lineHeight: 1.4, color: COLORS.textPrimary }}>
          {title}
        </p>
        <p className="truncate font-medium" style={{ fontSize: u(14), lineHeight: 1.4, color: COLORS.textSecondary }}>
          {subtitle}
        </p>
      </div>
      <Toggle on={on} />
    </div>
  );
}

/** The ListRow the Swap form uses for both tokens: logo, symbol, a line under it, a caret. */
export function TokenPickRow({ logo, symbol, detail }: { logo: string; symbol: string; detail: string }) {
  return (
    <div className="flex items-center" style={{ ...cardStyle, gap: u(12) }}>
      <Image
        src={logo}
        alt=""
        width={76}
        height={76}
        className="shrink-0 object-cover"
        style={{ width: u(38), height: u(38), borderRadius: '9999px' }}
      />
      <div className="min-w-0 flex-1">
        <p className="font-bold" style={{ fontSize: u(16), lineHeight: 1.4, color: COLORS.textPrimary }}>
          {symbol}
        </p>
        <p className="truncate font-medium" style={{ ...tabular, fontSize: u(14), lineHeight: 1.4, color: COLORS.textSecondary }}>
          {detail}
        </p>
      </div>
      <CaretRightIcon size={u(20)} color={COLORS.textTertiary} />
    </div>
  );
}


/** The water column, mounted once by (tabs)/_layout.tsx: the depth ramp,
 * the deep field of scales over it, and the floor fade over both. */
export function ScreenGround() {
  return (
    <>
      <div
        className="absolute inset-0 z-0"
        style={{ background: `linear-gradient(to bottom, ${COLORS.waterTop}, ${COLORS.waterBottom})` }}
      />
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: seigaihaTileUrl(DEEP_FIELD.stroke, DEEP_FIELD.scale),
          backgroundRepeat: 'repeat',
          // The tile is authored at 806.4×25.2 and shown at `scale`, in the
          // screen's own units — so the arcs and their 1pt stroke ride the
          // phone's size the way every other measurement here does.
          backgroundSize: `${u(seigaihaTile.width * DEEP_FIELD.scale)} ${u(seigaihaTile.height * DEEP_FIELD.scale)}`,
          // Density is the depth cue: the field thins downward to its floor
          // rather than to nothing, which would give the column an end.
          maskImage: `linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,${DEEP_FIELD.floor}) 100%)`,
          WebkitMaskImage: `linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,${DEEP_FIELD.floor}) 100%)`,
        }}
      />
    </>
  );
}

/** water.fadeBottom — starts and ends on the ramp's own floor. */
export function BottomFade() {
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-20"
      style={{ height: u(180), background: `linear-gradient(to bottom, rgba(7, 9, 17, 0), ${COLORS.waterBottom})` }}
    />
  );
}

/** WalletHeader — a 38pt row on the screen gutter, under the safe area. */
export function WalletHeader() {
  return (
    <div className="flex items-center justify-between" style={{ height: u(38), marginTop: u(62), paddingInline: u(12) }}>
      <div className="flex min-w-0 flex-1 items-center" style={{ gap: u(10) }}>
        <IconBubble size={38} tone="ink">
          {/* BrandMark: the salmon mark stands in for a missing avatar */}
          <Image src="/images/logo.png" alt="" width={36} height={34} style={{ width: u(18), height: 'auto' }} />
        </IconBubble>
        <div className="min-w-0">
          <p className="truncate font-bold" style={{ fontSize: u(14), lineHeight: u(18), color: COLORS.textPrimary }}>
            Account #1
          </p>
          <p
            className="truncate font-medium"
            style={{ ...tabular, fontSize: u(12), lineHeight: u(15), letterSpacing: u(0.3), color: COLORS.textTertiary }}
          >
            7Q3H…as6n
          </p>
        </div>
      </div>
      <div className="flex items-center" style={{ gap: u(8) }}>
        <span style={{ padding: u(4) }}>
          <CopyIcon size={u(23)} color={COLORS.textSecondary} />
        </span>
        <IconBubble size={36} tone="ink">
          <FadersHorizontalIcon size={u(18)} color={COLORS.textPrimary} />
        </IconBubble>
      </div>
    </div>
  );
}

/** KeyValueRow: a secondary label on the left, a bold value on the right. */
export function KeyValueRow({
  label,
  value,
  action,
  tone = 'primary',
  wrap = false,
}: {
  label: string;
  value: string;
  /** Let a long value break onto more lines instead of truncating. */
  wrap?: boolean;
  /** labelAction, e.g. "Change" beside "Amount". */
  action?: string;
  tone?: 'primary' | 'secondary' | 'success' | 'danger';
}) {
  const toneColor = {
    primary: COLORS.textPrimary,
    secondary: COLORS.textSecondary,
    success: COLORS.changePositive,
    danger: COLORS.changeNegative,
  }[tone];
  return (
    <div className={`flex justify-between ${wrap ? 'items-start' : 'items-center'}`} style={{ gap: u(12) }}>
      <span className="flex shrink-0 items-center" style={{ gap: u(8) }}>
        <span className="font-medium" style={{ fontSize: u(14), lineHeight: u(19.6), color: COLORS.textSecondary }}>
          {label}
        </span>
        {action && (
          <span className="font-semibold" style={{ fontSize: u(14), lineHeight: u(19.6), color: COLORS.accentFill }}>
            {action}
          </span>
        )}
      </span>
      <span
        className={`${wrap ? '' : 'truncate '}text-right font-bold`}
        style={{ ...tabular, fontSize: u(14), lineHeight: u(19.6), color: toneColor }}
      >
        {value}
      </span>
    </div>
  );
}

/** PrimaryButton: 56pt salmon fill with the flesh bands, Bold 16 ink label. */
export function PrimaryButton({ label }: { label: string }) {
  return (
    <span
      className="relative flex items-center justify-center overflow-hidden font-bold"
      style={{
        height: u(56),
        borderRadius: u(12),
        backgroundColor: COLORS.accentFill,
        // shadowsCSS.bezel — the lit inner rim
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.28), inset 0 -1px 0 rgba(0, 0, 0, 0.18)',
        fontSize: u(16),
        color: COLORS.accentOnFill,
      }}
    >
      <FleshBackground width={416} height={56} scale={1} />
      <span className="relative">{label}</span>
    </span>
  );
}

/** SecondaryButton: the outline twin, or its danger tone. */
export function SecondaryButton({ label, danger }: { label: string; danger?: boolean }) {
  const ink = danger ? COLORS.changeNegative : COLORS.textPrimary;
  return (
    <span
      className="flex items-center justify-center font-bold"
      style={{
        minHeight: u(56),
        borderRadius: u(12),
        border: `1px solid ${danger ? COLORS.changeNegative : COLORS.borderRaised}`,
        fontSize: u(16),
        color: ink,
      }}
    >
      {label}
    </span>
  );
}

/** ScreenHeader, titled: back well, optional glyph, Bold 24 title, optional subtitle. */
export function ScreenHeader({ title, glyph, subtitle }: { title: string; glyph?: ReactNode; subtitle?: string }) {
  return (
    <div className="flex flex-col" style={{ paddingTop: u(62), paddingInline: u(12), paddingBottom: u(20), gap: u(12) }}>
      <div className="flex items-center" style={{ gap: u(12) }}>
        <IconBubble size={38} tone="surface">
          <CaretLeftIcon size={u(18)} color={COLORS.textPrimary} />
        </IconBubble>
        {glyph}
        <span className="truncate font-bold" style={{ fontSize: u(24), letterSpacing: u(-0.12), color: COLORS.textPrimary }}>
          {title}
        </span>
      </div>
      {subtitle && (
        <p className="font-medium" style={{ fontSize: u(16), lineHeight: u(22.4), color: COLORS.textSecondary }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/** The bottom-pinned action column: outline above, primary below, over the safe area. */
export function ActionColumn({ children, gutter = 12 }: { children: ReactNode; gutter?: number }) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-30 flex flex-col"
      style={{ paddingInline: u(gutter), paddingTop: u(12), paddingBottom: u(54), gap: u(12) }}
    >
      {children}
    </div>
  );
}
