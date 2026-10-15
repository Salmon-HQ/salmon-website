import Image from 'next/image';
import { u } from './phone-scale';
import { fleshFills, fleshTile } from './flesh';
import { seigaihaTile, seigaihaTileUrl } from './scales';
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  ClockIcon,
  CopyIcon,
  EyeIcon,
  FadersHorizontalIcon,
  FadersIcon,
} from './wallet-icons';

/**
 * The wallet's home screen, rebuilt for the web with hardcoded holdings.
 *
 * Mirrors apps/mobile/app/(app)/(tabs)/index.tsx in salmon-wallet-frontend and
 * the components it composes — WalletHeader, BalanceHeader, PortfolioSubTabs,
 * TokenListItem (ListRow → Card) — measurement for measurement, expressed
 * against the 440pt reference screen via u(). Colors are the resolved dark
 * values of packages/shared/src/theme/semantic.ts; sizes are the tokens those
 * components actually read, not eyeballed from a screenshot.
 *
 * The app has no bottom tab bar, no swap surface and no powerups FAB, so
 * neither does this mock.
 *
 * Every figure is internally consistent: each row's USD value is
 * amount × price, the total is the sum of the rows ($2,011.54), and the 24h
 * change (+1.65% / +$32.66) is the weighted result of the per-token moves.
 */

