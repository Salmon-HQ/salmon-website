import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

const SNAPSHOT_PATH = path.join(process.cwd(), 'app/source.html');

const VALIDATOR_VOTE_ACCOUNT = 'Sa1HXZsn2u6p2dMLZGhfxtsRw7Jo32hF15yBghWJsCz';
const VALIDATOR_DETAILS_URL =
  'https://www.validators.app/validators/SA1LFXr4os2P4VKGUyRv84uFfuUYgcQkFh2uA4SmRcr?locale=en&network=mainnet';

interface ValidatorStats {
  activeStake: number; // SOL
  uptime: number; // %
  location: string; // city reported by Stakewiz
  active: boolean;
  live: boolean; // false = static fallback
}

// Snapshot from Stakewiz (2026-10-24), shown only when the API is unreachable.
const VALIDATOR_FALLBACK: ValidatorStats = {
  activeStake: 72697,
  uptime: 99.99,
  location: 'Sao Paulo',
  active: true,
  live: false,
};

// Same source as salmonwallet.io: Stakewiz, cached for an hour.
async function getValidatorStats(): Promise<ValidatorStats> {
  try {
    const res = await fetch(`https://api.stakewiz.com/validator/${VALIDATOR_VOTE_ACCOUNT}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return VALIDATOR_FALLBACK;
    const v = await res.json();
    if (typeof v.activated_stake !== 'number') return VALIDATOR_FALLBACK;
    return {
      activeStake: v.activated_stake,
      uptime: typeof v.uptime === 'number' ? v.uptime : VALIDATOR_FALLBACK.uptime,
      location: typeof v.ip_city === 'string' && v.ip_city ? v.ip_city : VALIDATOR_FALLBACK.location,
      active: !v.delinquent,
      live: true,
    };
  } catch {
    return VALIDATOR_FALLBACK;
  }
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function renderValidatorSection(stats: ValidatorStats) {
  const stake = Math.round(stats.activeStake).toLocaleString('en-US');
  return `<section id="salmon-validator" aria-labelledby="salmon-validator-heading">
    <div class="salmon-validator-intro">
      <p class="salmon-validator-eyebrow">Salmon Validator <span>Since June 2026</span></p>
      <h2 id="salmon-validator-heading">Salmon Wallet Validator</h2>
      <p class="salmon-validator-lead">Operating a Solana validator is part of our long-term commitment to the ecosystem: contributing reliable infrastructure and making performance visible and verifiable. Native Stake coming soon.</p>
    </div>
    <div class="salmon-validator-panel">
      <ul class="salmon-validator-stats">
        <li><strong>${stake} SOL</strong><span>Active stake</span></li>
        <li><strong>${stats.uptime.toFixed(2)}%</strong><span>Uptime</span></li>
        <li><strong>${escapeHtml(stats.location)}</strong><span>Location</span></li>
        <li><strong><i class="salmon-validator-dot${stats.active ? '' : ' is-down'}" aria-hidden="true"></i>${stats.active ? 'Active' : 'Delinquent'}</strong><span>Status</span></li>
      </ul>
      <div class="salmon-validator-foot">
        <span>${stats.live ? 'Live' : 'Snapshot'} · Stakewiz</span>
        <a href="${VALIDATOR_DETAILS_URL}" target="_blank" rel="noopener noreferrer">Validator details ↗</a>
      </div>
    </div>
  </section>`;
}

const STORES = [
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
    label: 'Product',
    groups: [
      {
        links: [
          ['Powerups', '#program'],
          ['Validator', '#salmon-validator'],
          ['Docs', 'https://docs.salmonwallet.io/'],
          ['FAQ', 'https://docs.salmonwallet.io/'],
        ],
      },
    ],
  },
  {
    label: 'Developers',
    groups: [
      {
        links: [
          ['GitHub', 'https://github.com/Salmon-HQ'],
          ['Apply for an Integration', 'mailto:integrations@salmonwallet.io'],
          ['Brand', 'https://www.salmonwallet.io/brand'],
          ['Media Kit', 'https://www.salmonwallet.io/downloads/salmonwallet-mediakit.zip'],
        ],
      },
    ],
  },
  {
    label: 'Salmon',
    groups: [
      {
        links: [
          ['About', 'https://www.salmonwallet.io/about'],
          ['Contact', 'https://www.salmonwallet.io/contact'],
        ],
      },
      {
        title: 'Community',
        links: [
          ['Telegram', 'https://t.me/salmon_wallet'],
          ['Medium', 'https://medium.com/@salmonwallet'],
        ],
      },
    ],
  },
];

function externalAttrs(href: string) {
  return href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '';
}

const downloadsHtml = `<div class="salmon-downloads">${STORES.map(
  (store) =>
    `<a class="salmon-download" href="${store.href}"${externalAttrs(store.href)} aria-label="${store.label}">${store.icon}</a>`,
).join('')}</div>`;

const getSalmonCardHtml = `<h3 class="salmon-get-title">Get Salmon</h3><p class="salmon-get-subtitle"><span>A reason to arrive.</span> <span>A wallet designed to stay.</span></p>${downloadsHtml}`;

// Layout follows hims.com: app card on the left, link columns, socials,
// legal row and an oversized wordmark closing the page.
const footerHtml = `
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
          `<nav aria-label="${column.label}">${column.groups
            .map(
              (group) =>
                `${group.title ? `<p class="salmon-footer-label">${group.title}</p>` : ''}<ul>${group.links
                  .map(([text, href]) => `<li><a href="${href}"${externalAttrs(href)}>${text}</a></li>`)
                  .join('')}</ul>`,
            )
            .join('')}</nav>`,
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
          <ul>
            <li><a href="https://www.salmonwallet.io/terms">Terms &amp; conditions</a></li>
            <li><a href="https://www.salmonwallet.io/privacy">Privacy policy</a></li>
          </ul>
          <p>© ${new Date().getFullYear()} Salmon Wallet. Open source and self-custodial. All rights reserved.</p>
        </div>
      </div>
    </div>
  </div>
  <div class="salmon-footer-wordmark" aria-hidden="true">Salmon</div>`;

// Stake, Swap and Pay: each word and its tile are one list item, so the word
// is centred on its tile by layout. The tile is the site's section icon tile
// (.section-rectangle) laid in perspective. The glyphs are the app's Phosphor
// marks, the same geometry as components/hero/wallet-icons (a route handler
// cannot render React to markup). Pay is the Payments QR, NFTs the app's Image.
const INTRO_ITEMS = [
  {
    word: 'Stake',
    glyph:
      '<polyline points="32 176 128 232 224 176"/><polyline points="32 128 128 184 224 128"/><polygon points="32 80 128 136 224 80 128 24 32 80"/>',
  },
  {
    word: 'Swap',
    glyph:
      '<polyline points="176 144 208 176 176 208"/><line x1="48" y1="176" x2="208" y2="176"/><polyline points="80 112 48 80 80 48"/><line x1="208" y1="80" x2="48" y2="80"/>',
  },
  {
    word: 'Pay',
    glyph:
      '<rect x="48" y="48" width="64" height="64" rx="8"/><rect x="48" y="144" width="64" height="64" rx="8"/><rect x="144" y="48" width="64" height="64" rx="8"/><line x1="144" y1="144" x2="144" y2="176"/><polyline points="144 208 176 208 176 144"/><line x1="176" y1="160" x2="208" y2="160"/><line x1="208" y1="192" x2="208" y2="208"/>',
  },
  {
    word: 'Send',
    glyph: '<line x1="64" y1="192" x2="192" y2="64"/><polyline points="94 64 192 64 192 162"/>',
  },
  {
    word: 'Receive',
    glyph: '<line x1="192" y1="64" x2="64" y2="192"/><polyline points="162 192 64 192 64 94"/>',
  },
  {
    word: 'NFTs',
    glyph:
      '<rect x="32" y="48" width="192" height="160" rx="8"/><polyline points="32 168 92 108 192 208"/><polyline points="148 164 178 134 224 180"/><circle cx="156" cy="100" r="4"/>',
  },
];

const introListHtml = (hidden: boolean) =>
  `<ul class=salmon-intro-row${hidden ? ' aria-hidden=true' : ''}>${INTRO_ITEMS.map(
    ({ word, glyph }) =>
      `<li class=salmon-intro-item><span class=salmon-intro-word>${word}</span><span class=salmon-intro-tile aria-hidden=true><span class="section-rectangle salmon-intro-face"><svg viewBox="0 0 256 256"><g fill="none" stroke="#ff5c45" stroke-width="24" stroke-linecap="round" stroke-linejoin="round">${glyph}</g></svg></span></span></li>`,
  ).join('')}</ul>`;

// The list twice in a row: the track slides one list's width and starts over.
const introRowHtml = `<div class=salmon-intro-marquee><div class=salmon-intro-track>${introListHtml(false)}${introListHtml(true)}</div></div>`;

const SCREENS = [
  { screen: 'swap-review', title: 'Swap', powerup: true, alt: 'Swap review in Salmon: SOL to USDC with rate, fee and minimum received', copy: 'Trade tokens without leaving your wallet. Rate and fees are shown before you confirm.' },
  { screen: 'payments', title: 'Payments', powerup: true, alt: 'Payment request in Salmon: QR code for 25 USDC waiting for payment', copy: 'Request a payment with a QR code and follow its status until it arrives.' },
  { screen: 'receive', title: 'Receive', powerup: false, alt: 'Receive screen in Salmon: Solana address QR code with a network warning', copy: 'Share your address as a QR code. The network is named, so funds arrive on the right chain.' },
  { screen: 'activity', title: 'Activity', powerup: false, alt: 'Activity in Salmon: sent and received transactions grouped by day', copy: 'Every transaction, grouped by day and filtered by type.' },
  { screen: 'nfts', title: 'NFTs', powerup: false, alt: 'NFT grid in Salmon showing generative art collectibles', copy: 'Your collectibles in one grid, right next to your tokens.' },
  { screen: 'token', title: 'Token details', powerup: false, alt: 'Solana token detail in Salmon: price chart and market data', copy: 'Price chart, market data and an overview for every token you hold.' },
];

const screensSectionHtml = `<section id=screens class=section aria-labelledby=screens-title>
  <div class=section-rectangle><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 1.5h10A2.5 2.5 0 0 1 19.5 4v16a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 20V4A2.5 2.5 0 0 1 7 1.5Zm3 2a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5h-4Z"/></svg></div>
  <h2 id=screens-title>Inside the app</h2>
  <p class=salmon-screens-intro>A look inside Salmon. <span>The screens you’ll actually use.</span></p>
  <ul class=salmon-screens-list>${SCREENS.map(
    (screen) => `<li><figure><div class=salmon-screens-phone><iframe src="/phone-preview?screen=${screen.screen}" title="${screen.alt}" loading="lazy" tabindex="-1"></iframe></div><figcaption>${screen.powerup ? '<span class=salmon-screens-tag>Powerup</span>' : ''}<strong>${screen.title}</strong><span>${screen.copy}</span></figcaption></figure></li>`,
  ).join('')}</ul>
</section>`;

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  let html: string;
  try {
    html = await readFile(SNAPSHOT_PATH, 'utf8');
  } catch {
    return new Response('The local reference snapshot could not be loaded.', { status: 500 });
  }

  const withoutOriginalMetadata = html
    .replace(/<title[\s\S]*?<\/title>/i, '')
    .replace(/<meta\b[^>]*>/gi, '')
    .replace(/<link\b[^>]*(?:canonical|icon|manifest|apple-touch|preload)[^>]*>/gi, '');
  const withHeadline = withoutOriginalMetadata.replace(
    '<h1> Total salmon.<br> Totally different. </h1>',
    '<h1> <span class="salmon-h1-strong">One wallet.</span><br> Only what you need. </h1>',
  );
  const withSalmonPhone = withHeadline.replace(
    /<div class=card-content-screen><video[^>]*hero\/00\.mp4[\s\S]*?<\/video><\/div>/,
    '<div class="card-content-screen salmon-phone-screen"><iframe src="/phone-preview" title="Salmon Wallet" tabindex="-1"></iframe></div>',
  );
  const withSalmonLogo = withSalmonPhone.replace(
    /<a[^>]*id="nav-logo"[^>]*>[\s\S]*?<\/a>/,
    `<a href="/" id="nav-logo" aria-label="Salmon">
      <img src="/images/logo.png" alt="" class="salmon-reference-mark">
      <img src="/images/app-title.png" alt="Salmon" class="salmon-reference-wordmark">
    </a>`,
  );
  const withDownloadLink = withSalmonLogo.replace(
    /<a\s+class=soon>/,
    '<a class=soon href="#salmon-card-1">',
  );
  // The template script still queries #shop on load (clip, sticky list, nav-logo
  // colour), so the Member Shop section becomes an empty stub instead of being
  // removed. Sitting right after #salmon, its card-content also marks where the
  // light nav logo over the black section ends. The separator after it goes too.
  const withoutShop = withDownloadLink.replace(
    /<section id=shop[\s\S]*?<\/section>\s*<div class=separator><\/div>/,
    '<section id=shop aria-hidden=true><div id=shop-card-bg></div><div class=card-content><div class=card-content-phone-shim></div><div class=card-content-screen></div><div class=card-content-list></div></div><div class=p></div></section>',
  );
  const withScreens = withoutShop
    .replace(/<ul id=intro-list>[\s\S]*?<\/ul>\s*<div id=intro-img>[\s\S]*?<\/div>/, () => introRowHtml)
    .replace(/<section id=salmon class=section>/, () => `${screensSectionHtml}<section id=salmon class=section>`)
    .replace(
      /<div id=salmon-card-1>[\s\S]*?<\/div> (?=<div id=salmon-card-2>)/,
      () => `<div id=salmon-card-1 class=salmon-get-card>${getSalmonCardHtml}</div> `,
    )
    .replace(/<footer>[\s\S]*?<\/footer>/, () => `<footer>${footerHtml}</footer>`);
  const validatorSection = renderValidatorSection(await getValidatorStats());
  const withValidator = withScreens.replace(
    /<section id=faq>[\s\S]*?<\/section>/,
    () => validatorSection,
  );
  const overrides = `
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=5">
    <meta name="theme-color" content="#ff5c45">
    <meta name="description" content="A lightweight Solana wallet that expands through optional Powerups.">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Salmon — One wallet. Only what you need.">
    <meta property="og:description" content="A lightweight Solana wallet that expands through optional Powerups.">
    <meta property="og:image" content="${origin}/images/sharing-og.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Salmon — One wallet. Only what you need.">
    <meta name="twitter:description" content="A lightweight Solana wallet that expands through optional Powerups.">
    <meta name="twitter:image" content="${origin}/images/sharing-og.png">
    <link rel="icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/images/app-icon.png">
    <title>Salmon — One wallet. Only what you need.</title>
    <style>
      @font-face { font-family: "DM Sans"; src: url("/reference-assets/font/dm-sans-400.ttf") format("truetype"); font-weight: 400; font-style: normal; font-display: swap; }
      @font-face { font-family: "DM Sans"; src: url("/reference-assets/font/dm-sans-500.ttf") format("truetype"); font-weight: 500; font-style: normal; font-display: swap; }
      @font-face { font-family: "DM Sans"; src: url("/reference-assets/font/dm-sans-600.ttf") format("truetype"); font-weight: 600; font-style: normal; font-display: swap; }
      @font-face { font-family: "DM Sans"; src: url("/reference-assets/font/dm-sans-700.ttf") format("truetype"); font-weight: 700; font-style: normal; font-display: swap; }
      /* Without the black section the page background shows; keep it white
         rather than leaving it to the browser's default canvas. */
      html { background: #fff; }
      /* The template's gray band between the hero claim and the intro. */
      .separator { display: none !important; }
      html, body, button, input, textarea, select,
      h1, h2, h3, h4, h5, h6, p, a, li, div, span {
        font-family: "DM Sans", system-ui, sans-serif !important;
      }
      #nav-logo {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        width: auto !important;
      }
      #nav-logo > div { display: none !important; }
      #nav-logo::before {
        content: "";
        display: block;
        width: 23px;
        height: 23px;
        background: url("/images/logo-orange.svg") center / contain no-repeat;
      }
      #nav-logo::after {
        content: "Salmon";
        display: block;
        width: auto;
        height: auto;
        color: #10131c;
        font-size: 20px;
        font-weight: 700;
        line-height: 1;
        letter-spacing: -0.04em;
        transition: color .2s cubic-bezier(.215,.61,.355,1);
      }
      /* The template toggles .fx over #salmon (no longer black, so it changes
         nothing) and .hide over the footer. */
      #nav-logo { transition: opacity .2s cubic-bezier(.215,.61,.355,1); }
      #nav-logo.hide { opacity: 0; pointer-events: none; }
      #nav-logo .salmon-reference-mark {
        display: block;
        width: 23px;
        height: 23px;
        object-fit: contain;
      }
      #nav-logo .salmon-reference-wordmark {
        display: block;
        width: 90px;
        height: auto;
        object-fit: contain;
      }
      #hero-txt {
        padding-top: 7.5vh !important;
        padding-bottom: 40vh !important;
      }
      #hero-txt div:nth-child(2),
      #hero-txt div:nth-child(3) {
        padding-top: 11.25vh !important;
      }
      #hero-txt div:nth-child(1) {
        background-image: linear-gradient(155deg, #ff7e6d 0%, #ff5c45 100%) !important;
      }
      #hero-txt div:nth-child(2) {
        background-image: linear-gradient(155deg, #ff5c45 0%, #d94432 100%) !important;
      }
      #hero-txt div:nth-child(3) {
        background-image: linear-gradient(155deg, #a12a2a 0%, #ff5c45 100%) !important;
      }
      #hero .p p {
        background-image: none !important;
        background-clip: border-box !important;
        -webkit-background-clip: border-box !important;
        -webkit-text-fill-color: currentColor !important;
        color: #10131c !important;
        font-weight: 600 !important;
      }
      #hero .p .salmon-copy-accent { color: #ff5c45; }
      #hero .p .salmon-copy-soft { color: #ff7e6d; }
      #hero .p .salmon-copy-deep { color: #a12a2a; }
      #nav .soon-icon { display: none !important; }
      #nav .soon > div { display: flex; align-items: center; justify-content: center; }
      #hero h1 {
        background: none !important;
        color: #ff5c45 !important;
        -webkit-text-fill-color: #ff5c45 !important;
      }
      #hero h1 .salmon-h1-strong {
        font-weight: 600;
      }
      #hero .card-content {
        background-image:
          radial-gradient(circle at 50% 68%, rgba(255, 92, 69, .42), transparent 30%),
          radial-gradient(circle at 72% 38%, rgba(255, 126, 109, .24), transparent 24%),
          linear-gradient(180deg, #ffffff 0%, #fff7f4 58%, #10131c 100%) !important;
      }
      #hero-card-content-gradient::after {
        background-image:
          radial-gradient(at 70% 35%, rgba(255, 126, 109, .55) 0, transparent 20%),
          radial-gradient(at 38% 72%, rgba(255, 92, 69, .42) 0, transparent 30%),
          radial-gradient(at 48% 52%, rgba(161, 42, 42, .35) 0, transparent 52%) !important;
      }
      /* No cream card or shadow behind Powerups, so the page runs white into
         Real ownership without a colour cut. */
      #program .card-content {
        background-color: transparent !important;
      }
      #program .card-shadow {
        display: none !important;
      }
      #program .section-rectangle {
        background-color: #fff7f4 !important;
      }
      #program .section-rectangle svg {
        fill: #ff5c45 !important;
      }
      #program-card-content-percent-w {
        display: none !important;
      }
      #program-card-content-intro {
        color: #10131c !important;
      }
      /* The grid is a single row, half the template's three-row height, so the
         phone lands in its empty centre slot. Margins stay as in the template. */
      .shim-not-null #program-card-content-grid {
        height: 83.61111vw !important;
      }
      .shim-null #program-card-content-grid {
        height: 100vh !important;
      }
      #program-card-content-intro span {
        background-image: linear-gradient(155deg, #ff7e6d 0%, #ff5c45 55%, #a12a2a 100%) !important;
        background-clip: text !important;
        -webkit-background-clip: text !important;
        color: transparent !important;
        -webkit-text-fill-color: transparent !important;
      }
      #program .p {
        height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
      #intro p {
        margin-top: 3.5vw !important;
        font-size: 3.2vw !important;
        line-height: 1.1 !important;
      }
      /* Real ownership (#salmon) shares the Powerups header sizes. */
      #program.section,
      #salmon.section {
        padding-top: 6vw !important;
      }
      #program .section-rectangle,
      #salmon .section-rectangle {
        width: 9vw !important;
        height: 9vw !important;
        box-shadow: 0 6px 48px 0 rgba(0,0,0,.09) !important;
      }
      #program .section-rectangle svg {
        width: 3.6vw !important;
        height: 3.6vw !important;
      }
      #program > h2,
      #salmon-card-0 > h2 {
        padding-top: 1.8vw !important;
        font-size: 7vw !important;
        line-height: 1 !important;
      }
      #program .card {
        margin-top: 5vw !important;
      }
      #program .card-content-screen > video:first-child {
        opacity: 1 !important;
      }
      #hero .card-content-phone > img,
      #program .card-content-phone > img {
        display: none !important;
      }
      #hero .card-content-screen,
      #program .card-content-screen,
      #salmon-card-0 .card-content-screen {
        background: #161c2d;
        box-shadow:
          0 0 0 .9vw #080a0f,
          0 0 0 1.02vw #ff7e6d,
          0 2.2vw 5vw rgba(16,19,28,.28);
      }
      /* The Powerups phone, bezel included, matches a card in the row image
         (540x1150 px, 80 px corners, in a 2880x2408 image), so the screen is
         shrunk by --bezel, the outer box-shadow width. The hero phone uses the
         same size for continuity. */
      #hero .card-content-screen,
      #program .card-content-screen,
      #salmon-card-0 .card-content-screen {
        --bezel: 1.02vw;
      }
      .shim-not-null #hero .card-content-screen,
      .shim-not-null #program .card-content-screen,
      .shim-not-null #salmon-card-0 .card-content-screen {
        width: calc(18.75vw - 2 * var(--bezel));
        height: calc(39.93vw - 2 * var(--bezel));
        border-radius: calc(2.78vw - var(--bezel));
      }
      .shim-null #hero .card-content-screen,
      .shim-null #program .card-content-screen,
      .shim-null #salmon-card-0 .card-content-screen {
        width: calc(22.43vh - 2 * var(--bezel));
        height: calc(47.76vh - 2 * var(--bezel));
        border-radius: calc(3.32vh - var(--bezel));
      }
      #hero .card-content-screen::before,
      #program .card-content-screen::before,
      #salmon-card-0 .card-content-screen::before {
        content: "";
        position: absolute;
        z-index: 7;
        top: .65vw;
        left: 50%;
        width: 5.2vw;
        height: 1.25vw;
        border-radius: 999px;
        background: #080a0f;
        transform: translateX(-50%);
      }
      #salmon-card-0 .card-content-screen iframe,
      .salmon-phone-screen iframe {
        width: 100%;
        height: 100%;
        border: 0;
        pointer-events: none;
      }
      /* Empty markers the template fades per step; the phone mock reads them. */
      .salmon-step-marker { display: none; }
      #shop, #shop * {
        position: static !important;
        height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        visibility: hidden !important;
      }
      /* Real ownership is no longer a black section: the icon and title move
         into the Own it twice card and Get Salmon sits below as its own card. */
      #salmon {
        margin-top: 0 !important;
        padding-bottom: calc(64px + 24px);
        background-color: transparent !important;
        color: #10131c !important;
      }
      #salmon .card-content {
        background-color: transparent !important;
      }
      #salmon-card-0 {
        margin-top: 0 !important;
        padding-top: 6vw !important;
        color: #fff;
      }
      #salmon-card-0 > p {
        margin-top: 3vw !important;
      }
      /* The salmon fin holding the phone: two renders from blender/fin.py
         (docs/fin-preproduction.md), the back one under the CSS phone and the
         front one over its live screen. The numbers are the script's "FIN CSS"
         output divided by the phone's 18.75vw width, so the fin follows the
         phone in both template sizings. */
      #salmon-card-0-phone { --phone-w: 18.75vw; }
      .shim-null #salmon-card-0-phone { --phone-w: 22.43vh; }
      #salmon-card-0-phone img.salmon-fin-back,
      #salmon-card-0-phone img.salmon-fin-front {
        top: calc(50% - 1.79429 * var(--phone-w));
        left: calc(50% - 2.34357 * var(--phone-w));
        width: calc(4.68720 * var(--phone-w));
        height: calc(3.90352 * var(--phone-w));
        transform: none;
        pointer-events: none;
      }
      /* The fin runs on past the render's left and bottom edges; fading there
         hides the straight cut. */
      #salmon-card-0-phone img.salmon-fin-back {
        z-index: 1;
        -webkit-mask-image: linear-gradient(to right, transparent 0, #000 22%), linear-gradient(to top, transparent 0, #000 14%);
        -webkit-mask-composite: source-in;
        mask-image: linear-gradient(to right, transparent 0, #000 22%), linear-gradient(to top, transparent 0, #000 14%);
        mask-composite: intersect;
      }
      #salmon-card-0-phone img.salmon-fin-front { z-index: 3; }
      #salmon-card-1.salmon-get-card {
        box-sizing: border-box;
        min-height: 38vw;
        padding: 8vw 5vw;
        background-image: linear-gradient(120deg, #161c2d 0%, #10131c 58%, #321b20 100%) !important;
      }
      #salmon .section-rectangle img {
        width: 40%;
        height: 40%;
        object-fit: contain;
        filter: brightness(0);
      }
      #salmon-card-0 > p span {
        display: block;
        background-image: linear-gradient(155deg, #ff7e6d 0%, #ff5c45 55%, #a12a2a 100%);
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
      }
      #salmon-card-1 .salmon-get-title {
        margin: 0 0 1.4vw;
        color: #fff;
        font-size: clamp(34px, 4.6vw, 72px);
        font-weight: 600;
        line-height: 1;
        letter-spacing: -.055em;
        text-align: center;
      }
      /* Resets the template's #salmon-card-1 p padding and fixed width. */
      #salmon-card-1 .salmon-get-subtitle {
        width: auto;
        padding: 0;
        margin: 0 0 5vw;
        color: rgba(255,255,255,.62);
        font-size: clamp(17px, 1.6vw, 26px);
        font-weight: 400;
        line-height: 1.3;
        letter-spacing: -.02em;
        text-align: center;
      }
      /* Wraps between the two sentences, never inside one. */
      #salmon-card-1 .salmon-get-subtitle span {
        display: inline-block;
      }
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
      #salmon-validator {
        display: grid;
        grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
        align-items: center;
        gap: 6vw;
        position: relative;
        z-index: 1;
        margin: -24px 0 0;
        padding: 9vw 64px 10vw;
        border-radius: 24px 24px 0 0;
        background: #fff;
        color: #10131c;
      }
      .salmon-validator-eyebrow {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
        margin-bottom: 22px;
        color: #6b6e7b;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: .16em;
        text-transform: uppercase;
      }
      .salmon-validator-eyebrow span {
        padding: 5px 10px;
        border-radius: 999px;
        background: #fff1ed;
        color: #ff5c45;
        letter-spacing: .1em;
      }
      #salmon-validator h2 {
        margin-bottom: 24px;
        font-size: clamp(36px, 4.4vw, 72px);
        font-weight: 600;
        line-height: 1;
        letter-spacing: -.055em;
      }
      .salmon-validator-lead {
        max-width: 520px;
        color: #6b6e7b;
        font-size: clamp(16px, 1.15vw, 19px);
        line-height: 1.55;
      }
      .salmon-validator-panel {
        border-radius: 28px;
        background: #fff7f4;
        overflow: hidden;
      }
      .salmon-validator-stats {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .salmon-validator-stats li {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 2.6vw 2.4vw;
        border-bottom: 1px solid rgba(255,92,69,.14);
      }
      .salmon-validator-stats li:nth-child(odd) {
        border-right: 1px solid rgba(255,92,69,.14);
      }
      .salmon-validator-stats strong {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: clamp(26px, 2.4vw, 40px);
        font-weight: 600;
        line-height: 1;
        letter-spacing: -.045em;
        white-space: nowrap;
      }
      .salmon-validator-stats span {
        color: #6b6e7b;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: .14em;
        text-transform: uppercase;
      }
      .salmon-validator-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #2fbf71;
        box-shadow: 0 0 0 5px rgba(47,191,113,.16);
      }
      .salmon-validator-dot.is-down {
        background: #e5484d;
        box-shadow: 0 0 0 5px rgba(229,72,77,.16);
      }
      .salmon-validator-foot {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 1.8vw 2.4vw;
        color: #8a8d98;
        font-size: 13px;
      }
      .salmon-validator-foot a {
        padding: 12px 20px;
        border-radius: 999px;
        background: #10131c;
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        transition: background-color .25s ease;
      }
      .salmon-validator-foot a:hover { background: #ff5c45; }
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
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 40px;
      }
      .salmon-footer-columns ul {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .salmon-footer-columns ul + .salmon-footer-label { margin-top: 40px; }
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
      .salmon-footer-legal ul { display: flex; flex-wrap: wrap; gap: 6px 20px; margin-bottom: 10px; }
      .salmon-footer-legal a, .salmon-footer-legal p { color: #9a9ca6; font-size: 13px; }
      .salmon-footer-legal a:hover { color: #ff5c45; }
      /* DM Sans 700 at line-height 1 draws "Salmon" from .11em to .85em, so a
         .74em box hides the bottom 15% of the letters behind the page edge. */
      .salmon-footer-wordmark {
        height: .74em;
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
      /* The features as an endless strip of columns of the same width and gap,
         each a word over its tile. Every tile carries its own perspective (the
         transform's perspective(), not a shared one on the row), so its
         vanishing point is its own centre and it reads the same wherever the
         strip has carried it. The strip stops while the pointer is on a tile; each tile
         floats on its own beat, lifts on hover and dips when pressed. */
      .salmon-intro-marquee {
        overflow: hidden;
        padding: 0 0 6vw;
        -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
      }
      .salmon-intro-track {
        display: flex;
        width: max-content;
        animation: salmon-intro-slide 48s linear infinite;
      }
      /* Only a tile stops the strip, not the gaps around it. */
      .salmon-intro-track:has(.salmon-intro-face:hover) { animation-play-state: paused; }
      @keyframes salmon-intro-slide {
        to { transform: translateX(-50%); }
      }
      .salmon-intro-row {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: 30vw;
        column-gap: 12vw;
        /* The gap after the last item, so the seam between copies matches. */
        padding-right: 12vw;
      }
      .salmon-intro-item {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .salmon-intro-word {
        font-size: 9.79167vw;
        line-height: 110%;
        letter-spacing: -.0575em;
        color: #f0f0f0;
        white-space: nowrap;
      }
      .salmon-intro-tile {
        display: block;
        /* The slab is laid out 30vw tall but lies flat, so it claims less room. */
        margin-block: -6vw -4vw;
        animation: salmon-tile-float 6s ease-in-out infinite;
      }
      .salmon-intro-item:nth-child(3n+2) .salmon-intro-tile { animation-delay: -2s; }
      .salmon-intro-item:nth-child(3n) .salmon-intro-tile { animation-delay: -4s; }
      @keyframes salmon-tile-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-0.8vw); }
      }
      .salmon-intro-face {
        width: 30vw !important;
        height: 30vw !important;
        border-radius: 22%;
        background: linear-gradient(160deg, #fff7f4 0%, #fbeeee 100%) !important;
        box-shadow:
          0 1.1vw 0 #ffffff,
          0 1.3vw 0 rgba(16,19,28,.05),
          0 7vw 6vw rgba(16,19,28,.16) !important;
        transform: perspective(50vw) rotateX(64deg);
        transition: transform .5s cubic-bezier(.22,1,.36,1), box-shadow .5s cubic-bezier(.22,1,.36,1), background .5s;
        cursor: pointer;
      }
      .salmon-intro-face svg {
        width: 34% !important;
        height: 34% !important;
        transition: filter .5s, transform .5s cubic-bezier(.22,1,.36,1);
      }
      @media (hover: hover) {
        .salmon-intro-face:hover {
          transform: perspective(50vw) rotateX(56deg) translateZ(2.2vw);
          background: linear-gradient(160deg, #ffffff 0%, #ffe9e4 100%) !important;
          box-shadow:
            0 1.1vw 0 #ffffff,
            0 0 0 .15vw rgba(255,92,69,.35),
            0 1.3vw 0 rgba(16,19,28,.05),
            0 11vw 9vw rgba(16,19,28,.12),
            0 0 6vw rgba(255,92,69,.22) !important;
        }
        .salmon-intro-face:hover svg {
          transform: scale(1.08);
          filter: drop-shadow(0 0 1.2vw rgba(255,92,69,.55));
        }
      }
      .salmon-intro-face:active {
        transform: perspective(50vw) rotateX(64deg) translateZ(-1vw);
        transition-duration: .12s;
        box-shadow:
          0 .4vw 0 #ffffff,
          0 3vw 3vw rgba(16,19,28,.16) !important;
      }
      @media (prefers-reduced-motion: reduce) {
        .salmon-intro-tile,
        .salmon-intro-track { animation: none; }
        .salmon-intro-marquee { overflow-x: auto; }
        .salmon-intro-row[aria-hidden] { display: none; }
        .salmon-intro-face,
        .salmon-intro-face svg { transition: none; }
      }
      #screens.section { padding-top: 6vw !important; }
      #screens .section-rectangle {
        width: 9vw !important;
        height: 9vw !important;
        box-shadow: 0 6px 48px 0 rgba(0,0,0,.09) !important;
        background-color: #fff7f4 !important;
      }
      #screens .section-rectangle svg { width: 3.6vw; height: 3.6vw; fill: #ff5c45; }
      #screens > h2 {
        padding-top: 1.8vw !important;
        font-size: 7vw !important;
        line-height: 1 !important;
        color: #10131c;
      }
      .salmon-screens-intro {
        margin: 3vw auto 0;
        color: #10131c;
        font-size: 3.2vw;
        font-weight: 600;
        line-height: 1.1;
        letter-spacing: -.04em;
        text-align: center;
      }
      .salmon-screens-intro span {
        display: block;
        background-image: linear-gradient(155deg, #ff7e6d 0%, #ff5c45 55%, #a12a2a 100%);
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
      }
      /* Same bezel as the hero and Powerups phones, a size smaller. */
      .salmon-screens-list {
        --bezel: .82vw;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 4vw 3vw;
        max-width: 72vw;
        margin: 6vw auto 0;
        padding: 0;
        list-style: none;
      }
      .salmon-screens-list figure { margin: 0; }
      .salmon-screens-phone {
        overflow: hidden;
        width: calc(100% - 2 * var(--bezel));
        margin: var(--bezel) auto 0;
        aspect-ratio: 720 / 1564;
        border-radius: calc(2.2vw - var(--bezel));
        background: #161c2d;
        box-shadow:
          0 0 0 calc(var(--bezel) * .88) #080a0f,
          0 0 0 var(--bezel) #ff7e6d,
          0 1.8vw 4vw rgba(16,19,28,.22);
      }
      .salmon-screens-phone { position: relative; }
      .salmon-screens-phone iframe { position: absolute; inset: 0; border: 0; pointer-events: none; }
      .salmon-screens-list figcaption {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: calc(1.6vw + var(--bezel));
        color: #5d6170;
        font-size: clamp(14px, 1.1vw, 17px);
        line-height: 1.4;
        letter-spacing: -.01em;
      }
      .salmon-screens-list figcaption strong {
        color: #10131c;
        font-size: clamp(18px, 1.5vw, 24px);
        font-weight: 600;
        letter-spacing: -.03em;
      }
      .salmon-screens-tag {
        align-self: flex-start;
        padding: 3px 10px;
        border-radius: 999px;
        background: #fff7f4;
        color: #ff5c45;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: .02em;
      }
      @media (max-width: 750px) {
        #nav-logo .salmon-reference-wordmark { width: 78px; }
        #footer-top.salmon-footer { grid-template-columns: 1fr; gap: 64px; padding: 48px 6.15vw 0 !important; }
        .salmon-footer-app { min-height: 640px; }
        .salmon-footer-columns { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 40px 24px; }
        .salmon-footer-row { padding-top: 56px; }
        .salmon-footer-support { flex-direction: column; align-items: flex-start; gap: 14px; }
        .salmon-footer-legal { align-items: flex-start; }
        #salmon { padding-bottom: calc(16px + 24px); }
        #salmon-validator { display: block; padding: 80px 6.15vw 96px; }
        .salmon-validator-lead { margin-bottom: 40px; }
        .salmon-validator-stats li { padding: 24px 20px; }
        .salmon-validator-foot { padding: 20px; }
        #intro p { margin-top: 8vw !important; font-size: 8.5vw !important; }
        #screens.section { padding-top: 14vw !important; }
        #screens .section-rectangle { width: 20vw !important; height: 20vw !important; }
        #screens .section-rectangle svg { width: 8vw; height: 8vw; }
        #screens > h2 { padding-top: 4vw !important; font-size: 15vw !important; }
        .salmon-screens-intro { margin-top: 8vw; font-size: 8.5vw; }
        /* One phone per swipe, with the next one peeking in. */
        .salmon-screens-list {
          --bezel: 2.2vw;
          grid-template-columns: none;
          grid-auto-flow: column;
          grid-auto-columns: 62vw;
          gap: 7vw;
          max-width: none;
          margin-top: 10vw;
          padding: 0 6.15vw 4vw;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-padding: 0 6.15vw;
          scrollbar-width: none;
        }
        .salmon-screens-list::-webkit-scrollbar { display: none; }
        .salmon-screens-list li { scroll-snap-align: start; }
        .salmon-screens-phone { border-radius: calc(6vw - var(--bezel)); }
        #program.section, #salmon.section { padding-top: 14vw !important; }
        #program .section-rectangle, #salmon .section-rectangle { width: 20vw !important; height: 20vw !important; }
        #program .section-rectangle svg { width: 8vw !important; height: 8vw !important; }
        #program > h2, #salmon-card-0 > h2 { padding-top: 4vw !important; font-size: 15vw !important; }
        #program .card { margin-top: 10vw !important; }
        #salmon-card-0 { padding-top: 12vw !important; }
        /* The card is narrower than the page, so the title shrinks to stay on one line. */
        #salmon-card-0 > h2 { font-size: 13vw !important; }
        #salmon-card-0 > p { margin-top: 8vw !important; }
        #salmon-card-1.salmon-get-card { min-height: auto; padding: 72px 24px; }
        #salmon-card-1 .salmon-get-title { margin-bottom: 14px; }
        #salmon-card-1 .salmon-get-subtitle { margin-bottom: 48px; }
        #salmon-card-1 .salmon-downloads { display: flex; gap: 0; }
        #salmon-card-1 .salmon-download { --d: min(112px, 23vw); }
        #hero .card-content-screen,
        #program .card-content-screen,
        #salmon-card-0 .card-content-screen {
          box-shadow:
            0 0 0 2.2vw #080a0f,
            0 0 0 2.55vw #ff7e6d,
            0 5vw 12vw rgba(16,19,28,.28);
        }
        #hero .card-content-screen,
        #program .card-content-screen,
        #salmon-card-0 .card-content-screen { --bezel: 2.55vw; }
        #hero .card-content-screen::before,
        #program .card-content-screen::before,
        #salmon-card-0 .card-content-screen::before {
          top: 1.6vw;
          width: 13vw;
          height: 3vw;
        }
      }
    </style>
  `;
  const localized = withValidator.replace(
    '<head>',
    `<head>${overrides}`,
  );
  const finalHtml = `${localized}<script>
      // The template measures the page and binds its handlers on window.onload,
      // so copy is swapped as soon as the DOM is parsed and only the nodes the
      // template caches (percent counter) wait for load.
      function applySalmonCopy() {
        var powerupsIcon = document.querySelector('#program .section-rectangle');
        if (powerupsIcon) {
          powerupsIcon.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.7 1.8 3.6 13.5h7.1l-1 8.7 10.7-12.5h-7.2l.5-7.9Z"/></svg>';
        }

        var powerupsGridImage = document.querySelector('#program-card-content-grid img');
        if (powerupsGridImage) {
          powerupsGridImage.src = '/powerups/row.webp';
          powerupsGridImage.alt = 'Salmon Powerups';
        }

        // The template fades one child of the screen per scroll step and calls
        // play()/pause() on the first two; they become empty markers with no-op
        // media methods. The phone is a mock that draws the Powerups flow at the
        // section's scroll progress, sent from here on every frame it changes.
        var powerupsScreen = document.querySelector('#program .card-content-screen');
        var powerupsList = document.querySelector('#program .card-content-list');
        if (powerupsScreen && powerupsList) {
          Array.prototype.slice.call(powerupsScreen.children, 0, 3).forEach(function (current) {
            var marker = document.createElement('div');
            marker.className = 'salmon-step-marker';
            marker.play = marker.pause = function () {};
            current.replaceWith(marker);
          });
          powerupsScreen.classList.add('salmon-phone-screen');
          var flowFrame = document.createElement('iframe');
          flowFrame.src = '/phone-preview?flow=powerups';
          flowFrame.title = 'Turning on the Swap Powerup in Salmon';
          flowFrame.tabIndex = -1;
          powerupsScreen.appendChild(flowFrame);

          // p is 0 when the copy list's top crosses the middle of the viewport
          // and 1 when its bottom does. A mouse wheel jumps, so the drawn
          // progress eases toward it; touch scrolling is already smooth and maps
          // directly. Reduced motion shows one still screen per copy step.
          var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          var directScroll = reduceMotion || window.matchMedia('(pointer: coarse)').matches;
          var target = -1, drawn = -1, sent = null, frame = 0;
          var measure = function () {
            var rect = powerupsList.getBoundingClientRect();
            var p = (window.innerHeight / 2 - rect.top) / rect.height;
            if (reduceMotion) p = p < 0 ? -1 : p < 0.35 ? 0.27 : p < 0.6 ? 0.57 : 1;
            target = Math.max(-1, Math.min(1.05, p));
          };
          var post = function () {
            var p = Math.round(drawn * 2000) / 2000;
            if (p === sent || !flowFrame.contentWindow) return;
            sent = p;
            flowFrame.contentWindow.postMessage({ type: 'salmon-powerups-progress', progress: p }, window.location.origin);
          };
          var tick = function () {
            frame = 0;
            drawn = directScroll ? target : drawn + (target - drawn) * 0.12;
            if (Math.abs(target - drawn) < 0.0005) drawn = target;
            post();
            if (drawn !== target) frame = requestAnimationFrame(tick);
          };
          var onScroll = function () {
            measure();
            if (!frame) frame = requestAnimationFrame(tick);
          };
          window.addEventListener('scroll', onScroll, { passive: true });
          window.addEventListener('resize', onScroll);
          flowFrame.addEventListener('load', function () { measure(); drawn = target; sent = null; post(); });
        }

        var salmonHeading = document.querySelector('#salmon > h2');
        var ownershipIcon = document.querySelector('#salmon .section-rectangle');
        if (ownershipIcon) ownershipIcon.innerHTML = '<img src="/images/logo.svg" alt="Salmon">';

        var ownershipCard = document.querySelector('#salmon-card-0');
        if (ownershipCard && salmonHeading) ownershipCard.prepend(salmonHeading);
        if (ownershipCard && ownershipIcon) ownershipCard.prepend(ownershipIcon);

        var parallaxCard = document.querySelector('#salmon-card-2');
        if (parallaxCard) parallaxCard.remove();
      }
      function initSalmonStandalone() {
        var powerupsPercent = document.querySelector('#program-card-content-percent-w');
        if (powerupsPercent) powerupsPercent.remove();
      }
      applySalmonCopy();
      if (document.readyState !== 'complete') {
        window.addEventListener('load', initSalmonStandalone, { once: true });
      } else {
        initSalmonStandalone();
      }
    </script>`;

  return new Response(finalHtml, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
