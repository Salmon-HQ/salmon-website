// Screenshots of the running site, for checking UI changes at several widths.
// Usage: node scripts/shot.mjs [path] [--sizes 402x874,1440x900] [--to "#coming-soon"] [--offset=-70] [--wait 800]
//                              [--base http://localhost:3100] [--out shots] [--reduced] [--consent]
// Scrolls down in steps (the template's scroll effects need the intermediate positions) to the element named
// by --to, plus --offset pixels, and saves one PNG per size. Uses the installed Chrome, no browser download.
// The analytics banner is dismissed as declined (no GA hits) unless --consent asks to see it.
import { mkdirSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright-core';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    sizes: { type: 'string', default: '402x874,1440x900' },
    to: { type: 'string' },
    offset: { type: 'string', default: '0' },
    wait: { type: 'string', default: '800' },
    base: { type: 'string', default: 'http://localhost:3100' },
    out: { type: 'string', default: 'shots' },
    reduced: { type: 'boolean', default: false },
    consent: { type: 'boolean', default: false },
  },
});
const path = positionals[0] ?? '/';
mkdirSync(values.out, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
for (const size of values.sizes.split(',')) {
  const [width, height] = size.split('x').map(Number);
  const page = await browser.newPage({
    viewport: { width, height },
    isMobile: width < 800,
    hasTouch: width < 800,
    reducedMotion: values.reduced ? 'reduce' : 'no-preference',
  });
  if (!values.consent) await page.addInitScript(() => localStorage.setItem('salmon-analytics-consent', 'denied'));
  await page.goto(values.base + path, { waitUntil: 'networkidle' });
  const target = values.to
    ? await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`no element matches ${selector}`);
        return element.getBoundingClientRect().top + window.scrollY;
      }, values.to)
    : 0;
  const y = Math.max(0, target + Number(values.offset));
  for (let step = 0; step < y; step += 300) {
    await page.evaluate((v) => window.scrollTo(0, v), step);
    await page.waitForTimeout(20);
  }
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(Number(values.wait));
  const name = path.replace(/^\/+|\/+$/g, '').replace(/\W+/g, '_') || 'home';
  const file = `${values.out}/${name}-${width}x${height}.png`;
  await page.screenshot({ path: file });
  console.log(file);
  await page.close();
}
await browser.close();
