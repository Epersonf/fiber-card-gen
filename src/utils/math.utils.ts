// src/utils/math.utils.ts
export class MathUtils {
  /** a + (b - a) * t */
  static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /** limita v ao intervalo [min, max] */
  static clamp(v: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, v));
  }

  /** remapeia x de [a,b] para [c,d] */
  static remap(x: number, a: number, b: number, c: number, d: number): number {
    return c + ((x - a) * (d - c)) / (b - a);
  }

  /** divisão inteira para cima */
  static ceilDiv(a: number, b: number): number {
    return Math.floor((a + b - 1) / b);
  }
}
