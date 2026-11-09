# Salmon website

Marketing and legal site for [Salmon](https://www.salmonwallet.io): a lightweight, self-custodial Solana wallet that stays small by default and grows through optional Powerups.

This repository is the site source. The code here is released under the [Apache License 2.0](./LICENSE).

- **Live site:** [https://www.salmonwallet.io](https://www.salmonwallet.io)
- **Product docs:** [https://docs.salmonwallet.io](https://docs.salmonwallet.io)

## Tech stack

- [Next.js](https://nextjs.org/) `16.1.6` (App Router)
- [React](https://react.dev/) `19.2.4`
- [TypeScript](https://www.typescriptlang.org/) `5.9.3`
- [Tailwind CSS](https://tailwindcss.com/) `4.1.18` (via `@tailwindcss/postcss`)
- Node.js `24` (see [`.nvmrc`](./.nvmrc)); package manager `npm@11.19.0` (see `packageManager` in `package.json`)

## Getting started

### Prerequisites

- Node.js 24 (recommended via `nvm use` / the version in `.nvmrc`)
- npm 11.x (matches `packageManager` in `package.json`)

### Install

```bash
npm install
```

CI uses `npm ci`; prefer that for a clean, lockfile-faithful install.

### Develop

```bash
npm run dev
```

Starts the Next.js dev server (`next dev`).

### Build and run production locally

```bash
npm run build
npm start
```

### Test

```bash
npm test
```

Runs `node --test tests/*.test.mjs` (legal text, mobile update file, redirects, and related checks against the built site).

There is no `lint` script in `package.json` today.

## Environment variables

No `.env.example` is published, and the app source does not read `process.env` / `NEXT_PUBLIC_*` variables for configuration.

Site URL and structured data are hard-coded in [`lib/site.ts`](./lib/site.ts) (`SITE_URL = https://www.salmonwallet.io`). The Google Analytics measurement ID used after consent is hard-coded in [`components/consent/consent.ts`](./components/consent/consent.ts).

`.gitignore` ignores local `.env*` files. **TODO:** document any Vercel project or runtime secrets if they are added later.


## Contributing

1. Use Node 24 and install with `npm ci` (or `npm install`).
2. Make your change on a branch.
3. Run `npm run build` and `npm test` locally (same checks as CI).
4. Open a pull request against `main`.

There is no `CONTRIBUTING.md` or `CODE_OF_CONDUCT.md` in this repository yet. **TODO:** add them if you want a fuller contributor guide.

For product or integration questions related to the live site, see [Contact](https://www.salmonwallet.io/contact) (`integrations@salmonwallet.io`).

## Related repositories

Public repos under [Salmon-HQ](https://github.com/Salmon-HQ):

- [salmon-wallet-frontend](https://github.com/Salmon-HQ/salmon-wallet-frontend) — Salmon Wallet Frontend
- [salmon-wallet-backend](https://github.com/Salmon-HQ/salmon-wallet-backend) — Salmon Wallet Backend
- [salmon-pay](https://github.com/Salmon-HQ/salmon-pay) — payments on Solana at Salmon

## License

[Apache License 2.0](./LICENSE)
