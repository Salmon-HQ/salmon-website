// Coming soon: the community Powerups in an orange card at the end of the cream Powerups card (a card inside a
// card). The rows are the wallet's PowerupRow, drawn by /powerup-rows: the home page is plain HTML from
// app/route.ts, and Next renders React only in its own pages, so the rows come in a frame like the phones do.

export const SOON_POWERUPS = [
  { name: 'Cash', partner: 'MoneyGram' },
  { name: 'Invest', partner: 'Cesto' },
  { name: 'Trade', partner: 'Titan' },
  { name: 'Borrow', partner: 'Hobba' },
  { name: 'Hardware', partner: 'Unruggable' },
];

export const comingSoonHtml = `<div id=coming-soon class=salmon-soon>
  <div class=salmon-soon-card>
    <p class=salmon-soon-eyebrow>Powerups by the community</p>
    <h2 class=salmon-soon-title>Coming soon</h2>
    <ul class=salmon-visually-hidden>${SOON_POWERUPS.map((powerup) => `<li>${powerup.name} by ${powerup.partner}</li>`).join('')}</ul>
    <iframe class=salmon-soon-rows src="/powerup-rows" title="" aria-hidden=true tabindex=-1 loading=lazy></iframe>
    <p class=salmon-soon-cta><a class=salmon-soon-apply href="mailto:integrations@salmonwallet.io?subject=Apply%20for%20an%20integration">Apply for an integration</a></p>
  </div>
</div>`;

// --u scales with the viewport's width but is capped by its height, so the whole card fits one screen on wide
// and short displays alike (equal to 1vw at 1440x900). The frame's aspect ratio holds the four rows
// /powerup-rows shows at a time as they rise (desktop: 34..41.5% wide; mobile: 74..86%), with room for tilt and shadow.
export const comingSoonCss = `
  .salmon-soon {
    --u: min(1vw, 1.6vh);
    position: relative;
    z-index: 3;
    padding: 0 calc(64px + 4vw) var(--salmon-card-top, 6vw);
  }
  .salmon-soon-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: calc(var(--u) * 3.2) calc(var(--u) * 4) calc(var(--u) * 2.8);
    border-radius: calc(var(--u) * 2.8);
    background: linear-gradient(155deg, #ff7e6d 0%, #ff5c45 55%, #a12a2a 100%);
    box-shadow: 0 calc(var(--u) * 2.2) calc(var(--u) * 5) rgba(161, 42, 42, .28);
    color: #fff;
    text-align: center;
    overflow: hidden;
  }
  .salmon-soon-eyebrow {
    margin-bottom: calc(var(--u) * .6);
    color: rgba(255, 255, 255, .82);
    font-size: max(14px, calc(var(--u) * 1.15));
    font-weight: 500;
    letter-spacing: .01em;
  }
  /* Scoped under .salmon-soon to outrank the template's .section h2 (size, line height and top padding). */
  .salmon-soon .salmon-soon-title {
    padding-top: 0;
    font-size: calc(var(--u) * 5);
    font-weight: 500;
    line-height: 1;
    letter-spacing: -.0575em;
  }
  .salmon-soon-rows {
    display: block;
    width: min(100%, calc(var(--u) * 75));
    /* The template sets every iframe absolute at 100% of its parent; this one sits in the flow at its ratio. */
    position: relative;
    top: auto;
    left: auto;
    height: auto;
    aspect-ratio: 100 / 38;
    margin-top: calc(var(--u) * 1.2);
    border: 0;
    background: transparent;
    color-scheme: normal;
    pointer-events: none;
  }
  .salmon-soon-cta { margin-top: calc(var(--u) * 1.2); }
  .salmon-soon-apply {
    display: inline-block;
    padding: 16px 32px;
    border-radius: 999px;
    background: #fff;
    box-shadow: 0 8px 30px rgba(120, 24, 18, .25);
    color: #10131c;
    font-size: 18px;
    font-weight: 600;
    text-decoration: none;
    transition: transform .3s cubic-bezier(.22, 1, .36, 1), box-shadow .3s;
  }
  .salmon-soon-apply:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(120, 24, 18, .32); }
  .salmon-soon-apply:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
  @media (max-width: 750px) {
    .salmon-soon { padding: 0 calc(16px + 1.5vw) var(--salmon-card-top, 14vw); }
    /* Side padding keeps the widest row off the card's edges. */
    .salmon-soon-card { padding: 10vw 4vw 8vw; border-radius: 6vw; }
    .salmon-soon .salmon-soon-title { font-size: 12vw; }
    .salmon-soon-rows { width: 100%; aspect-ratio: 100 / 74; margin-top: 5vw; }
    .salmon-soon-cta { margin-top: 5vw; }
  }
`;
