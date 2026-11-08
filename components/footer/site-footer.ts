export const STORES = [
  {
    name: 'Chrome',
    label: 'Download Salmon for Chrome',
    href: 'https://chromewebstore.google.com/detail/salmon-wallet/ejbidfepgijlcgahbmbckmnaljagjoll',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M21.17 8H12M3.95 6.06 8.54 14M10.88 21.94 15.46 14"/></svg>',
  },
  {
    name: 'iOS',
    label: 'Download Salmon for iOS',
    href: 'https://apps.apple.com/app/salmon-open-wallet/id6799740991',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.286 7.008C5.07 7.008 4 10.238 4 12.928 4 16.157 6.143 21 8.286 21c1.165-.05 1.799-.538 3.214-.538 1.406 0 1.607.538 3.214.538S19 17.771 19 15.619c-.03-.011-2.649-.434-2.679-3.23-.02-2.335 2.589-3.179 2.679-3.228-1.096-1.606-3.162-2.113-3.75-2.153-1.535-.12-3.032 1.077-3.75 1.077-.729 0-2.036-1.077-3.214-1.077M12 4a2 2 0 0 0 2-2 2 2 0 0 0-2 2"/></svg>',
  },
  {
    name: 'Android',
    label: 'Download Salmon for Android',
    href: 'https://play.google.com/store/apps/details?id=io.salmonwallet.app',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v6M20 10v6M7 9h10v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9a5 5 0 0 1 10 0M8 3l1 2M16 3l-1 2M9 18v3M15 18v3"/></svg>',
  },
  {
    name: 'Seeker',
    label: 'Get Salmon for Seeker',
    href: 'solanadappstore://details?id=io.salmonwallet.app',
    icon: '<img src="/images/seeker.svg" alt="" aria-hidden="true">',
  },
];

const SOCIALS = [
  {
    label: 'X',
    href: 'https://x.com/salmonwallet',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    label: 'Telegram',
    href: 'https://t.me/salmon_wallet',
    path: 'M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.2 13 1.4 11.5c-1-.3-1-1 .2-1.5L20.6 2.7c.9-.3 1.6.2 1.3 1.6z',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/Salmon-HQ',
    path: 'M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z',
  },
  {
    label: 'Medium',
    href: 'https://medium.com/@salmonwallet',
    path: 'M13.5 12a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0zm7.4 0c0 3.54-1.5 6.4-3.38 6.4s-3.38-2.86-3.38-6.4 1.51-6.4 3.38-6.4 3.38 2.87 3.38 6.4zM24 12c0 3.17-.53 5.74-1.19 5.74-.65 0-1.18-2.57-1.18-5.74s.53-5.74 1.18-5.74c.66 0 1.19 2.57 1.19 5.74z',
  },
];

const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      ['Powerups', '/#program'],
      ['Validator', '/#salmon-validator'],
      ['Extension', STORES[0].href],
      ['Docs', 'https://docs.salmonwallet.io/'],
    ],
  },
  {
    title: 'Developers',
    links: [
      ['GitHub', 'https://github.com/Salmon-HQ'],
      ['Apply for an integration', 'mailto:integrations@salmonwallet.io'],
    ],
  },
  {
    title: 'Community',
    links: SOCIALS.map((social) => [social.label, social.href]),
  },
  {
    title: 'Legal',
    links: [
      ['Terms & conditions', '/terms'],
      ['Privacy policy', '/privacy'],
      ['Contact', '/contact'],
    ],
  },
];

export function externalAttrs(href: string) {
  return href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '';
}

export const downloadsHtml = `<div class="salmon-downloads">${STORES.map(
  (store) =>
    `<a class="salmon-download" href="${store.href}"${externalAttrs(store.href)} aria-label="${store.label}">${store.icon}</a>`,
).join('')}</div>`;

