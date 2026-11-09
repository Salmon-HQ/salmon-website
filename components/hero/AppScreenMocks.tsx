import Image from 'next/image';
import type { ReactNode } from 'react';
import { u } from './phone-scale';
import {
  ActionColumn,
  BottomFade,
  COLORS,
  FleshBackground,
  IconBubble,
  KeyValueRow,
  MOTION,
  PrimaryButton,
  ScreenGround,
  ScreenHeader,
  SecondaryButton,
  UnderlineTab,
  WalletHeader,
  cardStyle,
  tabular,
} from './mock-kit';
import { ArrowDownLeftIcon, ArrowRightIcon, ArrowUpRightIcon, CaretDownIcon, CopyIcon, WarningIcon } from './wallet-icons';

/**
 * The app screens the landing shows besides Home, rebuilt from
 * salmon-wallet-frontend: core's TransactionConfirmation (swap review),
 * PaymentRequestSheet, ReceiveSheet, activity.tsx, send/review.tsx, NftsTab
 * and token/[id].tsx.
 *
 * The data is invented but consistent with the Home mock's account: 8.2 SOL
 * at $163.50, 350 USDC. The NFTs are generative pieces from made-up
 * collections, drawn here so no real artist's work is shown.
 */

function Screen({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden="true" className="wallet-mock absolute inset-0 overflow-hidden">
      <ScreenGround />
      {children}
    </div>
  );
}

/** Swap review — core's TransactionConfirmation, opened by "Review swap". */
export function SwapReviewMock() {
  const side = (label: string, logo: string, amount: string, usd: string) => (
    <div className="flex flex-1 flex-col items-center" style={{ gap: u(4) }}>
      <span
        className="font-medium uppercase"
        style={{ fontSize: u(10), letterSpacing: u(0.5), color: COLORS.textTertiary }}
      >
        {label}
      </span>
      <Image src={logo} alt="" width={80} height={80} style={{ width: u(40), height: u(40), borderRadius: '9999px' }} />
      <span
        className="font-bold"
        style={{ ...tabular, fontSize: u(18), lineHeight: u(22.5), letterSpacing: u(-0.12), color: COLORS.textPrimary }}
      >
        {amount}
      </span>
      <span className="font-medium" style={{ ...tabular, fontSize: u(12), lineHeight: u(16.8), color: COLORS.textSecondary }}>
        {usd}
      </span>
    </div>
  );

  return (
    <Screen>
      <div className="relative z-10 flex flex-col" style={{ paddingTop: u(62 + 24), paddingInline: u(18) }}>
        <p
          className="text-center font-semibold"
          style={{ fontSize: u(24), lineHeight: u(30), letterSpacing: u(-0.12), color: COLORS.textPrimary, marginBottom: u(24) }}
        >
          Swap Review
        </p>
        <div className="flex items-center" style={{ padding: u(10), gap: u(8), marginBottom: u(20) }}>
          {side('You pay', '/images/tokens/sol.png', '1 SOL', '$163.50')}
          <ArrowRightIcon size={u(20)} color={COLORS.accentFill} />
          {side('You receive (estimated)', '/images/tokens/usdc.png', '162.68 USDC', '$162.68')}
        </div>
        <div className="flex flex-col" style={{ ...cardStyle, gap: u(12), marginBottom: u(20) }}>
          <KeyValueRow label="Rate" value="1 SOL ≈ 163.50 USDC" />
          <KeyValueRow label="Salmon fee" value="0.82 USDC (0.5%), taken from what you receive" wrap />
          <KeyValueRow label="Provider fee" value="0.1%" />
          <KeyValueRow label="Minimum received" value="161.87 USDC" />
          <div className="flex items-center justify-between">
            <span className="font-medium" style={{ fontSize: u(14), lineHeight: u(19.6), color: COLORS.textSecondary }}>
              Details
            </span>
            <span style={{ display: 'flex', transform: 'rotate(180deg)' }}>
              <CaretDownIcon size={u(16)} color={COLORS.textSecondary} />
            </span>
          </div>
          <KeyValueRow label="Max slippage" value="0.5%" />
          <KeyValueRow label="Price impact" value="0.02%" />
          <KeyValueRow label="Route" value="Jupiter" />
          <KeyValueRow label="Pay mint" value="So1111...111112" />
          <KeyValueRow label="Receive mint" value="EPjFWd...yTDt1v" />
        </div>
        <p className="text-center font-medium" style={{ fontSize: u(12), color: COLORS.textTertiary }}>
          Powered by Jupiter
        </p>
      </div>
      <ActionColumn gutter={18}>
        <SecondaryButton label="Back" />
        <PrimaryButton label="Confirm (59)" />
      </ActionColumn>
    </Screen>
  );
}

