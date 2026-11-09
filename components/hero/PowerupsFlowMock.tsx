'use client';

import { useEffect, useState } from 'react';
import { LoadingMock } from './AppScreenMocks';
import HomeScreenMock, { STEP_PROGRESS, flowState, type MockStep } from './HomeScreenMock';

/** The message the landing sends this frame with the section's scroll progress. */
export const POWERUPS_PROGRESS_MESSAGE = 'salmon-powerups-progress';

/** Where in the unlock Home starts showing through the wait: the last stretch fades the wait out. */
const HOME_FROM = 0.85;

/**
 * The Powerups phone. While it sits in the row it shows the app's still mark (`unlock` 0). From the moment it
 * detaches to the first step, the landing sends `unlock` 0 → 1 and the app's unlock wait is drawn at that point:
 * "Unlocking Wallet" floats in, one wave crosses, and the wait fades into Home. Then the Powerups flow is drawn
 * at the scroll progress. All of it runs backwards when scrolling up.
 */
export default function PowerupsFlowMock({ initialStep }: { initialStep: MockStep }) {
  const [progress, setProgress] = useState(STEP_PROGRESS[initialStep]);
  const [unlock, setUnlock] = useState(initialStep === 0 ? 0 : 1);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: unknown; progress?: unknown; unlock?: unknown };
      if (data?.type !== POWERUPS_PROGRESS_MESSAGE || !Number.isFinite(data.progress)) return;
      setProgress(data.progress as number);
      if (Number.isFinite(data.unlock)) setUnlock(data.unlock as number);
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const waitOpacity = 1 - Math.min(1, Math.max(0, (unlock - HOME_FROM) / (1 - HOME_FROM)));
  return (
    <>
      <HomeScreenMock state={flowState(progress)} />
      {waitOpacity > 0 && (
        <div className="absolute inset-0 z-50" style={{ opacity: waitOpacity, pointerEvents: 'none' }}>
          {unlock <= 0 ? <LoadingMock waves={false} /> : <LoadingMock title="Unlocking Wallet" at={unlock} />}
        </div>
      )}
    </>
  );
}