// Layout follows hims.com: app card on the left, link columns, socials,
// legal row and an oversized wordmark closing the page.
export const footerHtml = `
  <div id="footer-top" class="salmon-footer">
    <aside class="salmon-footer-app">
      <p class="salmon-footer-app-eyebrow">Download the free Salmon app</p>
      <p class="salmon-footer-app-title">One wallet.<br>Available today.</p>
      ${downloadsHtml}
      <div class="salmon-footer-phone"><iframe src="/phone-preview" title="Salmon wallet home: balance and token list" loading="lazy" tabindex="-1"></iframe></div>
    </aside>
    <div class="salmon-footer-main">
      <div class="salmon-footer-columns">${FOOTER_COLUMNS.map(
        (column) =>
          `<nav aria-label="${column.title}"><p class="salmon-footer-label">${column.title}</p><ul>${column.links
            .map(([text, href]) => `<li><a href="${href}"${externalAttrs(href)}>${text.replace('&', '&amp;')}</a></li>`)
            .join('')}</ul></nav>`,
      ).join('')}</div>
      <div class="salmon-footer-row">
        <ul class="salmon-footer-socials">${SOCIALS.map(
          (social) =>
            `<li><a href="${social.href}" target="_blank" rel="noopener noreferrer" aria-label="${social.label}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${social.path}"/></svg></a></li>`,
        ).join('')}</ul>
        <div class="salmon-footer-support">
          <p>Supported by</p>
          <div>
            <img src="/images/partners/la-familia.png" alt="La Familia">
            <img src="/images/partners/superteam-argentina.svg" alt="Superteam Argentina">
          </div>
        </div>
      </div>
      <div class="salmon-footer-legal">
        <img src="/images/app-icon.png" alt="" class="salmon-footer-legal-icon">
        <div>
          <p class="salmon-footer-tagline">Open wallet infrastructure</p>
          <p>© ${new Date().getFullYear()} Salmon Wallet. Open source and self-custodial. All rights reserved.</p>
        </div>
      </div>
    </div>
  </div>
  <div class="salmon-footer-wordmark" aria-hidden="true">Salmon</div>`;

export const downloadsCss = `
  .salmon-downloads {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
  }
  /* --d drives width, height and flex-basis together so the buttons stay
     circles at every breakpoint. */
  .salmon-download {
    --d: max(92px, 9vw);
    display: flex;
    flex: 0 0 var(--d);
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: var(--d);
    height: var(--d);
    aspect-ratio: 1;
    border-radius: 50%;
    background: #fff;
    color: #10131c;
    box-shadow: 0 16px 48px rgba(0,0,0,.22);
    transition: transform .35s cubic-bezier(.19,1,.22,1), background-color .35s ease;
  }
  .salmon-download + .salmon-download {
    margin-left: calc(var(--d) * -.24);
  }
  .salmon-download:nth-child(1) { z-index: 4; }
  .salmon-download:nth-child(2) { z-index: 3; }
  .salmon-download:nth-child(3) { z-index: 2; }
  .salmon-download:nth-child(4) { z-index: 1; }
  .salmon-download:hover {
    transform: translateY(-8px);
    background: #ff7e6d;
  }
  .salmon-download svg {
    position: static;
    width: 2.6vw;
    height: 2.6vw;
    min-width: 28px;
    min-height: 28px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .salmon-download img {
    width: 45%;
    height: auto;
    filter: invert(1);
  }
`;

