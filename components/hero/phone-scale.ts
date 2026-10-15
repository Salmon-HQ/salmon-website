/**
 * The wallet app's design reference device is the iPhone 17 Pro Max
 * (440 × 956 logical points — see packages/shared/src/utils/scaling.native.ts
 * in salmon-wallet-v3). On that device the app's s()/vs()/ms() helpers are
 * identity functions, so every design value can be expressed as a share of the
 * 440pt screen width and the mock stays true to the app at any rendered size.
 */
export const DESIGN_WIDTH = 440;

/** Design pt on a 440pt-wide screen → a share of the phone screen's width. */
export const u = (px: number) => `${(px * 100) / DESIGN_WIDTH}cqw`;
