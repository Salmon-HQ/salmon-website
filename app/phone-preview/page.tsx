import type { ReactNode } from 'react';
import { ActivityMock, LoadingMock, PaymentRequestMock, ReceiveMock, SendReviewMock, SwapReviewMock, TokenDetailMock } from '@/components/hero/AppScreenMocks';
import HomeScreenMock, { STEP_PROGRESS, flowState, type MockStep } from '@/components/hero/HomeScreenMock';
import PowerupsFlowMock from '@/components/hero/PowerupsFlowMock';

const SCREENS: Record<string, ReactNode> = {
  nfts: <HomeScreenMock tab="nfts" />,
  'swap-review': <SwapReviewMock />,
  payments: <PaymentRequestMock />,
  receive: <ReceiveMock />,
  activity: <ActivityMock />,
  send: <SendReviewMock />,
  loading: <LoadingMock />,
  token: <TokenDetailMock />,
};

// ?screen= picks a static screen; ?flow=powerups is the Powerups phone, driven
// by the landing's scroll; ?step=1-3 pins a flow step for checking it alone.
export default async function PhonePreview({
  searchParams,
}: {
  searchParams: Promise<{ flow?: string; step?: string; screen?: string }>;
}) {
  const { flow, step, screen } = await searchParams;
  const pinned = [1, 2, 3].includes(Number(step)) ? (Number(step) as MockStep) : 0;

  let content: ReactNode = <HomeScreenMock state={flowState(STEP_PROGRESS[pinned])} />;
  if (flow === 'powerups') content = <PowerupsFlowMock initialStep={pinned} />;
  else if (screen && SCREENS[screen]) content = SCREENS[screen];

  return <main className="@container fixed inset-0 overflow-hidden bg-[#10131c]">{content}</main>;
}
