'use client';

import { useEffect, useState } from 'react';
import HomeScreenMock, { STEP_PROGRESS, flowState, type MockStep } from './HomeScreenMock';

/** The message the landing sends this frame with the section's scroll progress. */
export const POWERUPS_PROGRESS_MESSAGE = 'salmon-powerups-progress';

/** Draws the Powerups flow at the scroll progress the landing sends. */
export default function PowerupsFlowMock({ initialStep }: { initialStep: MockStep }) {
  const [progress, setProgress] = useState(STEP_PROGRESS[initialStep]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: unknown; progress?: unknown };
      if (data?.type === POWERUPS_PROGRESS_MESSAGE && Number.isFinite(data.progress)) {
        setProgress(data.progress as number);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return <HomeScreenMock state={flowState(progress)} />;
}
