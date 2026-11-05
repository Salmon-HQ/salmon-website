'use client';

import { useEffect, useState } from 'react';
import HomeScreenMock, { FLOW_BEATS, STEP_BEAT, type MockStep } from './HomeScreenMock';

/** The message the landing sends this frame when a Powerups step scrolls into view. */
export const POWERUPS_STEP_MESSAGE = 'salmon-powerups-step';

/** The tap only reads going forward; scrolling back skips it. */
const TAP_BEAT = 5;
const BACK_DELAY = 220;

/**
 * Plays the flow beat by beat toward the step the page is on, so a jump of
 * several steps still shows every beat in order instead of cutting to the end.
 */
export default function PowerupsFlowMock({ initialStep }: { initialStep: MockStep }) {
  const [beat, setBeat] = useState(STEP_BEAT[initialStep]);
  const [target, setTarget] = useState(STEP_BEAT[initialStep]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: unknown; step?: unknown };
      if (data?.type === POWERUPS_STEP_MESSAGE && [0, 1, 2, 3].includes(data.step as number)) {
        setTarget(STEP_BEAT[data.step as MockStep]);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (beat === target) return;
    const forward = target > beat;
    let next = forward ? beat + 1 : beat - 1;
    if (!forward && next === TAP_BEAT) next -= 1;
    const timer = window.setTimeout(() => setBeat(next), forward ? FLOW_BEATS[next].delay : BACK_DELAY);
    return () => window.clearTimeout(timer);
  }, [beat, target]);

  return <HomeScreenMock state={FLOW_BEATS[beat].state} />;
}
