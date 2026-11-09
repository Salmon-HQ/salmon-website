# Salmon website

The salmonwallet.io site: the home page, contact, and the terms and privacy policy in English, Spanish and Portuguese. Pushes to `main` deploy to production on Vercel.

## Run locally

```bash
npm install
npm run dev
```

## How it is built

- `app/route.ts` serves the home page from `app/source.html`, with the Salmon copy, styles and scripts applied on top.
- The phones on the home page are Next pages shown in iframes (`/phone-preview`, `/powerup-rows`), built from ports of the wallet's own components in `components/hero/`.
- The terms and privacy texts live in `lib/legal-powerups-content.mjs`, regenerated from the SOT with `node scripts/sync-powerups-legal.mjs <path to SOT/07-publishing/Website>`. Never edit them by hand.
- `public/app/mobile-release.json` is read by the mobile app to offer store updates. Keep its path.

## Production build

```bash
npm run build
npm start
```
