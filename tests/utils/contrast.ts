/** Parses a CSS `rgb(r, g, b)` / `rgba(r, g, b, a)` computed-style string into [r, g, b]. */
export function parseRgb(css: string): [number, number, number] {
  const m = css.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (!m) throw new Error(`Not an rgb()/rgba() color: "${css}"`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const [R, G, B] = [toLinear(r), toLinear(g), toLinear(b)];
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/** WCAG 2.x contrast ratio between two sRGB colors, from 1:1 (no contrast) to 21:1. */
export function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const [l1, l2] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** WCAG 2.1 AA minimum for normal-weight body text. Large text (18pt+/14pt+bold) only needs 3:1. */
export const AA_NORMAL_TEXT = 4.5;
