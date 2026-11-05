'use client';

import { useEffect, useState } from 'react';
import HomeScreenMock, { type MockStep } from './HomeScreenMock';

/** The message the landing sends this frame when a Powerups step scrolls into view. */
export const POWERUPS_STEP_MESSAGE = 'salmon-powerups-step';

export default function PowerupsFlowMock({ initialStep }: { initialStep: MockStep }) {
  const [step, setStep] = useState<MockStep>(initialStep);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: unknown; step?: unknown };
      if (data?.type === POWERUPS_STEP_MESSAGE && [0, 1, 2, 3].includes(data.step as number)) {
        setStep(data.step as MockStep);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return <HomeScreenMock step={step} />;
}
