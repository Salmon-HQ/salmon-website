// Analytics consent, ported from the previous site (components/CookieConsent.tsx at ee9a321) so the privacy policy
// still holds: Google Analytics loads only after "Accept", the banner shows once, and the choice lives in local
// storage under the same key (earlier choices carry over). Plain HTML, CSS and JS, so the home page (app/route.ts)
// and the Next pages (components/legal/PageShell.tsx) share it.

const GA_MEASUREMENT_ID = 'G-8W36W1WMX8';
const STORAGE_KEY = 'salmon-analytics-consent';

export type ConsentLocale = 'en' | 'es' | 'pt';

const COPY: Record<ConsentLocale, { label: string; message: string; policy: string; accept: string; decline: string; href: string }> = {
  en: {
    label: 'Analytics consent',
    message: 'We would like to measure how the site is used, with Google Analytics. It is off until you accept, and the wallet applications are unaffected either way.',
    policy: 'Read the privacy policy',
    accept: 'Accept',
    decline: 'Decline',
    href: '/privacy',
  },
  es: {
    label: 'Consentimiento de analítica',
    message: 'Nos gustaría medir cómo se usa el sitio, con Google Analytics. Está apagado hasta que aceptes, y las aplicaciones del wallet no se ven afectadas en ningún caso.',
    policy: 'Leé la política de privacidad',
    accept: 'Aceptar',
    decline: 'Rechazar',
    href: '/es/privacy',
  },
  pt: {
    label: 'Consentimento de análise',
    message: 'Gostaríamos de medir como o site é usado, com o Google Analytics. Fica desligado até você aceitar, e os aplicativos da carteira não são afetados de nenhuma forma.',
    policy: 'Leia a política de privacidade',
    accept: 'Aceitar',
    decline: 'Recusar',
    href: '/pt/privacy',
  },
};

export function consentHtml(locale: ConsentLocale = 'en') {
  const t = COPY[locale];
  return `<div id=salmon-consent class=salmon-consent role=dialog aria-live=polite aria-label="${t.label}" hidden>
  <div class=salmon-consent-card>
    <p>${t.message} <a href="${t.href}">${t.policy}</a></p>
    <div class=salmon-consent-actions>
      <button type=button data-consent=denied>${t.decline}</button>
      <button type=button data-consent=granted class=salmon-consent-accept>${t.accept}</button>
    </div>
  </div>
</div>`;
}

export const consentCss = `
  .salmon-consent { position: fixed; inset: auto 0 0; z-index: 2147483000; padding: 0 16px 16px; pointer-events: none; }
  .salmon-consent[hidden] { display: none; }
  .salmon-consent-card {
    display: flex; align-items: center; gap: 24px; max-width: 760px; margin: 0 auto; padding: 20px 24px;
    border-radius: 20px; background: rgba(16, 19, 28, .96); box-shadow: 0 18px 50px rgba(16, 19, 28, .35);
    color: rgba(255, 255, 255, .78); font: 400 14px/1.55 "DM Sans", system-ui, sans-serif; letter-spacing: 0;
    pointer-events: auto; animation: salmon-consent-in .45s cubic-bezier(.16, 1, .3, 1);
  }
  .salmon-consent-card p { flex: 1; margin: 0; }
  .salmon-consent-card a { color: #ff7e6d; text-decoration: underline; text-underline-offset: 2px; }
  .salmon-consent-actions { display: flex; gap: 12px; flex-shrink: 0; }
  .salmon-consent-actions button {
    padding: 10px 20px; border: 1px solid rgba(255, 255, 255, .22); border-radius: 999px; background: transparent;
    color: #fff; font: 500 14px/1 "DM Sans", system-ui, sans-serif; cursor: pointer; transition: background .2s, border-color .2s;
  }
  .salmon-consent-actions button:hover { border-color: rgba(255, 255, 255, .4); background: rgba(255, 255, 255, .06); }
  .salmon-consent-actions .salmon-consent-accept { border-color: transparent; background: #ff5c45; }
  .salmon-consent-actions .salmon-consent-accept:hover { border-color: transparent; background: #ff7e6d; }
  .salmon-consent-actions button:focus-visible, .salmon-consent-card a:focus-visible { outline: 2px solid #ff7e6d; outline-offset: 2px; }
  @keyframes salmon-consent-in { from { opacity: 0; transform: translateY(24px); } }
  @media (max-width: 640px) {
    .salmon-consent-card { flex-direction: column; align-items: stretch; gap: 16px; padding: 18px; }
    .salmon-consent-actions button { flex: 1; }
  }
  @media (prefers-reduced-motion: reduce) { .salmon-consent-card { animation-name: none; } }
`;

// Reads the stored choice (storage blocked = ask again, never assume consent); "granted" loads GA, "unset" shows the banner.
export const consentScript = `(function () {
  var KEY = '${STORAGE_KEY}';
  function read() { try { var v = localStorage.getItem(KEY); return v === 'granted' || v === 'denied' ? v : 'unset'; } catch (e) { return 'unset'; } }
  function loadAnalytics() {
    if (window.__salmonGa) return;
    window.__salmonGa = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', '${GA_MEASUREMENT_ID}');
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}';
    document.head.appendChild(s);
  }
  function init() {
    var consent = read();
    if (consent === 'granted') return loadAnalytics();
    var banner = document.getElementById('salmon-consent');
    if (consent !== 'unset' || !banner) return;
    banner.hidden = false;
    banner.addEventListener('click', function (event) {
      var value = event.target.closest && event.target.closest('[data-consent]') && event.target.closest('[data-consent]').getAttribute('data-consent');
      if (!value) return;
      try { localStorage.setItem(KEY, value); } catch (e) {}
      banner.hidden = true;
      if (value === 'granted') loadAnalytics();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();`;
