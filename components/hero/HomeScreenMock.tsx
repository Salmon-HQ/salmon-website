import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import { u } from './phone-scale';
import { fleshFills, fleshTile } from './flesh';
import { seigaihaTile, seigaihaTileUrl } from './scales';
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  ArrowsLeftRightIcon,
  CaretRightIcon,
  ClockIcon,
  CopyIcon,
  EyeIcon,
  FadersHorizontalIcon,
  FadersIcon,
  PlusIcon,
  QrCodeIcon,
} from './wallet-icons';

/**
 * The wallet's home screen, rebuilt for the web with hardcoded holdings, plus
 * the Powerups flow the landing walks through on scroll.
 *
 * Mirrors apps/mobile/app/(app)/(tabs)/index.tsx in salmon-wallet-frontend and
 * what it composes — WalletHeader, ChainSelector, BalanceHeader /
 * ValueActionsRow, PortfolioSubTabs, TokenListItem, PowerupsFab,
 * PowerupsCatalog and SwapScreen — measurement for measurement, against the
 * 440pt reference screen via u(). Colors are the resolved dark values of
 * packages/shared/src/theme/semantic.ts; motion uses durations.ts.
 *
 * Every figure is internally consistent: each row's USD value is
 * amount × price, the total is the sum of the rows ($2,011.54), and the 24h
 * change (+1.65% / +$32.66) is the weighted result of the per-token moves.
 */

/**
 * 0 — Home. 1 — Powerups catalog open. 2 — Swap turned on.
 * 3 — catalog closed, Swap tab added and selected (focus mode hides the balance).
 */
export type MockStep = 0 | 1 | 2 | 3;