/** A deterministic stand-in for a QR code: real finder patterns, modules that encode nothing. */
function DecoyQr() {
  const n = 41;
  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
  const inLogo = (x: number, y: number) => Math.abs(x - 20) <= 5 && Math.abs(y - 20) <= 5;
  const modules: [number, number][] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!inFinder(x, y) && !inLogo(x, y) && random() < 0.48) modules.push([x, y]);
    }
  }
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} rx={1.4} fill={COLORS.depthAbyss} />
      <rect x={x + 1} y={y + 1} width={5} height={5} rx={0.9} fill={COLORS.textPrimary} />
      <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.6} fill={COLORS.depthAbyss} />
    </g>
  );
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="block h-full w-full" shapeRendering="crispEdges">
      <rect width={n} height={n} fill={COLORS.textPrimary} />
      {modules.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={COLORS.depthAbyss} />
      ))}
      {[finder(0, 0), finder(n - 7, 0), finder(0, n - 7)]}
    </svg>
  );
}

/** The Payments Powerup's request sheet, risen over a dimmed Home. */
/** BottomSheetContainer over the Home: the dimmed screen, the handle and the title. */
function SheetOverHome({ title, top, children }: { title: string; top: number; children: ReactNode }) {
  return (
    <Screen>
      <div className="relative z-10">
        <WalletHeader />
      </div>
      <div className="absolute inset-0 z-20" style={{ backgroundColor: COLORS.backdrop }} />
      <div
        className="absolute inset-x-0 bottom-0 z-30 flex flex-col"
        style={{
          top: u(top),
          borderTopLeftRadius: u(24),
          borderTopRightRadius: u(24),
          border: `0.75px solid ${COLORS.borderDefault}`,
          borderBottom: 0,
          backgroundColor: COLORS.sheetFill,
        }}
      >
        <div className="flex justify-center" style={{ paddingTop: u(12), paddingBottom: u(8) }}>
          <span style={{ width: u(44), height: u(5), borderRadius: '9999px', backgroundColor: COLORS.textTertiary, opacity: 0.4 }} />
        </div>
        <p
          className="text-center font-semibold"
          style={{ fontSize: u(24), lineHeight: 1.25, letterSpacing: u(-0.12), color: COLORS.textPrimary }}
        >
          {title}
        </p>
        {children}
      </div>
    </Screen>
  );
}

/** The app's QRCode with brandKnockout, full width inside the sheet's gutter. */
function BrandQr() {
  return (
    <div
      className="relative self-center overflow-hidden"
      style={{ width: u(416), height: u(416), borderRadius: u(16), border: `${u(22)} solid ${COLORS.textPrimary}` }}
    >
      <DecoyQr />
      {/* The brand knockout: 24% of the code, the mark at 66% of that */}
      <span
        className="absolute left-1/2 top-1/2 flex items-center justify-center"
        style={{
          width: u(89),
          height: u(89),
          marginLeft: u(-44.5),
          marginTop: u(-44.5),
          borderRadius: u(22),
          backgroundColor: COLORS.textPrimary,
        }}
      >
        <Image src="/images/logo.svg" alt="" width={118} height={118} style={{ width: u(59), height: u(59), filter: 'brightness(0)' }} />
      </span>
    </div>
  );
}

export function PaymentRequestMock() {
  return (
    <SheetOverHome title="Payment request" top={52}>
      <div className="flex flex-col" style={{ paddingInline: u(12), paddingTop: u(12), gap: u(20) }}>
        <BrandQr />
        <div className="text-center font-bold" style={{ ...cardStyle, ...tabular, fontSize: u(48), color: COLORS.textPrimary }}>
          25.00 USDC
        </div>
        <div className="flex flex-col" style={{ ...cardStyle, gap: u(12) }}>
          <KeyValueRow label="For" value="Design review, March" />
          <KeyValueRow label="Expires in" value="23 h 59 min" />
          <KeyValueRow label="Status" value="Waiting for payment" />
        </div>
        <SecondaryButton label="Copy request" />
        <SecondaryButton label="Remove request" danger />
      </div>
    </SheetOverHome>
  );
}