/** semantic.ts, dark. Names are the token's, not a local invention. */
const COLORS = {
  depthAbyss: '#070911',
  waterTop: '#10131C',
  waterBottom: '#070911',
  /** Card tone `surface`: membraneThin over the ramp, hairline edge. */
  cardFill: 'rgba(11, 15, 25, 0.48)',
  hairline: 'rgba(199, 211, 232, 0.10)',
  borderRaised: '#6F7B95',
  textPrimary: '#EDF1F7',
  textSecondary: '#A7B1C4',
  textTertiary: '#8B96AD',
  textDisabled: '#6F7B95',
  accentFill: '#FF5C45',
  accentOnFill: '#070911',
  changePositive: '#33D6A6',
  changeNegative: '#FF6B85',
  /** flesh.band — salmon-50, the pale myoseptal band inside a salmon fill. */
  fleshBand: '#FFF1EE',
  /** chain.hintInk.bitcoin — chainMarks amber, the only warm ink beside salmon. */
  hintBitcoin: '#F59E0B',
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
 * the reorder button and the two money circles; the tones differ, nothing else.
 */
type BubbleTone = 'ink' | 'accent' | 'outline' | 'ghost';

const BUBBLE_TONES: Record<BubbleTone, { background: string; border?: string }> = {
  ink: { background: COLORS.depthAbyss },
  accent: { background: COLORS.accentFill },
  outline: { background: 'transparent', border: COLORS.borderRaised },
  ghost: { background: 'transparent' },
};

/** componentSizes.bubbleFleshScale — the drawing at half size inside a bubble. */
const BUBBLE_FLESH_SCALE = 0.5;

/**
 * FleshBackground — the myosepta, drawn inside a salmon fill and nowhere else.
 * `showFlesh` defaults to `tone === 'accent'` in the app, so the Send circle
 * carries it without asking: a filled control is mass, and mass has an inside.
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
          id="bubble-flesh"
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
      <rect width="100%" height="100%" fill="url(#bubble-flesh)" />
    </svg>
  );
}

function IconBubble({
  size,
  tone,
  children,
}: {
  size: number;
  tone: BubbleTone;
  children: React.ReactNode;
}) {
  const { background, border } = BUBBLE_TONES[tone];
  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden"
      style={{
        width: u(size),
        height: u(size),
        borderRadius: '9999px',
        backgroundColor: background,
        ...(border ? { border: `1px solid ${border}` } : {}),
      }}
    >
      {tone === 'accent' && <FleshBackground size={size} />}
      <span className="relative flex items-center justify-center">{children}</span>
    </span>
  );
}

export default function HomeScreenMock() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
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
          style={{ height: u(38), marginTop: u(62), paddingInline: u(20) }}
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
              <div className="min-w-0 flex-1">
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
              <span style={{ padding: u(4) }}>
                <CopyIcon size={u(23)} color={COLORS.textSecondary} />
              </span>
            </div>
          </div>

          <IconBubble size={36} tone="ink">
            <FadersHorizontalIcon size={u(18)} color={COLORS.textPrimary} />
          </IconBubble>
        </div>

        {/* The pinned block: balance, then the sub-tabs row. Both seams are the
            component gap (20); the anatomy inside keeps the 4/8/10/12 steps. */}
        <div style={{ paddingInline: u(20), paddingTop: u(20), paddingBottom: u(20) }}>
          {/* BalanceHeader — replaced the balance card and the action row.
              Bottom-aligned: the two money circles are 42 tall, which is
              exactly the change row and the cue row stacked. */}
          <div className="flex items-end justify-between" style={{ gap: u(12) }}>
            <div className="flex min-w-0 flex-1 flex-col" style={{ gap: u(4) }}>
              <div className="flex items-center" style={{ gap: u(4) }}>
                <span
                  className="font-medium"
                  style={{ fontSize: u(12), color: COLORS.textSecondary }}
                >
                  Total balance
                </span>
                <IconBubble size={24} tone="ghost">
                  <EyeIcon size={u(15)} color={COLORS.textSecondary} />
                </IconBubble>
              </div>

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

              <div className="flex items-center" style={{ gap: u(10) }}>
                <span
                  className="whitespace-nowrap font-bold"
                  style={{ ...tabular, fontSize: u(12), color: COLORS.changePositive }}
                >
                  +$32.66 · +1.65% 24h
                </span>
                {/* Chip, size sm, variant outline */}
                <span
                  className="flex shrink-0 items-center justify-center"
                  style={{
                    gap: u(4),
                    paddingBlock: u(4),
                    paddingInline: u(8),
                    borderRadius: '9999px',
                    border: `1px solid ${COLORS.borderRaised}`,
                  }}
                >
                  <ClockIcon size={u(12)} color={COLORS.textSecondary} />
                  <span
                    className="font-medium"
                    style={{ fontSize: u(10), lineHeight: 1.5, color: COLORS.textSecondary }}
                  >
                    Activity
                  </span>
                </span>
              </div>

              {/* The cue row: the dots, then the page ahead named in its own
                  chain's hue with the arrow pointing the way it lies. */}
              <div className="flex items-center" style={{ gap: u(12) }}>
                <div className="flex items-center" style={{ gap: u(8) }}>
                  {/* The active dot is a pill that travels between chains */}
                  <span
                    style={{
                      width: u(14),
                      height: u(4),
                      borderRadius: '9999px',
                      backgroundColor: COLORS.accentFill,
                    }}
                  />
                  <span
                    style={{
                      width: u(4),
                      height: u(4),
                      borderRadius: '9999px',
                      backgroundColor: COLORS.textDisabled,
                    }}
                  />
                </div>
                <span
                  className="font-semibold"
                  style={{ fontSize: u(10), lineHeight: 1.5, color: COLORS.hintBitcoin }}
                >
                  BTC →
                </span>
              </div>
            </div>

            {/* Send is the block's single salmon fill; Receive is its outline twin */}
            <div className="flex shrink-0 items-center" style={{ gap: u(8) }}>
              <IconBubble size={42} tone="accent">
                <ArrowUpRightIcon size={u(20)} color={COLORS.accentOnFill} bold />
              </IconBubble>
              <IconBubble size={42} tone="outline">
                <ArrowDownLeftIcon size={u(20)} color={COLORS.textPrimary} />
              </IconBubble>
            </div>
          </div>

          {/* PortfolioSubTabs */}
          <div
            className="flex items-center justify-between"
            style={{ gap: u(12), marginTop: u(20) }}
          >
            <div className="flex items-start" style={{ gap: u(20) }}>
              <span
                className="flex flex-col items-center"
                style={{ paddingBottom: u(4), position: 'relative' }}
              >
                <span
                  className="font-bold"
                  style={{ fontSize: u(16), lineHeight: 1.4, color: COLORS.textPrimary }}
                >
                  Portfolio
                </span>
                <span
                  className="absolute bottom-0 left-0 w-full"
                  style={{ height: u(2), borderRadius: u(4), backgroundColor: COLORS.accentFill }}
                />
              </span>
              <span
                className="font-semibold"
                style={{
                  fontSize: u(16),
                  lineHeight: 1.4,
                  paddingBottom: u(4),
                  color: COLORS.textSecondary,
                }}
              >
                NFTs
              </span>
            </div>
            <IconBubble size={36} tone="outline">
              <FadersIcon size={u(18)} color={COLORS.textSecondary} />
            </IconBubble>
          </div>
        </div>

        {/* TokenList — the only part of the screen that scrolls in the app.
            Card→card is a sibling-component seam, so it takes the gutter (20). */}
        <div className="flex flex-col" style={{ paddingInline: u(20), gap: u(20) }}>
          {TOKENS.map((token) => (
            <div
              key={token.symbol}
              className="flex items-center"
              style={{
                gap: u(12),
                padding: u(16),
                borderRadius: u(16),
                backgroundColor: COLORS.cardFill,
                border: `1px solid ${COLORS.hairline}`,
              }}
            >
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
                  style={{
                    ...tabular,
                    fontSize: u(12),
                    lineHeight: 1.4,
                    color: COLORS.textSecondary,
                  }}
                >
                  {token.usdValue}
                </span>
              </div>
            </div>
          ))}
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
    </div>
  );
}
