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

// Sizes are in this frame's vw: the landing sizes the frame (components/coming-soon) and these rows fill it.
// Each row is a 440pt app screen (an @container, so the mock's u() resolves against it); lower rows are wider,
// the same row seen closer, and the stack leans back.
const CSS = `
html, body { background: transparent !important; }
.rows { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .8vw; height: 100vh; margin: 0; padding: 0; list-style: none; perspective: 140vw; perspective-origin: 50% -40%; }
.row { --w: calc(35vw + var(--i) * 2.5vw); width: var(--w); border-radius: calc(var(--w) * 16 / 440); background: linear-gradient(to bottom, ${COLORS.waterTop}, ${COLORS.waterBottom}); box-shadow: 0 1vw 2.2vw rgba(80, 14, 10, .3); transform: rotateX(12deg); animation: float 6s ease-in-out calc(var(--i) * -1.1s) infinite; }
@keyframes float { 0%, 100% { translate: 0 0; } 50% { translate: 0 -.45vw; } }
@media (max-width: 500px) {
  .rows { gap: 2.5vw; }
  .row { --w: calc(84vw + var(--i) * 3vw); }
}
@media (prefers-reduced-motion: reduce) { .row { animation: none; } }
`;

/** The Coming soon Powerups as the wallet's PowerupRow, switched off. Shown inside the landing's orange card. */
export default function PowerupRows() {
  return (
    <>
      <style>{CSS}</style>
      <ul className="rows" aria-hidden="true">
        {SOON_POWERUPS.map((powerup, i) => {
          const Icon = ICONS[powerup.name];
          return (
            <li key={powerup.name} className="row @container" style={{ '--i': i } as CSSProperties}>
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
