import HomeScreenMock, { FLOW_BEATS, STEP_BEAT, type MockStep } from '@/components/hero/HomeScreenMock';
import PowerupsFlowMock from '@/components/hero/PowerupsFlowMock';

// ?flow=powerups is the Powerups phone, driven by the landing's scroll;
// ?step=1-3 pins a step for checking it on its own.
export default async function PhonePreview({
  searchParams,
}: {
  searchParams: Promise<{ flow?: string; step?: string }>;
}) {
  const { flow, step } = await searchParams;
  const pinned = [1, 2, 3].includes(Number(step)) ? (Number(step) as MockStep) : 0;

  return (
    <main className="@container fixed inset-0 overflow-hidden bg-[#10131c]">
      {flow === 'powerups' ? <PowerupsFlowMock initialStep={pinned} /> : <HomeScreenMock state={FLOW_BEATS[STEP_BEAT[pinned]].state} />}
    </main>
  );
}
