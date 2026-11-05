import Image from 'next/image';
import { NftGrid } from './AppScreenMocks';
import { u } from './phone-scale';
import {
  BottomFade,
  CapsLabel,
  COLORS,
  IconBubble,
  PowerupRow,
  ScreenGround,
  TOKENS,
  TokenPickRow,
  UnderlineTab,
  WalletHeader,
  cardStyle,
  changeColor,
  tabular,
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

/**
 * Where the screen is inside the flow. The numbers run 0..1 so the scroll can
 * hold the screen anywhere in between; the presses go 0 → 1 → 0.
 */
export interface MockState {
  fabPress: number;
  catalog: number;
  swapOn: boolean;
  swapAdded: number;
  tabPress: number;
  swapSelected: number;
}

const clamp = (t: number) => Math.min(1, Math.max(0, t));
const ease = (p: number, from: number, to: number) => {
  const t = clamp((p - from) / (to - from));
  return t * t * (3 - 2 * t);
};
const press = (p: number, from: number, to: number) => Math.sin(Math.PI * clamp((p - from) / (to - from)));

/**
 * The flow along the section's scroll progress p, one action per segment with
 * a hold between them: FAB press, catalog rises, toggle, Swap tab arrives,
 * sheet closes, tab press, tab opens. Steps 2 and 3 of the copy start at 0.35
 * and 0.60.
 */
export function flowState(p: number): MockState {
  return {
    fabPress: press(p, 0, 0.05),
    catalog: ease(p, 0.05, 0.17) - ease(p, 0.62, 0.7),
    swapOn: p >= 0.41,
    swapAdded: ease(p, 0.46, 0.52),
    tabPress: press(p, 0.72, 0.75),
    swapSelected: ease(p, 0.75, 0.83),
  };
}

/** A progress inside each step's hold, for a still screen of that step. */
export const STEP_PROGRESS: Record<MockStep, number> = { 0: -1, 1: 0.27, 2: 0.57, 3: 1 };

const HOME = flowState(-1);

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
  const { fabPress, catalog, swapOn, swapAdded, tabPress, swapSelected } = state;
  const swapTab = swapSelected > 0.5;
  // The outgoing surface leaves faster than the incoming one arrives.
  const leaving = clamp(swapSelected * 1.5);
  const arriving = clamp((swapSelected - 0.33) * 1.5);

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
              gridTemplateRows: `${1 - swapSelected}fr`,
              opacity: 1 - leaving,
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
                  marginLeft: u(20 * swapAdded),
                  maxWidth: u(60 * swapAdded),
                  opacity: swapAdded,
                  transform: `translateY(${u(8 * (1 - swapAdded))}) scale(${0.95 + 0.05 * swapAdded})`,
                }}
              >
                <span
                  className="block"
                  style={{ transform: `scale(${1 - 0.12 * tabPress})`, opacity: 1 - 0.3 * tabPress }}
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
              opacity: 1 - leaving,
              transform: `translateY(${u(8 * leaving)}) scale(${1 - 0.04 * leaving})`,
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
              opacity: arriving,
              transform: `translateY(${u(8 * (1 - arriving))}) scale(${0.96 + 0.04 * arriving})`,
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
            transform: `scale(${1 - 0.14 * fabPress})`,
            filter: `brightness(${1 - 0.15 * fabPress})`,
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
          opacity: catalog,
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
          transform: `translateY(${105 * (1 - catalog)}%)`,
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
