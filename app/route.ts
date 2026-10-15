import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

const SNAPSHOT_PATH = path.join(process.cwd(), 'app/source.html');

const SALMON_FAQ_GROUPS = [
  {
    label: 'Product',
    items: [
      ['What is Salmon?', 'An open-source, self-custodial, lightweight wallet built as open wallet infrastructure for Solana.'],
      ['Can I use Salmon today?', 'Yes. The Browser Extension, Web Wallet, Android app, and iOS app are live.'],
      ['What is the Salmon Core?', 'The focused wallet foundation for controlling assets, understanding signing requests, and interacting safely and reliably with Solana.'],
      ['What is a Powerup?', 'A selected modular integration that expands what users can do without permanently increasing the complexity of the wallet core.'],
      ['Why use Salmon?', 'Because access, signing clarity, and reliable interaction matter—not just storage.'],
      ['Can I stake with Salmon?', 'Not yet. Native in-wallet staking is coming soon. In the meantime, Salmon operates its own Solana validator with public, verifiable performance data.'],
    ],
  },
  {
    label: 'Integrations',
    items: [
      ['What problem is Salmon solving?', 'Strong projects can still struggle to reach active users. Salmon creates a more open, structured, and measurable path from selected integration to activation, feedback, repeat usage, and distribution proof.'],
      ['Is Salmon permissionless production?', 'No. Projects can apply through an open process, but production integrations require qualification, security review, product judgment, and operational accountability.'],
      ['How are integrations selected?', 'Salmon evaluates security, user value, UX coherence, technical compatibility, maintainability, partner commitment, and adoption potential.'],
      ['What do Experimental, Verified, and Featured mean?', 'They represent different levels of maturity, review, production readiness, and distribution support. Technical inclusion does not automatically guarantee endorsement or prominent placement.'],
      ['How is Salmon different from other wallets?', 'Salmon keeps the core wallet focused and uses selected modular integrations as an adoption strategy. Partners gain a credible path to users, while Salmon gains adoption through real use cases and existing communities.'],
      ['Who is Salmon for?', 'Solana-native applications, NFT communities, self-custody and security tools, infrastructure products, aligned builders, and users who value open infrastructure.'],
      ['Why integrate Salmon?', 'To reach users, gather product feedback, validate recurring behavior, and build measurable traction through a structured wallet integration path.'],
      ['What does success look like?', 'User activation, completed actions, repeat usage, retained cohorts, partner feedback, and evidence that an integration creates durable value.'],
    ],
  },
  {
    label: 'Security',
    items: [
      ['Is Salmon open-source?', 'Yes. The core software is public on GitHub.'],
      ['How does Salmon approach signing safety?', 'The core experience prioritizes helping users understand and approve signing requests. Every selected Powerup is evaluated for permissions, UX clarity, compatibility, dependencies, and user risk.'],
      ['Is Salmon audited?', 'Security is treated as an ongoing process: review, testing, audit readiness, and visible improvement.'],
    ],
  },
  {
    label: 'Ownership',
    items: [
      ['What does “built in public” mean?', 'Open-source code, visible progress, integration metrics, and accountable iteration. Salmon is meant to evolve in the open, not behind a closed roadmap.'],
      ['What does community ownership mean in Salmon?', 'Salmon is community-driven today and built toward ownership and governance structures that can align core assets and strategic oversight with the ecosystem it serves. Technical, security, and product reviews remain delegated operational responsibilities.'],
    ],
  },
] as const;

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
  const withHeadline = withoutOriginalMetadata.replace(
    '<h1> Total salmon.<br> Totally different. </h1>',
    '<h1> One wallet.<br> Only what you need. </h1>',
  );
  const withSalmonPhone = withHeadline.replace(
    /<div class="card-content-screen"><video[\s\S]*?<\/video><\/div>/,
    '<div class="card-content-screen salmon-phone-screen"><iframe src="/phone-preview" title="Salmon Wallet" tabindex="-1"></iframe></div>',
  );
  const withSalmonLogo = withSalmonPhone.replace(
    /<a[^>]*id="nav-logo"[^>]*>[\s\S]*?<\/a>/,
    `<a href="/" id="nav-logo" aria-label="Salmon">
      <img src="/images/logo.png" alt="" class="salmon-reference-mark">
      <img src="/images/app-title.png" alt="Salmon" class="salmon-reference-wordmark">
    </a>`,
  );
  const overrides = `
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=5">
    <meta name="robots" content="noindex,nofollow">
    <meta name="theme-color" content="#ff5c45">
    <meta name="description" content="A lightweight Solana wallet that expands through optional Powerups.">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Salmon — One wallet. Only what you need.">
    <meta property="og:description" content="A lightweight Solana wallet that expands through optional Powerups.">
    <meta property="og:image" content="/images/sharing-og.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Salmon — One wallet. Only what you need.">
    <meta name="twitter:description" content="A lightweight Solana wallet that expands through optional Powerups.">
    <meta name="twitter:image" content="/images/sharing-og.png">
    <link rel="icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/images/app-icon.png">
    <title>Salmon — One wallet. Only what you need.</title>
    <style>
      @font-face { font-family: "DM Sans"; src: url("/reference-assets/font/dm-sans-400.ttf") format("truetype"); font-weight: 400; font-style: normal; font-display: swap; }
      @font-face { font-family: "DM Sans"; src: url("/reference-assets/font/dm-sans-500.ttf") format("truetype"); font-weight: 500; font-style: normal; font-display: swap; }
      @font-face { font-family: "DM Sans"; src: url("/reference-assets/font/dm-sans-600.ttf") format("truetype"); font-weight: 600; font-style: normal; font-display: swap; }
      @font-face { font-family: "DM Sans"; src: url("/reference-assets/font/dm-sans-700.ttf") format("truetype"); font-weight: 700; font-style: normal; font-display: swap; }
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
      }
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
      #program .card-content {
        background-color: #fff7f4 !important;
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
      #program-card-content-intro span {
        background-image: linear-gradient(155deg, #ff7e6d 0%, #ff5c45 55%, #a12a2a 100%) !important;
        background-clip: text !important;
        -webkit-background-clip: text !important;
        color: transparent !important;
        -webkit-text-fill-color: transparent !important;
      }
      #program .p p {
        background-image: linear-gradient(132deg, #ff7e6d 4%, #ff5c45 48%, #a12a2a 96%) !important;
        background-size: 100% 100% !important;
        background-clip: text !important;
        -webkit-background-clip: text !important;
        color: transparent !important;
        -webkit-text-fill-color: transparent !important;
      }
      #program .card-content-screen > video:first-child {
        opacity: 1 !important;
      }
      #program .card-content-phone > img {
        display: none !important;
      }
      #program .card-content-screen {
        background: #161c2d;
        box-shadow:
          0 0 0 .9vw #080a0f,
          0 0 0 1.02vw #ff7e6d,
          0 2.2vw 5vw rgba(16,19,28,.28);
      }
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
      .salmon-phone-screen iframe {
        width: 100%;
        height: 100%;
        border: 0;
        pointer-events: none;
      }
      #program .card-content-screen > *,
      #salmon-card-0 .card-content-screen > *,
      #shop .card-content-screen > * {
        visibility: hidden !important;
      }
      #program .card-content-screen::after,
      #salmon-card-0 .card-content-screen::after,
      #shop .card-content-screen::after {
        content: "Mobile placeholder";
        position: absolute;
        inset: 0;
        z-index: 5;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        border: 1px solid rgba(255,255,255,.1);
        background: #161c2d;
        color: #8a8d98;
        font-family: "DM Sans", system-ui, sans-serif;
        font-size: clamp(8px, .82vw, 12px);
        font-weight: 500;
        letter-spacing: .16em;
        text-transform: uppercase;
      }
      #shop {
        display: none !important;
      }
      #salmon-card-1.salmon-get-card {
        box-sizing: border-box;
        min-height: 38vw;
        padding: 8vw 5vw;
        background-image: linear-gradient(120deg, #161c2d 0%, #10131c 58%, #321b20 100%) !important;
      }
      #salmon .section-rectangle img {
        width: 45%;
        height: 45%;
        object-fit: contain;
        filter: brightness(0);
      }
      #salmon-card-2 {
        background: #f5f6f9 !important;
      }
      #salmon-card-1 .salmon-get-title {
        margin: 0 0 5vw;
        color: #fff;
        font-size: clamp(34px, 4.6vw, 72px);
        font-weight: 600;
        line-height: 1;
        letter-spacing: -.055em;
        text-align: center;
      }
      #salmon-card-1 .salmon-downloads {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0;
      }
      #salmon-card-1 .salmon-download {
        display: flex;
        flex: 0 0 9vw;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        width: 9vw;
        height: 9vw;
        min-width: 92px;
        min-height: 92px;
        border-radius: 50%;
        background: #fff;
        color: #10131c;
        box-shadow: 0 16px 48px rgba(0,0,0,.22);
        transition: transform .35s cubic-bezier(.19,1,.22,1), background-color .35s ease;
      }
      #salmon-card-1 .salmon-download + .salmon-download {
        margin-left: -2.15vw;
      }
      #salmon-card-1 .salmon-download:nth-child(1) { z-index: 4; }
      #salmon-card-1 .salmon-download:nth-child(2) { z-index: 3; }
      #salmon-card-1 .salmon-download:nth-child(3) { z-index: 2; }
      #salmon-card-1 .salmon-download:nth-child(4) { z-index: 1; }
      #salmon-card-1 .salmon-download:hover {
        transform: translateY(-8px);
        background: #ff7e6d;
      }
      #salmon-card-1 .salmon-download svg {
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
      #salmon-card-1 .salmon-download img {
        width: 45%;
        height: auto;
        filter: invert(1);
      }
      #faq.salmon-faq {
        display: grid;
        grid-template-columns: minmax(220px, .72fr) minmax(0, 1.28fr);
        gap: 7vw;
        padding-top: 9vw;
      }
      #faq.salmon-faq > h2 {
        position: sticky;
        top: 9vw;
        align-self: start;
        font-size: clamp(36px, 4.4vw, 72px);
        line-height: 1;
        letter-spacing: -.055em;
      }
      #faq .salmon-faq-groups {
        display: flex;
        flex-direction: column;
        gap: 0;
        border-top: 1px solid rgba(16,19,28,.18);
      }
      #faq .salmon-faq-group {
        border-bottom: 1px solid rgba(16,19,28,.18);
      }
      #faq .salmon-faq-group-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 2.2vw 0;
        color: #10131c;
        text-align: left;
      }
      #faq .salmon-faq-group-label {
        color: #10131c;
        font-size: clamp(18px, 1.65vw, 27px);
        font-weight: 700;
        letter-spacing: .04em;
        text-transform: uppercase;
      }
      #faq .salmon-faq-group-arrow {
        color: #ff5c45;
        font-size: 30px;
        font-weight: 400;
        line-height: 1;
        transition: transform .4s cubic-bezier(.19,1,.22,1);
      }
      #faq .salmon-faq-group.on .salmon-faq-group-arrow {
        transform: rotate(45deg);
      }
      #faq .salmon-faq-list {
        display: none;
        width: 100%;
        padding-left: 0;
        padding-bottom: 2vw;
      }
      #faq .salmon-faq-group.on .salmon-faq-list {
        display: block;
      }
      #faq .salmon-faq-list .faq-li {
        padding: 2vw 0;
        border-color: rgba(16,19,28,.18);
      }
      #faq .salmon-faq-list .faq-list-title {
        padding-right: 48px;
        font-size: clamp(18px, 1.4vw, 24px);
        line-height: 1.25;
      }
      #faq .salmon-faq-list .faq-list-arrow {
        display: grid;
        place-items: center;
        width: 28px;
        height: 28px;
        color: #ff5c45;
        font-size: 24px;
        line-height: 1;
      }
      #faq .salmon-faq-list .faq-li.on .faq-list-arrow {
        transform: rotate(45deg);
      }
      #faq .salmon-faq-list .faq-list-p {
        max-width: 720px;
        padding-top: 1.2vw;
        padding-right: 48px;
        color: #6b6e7b;
        font-size: clamp(15px, 1.05vw, 18px);
        line-height: 1.55;
      }
      footer {
        background: #10131c !important;
        color: #e1e1dd !important;
      }
      #footer-top {
        align-items: flex-start !important;
      }
      .salmon-footer-brand {
        display: flex;
        flex-direction: column;
        gap: 22px;
        max-width: 360px;
      }
      .salmon-footer-lockup {
        display: flex;
        align-items: center;
        gap: 14px;
        color: #e1e1dd;
        font-size: 32px;
        font-weight: 700;
        letter-spacing: -.045em;
      }
      .salmon-footer-lockup img { width: 38px; height: 38px; }
      .salmon-footer-brand p {
        color: #8a8d98;
        font-size: 18px;
        line-height: 1.45;
      }
      #footer-top-list a {
        color: #e1e1dd !important;
      }
      #footer-top-list a:hover { color: #ff5c45 !important; }
      .salmon-footer-arrow { color: #ff5c45; }
      #salmon-footer-columns {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 48px;
        padding: 170px 0 150px;
        border-bottom: 1px solid rgba(225,225,221,.14);
      }
      .salmon-footer-column h2 {
        margin-bottom: 26px;
        color: #e1e1dd;
        font-size: 15px;
        font-weight: 600;
      }
      .salmon-footer-column ul { display: flex; flex-direction: column; gap: 16px; }
      .salmon-footer-column a {
        color: #8a8d98;
        font-size: 15px;
        line-height: 1.35;
        transition: color .25s ease;
      }
      .salmon-footer-column a:hover { color: #ff5c45; }
      #footer-bottom {
        align-items: flex-end !important;
      }
      .salmon-footer-support {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .salmon-footer-support-top {
        margin-left: auto;
        align-items: flex-end;
        width: 46%;
      }
      .salmon-footer-support-label {
        color: #6b6e7b;
        font-size: 11px;
        letter-spacing: .18em;
        text-transform: uppercase;
      }
      .salmon-footer-support-logos { display: flex; align-items: center; gap: 32px; }
      .salmon-footer-support-logos img {
        width: auto !important;
        object-fit: contain;
        padding: 0 !important;
        opacity: 1 !important;
        filter: none !important;
      }
      .salmon-footer-support-logos img:first-child { height: 25px !important; max-width: 190px; }
      .salmon-footer-support-logos img:last-child { height: 28px !important; max-width: 175px; }
      .salmon-footer-legal {
        margin-top: 32px;
        color: #6b6e7b;
        font-size: 13px;
        text-align: right;
      }
      @media (max-width: 750px) {
        #nav-logo .salmon-reference-wordmark { width: 78px; }
        #salmon-footer-columns { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 46px 28px; padding: 100px 0; }
        .salmon-footer-brand { max-width: 280px; }
        .salmon-footer-support-top { align-items: flex-start; margin-top: 72px; margin-left: 0; width: 100%; }
        .salmon-footer-support-logos { align-items: flex-start; flex-direction: column; }
        .salmon-footer-legal { margin-top: 48px; text-align: left; }
        #faq.salmon-faq { display: block; padding-top: 80px; }
        #faq.salmon-faq > h2 { position: static; margin-bottom: 72px; font-size: 42px; }
        #faq .salmon-faq-group-toggle { padding: 26px 0; }
        #faq .salmon-faq-list { padding-bottom: 20px; }
        #faq .salmon-faq-list .faq-li { padding: 24px 0; }
        #faq .salmon-faq-list .faq-list-p { padding-top: 16px; }
        #salmon-card-1.salmon-get-card { min-height: auto; padding: 72px 24px; }
        #salmon-card-1 .salmon-get-title { margin-bottom: 48px; }
        #salmon-card-1 .salmon-downloads { display: flex; gap: 0; }
        #salmon-card-1 .salmon-download { width: 112px; height: 112px; }
        #salmon-card-1 .salmon-download + .salmon-download { margin-left: -28px; }
        #program .card-content-screen {
          box-shadow:
            0 0 0 2.2vw #080a0f,
            0 0 0 2.55vw #ff7e6d,
            0 5vw 12vw rgba(16,19,28,.28);
        }
        #program .card-content-screen::before {
          top: 1.6vw;
          width: 13vw;
          height: 3vw;
        }
      }
    </style>
  `;
  const localized = withSalmonLogo.replace(
    '<head>',
    `<head>${overrides}`,
  );
  const finalHtml = `${localized}<script>
      function initSalmonStandalone() {
        var heroScreen = document.querySelector('#hero .card-content-screen');
        if (heroScreen) {
          heroScreen.classList.add('salmon-phone-screen');
          heroScreen.innerHTML = '<iframe src="/phone-preview" title="Salmon Wallet" tabindex="-1"></iframe>';
        }

        var heroWords = document.querySelectorAll('#hero-txt > div');
        ['make', 'it', 'yours'].forEach(function (word, index) {
          if (heroWords[index]) heroWords[index].textContent = word;
        });

        var heroClosing = document.querySelector('#hero .p p');
        if (heroClosing) {
          heroClosing.innerHTML = 'A community-owned Solana wallet that expands through optional Powerups. <span class="salmon-copy-accent">Lightweight by default.</span> <span class="salmon-copy-soft">Modular when useful.</span> <span class="salmon-copy-deep">Open where it matters.</span>';
        }

        var introItems = document.querySelectorAll('#intro-list > li');
        ['Stake', 'Swap', 'Pay'].forEach(function (label, index) {
          if (introItems[index]) introItems[index].textContent = label;
        });

        var introClosing = document.querySelector('#intro > p');
        if (introClosing) introClosing.textContent = 'Add more when you need more.';

        var powerupsHeading = document.querySelector('#program > h2');
        if (powerupsHeading) powerupsHeading.textContent = 'Powerups';

        var powerupsIcon = document.querySelector('#program .section-rectangle');
        if (powerupsIcon) {
          powerupsIcon.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.7 1.8 3.6 13.5h7.1l-1 8.7 10.7-12.5h-7.2l.5-7.9Z"/></svg>';
        }

        var powerupsPercent = document.querySelector('#program-card-content-percent-w');
        if (powerupsPercent) powerupsPercent.remove();

        var powerupsIntro = document.querySelector('#program-card-content-intro');
        if (powerupsIntro) {
          powerupsIntro.innerHTML = "Wallets became mega-apps, complicated to navigate and understand. <span>Let's fix that.</span>";
        }

        var powerupsGridImage = document.querySelector('#program-card-content-grid img');
        if (powerupsGridImage) {
          powerupsGridImage.src = '/images/reference/powerups-01.png';
          powerupsGridImage.alt = 'Salmon Powerups';
        }

        var powerupsSteps = document.querySelectorAll('#program .card-content-list-sticky-copy p');
        [
          'Find the Powerup you need. Add only the capabilities that fit your wallet.',
          'Turn it on when you need it. You decide what becomes part of your experience.',
          'Keep your wallet lean. The core stays focused; everything else remains optional.'
        ].forEach(function (copy, index) {
          if (powerupsSteps[index]) powerupsSteps[index].textContent = copy;
        });

        var powerupsClosing = document.querySelector('#program .p p');
        if (powerupsClosing) {
          powerupsClosing.textContent = 'Open entry. Curated production. Projects can apply through an open process. Production access is earned through qualification because integrations affect signing flows, permissions, navigation, performance, security, and the wider wallet experience.';
        }

        var salmonClosing = document.querySelector('#salmon > .p');
        if (salmonClosing) salmonClosing.remove();

        var salmonHeading = document.querySelector('#salmon > h2');
        if (salmonHeading) salmonHeading.textContent = 'Real ownership';

        var ownershipIcon = document.querySelector('#salmon .section-rectangle');
        if (ownershipIcon) ownershipIcon.innerHTML = '<img src="/images/logo.svg" alt="Salmon">';

        var ownershipIntro = document.querySelector('#salmon-card-0 > p');
        if (ownershipIntro) ownershipIntro.textContent = 'When using Salmon, you own both the experience and the project';

        var ownershipWalletImage = document.querySelector('#salmon-card-2 img');
        if (ownershipWalletImage) {
          ownershipWalletImage.src = '/images/reference/salmon-card-2.png';
          ownershipWalletImage.alt = 'Salmon wallet portfolio';
        }

        var getSalmonCard = document.querySelector('#salmon-card-1');
        if (getSalmonCard) {
          getSalmonCard.classList.add('salmon-get-card');
          getSalmonCard.innerHTML = '<h3 class="salmon-get-title">Get Salmon</h3><div class="salmon-downloads">' +
            '<a class="salmon-download" href="https://chromewebstore.google.com/detail/salmon-wallet/ejbidfepgijlcgahbmbckmnaljagjoll" target="_blank" rel="noopener noreferrer" aria-label="Download Salmon for Chrome"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M21.17 8H12M3.95 6.06 8.54 14M10.88 21.94 15.46 14"/></svg></a>' +
            '<a class="salmon-download" href="https://apps.apple.com/ar/app/salmon-open-wallet/id6799740991" target="_blank" rel="noopener noreferrer" aria-label="Download Salmon for iOS"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.286 7.008C5.07 7.008 4 10.238 4 12.928 4 16.157 6.143 21 8.286 21c1.165-.05 1.799-.538 3.214-.538 1.406 0 1.607.538 3.214.538S19 17.771 19 15.619c-.03-.011-2.649-.434-2.679-3.23-.02-2.335 2.589-3.179 2.679-3.228-1.096-1.606-3.162-2.113-3.75-2.153-1.535-.12-3.032 1.077-3.75 1.077-.729 0-2.036-1.077-3.214-1.077M12 4a2 2 0 0 0 2-2 2 2 0 0 0-2 2"/></svg></a>' +
            '<a class="salmon-download" href="https://play.google.com/store/apps/details?id=io.salmonwallet.app" target="_blank" rel="noopener noreferrer" aria-label="Download Salmon for Android"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v6M20 10v6M7 9h10v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9a5 5 0 0 1 10 0M8 3l1 2M16 3l-1 2M9 18v3M15 18v3"/></svg></a>' +
            '<a class="salmon-download" href="https://dappstore.solanamobile.com/" target="_blank" rel="noopener noreferrer" aria-label="Get Salmon for Seeker"><img src="/images/seeker.svg" alt="" aria-hidden="true"></a>' +
          '</div>';
        }

        var faq = document.querySelector('#faq');
        if (faq) {
          var salmonFaqGroups = ${JSON.stringify(SALMON_FAQ_GROUPS)};
          faq.classList.add('salmon-faq');
          faq.innerHTML = '<h2>Salmon FAQs</h2><div class="salmon-faq-groups">' + salmonFaqGroups.map(function (group) {
            return '<section class="salmon-faq-group"><button class="salmon-faq-group-toggle" type="button" aria-expanded="false"><span class="salmon-faq-group-label">' + group.label + '</span><span class="salmon-faq-group-arrow" aria-hidden="true">+</span></button><ul class="salmon-faq-list">' + group.items.map(function (item) {
              return '<li class="faq-li"><div class="faq-list-title">' + item[0] + '<span class="faq-list-arrow" aria-hidden="true">+</span></div><p class="faq-list-p">' + item[1] + '</p></li>';
            }).join('') + '</ul></section>';
          }).join('') + '</div>';

          faq.addEventListener('click', function (event) {
            var groupToggle = event.target.closest('.salmon-faq-group-toggle');
            if (groupToggle) {
              var group = groupToggle.closest('.salmon-faq-group');
              var willOpen = !group.classList.contains('on');
              faq.querySelectorAll('.salmon-faq-group.on').forEach(function (openGroup) {
                openGroup.classList.remove('on');
                openGroup.querySelector('.salmon-faq-group-toggle').setAttribute('aria-expanded', 'false');
                openGroup.querySelectorAll('.faq-li.on').forEach(function (openItem) { openItem.classList.remove('on'); });
              });
              if (willOpen) {
                group.classList.add('on');
                groupToggle.setAttribute('aria-expanded', 'true');
              }
              return;
            }
            var item = event.target.closest('.faq-li');
            if (!item || !faq.contains(item)) return;
            faq.querySelectorAll('.faq-li.on').forEach(function (openItem) {
              if (openItem !== item) openItem.classList.remove('on');
            });
            item.classList.toggle('on');
          });
        }

        var footer = document.querySelector('footer');
        if (footer) {
          footer.innerHTML = \`
            <div id="footer-top">
              <div class="salmon-footer-brand">
                <div class="salmon-footer-lockup">
                  <img src="/images/logo-orange.svg" alt="">
                  <span>Salmon</span>
                </div>
                <p>Open wallet infrastructure for Solana.</p>
              </div>
              <div class="salmon-footer-support salmon-footer-support-top">
                <p class="salmon-footer-support-label">Supported by</p>
                <div class="salmon-footer-support-logos">
                  <img src="/images/partners/la-familia.png" alt="La Familia">
                  <img src="/images/partners/superteam-argentina.svg" alt="Superteam Argentina">
                </div>
              </div>
            </div>
            <div id="salmon-footer-columns">
              <nav class="salmon-footer-column" aria-label="Get Salmon">
                <h2>Get Salmon</h2>
                <ul>
                  <li><a href="https://chromewebstore.google.com/detail/salmon-wallet/ejbidfepgijlcgahbmbckmnaljagjoll" target="_blank" rel="noopener noreferrer">Chrome</a></li>
                  <li><a href="https://play.google.com/store/apps/details?id=io.salmonwallet.app" target="_blank" rel="noopener noreferrer">Android</a></li>
                  <li><a href="https://apps.apple.com/ar/app/salmon-open-wallet/id6799740991" target="_blank" rel="noopener noreferrer">iOS</a></li>
                  <li><a href="https://dappstore.solanamobile.com/" target="_blank" rel="noopener noreferrer">Seeker</a></li>
                </ul>
              </nav>
              <nav class="salmon-footer-column" aria-label="Developers">
                <h2>Developers</h2>
                <ul>
                  <li><a href="https://github.com/Salmon-HQ" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                  <li><a href="https://docs.salmonwallet.io/" target="_blank" rel="noopener noreferrer">Docs</a></li>
                  <li><a href="https://www.salmonwallet.io/brand">Brand</a></li>
                  <li><a href="mailto:integrations@salmonwallet.io">Apply for an Integration</a></li>
                  <li><a href="https://www.salmonwallet.io/downloads/salmonwallet-mediakit.zip">Media Kit</a></li>
                </ul>
              </nav>
              <nav class="salmon-footer-column" aria-label="Community">
                <h2>Community</h2>
                <ul>
                  <li><a href="https://x.com/salmonwallet" target="_blank" rel="noopener noreferrer">X / Twitter</a></li>
                  <li><a href="https://t.me/salmon_wallet" target="_blank" rel="noopener noreferrer">Telegram Community</a></li>
                  <li><a href="https://medium.com/@salmonwallet" target="_blank" rel="noopener noreferrer">Medium</a></li>
                </ul>
              </nav>
              <nav class="salmon-footer-column" aria-label="Legal">
                <h2>Legal</h2>
                <ul>
                  <li><a href="https://www.salmonwallet.io/terms">Terms &amp; Conditions</a></li>
                  <li><a href="https://www.salmonwallet.io/privacy">Privacy Policy</a></li>
                  <li><a href="https://www.salmonwallet.io/about">About</a></li>
                  <li><a href="https://www.salmonwallet.io/contact">Contact / Integrations</a></li>
                </ul>
              </nav>
            </div>
            <div id="footer-bottom">
              <p class="salmon-footer-legal">© ${new Date().getFullYear()} Salmon Wallet.<br>All rights reserved.</p>
            </div>\`;
        }
      }
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
