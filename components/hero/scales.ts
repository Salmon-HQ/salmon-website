/**
 * The seigaiha fish-scale motif, ported verbatim from
 * packages/shared/src/theme/scales.ts in salmon-wallet-frontend.
 *
 * The tile is 806.4 × 25.2 in authored units; the drawing is generated from
 * four constants there (arc width 28.8, rise 12.6, control drop 16.8, phase
 * inset 0.1) and must not be edited by hand. `seigaihaTiledPaths` adds a copy
 * of every curve that runs past an edge, displaced by a whole tile so it
 * re-enters at the opposite one — a viewBox crops the same way a pattern cell
 * does, so the wrap has to be in the data.
 */
export const seigaihaTile = { width: 806.4, height: 25.2 } as const;

const seigaihaPaths: readonly string[] = [
  /** Row 1 */
  'M0.1 12.7C0.1 -4.1 28.9 -4.1 28.9 12.7C28.9 -4.1 57.7 -4.1 57.7 12.7C57.7 -4.1 86.5 -4.1 86.5 12.7C86.5 -4.1 115.3 -4.1 115.3 12.7C115.3 -4.1 144.1 -4.1 144.1 12.7C144.1 -4.1 172.9 -4.1 172.9 12.7C172.9 -4.1 201.7 -4.1 201.7 12.7C201.7 -4.1 230.5 -4.1 230.5 12.7C230.5 -4.1 259.3 -4.1 259.3 12.7C259.3 -4.1 288.1 -4.1 288.1 12.7C288.1 -4.1 316.9 -4.1 316.9 12.7C316.9 -4.1 345.7 -4.1 345.7 12.7C345.7 -4.1 374.5 -4.1 374.5 12.7C374.5 -4.1 403.3 -4.1 403.3 12.7C403.3 -4.1 432.1 -4.1 432.1 12.7C432.1 -4.1 460.9 -4.1 460.9 12.7C460.9 -4.1 489.7 -4.1 489.7 12.7C489.7 -4.1 518.5 -4.1 518.5 12.7C518.5 -4.1 547.3 -4.1 547.3 12.7C547.3 -4.1 576.1 -4.1 576.1 12.7C576.1 -4.1 604.9 -4.1 604.9 12.7C604.9 -4.1 633.7 -4.1 633.7 12.7C633.7 -4.1 662.5 -4.1 662.5 12.7C662.5 -4.1 691.3 -4.1 691.3 12.7C691.3 -4.1 720.1 -4.1 720.1 12.7C720.1 -4.1 748.9 -4.1 748.9 12.7C748.9 -4.1 777.7 -4.1 777.7 12.7C777.7 -4.1 806.5 -4.1 806.5 12.7',
  /** Row 2 — row 1 translated by (-w/2, +rise) */
  'M-14.3 25.3C-14.3 8.5 14.5 8.5 14.5 25.3C14.5 8.5 43.3 8.5 43.3 25.3C43.3 8.5 72.1 8.5 72.1 25.3C72.1 8.5 100.9 8.5 100.9 25.3C100.9 8.5 129.7 8.5 129.7 25.3C129.7 8.5 158.5 8.5 158.5 25.3C158.5 8.5 187.3 8.5 187.3 25.3C187.3 8.5 216.1 8.5 216.1 25.3C216.1 8.5 244.9 8.5 244.9 25.3C244.9 8.5 273.7 8.5 273.7 25.3C273.7 8.5 302.5 8.5 302.5 25.3C302.5 8.5 331.3 8.5 331.3 25.3C331.3 8.5 360.1 8.5 360.1 25.3C360.1 8.5 388.9 8.5 388.9 25.3C388.9 8.5 417.7 8.5 417.7 25.3C417.7 8.5 446.5 8.5 446.5 25.3C446.5 8.5 475.3 8.5 475.3 25.3C475.3 8.5 504.1 8.5 504.1 25.3C504.1 8.5 532.9 8.5 532.9 25.3C532.9 8.5 561.7 8.5 561.7 25.3C561.7 8.5 590.5 8.5 590.5 25.3C590.5 8.5 619.3 8.5 619.3 25.3C619.3 8.5 648.1 8.5 648.1 25.3C648.1 8.5 676.9 8.5 676.9 25.3C676.9 8.5 705.7 8.5 705.7 25.3C705.7 8.5 734.5 8.5 734.5 25.3C734.5 8.5 763.3 8.5 763.3 25.3C763.3 8.5 792.1 8.5 792.1 25.3',
];

/** Every number is one half of an `x y` pair, in order, so parity is the parser. */
const shiftSeigaiha = (d: string, dx: number, dy: number): string => {
  let i = 0;
  return d.replace(/-?\d*\.?\d+/g, (n) => {
    const shifted = Number(n) + (i++ % 2 === 0 ? dx : dy);
    return String(Number(shifted.toFixed(5)));
  });
};

const { width: W, height: H } = seigaihaTile;

export const seigaihaTiledPaths: readonly string[] = [
  ...seigaihaPaths,
  shiftSeigaiha(seigaihaPaths[0], -W, 0),
  shiftSeigaiha(seigaihaPaths[1], W, 0),
  shiftSeigaiha(seigaihaPaths[1], 0, -H),
  shiftSeigaiha(seigaihaPaths[1], W, -H),
];

/**
 * One tile as a `background-image`, exactly as the app's DOM half builds it
 * (packages/ui/src/components/ScalesBackground): the paths are drawn at the
 * native tile size and the whole document is scaled, so the drawing moves away
 * from the eye instead of shearing. 1px is the only stroke weight for a
 * boundary in this system, so the authored width is divided by the scale to
 * survive the multiplication.
 */
export const seigaihaTileUrl = (stroke: string, scale: number): string => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${seigaihaTile.width * scale}" height="${seigaihaTile.height * scale}" viewBox="0 0 ${seigaihaTile.width} ${seigaihaTile.height}">` +
    seigaihaTiledPaths
      .map((d) => `<path d="${d}" stroke="${stroke}" stroke-width="${1 / scale}" fill="none"/>`)
      .join('') +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};