export const footerCss = `
  footer {
    margin-top: 0 !important;
    padding: 0 !important;
    background: #0b0d13 !important;
    color: #f4f4f1 !important;
    overflow: hidden;
  }
  footer a { color: inherit; }
  #footer-top.salmon-footer {
    display: grid !important;
    grid-template-columns: minmax(300px, 30%) minmax(0, 1fr);
    gap: 6vw;
    padding: 64px 64px 0 !important;
  }
  .salmon-footer-app {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 640px;
    padding: 44px 32px 0;
    border-radius: 20px;
    background: radial-gradient(circle at 50% 100%, rgba(255,92,69,.32), transparent 55%), #161a24;
    text-align: center;
    overflow: hidden;
  }
  .salmon-footer-app-eyebrow {
    margin-bottom: 14px;
    color: #c9cad0;
    font-size: 14px;
  }
  .salmon-footer-app-title {
    margin-bottom: 28px;
    font-size: clamp(30px, 2.6vw, 42px);
    font-weight: 600;
    line-height: 1.05;
    letter-spacing: -.045em;
  }
  .salmon-footer-app .salmon-download { --d: 72px; }
  .salmon-footer-app .salmon-download svg {
    width: 26px;
    height: 26px;
    min-width: 0;
    min-height: 0;
  }
  .salmon-footer-phone {
    position: absolute;
    bottom: -90px;
    left: 50%;
    width: 210px;
    aspect-ratio: 591 / 1280;
    border-radius: 32px;
    box-shadow: 0 0 0 9px #080a0f, 0 0 0 10px #ff7e6d, 0 30px 60px rgba(0,0,0,.45);
    transform: translateX(-50%);
    overflow: hidden;
  }
  .salmon-footer-phone iframe { position: absolute; inset: 0; border: 0; pointer-events: none; }
  .salmon-footer-main {
    display: flex;
    flex-direction: column;
    padding-top: 8px;
  }
  .salmon-footer-columns {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 40px;
  }
  .salmon-footer-columns ul {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .salmon-footer-label {
    margin-bottom: 18px;
    color: #7d808c;
    font-size: 13px;
  }
  .salmon-footer-columns a {
    font-size: clamp(17px, 1.3vw, 21px);
    line-height: 1.25;
    transition: color .25s ease;
  }
  .salmon-footer-columns a:hover { color: #ff5c45; }
  .salmon-footer-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    margin-top: auto;
    padding-top: 72px;
  }
  .salmon-footer-socials { display: flex; gap: 12px; }
  .salmon-footer-socials a {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: #232837;
    transition: background-color .25s ease;
  }
  .salmon-footer-socials a:hover { background: #ff5c45; }
  .salmon-footer-socials svg { width: 19px; height: 19px; fill: currentColor; }
  .salmon-footer-support {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 16px 22px;
    border-radius: 14px;
    background: #161a24;
  }
  .salmon-footer-support p {
    color: #7d808c;
    font-size: 11px;
    letter-spacing: .16em;
    text-transform: uppercase;
  }
  .salmon-footer-support div { display: flex; align-items: center; gap: 24px; }
  .salmon-footer-support img { width: auto; object-fit: contain; }
  .salmon-footer-support img:first-child { height: 20px; max-width: 150px; }
  .salmon-footer-support img:last-child { height: 22px; max-width: 140px; }
  .salmon-footer-legal {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-top: 40px;
  }
  .salmon-footer-legal-icon { width: 56px; height: 56px; border-radius: 14px; }
  .salmon-footer-legal .salmon-footer-tagline { margin-bottom: 6px; color: #f4f4f1; font-size: 15px; font-weight: 500; }
  .salmon-footer-legal a, .salmon-footer-legal p { color: #9a9ca6; font-size: 13px; }
  .salmon-footer-legal a:hover { color: #ff5c45; }
  /* DM Sans 700 at line-height 1 draws "Salmon" from .12em to .854em (the round
     letters' overshoot), so a .855em box sets the word right on the page edge, uncut. */
  .salmon-footer-wordmark {
    height: .855em;
    margin-top: 6vw;
    padding: 0;
    color: #1a1e2a;
    font-size: 26.5vw;
    font-weight: 700;
    line-height: 1;
    overflow: hidden;
    letter-spacing: -.065em;
    text-align: center;
    white-space: nowrap;
    user-select: none;
  }
  @media (max-width: 750px) {
    #footer-top.salmon-footer { grid-template-columns: 1fr; gap: 64px; padding: 48px 6.15vw 0 !important; }
    .salmon-footer-app { min-height: 640px; }
    .salmon-footer-columns { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 40px 24px; }
    .salmon-footer-row { padding-top: 56px; }
    .salmon-footer-support { flex-direction: column; align-items: flex-start; gap: 14px; }
    .salmon-footer-legal { align-items: flex-start; }
  }
`;