/** ReceiveSheet — the chain badge over the QR, the wrong-network warning, Copy address. */
export function ReceiveMock() {
  return (
    <SheetOverHome title="Receive" top={150}>
      <div className="flex flex-col items-center" style={{ paddingInline: u(12), paddingTop: u(12), gap: u(20) }}>
        <div className="flex flex-col items-center" style={{ gap: u(12) }}>
          <span
            className="font-semibold"
            style={{
              paddingBlock: u(4),
              paddingInline: u(12),
              borderRadius: u(4),
              border: `1px solid ${COLORS.borderRaised}`,
              backgroundColor: COLORS.surfaceCrest,
              fontSize: u(12),
              letterSpacing: u(0.3),
              color: COLORS.textPrimary,
            }}
          >
            Solana Address
          </span>
          <BrandQr />
        </div>
        <div
          className="flex w-full items-start"
          style={{
            padding: u(12),
            gap: u(8),
            borderRadius: u(12),
            border: `1px solid ${COLORS.warning}`,
            backgroundColor: 'rgba(255, 171, 0, 0.1)',
          }}
        >
          <WarningIcon size={u(20)} color={COLORS.warning} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold" style={{ fontSize: u(12), lineHeight: u(20), marginBottom: u(2), color: COLORS.warning }}>
              Solana network only
            </p>
            <p style={{ fontSize: u(12), lineHeight: 1.45, color: COLORS.textPrimary }}>
              Only send assets on the Solana network to this address. Anything sent on another network is lost and cannot be recovered.
            </p>
          </div>
        </div>
        <span
          className="relative flex items-center justify-center overflow-hidden font-bold"
          style={{
            minWidth: u(180),
            minHeight: u(42),
            paddingBlock: u(4),
            paddingInline: u(16),
            gap: u(4),
            borderRadius: u(12),
            backgroundColor: COLORS.accentFill,
            fontSize: u(16),
            color: COLORS.accentOnFill,
          }}
        >
          <FleshBackground width={180} height={42} scale={1} />
          <span className="relative flex items-center" style={{ gap: u(4) }}>
            <CopyIcon size={u(23)} color={COLORS.accentOnFill} bold />
            Copy address
          </span>
        </span>
      </div>
    </SheetOverHome>
  );
}

/**
 * Invented history, consistent with the other screens: the 0.5 SOL send to
 * Lucía and the 25 USDC payment request are today's.
 */
const ACTIVITY: { group?: string; type: 'send' | 'receive'; logo: string; who: string; amount: string; when: string }[] = [
  { group: 'Today', type: 'send', logo: '/images/tokens/sol.png', who: 'Lucía', amount: '- 0.5 SOL', when: '2h ago' },
  { type: 'receive', logo: '/images/tokens/usdc.png', who: '7Hx2…Qa9P', amount: '+ 25.00 USDC', when: '5h ago' },
  { group: 'Earlier', type: 'receive', logo: '/images/tokens/jup.png', who: 'Mateo', amount: '+ 120 JUP', when: '2d ago' },
  { type: 'send', logo: '/images/tokens/sol.png', who: '4kPm…T8vW', amount: '- 1.2 SOL', when: '3d ago' },
  { type: 'receive', logo: '/images/tokens/bonk.png', who: 'Bc3r…Lm7Y', amount: '+ 1.5M BONK', when: '5d ago' },
  { type: 'send', logo: '/images/tokens/usdc.png', who: 'Ana', amount: '- 40.00 USDC', when: '6d ago' },
];

