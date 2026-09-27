export const LINKS = {
  webWallet: 'https://v2.salmonwallet.io/',
  chrome:
    'https://chromewebstore.google.com/detail/salmon-wallet/ejbidfepgijlcgahbmbckmnaljagjoll',
  firefox: '#',
  appStore: 'https://apps.apple.com/ar/app/salmon-open-wallet/id6799740991',
  playStore: 'https://play.google.com/store/apps/details?id=io.salmonwallet.app',
  github: 'https://github.com/Salmon-HQ',
  repo: 'https://github.com/Salmon-HQ/salmon-wallet-frontend',
  twitter: 'https://x.com/salmonwallet',
  telegram: 'https://t.me/salmon_wallet',
  medium: 'https://medium.com/@salmonwallet',
  mediaKit: '/downloads/salmonwallet-mediakit.zip',
  contact: 'mailto:integrations@salmonwallet.io',
} as const;


/** Salmon's Solana validator (for live stats in the ValidatorStats section). */
export const VALIDATOR = {
  voteAccount: 'Sa1HXZsn2u6p2dMLZGhfxtsRw7Jo32hF15yBghWJsCz',
  details:
    'https://www.validators.app/validators/SA1LFXr4os2P4VKGUyRv84uFfuUYgcQkFh2uA4SmRcr?locale=en&network=mainnet',
} as const;
