// noise.utils.ts
import { makeNoise2D } from 'open-simplex-noise';

export class NoiseUtils {
  private static seed = 0;
  private static noise2D = makeNoise2D(0);

  static setSeed(seed: number) {
    this.seed = seed;
    this.noise2D = makeNoise2D(seed);
  }

  static fbm2(x: number, y: number, octaves = 4, seed?: number) {
    if (seed !== undefined && seed !== this.seed) this.setSeed(seed);
    let v = 0, amp = 0.5, sumAmp = 0;
    for (let i = 0; i < octaves; i++) {
      v += amp * this.noise2D(x, y);
      sumAmp += amp;
      x *= 2; y *= 2; amp *= 0.5;
    }
    return (v / sumAmp) * 0.5 + 0.5; // [0,1]
  }
}
