import Image from 'next/image';
import { NftGrid } from './AppScreenMocks';
import { u } from './phone-scale';
import {
  BottomFade,
  CapsLabel,
  COLORS,
  IconBubble,
  MOTION,
  PowerupRow,
  ScreenGround,
  TOKENS,
  TokenPickRow,
  UnderlineTab,
  WalletHeader,
  cardStyle,
  changeColor,
  tabular,
  transition,
} from './mock-kit';
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  ArrowsLeftRightIcon,
  ClockIcon,
  EyeIcon,
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
 * The landing's three Powerups steps, plus 0 for the plain Home.
 * 1 — catalog open. 2 — Swap turned on, its tab added. 3 — Swap tab selected.
 */
export type MockStep = 0 | 1 | 2 | 3;

/** Where the screen is inside the flow; each beat changes one thing. */
export interface MockState {
  /** A finger is on the Powerups FAB. */
  fabTapping: boolean;
  catalogOpen: boolean;
  swapOn: boolean;
  swapAdded: boolean;
  /** A finger is on the Swap tab. */
  tapping: boolean;
  swapSelected: boolean;
}

const HOME: MockState = { fabTapping: false, catalogOpen: false, swapOn: false, swapAdded: false, tapping: false, swapSelected: false };

/**
 * The flow as beats, in order, with how long each waits after the one before
 * when walking forward: Home at rest, a tap on the FAB, the catalog rising,
 * the toggle, its tab arriving behind the dim, the sheet closing, a tap on
 * the new tab, and the tab opening.
 */
export const FLOW_BEATS: { state: MockState; delay: number }[] = [
  { state: HOME, delay: 0 },
  { state: { ...HOME, fabTapping: true }, delay: 1100 },
  { state: { ...HOME, catalogOpen: true }, delay: 380 },
  { state: { ...HOME, catalogOpen: true, swapOn: true }, delay: 250 },
  { state: { ...HOME, catalogOpen: true, swapOn: true, swapAdded: true }, delay: 650 },
  { state: { ...HOME, swapOn: true, swapAdded: true }, delay: 900 },
  { state: { ...HOME, swapOn: true, swapAdded: true, tapping: true }, delay: 900 },
  { state: { ...HOME, swapOn: true, swapAdded: true, swapSelected: true }, delay: 380 },
];

/** The beat each landing step settles on. */
export const STEP_BEAT: Record<MockStep, number> = { 0: 0, 1: 2, 2: 4, 3: 7 };

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

export default function HomeScreenMock({
  state = HOME,
  tab = 'assets',
}: {
  state?: MockState;
  /** Which sub-tab the Home shows when no Powerup tab is selected. */
  tab?: 'assets' | 'nfts';
}) {
  const { fabTapping, catalogOpen, swapOn, swapAdded, tapping } = state;
  const swapTab = state.swapSelected;

  return (
    <div aria-hidden="true" className="wallet-mock absolute inset-0 overflow-hidden">
      <ScreenGround />

      <div className="relative z-10 flex flex-col">
        <WalletHeader />

        {/* The pinned block: balance, then the sub-tabs row. A Powerup tab is
            focus mode: the balance block folds away and the row rises. */}
        <div style={{ paddingInline: u(12), paddingTop: u(20), paddingBottom: u(20) }}>
          <div
            className="grid"
            style={{
              gridTemplateRows: swapTab ? '0fr' : '1fr',
              opacity: swapTab ? 0 : 1,
              ...transition(['grid-template-rows', 'opacity'], MOTION.rise, MOTION.current),
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
              <UnderlineTab label="Assets" active={!swapTab && tab === 'assets'} />
              <span style={{ marginLeft: u(20) }}>
                <UnderlineTab label="NFTs" active={!swapTab && tab === 'nfts'} />
              </span>
              <span
                className="relative"
                style={{
                  overflowX: 'clip',
                  marginLeft: swapAdded ? u(20) : 0,
                  maxWidth: swapAdded ? u(60) : 0,
                  opacity: swapAdded ? 1 : 0,
                  transform: swapAdded ? 'none' : `translateY(${u(8)}) scale(0.95)`,
                  ...transition(['margin-left', 'max-width', 'opacity', 'transform'], MOTION.rise, MOTION.settle),
                }}
              >
                <span
                  className="block"
                  style={{
                    transform: tapping ? 'scale(0.88)' : 'none',
                    opacity: tapping ? 0.7 : 1,
                    ...transition(['transform', 'opacity'], MOTION.swell, MOTION.current),
                  }}
                >
                  <UnderlineTab label="Swap" active={swapTab} />
                </span>
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
            {tab === 'nfts' ? <NftGrid /> : TOKENS.map((token) => (
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

      <BottomFade />

      {/* PowerupsFab — 48pt accent circle on the right gutter */}
      <span
        className="absolute z-20"
        style={{ right: u(12), bottom: u(54), borderRadius: '9999px', boxShadow: '0 0 12px rgba(0, 0, 0, 0.64)' }}
      >
        <span
          className="block"
          style={{
            // The press reads on the control itself: it sinks and dims a touch.
            transform: fabTapping ? 'scale(0.86)' : 'none',
            filter: fabTapping ? 'brightness(0.85)' : 'none',
            ...transition(['transform', 'filter'], MOTION.swell, MOTION.current),
          }}
        >
          <IconBubble size={48} tone="accent">
            <PlusIcon size={u(24)} color={COLORS.accentOnFill} />
          </IconBubble>
        </span>
      </span>

      {/* overlay.backdrop under the catalog sheet */}
      <div
        className="absolute inset-0 z-30"
        style={{
          backgroundColor: COLORS.backdrop,
          opacity: catalogOpen ? 1 : 0,
          ...transition(['opacity'], MOTION.rise, catalogOpen ? MOTION.settle : MOTION.current),
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
          // The app closes in 180ms; here it takes the open's 500 so the eye can follow it.
          ...transition(['transform'], MOTION.rise, catalogOpen ? MOTION.settle : MOTION.current),
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
