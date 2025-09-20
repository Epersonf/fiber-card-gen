export class NoiseUtils {
  static fbm(x: number, y: number, octaves = 4): number {
    let value = 0;
    let amplitude = 0.5;

    for (let i = 0; i < octaves; i++) {
      value += amplitude * Math.sin(x * 10 + y * 5);
      x *= 2;
      y *= 2;
      amplitude *= 0.5;
    }

    return value;
  }
}