/** app/(app)/activity.tsx — CORE 08: filters, day groups, one row per transaction. */
export function ActivityMock() {
  return (
    <Screen>
      <div className="relative z-10 flex flex-col">
        <ScreenHeader title="Activity" subtitle="Tap to view transaction details" />
        <div className="flex flex-col" style={{ paddingInline: u(12) }}>
          <div className="flex items-start" style={{ gap: u(20) }}>
            {['All', 'Sent', 'Received', 'Other'].map((label, index) => (
              <UnderlineTab key={label} label={label} active={index === 0} size={12} />
            ))}
          </div>
          {ACTIVITY.map((row) => {
            const sent = row.type === 'send';
            const ink = sent ? COLORS.changeNegative : COLORS.changePositive;
            const Glyph = sent ? ArrowUpRightIcon : ArrowDownLeftIcon;
            return (
              <div key={row.who + row.when} className="flex flex-col">
                {row.group && (
                  <p className="font-bold" style={{ marginTop: u(20), fontSize: u(12), lineHeight: 1.4, color: COLORS.textSecondary }}>
                    {row.group}
                  </p>
                )}
                <div className="flex items-center" style={{ ...cardStyle, padding: u(12), marginTop: u(20), gap: u(12) }}>
                  {/* TransactionMark: the token, its type riding the corner */}
                  <span className="relative shrink-0" style={{ width: u(40), height: u(40) }}>
                    <Image src={row.logo} alt="" width={80} height={80} style={{ width: u(40), height: u(40), borderRadius: '9999px' }} />
                    <span
                      className="absolute flex items-center justify-center"
                      style={{
                        top: u(-2),
                        right: u(-2),
                        width: u(18),
                        height: u(18),
                        borderRadius: '9999px',
                        border: `${u(2)} solid ${COLORS.depthAbyss}`,
                        backgroundColor: ink,
                      }}
                    >
                      <Glyph size={u(10)} color={COLORS.textPrimary} />
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold" style={{ fontSize: u(16), lineHeight: 1.4, color: COLORS.textPrimary }}>
                      {sent ? 'Sent' : 'Received'}
                    </p>
                    <p className="truncate font-medium" style={{ fontSize: u(14), lineHeight: 1.4, color: COLORS.textSecondary }}>
                      {row.who}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end" style={{ minWidth: u(104), gap: u(2) }}>
                    <span className="whitespace-nowrap font-bold" style={{ ...tabular, fontSize: u(12), lineHeight: 1.4, color: ink }}>
                      {row.amount}
                    </span>
                    <span className="font-medium" style={{ ...tabular, fontSize: u(10), lineHeight: 1.4, color: COLORS.textSecondary }}>
                      {row.when}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <BottomFade />
    </Screen>
  );
}

/** send/review.tsx — the last look before signing. */
export function SendReviewMock() {
  return (
    <Screen>
      <div className="relative z-10">
        <ScreenHeader title="Review send" subtitle="Check the details before signing." />
        <div style={{ paddingInline: u(12) }}>
          <div className="flex flex-col" style={{ ...cardStyle, gap: u(12) }}>
            <KeyValueRow label="Amount" action="Change" value="0.5 SOL" />
            <KeyValueRow label="To" value="Lucía" />
            <KeyValueRow label="Address" value="9xQe…F4kD" />
            <KeyValueRow label="Network Fee" value="~0.000005 SOL" />
          </div>
        </div>
      </div>
      <ActionColumn>
        <SecondaryButton label="Cancel" />
        <PrimaryButton label="Confirm" />
      </ActionColumn>
    </Screen>
  );
}

/** Generative pieces for the NFT grid. Each is its own small composition. */
const NFT_ART: { name: string; collection: string; art: ReactNode }[] = [
  {
    name: 'Low Tide No. 12',
    collection: 'Low Tide Studies',
    art: (
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <rect width="100" height="100" fill="#0f1b2d" />
        {Array.from({ length: 14 }, (_, i) => (
          <path
            key={i}
            d={`M-5 ${18 + i * 5.5} Q 25 ${12 + i * 5.5 + Math.sin(i) * 6} 50 ${18 + i * 5.5} T 105 ${18 + i * 5.5}`}
            fill="none"
            stroke="#e9dfc9"
            strokeOpacity={0.25 + (i / 14) * 0.7}
            strokeWidth="0.9"
          />
        ))}
        <circle cx="72" cy="22" r="7" fill="#e9dfc9" fillOpacity="0.9" />
      </svg>
    ),
  },
  {
    name: 'Halflight 3',
    collection: 'Halflight',
    art: (
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <filter id="halflight-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>
        <rect width="100" height="100" fill="#3a1d2b" />
        <g filter="url(#halflight-soft)">
          <rect x="12" y="10" width="76" height="42" rx="2" fill="#d9583f" />
          <rect x="12" y="58" width="76" height="30" rx="2" fill="#6e2f3f" />
        </g>
      </svg>
    ),
  },
  {
    name: 'Strata 21',
    collection: 'Strata',
    art: (
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <rect width="100" height="100" fill="#efe6d6" />
        {Array.from({ length: 11 }, (_, i) => (
          <ellipse
            key={i}
            cx={54 + Math.sin(i * 0.9) * 4}
            cy={56 + Math.cos(i * 0.7) * 3}
            rx={6 + i * 4.6}
            ry={4 + i * 3.6}
            fill="none"
            stroke="#7a5a3c"
            strokeOpacity={0.85 - i * 0.05}
            strokeWidth="0.8"
            transform={`rotate(${-18 + i * 2} 54 56)`}
          />
        ))}
      </svg>
    ),
  },
  {
    name: 'Orbit 88',
    collection: 'Orbits',
    art: (
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <rect width="100" height="100" fill="#0b0b0e" />
        {Array.from({ length: 12 }, (_, i) => (
          <circle
            key={i}
            cx={50 + i * 1.6}
            cy={50 - i * 1.1}
            r={6 + i * 3.4}
            fill="none"
            stroke="#f2f2f2"
            strokeOpacity={0.95 - i * 0.06}
            strokeWidth="0.7"
          />
        ))}
        <circle cx="50" cy="50" r="2.4" fill="#ff5c45" />
      </svg>
    ),
  },
  {
    name: 'Ember Field 07',
    collection: 'Ember Fields',
    art: (
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <radialGradient id="ember-a" cx="35%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#ffb36b" />
            <stop offset="100%" stopColor="#ffb36b" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ember-b" cx="70%" cy="70%" r="50%">
            <stop offset="0%" stopColor="#e2364a" />
            <stop offset="100%" stopColor="#e2364a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="#2a0f14" />
        <rect width="100" height="100" fill="url(#ember-b)" />
        <rect width="100" height="100" fill="url(#ember-a)" />
      </svg>
    ),
  },
  {
    name: 'Shoal 0418',
    collection: 'Shoal',
    art: (
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <rect width="100" height="100" fill="#0d2a2c" />
        {Array.from({ length: 64 }, (_, i) => {
          const x = (i % 8) * 13 + ((Math.floor(i / 8) % 2) * 6.5);
          const y = Math.floor(i / 8) * 13 + 4;
          return (
            <path
              key={i}
              d={`M${x} ${y + 6} q 6 -7 12 0`}
              fill="none"
              stroke="#7fd1c3"
              strokeOpacity={0.35 + ((i * 37) % 10) / 16}
              strokeWidth="1"
            />
          );
        })}
      </svg>
    ),
  },
];

/** NftsTab: two columns, 12pt gaps, the name band laid over the bottom of each tile. */
export function NftGrid() {
  return (
    <div className="grid grid-cols-2" style={{ gap: u(12) }}>
      {NFT_ART.map((nft) => (
        <div
          key={nft.name}
          className="relative overflow-hidden"
          style={{ aspectRatio: '194 / 193', borderRadius: u(12), border: `1px solid ${COLORS.hairline}` }}
        >
          <div className="absolute inset-0">{nft.art}</div>
          <div
            className="absolute inset-x-0 bottom-0 flex flex-col"
            style={{ backgroundColor: 'rgba(7, 9, 17, 0.9)', paddingBlock: u(8), paddingInline: u(12), gap: u(2) }}
          >
            <span className="truncate font-semibold" style={{ fontSize: u(14), lineHeight: u(19.6), color: COLORS.textPrimary }}>
              {nft.name}
            </span>
            <span className="truncate" style={{ fontSize: u(12), lineHeight: u(16.8), color: COLORS.textSecondary }}>
              {nft.collection}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** One month of SOL closing at $163.50, smoothed with quadratic segments like PriceChart. */
function chartPath(width: number, height: number) {
  const n = 42;
  let seed = 11;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const values = Array.from({ length: n }, (_, i) => 144.9 + (18.6 * i) / (n - 1) + Math.sin(i / 3.2) * 4.5 + (random() - 0.5) * 5);
  values[n - 1] = 163.5;
  const min = Math.min(...values) - 2;
  const max = Math.max(...values) + 2;
  const points = values.map((v, i) => [(i / (n - 1)) * width, height - ((v - min) / (max - min)) * height] as const);
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < n - 1; i++) {
    const mx = (points[i][0] + points[i + 1][0]) / 2;
    const my = (points[i][1] + points[i + 1][1]) / 2;
    d += ` Q ${points[i][0]} ${points[i][1]} ${mx} ${my}`;
  }
  d += ` L ${points[n - 1][0]} ${points[n - 1][1]}`;
  return { d, end: points[n - 1] };
}

/** token/[id].tsx for Solana. */
export function TokenDetailMock() {
  const width = 428;
  const height = 200;
  const { d, end } = chartPath(width, height);
  const up = COLORS.changePositive;
  return (
    <Screen>
      <div className="relative z-10 flex flex-col">
        <ScreenHeader
          title="Solana"
          glyph={
            <Image src="/images/tokens/sol.png" alt="" width={48} height={48} style={{ width: u(24), height: u(24), borderRadius: '9999px' }} />
          }
        />
        <div className="flex flex-col" style={{ paddingInline: u(12), gap: u(12) }}>
          <div className="flex flex-col" style={{ gap: u(8) }}>
            <span
              className="font-bold"
              style={{ ...tabular, fontSize: u(48), lineHeight: 1.25, letterSpacing: u(-0.25), color: COLORS.textPrimary }}
            >
              8.2 SOL
            </span>
            <div className="flex items-center" style={{ gap: u(12) }}>
              <span className="font-bold" style={{ ...tabular, fontSize: u(16), color: COLORS.textSecondary }}>
                $1,340.70 · $163.50
              </span>
              <span className="ml-auto">
                <IconBubble size={36} tone="accent">
                  <ArrowUpRightIcon size={u(18)} color={COLORS.accentOnFill} bold />
                </IconBubble>
              </span>
            </div>
          </div>

          <div className="flex flex-col" style={{ gap: u(12) }}>
            {/* The chart bleeds to the screen's left edge */}
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: u(width), height: u(height), marginLeft: u(-12) }}>
              <defs>
                <linearGradient id="price-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={up} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={up} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${d} L ${width} ${height} L 0 ${height} Z`} fill="url(#price-fill)" />
              <path d={d} fill="none" stroke={up} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={end[0]} cy={end[1]} r="9" fill={up} fillOpacity="0.18" />
              <circle cx={end[0]} cy={end[1]} r="3.5" fill={up} />
            </svg>
            <div className="flex justify-center" style={{ gap: u(12) }}>
              {['1H', '1D', '1W', '1M', '3M', '1Y'].map((range) => (
                <UnderlineTab key={range} label={range} active={range === '1M'} size={12} />
              ))}
            </div>
            <KeyValueRow label="1M change" value="+12.84%" tone="success" />
          </div>

          <div className="flex flex-col" style={{ ...cardStyle, gap: u(12) }}>
            <p className="font-bold" style={{ fontSize: u(16), lineHeight: u(22.4), color: COLORS.textPrimary }}>
              Market data
            </p>
            <KeyValueRow label="Market Cap" value="$79,605,112,340" />
            <KeyValueRow label="24h Volume" value="$3,124,887,015" />
            <KeyValueRow label="Circulating Supply" value="486.88M SOL" />
            <KeyValueRow label="Total Supply" value="592.31M SOL" />
            <KeyValueRow label="All-Time High" value="$293.31" />
          </div>

          <div className="flex flex-col" style={{ ...cardStyle, gap: u(8) }}>
            <p className="font-bold" style={{ fontSize: u(16), lineHeight: u(22.4), color: COLORS.textPrimary }}>
              About
            </p>
            <p style={{ fontSize: u(14), lineHeight: u(21), color: COLORS.textSecondary }}>
              Solana is a high-performance blockchain built for fast, low-cost transactions at global scale.
            </p>
          </div>
        </div>
      </div>
      <BottomFade />
    </Screen>
  );
}


// The app's wait (packages/ui LoadingScreen), looping for as long as it is on
// screen: the mark sinks on `flick` and recovers on `tide`, and the crest is
// thrown at the trough. Timing and paint are the dark theme's resolved values
// from @salmon/shared motion/wavefront and motion/crest.
const MARK_PATHS = [
  'M189.676 53.962C177.731 46.79 165.138 41.69 152.196 38.81L138.484 8.296C138.484 8.296 134.876 0 126.323 0C117.771 0 114.516 8.296 114.516 8.296L100.804 38.791C87.839 41.69 75.208 46.809 63.247 53.981C39.474 100.136 33.034 145.129 36.254 189.494C50.181 202.986 108.376 237 126.323 237C144.271 237 202.819 202.986 216.746 189.494C219.966 145.129 213.522 100.136 189.753 53.981L189.676 53.962ZM101.277 147.338C93.79 147.338 87.604 138.411 87.604 127.421C87.604 116.427 93.575 107.427 101.239 107.427C108.899 107.427 115.047 116.427 114.908 127.421C114.774 138.411 108.88 147.338 101.258 147.338L101.277 147.338ZM151.684 147.338C144.178 147.338 138.03 138.411 138.03 127.421C138.03 116.427 144.001 107.427 151.684 107.427C159.364 107.427 165.454 116.427 165.315 127.421C165.181 138.411 159.306 147.338 151.684 147.338Z',
  'M251.919 167.526L234.356 112.174C232.196 105.4 225.929 100.793 218.817 100.793C216.696 100.793 214.633 101.206 212.727 101.974C220.742 128.656 223.964 157.444 221.45 188.812L236.36 188.812C247.401 188.812 255.239 178.061 251.9 167.526L251.919 167.526Z',
  'M1.081 167.526L18.644 112.174C20.804 105.4 27.071 100.793 34.183 100.793C36.304 100.793 38.367 101.206 40.273 101.974C32.258 128.656 29.036 157.444 31.55 188.812L16.64 188.812C5.599 188.812 -2.239 178.061 1.1 167.526L1.081 167.526Z',
];

const CREST_GRADIENT =
  'radial-gradient(circle closest-side, transparent 0%, rgba(255, 92, 69, 0.000) 70.00%, rgba(255, 92, 69, 0.050) 70.85%, rgba(255, 92, 69, 0.050) 72.15%, rgba(255, 92, 69, 0.050) 73.55%, rgba(255, 92, 69, 0.220) 74.20%, rgba(255, 92, 69, 0.050) 74.85%, rgba(255, 92, 69, 0.031) 76.25%, rgba(7, 9, 17, 0.558) 76.90%, rgba(255, 92, 69, 0.031) 77.55%, rgba(255, 92, 69, 0.031) 78.95%, rgba(255, 92, 69, 0.136) 79.60%, rgba(255, 92, 69, 0.031) 80.25%, rgba(255, 92, 69, 0.019) 81.65%, rgba(7, 9, 17, 0.346) 82.30%, rgba(255, 92, 69, 0.019) 82.95%, rgba(255, 92, 69, 0.019) 84.35%, rgba(255, 92, 69, 0.085) 85.00%, rgba(255, 92, 69, 0.019) 85.65%, rgba(255, 92, 69, 0.012) 87.05%, rgba(7, 9, 17, 0.214) 87.70%, rgba(255, 92, 69, 0.012) 88.35%, rgba(255, 92, 69, 0.012) 89.75%, rgba(255, 92, 69, 0.052) 90.40%, rgba(255, 92, 69, 0.012) 91.05%, rgba(255, 92, 69, 0.007) 92.45%, rgba(7, 9, 17, 0.133) 93.10%, rgba(255, 92, 69, 0.007) 93.75%, rgba(255, 92, 69, 0.007) 95.15%, rgba(255, 92, 69, 0.033) 95.80%, rgba(255, 92, 69, 0.007) 96.45%, rgba(255, 92, 69, 0.007) 97.85%, rgba(7, 9, 17, 0.133) 98.50%, rgba(255, 92, 69, 0.007) 99.15%, rgba(255, 92, 69, 0.000) 100.00%)';

// period 2600 = cross 2000 + rest 600; sink 90, recover 720; crest fades from 0.85 of the cross.
const WAIT_CSS = `
@keyframes salmon-wait-sink {
  0% { transform: scale(1); opacity: 1; animation-timing-function: ${MOTION.sink}; }
  3.4615% { transform: scale(0.95); opacity: 0.88; animation-timing-function: ${MOTION.settle}; }
  31.1538%, 100% { transform: scale(1); opacity: 1; }
}
@keyframes salmon-wait-crest {
  0% { transform: translate(-50%, -50%) scale(0.02); opacity: 0; }
  3.0769% { opacity: 1; }
  65.3846% { opacity: 1; }
  76.9231%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}
.salmon-wait-mark { animation: salmon-wait-sink 2600ms linear infinite; }
.salmon-wait-crest { animation: salmon-wait-crest 2600ms linear 90ms infinite; }
@media (prefers-reduced-motion: reduce) {
  .salmon-wait-mark, .salmon-wait-crest { animation: none; }
}`;

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
/** motionEasing.settle (cubic-bezier .22,1,.36,1) and .sink (.4,0,1,1), close enough to scrub with. */
const settle = (t: number) => 1 - (1 - t) ** 3;
const sinkIn = (t: number) => t * t;

/**
 * One frame of the wait at `at` (0..1), for a wait the scroll drives instead of the clock: the words float in
 * (Cluster: 8pt rise from 0.9 scale on `settle`, light on `sink`), then one wave runs (WAIT_CSS's mark sink and
 * crest, period stops kept), and the caller fades to Home over the last stretch.
 */
function waitFrame(at: number) {
  const words = clamp01(at / 0.25);
  // The wave's own clock: 0..0.769 of the period is the crest crossing the screen (WAIT_CSS stops).
  const k = clamp01((at - 0.2) / 0.6) * 0.769;
  const sink = k < 0.0346 ? k / 0.0346 : k < 0.3115 ? 1 - (k - 0.0346) / (0.3115 - 0.0346) : 0;
  return {
    wordsStyle: {
      opacity: sinkIn(words),
      transform: `translateY(${u(8 * (1 - settle(words)))}) scale(${0.9 + 0.1 * settle(words)})`,
    },
    markStyle: { transform: `scale(${1 - 0.05 * sink})`, opacity: 1 - 0.12 * sink },
    crestStyle: {
      opacity: at < 0.2 ? 0 : k < 0.0308 ? k / 0.0308 : k < 0.654 ? 1 : 1 - (k - 0.654) / (0.769 - 0.654),
      transform: `translate(-50%, -50%) scale(${0.02 + 0.98 * (k / 0.769)})`,
    },
  };
}

/**
 * The app's wait. `waves={false}` is the still mark the app opens on, before the
 * wait starts; `title` is the wait's one line under the mark (Words in
 * LoadingScreen/styled.ts: mark/2 + 3xl below the centre, 2xl bold, text.primary).
 * `at` draws it at a point of a scroll-driven wait instead of looping on the clock.
 * Tips are left out.
 */
export function LoadingMock({ waves = true, title, at }: { waves?: boolean; title?: string; at?: number }) {
  // The front reaches the farthest corner of the 440×956 screen: 2·hypot(220, 478).
  const ring = u(1052.4);
  const scrubbed = at !== undefined;
  const frame = scrubbed ? waitFrame(at) : null;
  const looping = waves && !scrubbed;
  return (
    <Screen>
      {looping && <style>{WAIT_CSS}</style>}
      {(looping || scrubbed) && (
        <div
          className={`${looping ? 'salmon-wait-crest ' : ''}absolute left-1/2 top-1/2 rounded-full`}
          style={{ width: ring, height: ring, background: CREST_GRADIENT, opacity: 0, transform: 'translate(-50%, -50%) scale(0)', ...frame?.crestStyle }}
        />
      )}
      {title && (
        <p
          className="absolute inset-x-0 top-1/2 text-center font-bold"
          style={{ paddingTop: u(48 + 32), paddingInline: u(24), fontSize: u(24), lineHeight: 1.25, color: COLORS.textPrimary, ...frame?.wordsStyle }}
        >
          {title}
        </p>
      )}
      <div
        className={`${looping ? 'salmon-wait-mark ' : ''}absolute left-1/2 top-1/2`}
        style={{ width: u(96), height: u(96), marginLeft: `calc(-1 * ${u(48)})`, marginTop: `calc(-1 * ${u(48)})`, color: COLORS.accentFill, ...frame?.markStyle }}
      >
        <svg viewBox="0 0 253 237" fill="currentColor" className="block size-full">
          {MARK_PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
      </div>
    </Screen>
  );
}
