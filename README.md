# Salmon Website
<img width="160" alt="logo-salmon" src="https://github.com/salmonw/salmon-wallet-v2/assets/35810074/ac99529f-aff7-47c6-b443-4a58b41a998d">
Public website for [Salmon Wallet](https://salmonwallet.io): an open-source, self-custodial wallet experience focused on Solana and emerging ecosystem integrations.

This repository contains the landing page, localized public pages, app download links, and the staking page for Salmon's Solana validator. Keep public claims grounded in what the code and current product can verify.

## What is in this repo

- Next.js App Router site for `salmonwallet.io`
- Localized content in English, Spanish, and Portuguese
- Public routes for the homepage, staking, privacy policy, and terms
- Dark editorial visual system using Tailwind CSS v4 theme tokens
- Live validator stats from Stakewiz with a static fallback
- Public web app metadata, Open Graph image, sitemap, robots, and manifest

## Tech stack

- [Next.js](https://nextjs.org/) 16
- [React](https://react.dev/) 19
- [next-intl](https://next-intl.dev/) for routing and translations
- [Tailwind CSS](https://tailwindcss.com/) v4 through `@tailwindcss/postcss`
- [Framer Motion](https://www.framer.com/motion/) for UI motion
- TypeScript with strict checking enabled

## Getting started

Use Node.js 20.19 or newer and npm. `package-lock.json` is the canonical lockfile and must be kept in sync with dependency changes.

```bash
npm install
npm run dev
```

The development server starts with Turbopack. Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm test
```

- `dev` starts the local Next.js development server.
- `build` creates a production build and runs TypeScript checks.
- `start` serves the production build after `npm run build`.
- `test` verifies Markdown negotiation helpers, recovery content, OpenAPI, and the CLI.

## Agent and developer discovery

- `/llms.txt` indexes the site's stable public resources.
- `/openapi.json` describes the public machine-readable website surface. Salmon does not expose a transactional or custodial API from this site.
- `/api/v1/discovery` returns stable product and documentation links as JSON. Breaking API changes use a new URL major version; retirement is announced with `Deprecation` and `Sunset` headers at least 180 days in advance.
- Public pages return Markdown when requested with `Accept: text/markdown`; negotiated responses include `Vary: Accept, Accept-Encoding`.
- Unknown paths return HTTP 404 in both HTML and Markdown, with links that help agents recover.
- `packages/salmon-cli` contains the registry-ready `@salmonwallet/cli` discovery CLI. Publishing it requires authorization for the npm scope.

## Project structure

```text
app/
  [locale]/
    page.tsx          Homepage
    stake/page.tsx    Validator staking page
    privacy/page.tsx  Privacy policy
    terms/page.tsx    Terms and conditions
  manifest.ts
  robots.ts
  sitemap.ts
components/
  LegalDocument.tsx
  Hero.tsx
  Navbar.tsx
  Why.tsx
  Manifesto.tsx
  FAQ.tsx
  GetSalmon.tsx
  sections/
  ui/
lib/
  constants.ts        Public links and validator constants
  legal-content.mjs   Localized terms and privacy content
  validator.ts        Stakewiz validator stats fetcher
  i18n/               next-intl routing and request config
messages/
  en.json
  es.json
  pt.json
public/
  images/
  icons/
```

## Internationalization

The site uses `next-intl` with these locales:

- `en` - default locale, served without a locale prefix
- `es` - served under `/es`
- `pt` - served under `/pt`

Interface and marketing copy lives in `messages/{locale}.json`. Legal copy lives in `lib/legal-content.mjs` so the HTML pages and negotiated Markdown use one source. When changing either kind of copy, update all three locales and keep their meaning and structure aligned.

## Public content guidelines

This is a public-facing repository and website. Be precise:

- Do not add security, audit, user-count, asset-protection, rating, or growth claims unless there is a current source of truth.
- Prefer verifiable proof: open-source repositories, live product surfaces, and live validator data.
- Keep the positioning close to the current site: open-source, self-custodial, open wallet infrastructure, and a real product available on web, extension, and Android.
- Treat unreleased surfaces as unreleased. iOS links are currently inert and marked as coming soon.
- Keep integration and ecosystem language factual. Do not imply automatic access, guaranteed distribution, or protocol endorsement.

## Live data

The staking page reads Salmon validator stats from Stakewiz:

```text
https://api.stakewiz.com/validator/{voteAccount}
```

The fetch is cached for one hour with the Next data cache. If Stakewiz is unavailable or returns unexpected data, `lib/validator.ts` returns a static fallback snapshot so the page does not render empty.

## Public links

Primary public links are centralized in `lib/constants.ts`:

- Web wallet
- Chrome extension
- Android app
- GitHub organization and repository
- X / Twitter
- Telegram
- Medium
- Media kit
- Contact email
- Validator staking link

Update links there instead of scattering URLs across components.

## Design system

The site uses a dark navy base with Salmon accent colors defined in `app/globals.css` through Tailwind v4 theme tokens. Typography uses DM Sans and DM Mono through `next/font/google`.

Main component patterns:

- Section-level content components in `components/`
- Reusable primitives in `components/ui/`
- Specialized homepage sections in `components/sections/`
- Platform and product imagery under `public/images/`

Keep UI changes consistent with the existing compact editorial style. Avoid introducing a separate visual direction without updating the underlying design system.

## SEO and metadata

SEO-related files are implemented through Next metadata routes:

- `app/[locale]/layout.tsx` - localized metadata, Open Graph, Twitter cards, JSON-LD, Google Analytics
- `app/sitemap.ts` - localized sitemap entries
- `app/robots.ts` - robots rules and sitemap URL
- `app/manifest.ts` - web app manifest

The canonical production URL is `https://salmonwallet.io`.

## Contributing

Before opening a pull request:

1. Run `npm run build`.
2. Check that all locale files still have matching keys.
3. Confirm public claims against a current source of truth.
4. Keep public links centralized in `lib/constants.ts`.
5. Avoid documenting features that are not present in the current site.

## License

Licensed under the [Apache License 2.0](LICENSE).
