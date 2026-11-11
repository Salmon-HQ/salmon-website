import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { comingSoonCss, comingSoonHtml } from '@/components/coming-soon/coming-soon';
import { consentCss, consentHtml, consentScript } from '@/components/consent/consent';
import { downloadsCss, downloadsHtml, footerCss, footerHtml } from '@/components/footer/site-footer';
import { HOME_DESCRIPTION, HOME_TITLE, SHARING_IMAGE, SITE_URL, structuredData } from '@/lib/site';

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
      // A hung API must not hold the page: the fallback snapshot is shown instead.
      signal: AbortSignal.timeout(1500),
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


const getSalmonCardHtml = `<h3 class="salmon-get-title">Get Salmon</h3><p class="salmon-get-subtitle"><span>A reason to arrive.</span> <span>A wallet designed to stay.</span></p>${downloadsHtml}`;


// Features (Stake, Swap and Pay live in the Powerups section): each word and its tile are one list item, so the word
// is centred on its tile by layout. The tile is the site's section icon tile
// (.section-rectangle) laid in perspective. The glyphs are the app's Phosphor
// marks, the same geometry as components/hero/wallet-icons (a route handler
// cannot render React to markup). NFTs is the app's Image.
const INTRO_ITEMS = [
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
] as { word: string; glyph: string }[];

const introListHtml = (items: typeof INTRO_ITEMS, hidden: boolean) =>
  `<ul class=salmon-intro-row${hidden ? ' aria-hidden=true' : ''}>${items.map(
    ({ word, glyph }) =>
      `<li class=salmon-intro-item><span class=salmon-intro-word>${word}</span><span class=salmon-intro-tile aria-hidden=true><span class="section-rectangle salmon-intro-face"><svg viewBox="0 0 256 256"><g fill="none" stroke="#ff5c45" stroke-width="24" stroke-linecap="round" stroke-linejoin="round">${glyph}</g></svg></span></span></li>`,
  ).join('')}</ul>`;

// Each strip holds its list twice: the track slides one list's width and starts over.
const introMarquee = (items: typeof INTRO_ITEMS) =>
  `<div class=salmon-intro-marquee><div class=salmon-intro-track>${introListHtml(items, false)}${introListHtml(items, true)}</div></div>`;
const introRowHtml = introMarquee(INTRO_ITEMS);
// Opens the cream Powerups card: title, context and "Add more" on the first screen, then the row and demo.
const powerupsIntroHtml = `<div class=salmon-powerups-intro><h2 class=salmon-powerups-title>Powerups</h2><p class=salmon-add-more><span class="salmon-reveal-w salmon-orange">Add</span> <span class=salmon-reveal-w>more</span> <span class="salmon-reveal-w salmon-orange">when you need</span> <span class=salmon-reveal-w>more<span class=salmon-orange>.</span></span></p></div>`;
const SCREENS = [
  { screen: 'swap-review', title: 'Swap', powerup: true, alt: 'Swap review in Salmon: SOL to USDC with rate, fee and minimum received', copy: 'Trade tokens without leaving your wallet. Rate and fees are shown before you confirm.' },
  { screen: 'payments', title: 'Payments', powerup: true, alt: 'Payment request in Salmon: QR code for 25 USDC waiting for payment', copy: 'Request a payment with a QR code and follow its status until it arrives.' },
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

// The fin in AVIF (WebP fallback) at the width the card draws it: at most 4.13573 × the 18.75vw phone, the card's
// width on mobile.
const finPicture = (name: 'fin-back' | 'fin-front') =>
  `<picture><source type="image/avif" sizes="(max-width: 750px) 100vw, 78vw" srcset="/fin/${name}-800.avif 800w, /fin/${name}-1400.avif 1400w, /fin/${name}-2260.avif 2260w"><img class=salmon-fin-${name.slice(4)} src=/fin/${name}.webp sizes="(max-width: 750px) 100vw, 78vw" srcset="/fin/${name}-800.webp 800w, /fin/${name}-1400.webp 1400w, /fin/${name}.webp 2260w" alt="" loading="lazy" decoding="async"></picture>`;

// Media the template downloads but the page never shows lose their src (the phone frames, the Powerups screen's
// videos and last slide, which the script turns into markers, the removed parallax card); the Powerups grid gets its
// row before the browser asks for the template's 2 MB PNG; the rest come in AVIF/WebP.
function lighterImages(html: string) {
  return html
    .replace(/<img src=\/reference-assets\/media\/(?:left|right|program\/04)\.png\?\d+ alt="">/g, '<img alt="">')
    .replace(/(<video muted playsinline) src=\/reference-assets\/media\/program\/0[01]\.mp4\?\d+/g, '$1')
    // #salmon-card-2 is removed by the script below once the DOM is parsed.
    .replace(/<img src=\/reference-assets\/media\/salmon\/card-2\/00\.png\?\d+>/, '<img alt="">')
    .replace(
      /<img src=\/reference-assets\/media\/program\/01\.png\?\d+ alt="">/,
      '<img src=/powerups/row.webp alt="Salmon Powerups" decoding=async>',
    )
    .replace('<img class=salmon-fin-back src=/fin/fin-back.webp alt="" loading="lazy">', finPicture('fin-back'))
    .replace('<img class=salmon-fin-front src=/fin/fin-front.webp alt="" loading="lazy">', finPicture('fin-front'))
    .replace(
      'background-image:url(/reference-assets/media/salmon/00.jpg)',
      'background-image:url(/reference-assets/media/salmon/00.webp);background-image:image-set(url(/reference-assets/media/salmon/00.avif) type("image/avif"),url(/reference-assets/media/salmon/00.webp) type("image/webp"))',
    )
    // Template assets that are no longer in public/: its Sofia font (DM Sans replaces it) and the backgrounds of the
    // hero card (overridden below) and of the removed #video section.
    .replace(/@font-face\{font-family:sofia;[^}]*\}/g, '')
    .replace(/;background-image:url\(\/reference-assets\/media\/(?:hero\/01|video\/00)\.jpg\)/g, '');
}

