// src/utils/rng.utils.ts
export class RNGUtils {
  /** mulberry32: retorna um gerador determinístico (0..1) a partir de seed */
  static mulberry32(seed: number): () => number {
    let a = seed | 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
}