/** semantic.ts, dark. Names are the token's, not a local invention. */
const COLORS = {
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
const MOTION = {
  swell: 180,
  drift: 280,
  rise: 500,
  current: 'cubic-bezier(0.32, 0.72, 0, 1)',
  settle: 'cubic-bezier(0.22, 1, 0.36, 1)',
  sink: 'cubic-bezier(0.4, 0, 1, 1)',
} as const;

/** scales.deepFieldStroke / deepFieldScale / deepFieldFloor, dark. */
const DEEP_FIELD = {
  stroke: 'rgba(199, 211, 232, 0.03)',
  scale: 3.2,
  floor: 0.35,
} as const;

/** The app's fonts ship patched for tabular figures; every number uses them. */
const tabular = { fontVariantNumeric: 'tabular-nums' } as const;

interface MockToken {
  name: string;
  symbol: string;
  logo: string;
  price: string;
  change: string;
  direction: 'up' | 'down';
  amount: string;
  usdValue: string;
}

const TOKENS: MockToken[] = [
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

const changeColor = (direction: MockToken['direction']) =>
  direction === 'up' ? COLORS.changePositive : COLORS.changeNegative;

/**
 * IconBubble — one object behind the wallet thumb, the settings gear, the eye,
 * the money circles, the FAB and the Powerup tiles; the tones differ, nothing else.
 */
type BubbleTone = 'ink' | 'accent' | 'accentTint' | 'outline' | 'ghost';

const BUBBLE_TONES: Record<BubbleTone, { background: string; border?: string }> = {
  ink: { background: COLORS.depthAbyss },
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
function FleshBackground({ size }: { size: number }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      // The tile is authored in design points, so the viewBox is the bubble's
      // own point size: the texture then rides the phone's scale like every
      // other measurement here, instead of being fixed in CSS pixels.
      viewBox={`0 0 ${size} ${size}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern
          id={`bubble-flesh-${size}`}
          patternUnits="userSpaceOnUse"
          width={fleshTile.width}
          height={fleshTile.height}
          patternTransform={`scale(${BUBBLE_FLESH_SCALE})`}
        >
          {fleshFills.map(([d, fillOpacity], i) => (
            <path key={i} d={d} fill={COLORS.fleshBand} fillOpacity={fillOpacity} />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#bubble-flesh-${size})`} />
    </svg>
  );
}

function IconBubble({
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
      {tone === 'accent' && <FleshBackground size={size} />}
      <span className="relative flex items-center justify-center">{children}</span>
    </span>
  );
}

/** A transition on several properties, each with the same timing. */
const transition = (properties: string[], ms: number, curve: string): CSSProperties => ({
  transitionProperty: properties.join(', '),
  transitionDuration: `${ms}ms`,
  transitionTimingFunction: curve,
});

/** UnderlineTabs size md: 16pt labels, bold when active, a 2pt underline under the text. */
function UnderlineTab({
  label,
  active,
  underline = COLORS.accentFill,
}: {
  label: string;
  active: boolean;
  underline?: string;
}) {
  return (
    <span className="relative flex flex-col items-center" style={{ paddingBottom: u(4) }}>
      <span
        style={{
          fontSize: u(16),
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
function CapsLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className="font-bold uppercase"
      style={{ fontSize: u(12), lineHeight: 1.4, letterSpacing: u(0.3), color: COLORS.textSecondary }}
    >
      {children}
    </p>
  );
}

const cardStyle: CSSProperties = {
  padding: u(16),
  borderRadius: u(16),
  backgroundColor: COLORS.cardFill,
  border: `1px solid ${COLORS.hairline}`,
};

/** RN Switch on iOS: 51×31 track, 27pt thumb. Only the colours are the app's. */
function Toggle({ on }: { on: boolean }) {
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

function PowerupRow({
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
function TokenPickRow({ logo, symbol, detail }: { logo: string; symbol: string; detail: string }) {
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

function SwapForm() {
  return (
    <div className="flex flex-col" style={{ gap: u(12) }}>
      {/* PowerupTabBody — the usage line above the Powerup's own surface */}
      <p className="font-bold" style={{ paddingInline: u(18), fontSize: u(16), lineHeight: 1.4, color: COLORS.textSecondary }}>
        Pick what you pay with, what you receive and how much. Review the quote, then sign.
      </p>
      <div className="flex flex-col" style={{ paddingInline: u(18), gap: u(12) }}>
        <CapsLabel>You pay</CapsLabel>
        <TokenPickRow logo="/images/tokens/sol.png" symbol="SOL" detail="8.2 SOL available" />
        {/* AmountEntryCard */}
        <div className="flex flex-col items-center" style={{ ...cardStyle, gap: u(10) }}>
          <span className="font-bold" style={{ ...tabular, fontSize: u(46), lineHeight: 1.4, color: COLORS.textTertiary }}>
            0
          </span>
          <span className="font-medium" style={{ ...tabular, fontSize: u(13), color: COLORS.textSecondary }}>
            ≈ 0.00 USD
          </span>
        </div>
        <div className="flex" style={{ gap: u(8) }}>
          {['25%', '50%', '75%', 'Max'].map((chip) => (
            <span
              key={chip}
              className="flex flex-1 items-center justify-center font-bold"
              style={{
                paddingBlock: u(8),
                paddingInline: u(12),
                borderRadius: '9999px',
                border: `1px solid ${COLORS.borderRaised}`,
                fontSize: u(14),
                letterSpacing: u(0.3),
                color: COLORS.textPrimary,
              }}
            >
              {chip}
            </span>
          ))}
        </div>
        <CapsLabel>You receive</CapsLabel>
        <TokenPickRow logo="/images/tokens/usdc.png" symbol="USDC" detail="USD Coin" />
        {/* PrimaryButton, disabled until an amount is entered */}
        <div style={{ paddingTop: u(16) }}>
          <span
            className="flex items-center justify-center font-bold"
            style={{
              height: u(56),
              borderRadius: u(12),
              backgroundColor: COLORS.surfaceCrest,
              fontSize: u(16),
              color: COLORS.textDisabled,
            }}
          >
            Review swap
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HomeScreenMock({ step = 0 }: { step?: MockStep }) {
  const catalogOpen = step === 1 || step === 2;
  const swapOn = step >= 2;
  // The tab lands as the sheet closes, so its arrival is the beat the step shows.
  const swapTab = step === 3;

  return (
    <div aria-hidden="true" className="wallet-mock absolute inset-0 overflow-hidden">
      {/* The water column, mounted once by (tabs)/_layout.tsx: the depth ramp,
          the deep field of scales over it, and the floor fade over both. */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(to bottom, ${COLORS.waterTop}, ${COLORS.waterBottom})`,
        }}
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

      <div className="relative z-10 flex flex-col">
        {/* WalletHeader — a 38pt row on the screen gutter, under the safe area */}
        <div
          className="flex items-center justify-between"
          style={{ height: u(38), marginTop: u(62), paddingInline: u(12) }}
        >
          <div className="flex min-w-0 flex-1 items-center" style={{ gap: u(10) }}>
            <IconBubble size={38} tone="ink">
              {/* BrandMark: the salmon mark stands in for a missing avatar */}
              <Image
                src="/images/logo.png"
                alt=""
                width={36}
                height={34}
                style={{ width: u(18), height: 'auto' }}
              />
            </IconBubble>

            <div className="flex min-w-0 flex-1 items-center" style={{ gap: u(8) }}>
              <div className="min-w-0">
                <p
                  className="truncate font-bold"
                  style={{ fontSize: u(14), lineHeight: u(18), color: COLORS.textPrimary }}
                >
                  Account #1
                </p>
                <p
                  className="truncate font-medium"
                  style={{
                    ...tabular,
                    fontSize: u(12),
                    lineHeight: u(15),
                    letterSpacing: u(0.3),
                    color: COLORS.textTertiary,
                  }}
                >
                  7Q3H…as6n
                </p>
              </div>
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

        {/* The pinned block: balance, then the sub-tabs row. A Powerup tab is
            focus mode: the balance block folds away and the row rises. */}
        <div style={{ paddingInline: u(12), paddingTop: u(20), paddingBottom: u(20) }}>
          <div
            className="grid"
            style={{
              gridTemplateRows: swapTab ? '0fr' : '1fr',
              opacity: swapTab ? 0 : 1,
              ...transition(['grid-template-rows', 'opacity'], MOTION.drift, MOTION.current),
            }}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="flex flex-col" style={{ gap: u(4), paddingBottom: u(20) }}>
                {/* ChainSelector — where the Total balance label used to be */}
                <div className="flex items-start" style={{ gap: u(20) }}>
                  <UnderlineTab label="Solana" active underline={COLORS.chainSolana} />
                  <UnderlineTab label="Bitcoin" active={false} />
                </div>

                <div className="flex items-center" style={{ gap: u(4) }}>
                  <p
                    className="whitespace-nowrap font-bold"
                    style={{
                      ...tabular,
                      fontSize: u(48),
                      lineHeight: 1.25,
                      letterSpacing: u(-0.25),
                      color: COLORS.textPrimary,
                    }}
                  >
                    $2,011.54
                  </p>
                  <IconBubble size={24} tone="ghost">
                    <EyeIcon size={u(15)} color={COLORS.textSecondary} />
                  </IconBubble>
                </div>

                {/* ValueActionsRow — the change, then Activity, Send, Receive */}
                <div className="flex items-center" style={{ gap: u(12) }}>
                  <span
                    className="whitespace-nowrap font-bold"
                    style={{ ...tabular, fontSize: u(16), color: COLORS.changePositive }}
                  >
                    +$32.66 · +1.65%
                  </span>
                  <div className="ml-auto flex shrink-0 items-center" style={{ gap: u(8) }}>
                    <IconBubble size={36} tone="outline">
                      <ClockIcon size={u(16)} color={COLORS.textPrimary} />
                    </IconBubble>
                    <IconBubble size={36} tone="accent">
                      <ArrowUpRightIcon size={u(16)} color={COLORS.accentOnFill} bold />
                    </IconBubble>
                    <IconBubble size={36} tone="outline">
                      <ArrowDownLeftIcon size={u(16)} color={COLORS.textPrimary} />
                    </IconBubble>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PortfolioSubTabs — a Powerup's tab appends after NFTs */}
          <div className="flex items-center justify-between" style={{ gap: u(12) }}>
            <div className="flex items-start">
              <UnderlineTab label="Assets" active={!swapTab} />
              <span style={{ marginLeft: u(20) }}>
                <UnderlineTab label="NFTs" active={false} />
              </span>
              <span
                className="overflow-hidden"
                style={{
                  marginLeft: swapTab ? u(20) : 0,
                  maxWidth: swapTab ? u(60) : 0,
                  opacity: swapTab ? 1 : 0,
                  transform: swapTab ? 'none' : `translateY(${u(8)}) scale(0.95)`,
                  ...transition(['margin-left', 'max-width', 'opacity', 'transform'], MOTION.drift, MOTION.settle),
                }}
              >
                <UnderlineTab label="Swap" active={swapTab} />
              </span>
            </div>
            <IconBubble size={36} tone="outline">
              <FadersIcon size={u(18)} color={COLORS.textSecondary} />
            </IconBubble>
          </div>
        </div>

        {/* The sub-tab content: the outgoing surface sinks, the incoming floats in. */}
        <div className="relative">
          <div
            className="flex flex-col"
            style={{
              paddingInline: u(12),
              gap: u(12),
              opacity: swapTab ? 0 : 1,
              transform: swapTab ? `translateY(${u(8)}) scale(0.96)` : 'none',
              ...transition(['opacity', 'transform'], swapTab ? 360 : 560, swapTab ? MOTION.sink : MOTION.settle),
            }}
          >
            {TOKENS.map((token) => (
              <div key={token.symbol} className="flex items-center" style={{ ...cardStyle, gap: u(12) }}>
                <Image
                  src={token.logo}
                  alt=""
                  width={88}
                  height={88}
                  className="shrink-0 object-cover"
                  style={{ width: u(44), height: u(44), borderRadius: u(22) }}
                />

                <div className="min-w-0 flex-1">
                  <p
                    className="truncate font-bold"
                    style={{ fontSize: u(18), lineHeight: 1.4, color: COLORS.textPrimary }}
                  >
                    {token.name}
                  </p>
                  {/* One text run that ellipsises at its end, like the app's */}
                  <p
                    className="truncate font-medium"
                    style={{ ...tabular, fontSize: u(12), lineHeight: 1.4, color: COLORS.textSecondary }}
                  >
                    {token.symbol} · {token.price} ·{' '}
                    <span className="font-semibold" style={{ color: changeColor(token.direction) }}>
                      {token.change}
                    </span>
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end" style={{ gap: u(2) }}>
                  <span
                    className="whitespace-nowrap font-bold"
                    style={{ ...tabular, fontSize: u(16), lineHeight: 1.4, color: COLORS.textPrimary }}
                  >
                    {token.amount}
                  </span>
                  <span
                    className="whitespace-nowrap font-medium"
                    style={{ ...tabular, fontSize: u(12), lineHeight: 1.4, color: COLORS.textSecondary }}
                  >
                    {token.usdValue}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div
            className="absolute inset-x-0 top-0"
            style={{
              opacity: swapTab ? 1 : 0,
              transform: swapTab ? 'none' : `translateY(${u(8)}) scale(0.96)`,
              ...transition(['opacity', 'transform'], swapTab ? 560 : 360, swapTab ? MOTION.settle : MOTION.sink),
            }}
          >
            <SwapForm />
          </div>
        </div>
      </div>

      {/* water.fadeBottom — starts and ends on the ramp's own floor */}
      <div
        className="absolute inset-x-0 bottom-0 z-20"
        style={{
          height: u(180),
          background: `linear-gradient(to bottom, rgba(7, 9, 17, 0), ${COLORS.waterBottom})`,
        }}
      />

      {/* PowerupsFab — 48pt accent circle on the right gutter */}
      <span
        className="absolute z-20"
        style={{ right: u(12), bottom: u(54), borderRadius: '9999px', boxShadow: '0 0 12px rgba(0, 0, 0, 0.64)' }}
      >
        <IconBubble size={48} tone="accent">
          <PlusIcon size={u(24)} color={COLORS.accentOnFill} />
        </IconBubble>
      </span>

      {/* overlay.backdrop under the catalog sheet */}
      <div
        className="absolute inset-0 z-30"
        style={{
          backgroundColor: COLORS.backdrop,
          opacity: catalogOpen ? 1 : 0,
          ...transition(['opacity'], catalogOpen ? MOTION.rise : MOTION.swell, catalogOpen ? MOTION.settle : MOTION.sink),
        }}
      />

      {/* PowerupsCatalog — the sheet stops at the sub-tabs row, so Send and
          Receive stay in view above it. */}
      <div
        className="absolute inset-x-0 bottom-0 z-40 flex flex-col"
        style={{
          top: u(412),
          borderTopLeftRadius: u(24),
          borderTopRightRadius: u(24),
          border: `0.75px solid ${COLORS.borderDefault}`,
          borderBottom: 0,
          backgroundColor: COLORS.sheetFill,
          boxShadow: '0 -3px 15px rgba(0, 0, 0, 0.8)',
          transform: catalogOpen ? 'none' : 'translateY(105%)',
          ...transition(['transform'], catalogOpen ? MOTION.rise : MOTION.swell, catalogOpen ? MOTION.settle : MOTION.sink),
        }}
      >
        <div className="flex justify-center" style={{ paddingTop: u(12), paddingBottom: u(8) }}>
          <span
            style={{
              width: u(44),
              height: u(5),
              borderRadius: '9999px',
              backgroundColor: COLORS.textTertiary,
              opacity: 0.4,
            }}
          />
        </div>
        <div className="flex flex-col text-center" style={{ gap: u(4), paddingInline: u(12) }}>
          <p
            className="font-semibold"
            style={{ fontSize: u(24), lineHeight: 1.25, letterSpacing: u(-0.12), color: COLORS.textPrimary }}
          >
            Powerups
          </p>
          <p className="font-medium" style={{ fontSize: u(16), lineHeight: 1.4, color: COLORS.textSecondary }}>
            Add-ons that give your wallet new abilities.
          </p>
        </div>
        <div className="flex flex-col" style={{ gap: u(20), paddingInline: u(12), paddingTop: u(12) }}>
          <CapsLabel>Core</CapsLabel>
          <PowerupRow
            icon={<ArrowsLeftRightIcon size={u(20)} color={COLORS.accentFill} bold />}
            title="Swap"
            subtitle="Exchange one token for another"
            on={swapOn}
          />
          <PowerupRow
            icon={<QrCodeIcon size={u(20)} color={COLORS.accentFill} bold />}
            title="Payments"
            subtitle="Ask for USDC with a QR code"
            on={false}
          />
          <CapsLabel>Community</CapsLabel>
          {/* StateBlock tone="empty" */}
          <div style={{ paddingBlock: u(20) }}>
            <div className="text-center" style={{ ...cardStyle, padding: u(24) }}>
              <p className="font-bold" style={{ fontSize: u(18), lineHeight: 1.4, color: COLORS.textPrimary }}>
                Nothing here yet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
