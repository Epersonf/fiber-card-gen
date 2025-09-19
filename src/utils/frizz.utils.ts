// src/utils/frizz.utils.ts
export type CurvePoint = { x: number; y: number };

export class FrizzUtils {
  /**
   * Avalia curva piecewise-linear definida por pts (ordenados por x).
   * Se lista for vazia ou com 1 ponto, retorna t.
   */
  static evalCurve(t: number, pts: CurvePoint[]): number {
    if (!pts || pts.length < 2) return t;

    // clamps nos extremos
    if (t <= pts[0].x) return pts[0].y;
    if (t >= pts[pts.length - 1].x) return pts[pts.length - 1].y;

    // busca segmento onde t está
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      if (t >= a.x && t <= b.x) {
        const u = (t - a.x) / (b.x - a.x);
        return a.y + (b.y - a.y) * u;
      }
    }
    // fallback (não deveria acontecer se pts cobrir [0,1])
    return t;
  }
}
