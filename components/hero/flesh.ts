/**
 * The myoseptal texture of salmon flesh — the "marbled" drawing — ported
 * verbatim from packages/shared/src/theme/flesh.ts in salmon-wallet-frontend.
 *
 * It is generated from constants at import time, never drawn by hand. The
 * rationale lives in DESIGN.md §The flesh texture; the short version is that a
 * salmon fill is mass rather than surface, so it carries the cut surface of
 * the fish and not its skin. Every vein is paler than the fill it sits in, so
 * the texture can only raise the luminance under a glyph.
 */

/** One filled band pass: `[path, fillOpacity]`. */
export type FleshFill = readonly [d: string, opacity: number];

const TWO_PI = Math.PI * 2;

/** Veins per tile width. 3 over a 150px tile = 50px apart. */
const BANDS = 3;

/**
 * How far each vein bows sideways as it sweeps down the tile, in tile units.
 * All veins share the one bow, which is what makes them nest as arcs that
 * barrel together (myosepta) instead of independent wiggles.
 */
const ARC_AMP = 10;

/**
 * Vein half-profile: `[min, max]` width in tile units. The vein swells to
 * `max` mid-tile and thins to `min` at the tips — `min` stays visible so the
 * tile edge never shows a bare row.
 */
const WIDTH: readonly [number, number] = [2, 7];

/**
 * Ink: `[core, halo]` fill opacity. Few veins, so the core could sit just
 * under the 0.2 ceiling `flesh.test.ts` enforces; it sits a step lower
 * (0.16 → 0.12, owner, 2026-09-02, on device: the marbling on the buttons
 * read a shade too loud — subtle, not stated).
 */
const INK: readonly [number, number] = [0.12, 0.04];

/** The drawing's native tile, in the units the paths are authored in. */
export const fleshTile = { width: 150, height: 88 } as const;

/** The halo pass is this much wider than the core it softens. */
const HALO_SPREAD = 1.9;

type Sample = readonly [x: number, y: number, halfWidth: number];

/** A closed polygon around a centreline: down one edge, back up the other. */
const outline = (samples: ReadonlyArray<Sample>, spread: number): string => {
  const edge = (side: 1 | -1) =>
    samples.map(([x, y, half]) => `${(x + side * half * spread).toFixed(2)},${y.toFixed(2)}`);
  const left = edge(-1);
  const right = edge(1).reverse();
  return `M ${left.join(' L ')} L ${right.join(' L ')} Z`;
};

const build = (): ReadonlyArray<FleshFill> => {
  const { width: W, height: H } = fleshTile;
  const S = W / BANDS;
  const [wMin, wMax] = WIDTH;
  const [core, halo] = INK;
  const STEPS = 22;

  const fills: FleshFill[] = [];
  for (let k = 0; k < BANDS; k += 1) {
    const samples: Sample[] = [];
    for (let i = 0; i <= STEPS; i += 1) {
      const t = i / STEPS;
      const y = t * H;
      // Shared bow (fundamental + a fixed 0.35 second harmonic for the
      // unequal lobes) — periodic over H, so slope and position both hand
      // off cleanly at the tile edge.
      const bow = ARC_AMP * (Math.sin(TWO_PI * t) + 0.35 * Math.sin(2 * TWO_PI * t + 1.1));
      // Rake: one band-slot of drift per tile height, so the band leaving
      // the bottom is exactly the next band entering the top.
      const x = (k + 0.5) * S + S * t + bow;
      // Swell mid-tile, thin (never zero) at the tips; periodic over H.
      const half = (wMin + (wMax - wMin) * (0.5 - 0.5 * Math.cos(TWO_PI * t))) / 2;
      samples.push([x, y, half]);
    }
    // Wrap copies wherever the halo's ink reaches past a vertical tile edge —
    // react-native-svg's Pattern has no overflow, so the wrap is baked in.
    const reach = samples.map(([x, , half]) => [x - half * HALO_SPREAD, x + half * HALO_SPREAD]);
    const minX = Math.min(...reach.map(([lo]) => lo));
    const maxX = Math.max(...reach.map(([, hi]) => hi));
    const shifts = [0, ...(minX < 0 ? [W] : []), ...(maxX > W ? [-W] : [])];
    for (const dx of shifts) {
      const shifted = samples.map(([x, y, half]) => [x + dx, y, half] as const);
      fills.push([outline(shifted, HALO_SPREAD), halo]);
      fills.push([outline(shifted, 1), core]);
    }
  }
  return fills;
};

/**
 * The filled passes both renderers draw, wrap copies included — a renderer
 * only has to map over the array.
 */
export const fleshFills: ReadonlyArray<FleshFill> = build();