export async function GET() {
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
  const withHeadline = lighterImages(withoutOriginalMetadata).replace(
    '<h1> Total salmon.<br> Totally different. </h1>',
    '<h1> <span class="salmon-h1-strong">One wallet.</span><br> Only what you need. </h1>',
  );
  const withSalmonPhone = withHeadline.replace(
    /<div class=card-content-screen><video[^>]*hero\/00\.mp4[\s\S]*?<\/video><\/div>/,
    '<div class="card-content-screen salmon-phone-screen"><iframe src="/phone-preview" title="Salmon Wallet" tabindex="-1"></iframe></div>',
  );
  const withDownloadLink = withSalmonPhone.replace(
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
  const powerupsCopy = withoutShop.match(/<p id=program-card-content-intro>[\s\S]*?<\/p>/)?.[0] ?? '';
  const withScreens = withoutShop
    .replace(powerupsCopy, '')
    .replace(/<ul id=intro-list>[\s\S]*?<\/ul>\s*<div id=intro-img>[\s\S]*?<\/div>/, () => introRowHtml)
    .replace(/(<section id=program class=section>[\s\S]*?<div class=card-content>)/, (open) => open + powerupsIntroHtml)
    // The Swap demo (phone between its shims, then the step copy) gets its own box so the sticky phone lets go
    // where the demo ends, and Coming soon closes the cream card under it, a card inside the card.
    .replace(
      /(<section id=program class=section>[\s\S]*?)(<div class=card-content-phone-shim><\/div> <div class=card-content-phone-sticky>[\s\S]*?<div class=card-content-list>[\s\S]*?<\/ul> <\/div>)/,
      (_, before, demo) => `${before}<div class=salmon-powerups-demo>${demo}</div>${comingSoonHtml}`,
    )
    // "Wallets became mega-apps" leaves the Powerups card for the spot between the title and "Add more".
    .replace('<h2 class=salmon-powerups-title>Powerups</h2>', (title) => title + powerupsCopy)
    // "Inside the app" is off for now; uncomment to show it again.
    // .replace(/<section id=salmon class=section>/, () => `${screensSectionHtml}<section id=salmon class=section>`)
    // Powerups loses its icon tile; its title opens the cream card (powerupsIntroHtml).
    .replace(/(<section id=program class=section>) <div class=section-rectangle>[\s\S]*?<\/svg> <\/div> <h2>Powerups<\/h2>/, '$1')
    // Step copy: key words in the accent, so each step reads at a glance.
    .replace('Add only the capabilities', 'Add <span class=salmon-key>only</span> the capabilities')
    .replace('<p>Turn it on when you need it. You decide what', '<p><span class=salmon-key>Turn it on</span> when you need it. <span class=salmon-key>You decide</span> what')
    .replace('Keep your wallet lean.', 'Keep your wallet <span class=salmon-key>lean</span>.')
    .replace('everything else remains optional.', 'everything else remains <span class=salmon-key>optional</span>.')
    // Real ownership opens on its title, without the icon tile.
    .replace(/(<section id=salmon class=section>) <div class=section-rectangle>[\s\S]*?<\/svg> <\/div>/, '$1')
    // Light shafts from the water's surface, behind everything in the card.
    .replace('<div id=salmon-card-0>', '<div id=salmon-card-0><div class=salmon-rays aria-hidden=true></div>')
    // "Add more when you need more." moves up between the Powerups title and "Coming soon" (introRowHtml).
    .replace(' <p>Add more when you need more.</p>', '')
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
    <meta name="description" content="${HOME_DESCRIPTION}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${HOME_TITLE}">
    <meta property="og:description" content="${HOME_DESCRIPTION}">
    <meta property="og:image" content="${SHARING_IMAGE.url}">
    <meta property="og:image:width" content="${SHARING_IMAGE.width}">
    <meta property="og:image:height" content="${SHARING_IMAGE.height}">
    <meta property="og:image:alt" content="${SHARING_IMAGE.alt}">
    <meta property="og:url" content="${SITE_URL}/">
    <meta property="og:site_name" content="Salmon Wallet">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${HOME_TITLE}">
    <meta name="twitter:description" content="${HOME_DESCRIPTION}">
    <meta name="twitter:image" content="${SHARING_IMAGE.url}">
    <meta name="twitter:image:alt" content="${SHARING_IMAGE.alt}">
    <link rel="canonical" href="${SITE_URL}/">
    <link rel="manifest" href="/manifest.webmanifest">
    <link rel="api-catalog" href="/.well-known/api-catalog">
    <script type="application/ld+json">${JSON.stringify(structuredData()).replace(/</g, '\\u003c')}</script>
    <link rel="icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/images/app-icon.png">
    <title>${HOME_TITLE}</title>
    <style>
      @font-face { font-family: "DM Sans"; src: url("/reference-assets/font/dm-sans-400.woff2") format("woff2"); font-weight: 400; font-style: normal; font-display: swap; }
      @font-face { font-family: "DM Sans"; src: url("/reference-assets/font/dm-sans-500.woff2") format("woff2"); font-weight: 500; font-style: normal; font-display: swap; }
      @font-face { font-family: "DM Sans"; src: url("/reference-assets/font/dm-sans-600.woff2") format("woff2"); font-weight: 600; font-style: normal; font-display: swap; }
      @font-face { font-family: "DM Sans"; src: url("/reference-assets/font/dm-sans-700.woff2") format("woff2"); font-weight: 700; font-style: normal; font-display: swap; }
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
        width: 32px;
        height: 32px;
        background: url("/images/logo-orange.svg") center / contain no-repeat;
      }
      #nav-logo::after {
        content: "Salmon";
        display: block;
        width: auto;
        height: auto;
        color: #10131c;
        font-size: 27px;
        font-weight: 700;
        line-height: 1;
        letter-spacing: -0.04em;
        transition: color .2s cubic-bezier(.215,.61,.355,1);
      }
      /* Logo sized to the Download now button and centred on it (button: top 24px, 54px tall). */
      #nav-logo { top: 35px !important; height: 32px !important; }
      #nav .soon { background: #ff5c45 !important; box-shadow: 0 8px 30px 0 rgba(255,92,69,.3) !important; }
      /* Mirrors the logo's inset from the left edge (template: 40px, 6.15385vw on mobile). */
      #nav .soon { right: 40px !important; }
      #nav .soon-txt { color: #fff !important; -webkit-text-fill-color: #fff !important; font-weight: 600; }
      /* The template toggles .fx over #salmon (no longer black, so it changes
         nothing) and .hide over the footer. */
      /* White header band: solid down to the Download now button's bottom edge
         (78px desktop, 56px mobile), then an 18px fade so sections slide under it. */
      #nav::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 96px;
        /* No var() inside the gradient: Dark Reader skips gradients that contain one and leaves the band white. */
        background: linear-gradient(to bottom, #fff 0, #fff 78px, rgba(255,255,255,0) 100%);
        pointer-events: none;
        transition: opacity .2s cubic-bezier(.215,.61,.355,1);
      }
      /* Over the dark footer the template hides the logo; the band and Download now leave with it. */
      #nav:has(#nav-logo.hide)::before { opacity: 0; }
      #nav .soon { transition: opacity .2s cubic-bezier(.215,.61,.355,1); }
      #nav:has(#nav-logo.hide) .soon { opacity: 0; pointer-events: none; }
      #nav-logo { transition: opacity .2s cubic-bezier(.215,.61,.355,1); }
      #nav-logo.hide { opacity: 0; pointer-events: none; }
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
      #hero .p .salmon-copy-deep { color: #a12a2a; }
      #nav .soon-icon { display: none !important; }
      #nav .soon > div { display: flex; align-items: center; justify-content: center; }
      #hero h1 {
        background: linear-gradient(155deg, #ff7e6d 0%, #ff5c45 55%, #a12a2a 100%) !important;
        -webkit-background-clip: text !important;
        background-clip: text !important;
        color: transparent !important;
        -webkit-text-fill-color: transparent !important;
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
      /* Cream Powerups card, so the template's scroll clip shows: it opens to full width as the row comes in
         and closes back into a rounded card as the demo leaves. Its static shadow stays off (it would not follow the clip). */
      #program .card-content {
        background-color: #fff7f4 !important;
      }
      /* The card's clip is driven by salmonPowerupsCardClip() (it opens when the Swap phone detaches from the row),
         which outranks the template's inline clip-path. Fallbacks are the closed card until the script runs. */
      #program .card-content {
        -webkit-clip-path: inset(0 var(--salmon-card-inset, 64px) round var(--salmon-card-radius, 45px)) !important;
        clip-path: inset(0 var(--salmon-card-inset, 64px) round var(--salmon-card-radius, 45px)) !important;
      }
      @media (max-width: 750px) {
        #program .card-content {
          -webkit-clip-path: inset(0 var(--salmon-card-inset, 16px) round var(--salmon-card-radius, 24px)) !important;
          clip-path: inset(0 var(--salmon-card-inset, 16px) round var(--salmon-card-radius, 24px)) !important;
        }
      }
      /* The Powerups row: each tile casts a soft shadow onto the card, as deep as the feature slabs'. The row is
         one transparent image, so drop-shadow follows each tile's outline. */
      #program .salmon-phone-screen,
      #program-card-content-grid img { filter: drop-shadow(0 2.2vw 2.4vw rgba(16,19,28,.2)) drop-shadow(0 .4vw .6vw rgba(16,19,28,.08)); }
      #program .card-shadow {
        display: none !important;
      }
      /* Desktop: the step copy alternates sides around the phone, the middle step mirrored to the right. */
      @media (min-width: 751px) {
        #program .card-content-list-sticky li:nth-child(2) {
          left: calc(100vw - 2 * (64px + 2.5vw) - 23.61111vw);
        }
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
      /* The intro lines keep the template's #intro p look now that they sit in the Powerups card. */
      .salmon-powerups-intro p {
        margin-left: auto;
        margin-right: auto;
        width: 50vw;
        letter-spacing: -.0475em;
        text-align: center;
      }
      .salmon-powerups-intro p {
        margin-top: 3.5vw !important;
        font-size: 3.2vw !important;
        line-height: 1.1 !important;
      }
      /* Real ownership (#salmon) shares the Powerups header sizes. */
      /* One gap between stacked cards: Powerups → Real ownership. */
      :root { --salmon-section-gap: 6vw; }
      #program.section,
      #salmon.section {
        padding-top: var(--salmon-section-gap) !important;
      }
      /* "Powerups" keeps the section title look. */
      .salmon-powerups-title {
        padding-top: 6vw;
        font-size: 7vw;
        line-height: 1;
        letter-spacing: -.0575em;
        text-align: center;
      }
      /* Every card opens its title at Real ownership's distance from the card top: the card's padding plus the title's. */
      :root { --salmon-card-top: 6vw; --salmon-card-title-top: 1.8vw; }
      #hero h1 { padding-top: calc(var(--salmon-card-top) + var(--salmon-card-title-top)) !important; }
      #salmon-card-0 > h2 {
        padding-top: var(--salmon-card-title-top) !important;
        font-size: 7vw !important;
        line-height: 1 !important;
      }
      /* Orange words share the "Let's fix that." gradient, darker at the end. */
      #hero .p .salmon-copy-accent,
      #hero .p .salmon-copy-soft,
      .card-content-list-sticky-copy .salmon-key,
      .salmon-orange {
        background-image: linear-gradient(155deg, #ff7e6d 0%, #ff5c45 55%, #a12a2a 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent !important;
        -webkit-text-fill-color: transparent !important;
        -webkit-box-decoration-break: clone;
        box-decoration-break: clone;
      }
      /* Powerups intro: title, context (90% of the intro size) and "Add more", then the row and demo. */
      .salmon-powerups-intro { padding: var(--salmon-card-top) 0 24px; }
      /* "Powerups" is set like the hero's "One wallet.": same size, weight and orange gradient. */
      .salmon-powerups-intro .salmon-powerups-title {
        padding-top: var(--salmon-card-title-top);
        font-size: 5.625vw;
        line-height: 1.04;
        font-weight: 600;
        background: linear-gradient(155deg, #ff7e6d 0%, #ff5c45 55%, #a12a2a 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
      }
      #program #program-card-content-intro { width: 50vw; margin: 3.5vw auto 0 !important; font-size: 2.88vw !important; line-height: 1.1 !important; }
      #program p.salmon-add-more span { color: #10131c; }
      /* "Add more" lights up word by word once, when it comes into view (salmonReveal in the script). */
      .salmon-reveal-w { display: inline-block; opacity: .12; transform: translateY(.12em); transition: opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1); }
      .salmon-reveal-w.on { opacity: 1; transform: none; }
      @media (prefers-reduced-motion: reduce) {
        .salmon-reveal-w { opacity: 1; transform: none; transition: none; }
      }
      /* Powerups starts right under "Add more when you need more."; the row image carries its own top margin. */
      #program.section { padding-top: 0 !important; }
      #program .card {
        margin-top: 0 !important;
      }
      #program .card-content-screen > video:first-child {
        opacity: 1 !important;
      }
      #hero .card-content-phone > img,
      #program .card-content-phone > img {
        display: none !important;
      }
      #hero .card-content-screen,
      #program .card-content-screen {
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
      #program .card-content-screen {
        --bezel: 1.02vw;
      }
      .shim-not-null #hero .card-content-screen,
      .shim-not-null #program .card-content-screen {
        width: calc(18.75vw - 2 * var(--bezel));
        height: calc(39.93vw - 2 * var(--bezel));
        border-radius: calc(2.78vw - var(--bezel));
      }
      .shim-null #hero .card-content-screen,
      .shim-null #program .card-content-screen {
        width: calc(22.43vh - 2 * var(--bezel));
        height: calc(47.76vh - 2 * var(--bezel));
        border-radius: calc(3.32vh - var(--bezel));
      }
      #hero .card-content-screen::before,
      #program .card-content-screen::before {
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
        /* 100cqw below is the card's width, so the fin can be fitted to it. */
        container-type: inline-size;
        isolation: isolate;
        margin-top: 0 !important;
        padding-top: var(--salmon-card-top) !important;
        padding-bottom: var(--salmon-card-top);
        color: #fff;
      }
      /* Warm light rising from the card's bottom edge, where the fin sits. */
      #salmon-card-0::before {
        content: "";
        position: absolute;
        z-index: -1;
        inset: auto 0 0;
        height: 55%;
        background: linear-gradient(to top, rgba(255,92,69,.16), rgba(255,92,69,.05) 45%, rgba(255,92,69,0));
        pointer-events: none;
      }
      /* The card seen from under the water: a bright band where the surface is, and soft parallel shafts
         coming down from it that fade out before the fin. Two shaft layers with different spacing sway on
         different periods, so the light never repeats; only transform animates (stripes and blur raster once). */
      .salmon-rays {
        position: absolute;
        z-index: -1;
        inset: 0;
        overflow: hidden;
        border-radius: inherit;
        background: linear-gradient(to bottom, rgba(255, 214, 196, .13), rgba(255, 214, 196, 0) 9%);
        pointer-events: none;
      }
      .salmon-rays::before,
      .salmon-rays::after {
        content: "";
        position: absolute;
        top: -10%;
        left: -25%;
        width: 150%;
        height: 85%;
        background: repeating-linear-gradient(104deg, transparent 0 3vw, rgba(255, 196, 170, .55) 5vw, transparent 8vw 13vw);
        filter: blur(1vw);
        -webkit-mask-image: linear-gradient(to bottom, #000, transparent 85%);
        mask-image: linear-gradient(to bottom, #000, transparent 85%);
        opacity: .2;
        transform-origin: 50% 0;
        animation: salmon-rays-sway 14s ease-in-out infinite alternate;
      }
      .salmon-rays::after {
        background: repeating-linear-gradient(98deg, transparent 0 5vw, rgba(255, 170, 140, .5) 6.5vw, transparent 9vw 17vw);
        opacity: .16;
        animation-duration: 21s;
        animation-direction: alternate-reverse;
      }
      @keyframes salmon-rays-sway {
        from { transform: rotate(-2deg) translateX(-2%); }
        to { transform: rotate(2deg) translateX(2%); }
      }
      @media (prefers-reduced-motion: reduce) {
        .salmon-rays::before,
        .salmon-rays::after { animation: none; }
      }
      #salmon-card-0 > p {
        margin-top: 3vw !important;
      }
      /* The salmon fin holding the phone: two renders from blender/fin.py
         (docs/fin-preproduction.md), the back one under the CSS phone and the
         front one over its live screen. Both renders frame the phone and the
         whole fin, so this box is their frame and the phone sits inside it.
         The numbers are the script's "FIN CSS" output divided by 18.75vw, the
         width it renders the phone at. */
      #salmon-card-0-phone {
        --phone-max: 18.75vw;
        /* The template's phone size, shrunk when needed so the box fits the
           card's width and the viewport under the header band (96px). */
        --phone-w: min(var(--phone-max), 100cqw / 4.13573, (100svh - 96px - 32px) / 3.42203);
        /* Phone and fin float as one piece: a slow rise and a slight sway
           around the box's centre, inside the render's margin. */
        animation: salmon-fin-float 7s ease-in-out infinite;
      }
      .shim-null #salmon-card-0-phone { --phone-max: 22.43vh; }
      #salmon #salmon-card-0-phone {
        width: calc(4.13573 * var(--phone-w));
        height: calc(3.42203 * var(--phone-w));
        /* The phone, not the box, sits on the card's centre line. The screen's
           left below is its centre (the template translates it -50%). */
        margin: 3vw 0 0 calc(50% - 3.19509 * var(--phone-w));
      }
      @keyframes salmon-fin-float {
        0%, 100% { translate: 0 0; rotate: 0deg; }
        50% { translate: 0 calc(-.06 * var(--phone-w)); rotate: -.8deg; }
      }
      @media (prefers-reduced-motion: reduce) {
        #salmon-card-0-phone { animation: none; }
      }
      /* A soft orange light behind phone and fin, fading out before the box's edges. */
      #salmon-card-0-phone::before {
        content: "";
        position: absolute;
        z-index: 0;
        inset: 0;
        background: radial-gradient(closest-side, rgba(255,92,69,.26), rgba(255,92,69,.09) 55%, rgba(255,92,69,0));
        pointer-events: none;
      }
      #salmon-card-0-phone img.salmon-fin-back,
      #salmon-card-0-phone img.salmon-fin-front {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform: none;
        pointer-events: none;
      }
      /* The fin rises out of the card: its tail, at the box's lower left, fades
         in toward the phone so no edge of it reads as a cut. */
      #salmon-card-0-phone img.salmon-fin-back {
        z-index: 1;
        -webkit-mask-image: linear-gradient(55deg, transparent 16%, #000 50%);
        mask-image: linear-gradient(55deg, transparent 16%, #000 50%);
      }
      #salmon-card-0-phone img.salmon-fin-front { z-index: 3; }
      /* The phone, in the same proportions as the hero's, scaled by --phone-w. */
      #salmon-card-0 .card-content-screen {
        --bezel: calc(.0544 * var(--phone-w));
        left: calc(3.19509 * var(--phone-w));
        top: calc(1.12357 * var(--phone-w));
        width: calc(var(--phone-w) - 2 * var(--bezel));
        height: calc(2.1296 * var(--phone-w) - 2 * var(--bezel));
        border-radius: calc(.14827 * var(--phone-w) - var(--bezel));
        background: #161c2d;
        box-shadow:
          0 0 0 calc(.048 * var(--phone-w)) #080a0f,
          0 0 0 var(--bezel) #ff7e6d,
          0 calc(.11733 * var(--phone-w)) calc(.26667 * var(--phone-w)) rgba(16,19,28,.28);
      }
      #salmon-card-0 .card-content-screen::before {
        content: "";
        position: absolute;
        z-index: 7;
        top: calc(.03467 * var(--phone-w));
        left: 50%;
        width: calc(.27733 * var(--phone-w));
        height: calc(.06667 * var(--phone-w));
        border-radius: 999px;
        background: #080a0f;
        transform: translateX(-50%);
      }
      #salmon-card-1.salmon-get-card {
        box-sizing: border-box;
        min-height: 38vw;
        padding: 8vw 5vw;
        background-image: linear-gradient(120deg, #161c2d 0%, #10131c 58%, #321b20 100%) !important;
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
      ${downloadsCss}
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
      ${footerCss}
      ${consentCss}
      ${comingSoonCss}
      /* The features as an endless strip of columns of the same width and gap,
         each a word over its tile. Every tile carries its own perspective (the
         transform's perspective(), not a shared one on the row), so its
         vanishing point is its own centre and it reads the same wherever the
         strip has carried it. The strip stops while the pointer is on a tile; each tile
         floats on its own beat, lifts on hover and dips when pressed. */
      .salmon-intro-marquee {
        overflow: hidden;
        padding: 0 0 10vw;
        /* Sides fade, and so does the bottom: the tiles' long shadow dissolves before the box edge instead of being cut there. */
        -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent), linear-gradient(to bottom, #000 70%, transparent);
        -webkit-mask-composite: source-in;
        mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent), linear-gradient(to bottom, #000 70%, transparent);
        mask-composite: intersect;
      }
      /* Both strips at 80% of their drawn size; zoom scales the vw sizes, gaps and shadows together. */
      .salmon-intro-marquee { zoom: .8; }
      .salmon-intro-track {
        display: flex;
        width: max-content;
        animation: salmon-intro-slide 24s linear infinite;
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
        color: #d9d9db;
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
      .salmon-visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
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
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 4vw 3vw;
        max-width: 72vw;
        margin: 6vw auto 0;
        padding: 0;
        list-style: none;
      }
      .salmon-screens-list figure { margin: 0; }
      /* Five screens: three on top, two centred under them. */
      .salmon-screens-list li { grid-column: span 2; }
      .salmon-screens-list li:nth-child(4) { grid-column: 2 / span 2; }
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
        #nav-logo { top: 21px !important; height: 26px !important; gap: 8px !important; }
        #nav::before {
          height: 74px;
          background: linear-gradient(to bottom, #fff 0, #fff 56px, rgba(255,255,255,0) 100%);
        }
        #nav .soon { right: 6.15385vw !important; }
        #nav-logo::before { width: 26px; height: 26px; }
        #nav-logo::after { font-size: 22px; }
        #salmon { padding-bottom: calc(16px + 24px); }
        #salmon-validator { display: block; padding: 80px 6.15vw 96px; }
        .salmon-validator-lead { margin-bottom: 40px; }
        .salmon-validator-stats li { padding: 24px 20px; }
        .salmon-validator-foot { padding: 20px; }
        .salmon-powerups-intro p { width: 87.17949vw; margin-top: 8vw !important; font-size: 8.5vw !important; }
        #program #program-card-content-intro { width: 87.17949vw; margin-top: 6vw !important; font-size: 7.65vw !important; }
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
        .salmon-screens-list li, .salmon-screens-list li:nth-child(4) { grid-column: auto; scroll-snap-align: start; }
        .salmon-screens-phone { border-radius: calc(6vw - var(--bezel)); }
        :root { --salmon-section-gap: 14vw; }
        :root { --salmon-card-top: 12vw; --salmon-card-title-top: 4vw; }
        #salmon-card-0 > h2 { font-size: 15vw !important; }
        .salmon-powerups-title { padding-top: 14vw; font-size: 15vw; }
        .salmon-powerups-intro .salmon-powerups-title { padding-top: var(--salmon-card-title-top); font-size: 12.30769vw; letter-spacing: -.0375em; }
        /* The card is narrower than the page, so the title shrinks to stay on one line. */
        #salmon-card-0 > h2 { font-size: 13vw !important; }
        #salmon-card-0 > p { margin-top: 8vw !important; }
        #salmon #salmon-card-0-phone { margin-top: 8vw; }
        /* Phones read larger on phones. Hero and Powerups grow by --salmon-phone-k (the row image with them, so
           the Powerups phone still lands on its slot and the side tiles crop at the card's edges); the ceiling
           keeps the Powerups phone above the viewport's bottom, as its sticky sits at 18%. */
        .shim-null { --salmon-phone-k: 1.22; }
        .shim-null #hero .card-content-screen,
        .shim-null #program .card-content-screen {
          width: calc(22.43vh * var(--salmon-phone-k) - 2 * var(--bezel));
          height: calc(47.76vh * var(--salmon-phone-k) - 2 * var(--bezel));
          border-radius: calc(3.32vh * var(--salmon-phone-k) - var(--bezel));
        }
        .shim-null #program-card-content-grid img { transform: translateX(-50%) scale(var(--salmon-phone-k)); }
        /* Each step's copy sits centred in the space between the header band (56px) and the phone's top,
           which is its sticky's 18% plus half the viewport, less half the phone. */
        .shim-null #program .card-content-list-sticky-copy {
          display: flex;
          align-items: center;
          justify-content: center;
          height: calc(68vh - 23.88vh * var(--salmon-phone-k) - 56px);
          margin-top: 56px;
          padding: 0 4vw;
        }
        .shim-null #program .card-content-list-sticky-copy p {
          font-size: 7.2vw;
          line-height: 1.15;
          text-align: center;
        }
        /* Real ownership: the phone is sized by the screen, not by the card, and the fin runs past the card's
           sides, cropped there; its tail already fades in. */
        #salmon-card-0 { overflow: clip; }
        #salmon-card-0-phone { --phone-w: min(40vw, (100svh - 96px - 32px) / 3.42203); }
        #salmon-card-1.salmon-get-card { min-height: auto; padding: 72px 24px; }
        #salmon-card-1 .salmon-get-title { margin-bottom: 14px; }
        #salmon-card-1 .salmon-get-subtitle { margin-bottom: 48px; }
        #salmon-card-1 .salmon-downloads { display: flex; gap: 0; }
        #salmon-card-1 .salmon-download { --d: min(112px, 23vw); }
        #hero .card-content-screen,
        #program .card-content-screen {
          box-shadow:
            0 0 0 2.2vw #080a0f,
            0 0 0 2.55vw #ff7e6d,
            0 5vw 12vw rgba(16,19,28,.28);
        }
        #hero .card-content-screen,
        #program .card-content-screen { --bezel: 2.55vw; }
        #hero .card-content-screen::before,
        #program .card-content-screen::before {
          top: 1.6vw;
          width: 13vw;
          height: 3vw;
        }
      }
      /* The template left two 17.36vw gaps between the hero sentence and the strip; one 64px gap remains. */
      #hero .p { padding-bottom: 0 !important; }
      #intro { margin-top: clamp(40px, 4.4vw, 64px) !important; }
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
          // unlock runs 0 → 1 from the moment the phone leaves the row (its sticky wrapper starts sticking) to the
          // moment the first step starts (p = 0): the app's unlock wait is drawn at that point of the scroll.
          // Both distances move one-for-one with the scroll, so their sum is the segment's fixed length.
          var powerupsSticky = document.querySelector('#program .card-content-phone-sticky');
          var target = -1, drawn = -1, sent = null, unlockTarget = 0, unlockDrawn = 0, sentUnlock = null, frame = 0;
          var measure = function () {
            var rect = powerupsList.getBoundingClientRect();
            var p = (window.innerHeight / 2 - rect.top) / rect.height;
            if (reduceMotion) p = p < 0 ? -1 : p < 0.35 ? 0.27 : p < 0.6 ? 0.57 : 1;
            target = Math.max(-1, Math.min(1.05, p));
            if (powerupsSticky && powerupsSticky.previousElementSibling) {
              var past = (parseFloat(getComputedStyle(powerupsSticky).top) || 0) - powerupsSticky.previousElementSibling.getBoundingClientRect().bottom;
              var ahead = rect.top - window.innerHeight / 2;
              var u = past <= 0 ? 0 : ahead <= 0 ? 1 : past / (past + ahead);
              unlockTarget = reduceMotion ? (u < 0.5 ? 0 : 1) : u;
            }
          };
          var post = function () {
            var p = Math.round(drawn * 2000) / 2000;
            var u = Math.round(unlockDrawn * 1000) / 1000;
            if ((p === sent && u === sentUnlock) || !flowFrame.contentWindow) return;
            sent = p;
            sentUnlock = u;
            flowFrame.contentWindow.postMessage({ type: 'salmon-powerups-progress', progress: p, unlock: u }, window.location.origin);
          };
          var tick = function () {
            frame = 0;
            drawn = directScroll ? target : drawn + (target - drawn) * 0.12;
            unlockDrawn = directScroll ? unlockTarget : unlockDrawn + (unlockTarget - unlockDrawn) * 0.12;
            if (Math.abs(target - drawn) < 0.0005) drawn = target;
            if (Math.abs(unlockTarget - unlockDrawn) < 0.0005) unlockDrawn = unlockTarget;
            post();
            if (drawn !== target || unlockDrawn !== unlockTarget) frame = requestAnimationFrame(tick);
          };
          var onScroll = function () {
            measure();
            if (!frame) frame = requestAnimationFrame(tick);
          };
          window.addEventListener('scroll', onScroll, { passive: true });
          window.addEventListener('resize', onScroll);
          flowFrame.addEventListener('load', function () { measure(); drawn = target; unlockDrawn = unlockTarget; sent = sentUnlock = null; post(); });
        }

        var salmonHeading = document.querySelector('#salmon > h2');

        var ownershipCard = document.querySelector('#salmon-card-0');
        if (ownershipCard && salmonHeading) ownershipCard.prepend(salmonHeading);

        var parallaxCard = document.querySelector('#salmon-card-2');
        if (parallaxCard) parallaxCard.remove();
      }
      function initSalmonStandalone() {
        var powerupsPercent = document.querySelector('#program-card-content-percent-w');
        if (powerupsPercent) powerupsPercent.remove();
      }
      // "Add more": its words light up one after another the first time it is on screen.
      function salmonReveal() {
        var line = document.querySelector('.salmon-add-more');
        if (!line) return;
        var words = line.querySelectorAll('.salmon-reveal-w');
        if (!('IntersectionObserver' in window)) { words.forEach(function (word) { word.classList.add('on'); }); return; }
        var seen = new IntersectionObserver(function (entries) {
          if (!entries[0].isIntersecting) return;
          seen.disconnect();
          words.forEach(function (word, i) { setTimeout(function () { word.classList.add('on'); }, i * 350); });
        }, { threshold: 0.6 });
        seen.observe(line);
      }
      // The cream Powerups card stays a rounded card while the row scrolls in and opens to full width only once
      // the Swap phone detaches from the row (its sticky wrapper starts sticking). Closing is the template's:
      // it starts when the card's bottom reaches the viewport's. Inset, radius and scroll lengths match the
      // template's clip (64/45px, 16/24px mobile; open over 2.8x and close over 3x the hero card's top), linear.
      function salmonPowerupsCardClip() {
        var card = document.querySelector('#program .card-content');
        var sticky = card && card.querySelector('.card-content-phone-sticky');
        var shim = sticky && sticky.previousElementSibling;
        var hero = document.querySelector('#hero .card-content');
        if (!shim || !hero) return;
        var mobile = window.matchMedia('(max-width: 750px)');
        var openLength = 1, closeLength = 1, stickyTop = 0, frame = 0;
        var clamp01 = function (v) { return Math.min(1, Math.max(0, v)); };
        var measure = function () {
          var heroTop = hero.getBoundingClientRect().top + window.scrollY;
          openLength = Math.max(1, 2.8 * heroTop);
          closeLength = Math.max(1, 3 * heroTop);
          stickyTop = parseFloat(getComputedStyle(sticky).top) || 0;
        };
        var draw = function () {
          frame = 0;
          var closed = mobile.matches ? [16, 24] : [64, 45];
          var opened = clamp01((stickyTop - shim.getBoundingClientRect().bottom) / openLength);
          var closing = clamp01((window.innerHeight - card.getBoundingClientRect().bottom) / closeLength);
          var k = Math.max(1 - opened, closing);
          card.style.setProperty('--salmon-card-inset', (closed[0] * k).toFixed(2) + 'px');
          card.style.setProperty('--salmon-card-radius', (closed[1] * k).toFixed(2) + 'px');
        };
        var schedule = function () { if (!frame) frame = requestAnimationFrame(draw); };
        var refresh = function () { measure(); schedule(); };
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', refresh);
        window.addEventListener('load', refresh, { once: true });
        refresh();
      }
      applySalmonCopy();
      salmonReveal();
      salmonPowerupsCardClip();
      if (document.readyState !== 'complete') {
        window.addEventListener('load', initSalmonStandalone, { once: true });
      } else {
        initSalmonStandalone();
      }
    </script>${consentHtml()}<script>${consentScript}</script>`;

  return new Response(finalHtml, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // Served from Vercel's edge for 10 minutes, refreshed in the background (the validator figures cache for an hour).
      'cache-control': 'public, s-maxage=600, stale-while-revalidate=3600',
    },
  });
}
