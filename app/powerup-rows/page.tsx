import type { CSSProperties, ReactNode } from 'react';
import { COLORS, PowerupRow } from '@/components/hero/mock-kit';
import { u } from '@/components/hero/phone-scale';
import { ChartLineUpIcon, CpuIcon, HandCoinsIcon, MoneyIcon, TrendUpIcon } from '@/components/hero/wallet-icons';
import { SOON_POWERUPS } from '@/components/coming-soon/coming-soon';

const ICONS: Record<string, (props: { size: string; color: string }) => ReactNode> = {
  Cash: MoneyIcon,
  Invest: ChartLineUpIcon,
  Trade: TrendUpIcon,
  Borrow: HandCoinsIcon,
  Hardware: CpuIcon,
};

/** A PowerupRow's height over its width, tilted back 12deg. */
const ROW_RATIO = 0.178 * Math.cos((12 * Math.PI) / 180);
const TILT = 12;
const SECONDS_PER_SLOT = 3.2;

/** How a row leaves the track's ends: further along (vw), in depth (vw, + toward the viewer) and tilt (deg). */
type End = { dy: number; z: number; tilt: number };
type Layout = { widths: number[]; gap: number; enter?: End; exit?: End };

/** Row centres (in the frame's vw, from its centre) for rows stacked bottom to top, the visible ones centred. */
function centres({ widths, gap }: Layout, visible: [number, number]) {
  const ys = [0];
  for (let k = 1; k < widths.length; k++) ys.push(ys[k - 1] - ((widths[k - 1] + widths[k]) / 2) * ROW_RATIO - gap);
  const mid = (ys[visible[0]] + ys[visible[1]]) / 2;
  return ys.map((y) => y - mid);
}

const place = (y: number, scale: number, z = 0, tilt = TILT) =>
  `translate(-50%, calc(-50% + ${y.toFixed(3)}vw)) translateZ(${z}vw) rotateX(${tilt}deg) scale(${scale.toFixed(4)})`;

/**
 * The carousel track: slots bottom to top, a row narrowing as it rises (farther away), so the stack still leans
 * back. A row arrives from below and in front of the stack, and leaves upward and back into the distance, fading
 * in and out on the way; five rows a slot apart pass every place in turn.
 */
function track(name: string, layout: Layout) {
  const ys = centres(layout, [1, layout.widths.length - 2]);
  const base = layout.widths[1];
  const last = layout.widths.length - 1;
  const at = (k: number) => (k === 0 ? layout.enter : k === last ? layout.exit : undefined);
  const frames = layout.widths
    .map((w, k) => {
      const end = at(k);
      const transform = place(ys[k] + (end?.dy ?? 0), w / base, end?.z, end?.tilt);
      return `${((k / last) * 100).toFixed(3)}% { transform: ${transform}; opacity: ${end ? 0 : 1}; }`;
    })
    .join('\n  ');
  return { base, css: `@keyframes ${name} {\n  ${frames}\n}` };
}

/** With reduced motion the five rows stand still, stacked. */
function still(layout: Layout) {
  const ys = centres(layout, [0, layout.widths.length - 1]);
  const base = layout.widths[0];
  return layout.widths.map((w, k) => place(ys[k], w / base));
}

const N = SOON_POWERUPS.length;
const DESKTOP: Layout = {
  widths: [44, 41.5, 39, 36.5, 34, 31.5],
  gap: 0.9,
  enter: { dy: 4, z: 12, tilt: 2 },
  exit: { dy: -3, z: -24, tilt: 40 },
};
const MOBILE: Layout = {
  widths: [90, 86, 82, 78, 74, 70],
  gap: 2.2,
  enter: { dy: 8, z: 12, tilt: 2 },
  exit: { dy: -6, z: -48, tilt: 40 },
};
const DESKTOP_STILL: Layout = { widths: [41.5, 39.5, 37.5, 35.5, 33.5], gap: 0.8 };
const MOBILE_STILL: Layout = { widths: [80, 77, 74, 71, 68], gap: 1.8 };
const desk = track('rise', DESKTOP);
const mob = track('rise-mobile', MOBILE);
const deskStill = still(DESKTOP_STILL);
const mobStill = still(MOBILE_STILL);

// Sizes are in this frame's vw: the landing sizes the frame (components/coming-soon), and its ratio fits four rows.
// Each row is a 440pt app screen (an @container, so the mock's u() resolves against it).
const CSS = `
html, body { background: transparent !important; overflow: hidden; }
.rows { position: relative; height: 100vh; margin: 0; padding: 0; list-style: none; perspective: 140vw; perspective-origin: 50% -40%; }
.rows { -webkit-mask-image: linear-gradient(transparent, #000 9%, #000 91%, transparent); mask-image: linear-gradient(transparent, #000 9%, #000 91%, transparent); }
.row { position: absolute; top: 50%; left: 50%; width: ${desk.base}vw; border-radius: calc(${desk.base}vw * 16 / 440); background: linear-gradient(to bottom, ${COLORS.waterTop}, ${COLORS.waterBottom}); box-shadow: 0 1vw 2.2vw rgba(80, 14, 10, .3); opacity: 0; animation: rise ${N * SECONDS_PER_SLOT}s linear calc(var(--i) * ${-SECONDS_PER_SLOT}s) infinite; }
${desk.css}
${mob.css}
@media (max-width: 500px) {
  .row { width: ${mob.base}vw; border-radius: calc(${mob.base}vw * 16 / 440); animation-name: rise-mobile; }
}
@media (prefers-reduced-motion: reduce) {
  .rows { -webkit-mask-image: none; mask-image: none; }
  .row { animation: none; opacity: 1; width: ${DESKTOP_STILL.widths[0]}vw; transform: var(--still); }
}
@media (prefers-reduced-motion: reduce) and (max-width: 500px) {
  .row { width: ${MOBILE_STILL.widths[0]}vw; transform: var(--still-mobile); }
}
`;

/** The Coming soon Powerups as the wallet's PowerupRow, switched off, rising in a loop. Shown inside the landing's orange card. */
export default function PowerupRows() {
  return (
    <>
      <style>{CSS}</style>
      <ul className="rows" aria-hidden="true">
        {SOON_POWERUPS.map((powerup, i) => {
          const Icon = ICONS[powerup.name];
          return (
            <li
              key={powerup.name}
              className="row @container"
              style={{ '--i': i, '--still': deskStill[N - 1 - i], '--still-mobile': mobStill[N - 1 - i] } as CSSProperties}
            >
              <PowerupRow
                icon={<Icon size={u(20)} color={COLORS.accentFill} />}
                title={powerup.name}
                subtitle={`by ${powerup.partner}`}
                on={false}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
}
