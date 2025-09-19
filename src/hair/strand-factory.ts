import * as THREE from "three";
import { MathUtils } from "../utils/math.utils";
import { FrizzUtils } from "../utils/frizz.utils";
import { type StudioStateSubset } from "./types";

export class StrandFactory {
  static makeStrandCurve(
    points: number,
    cellW: number,
    usableH: number,
    padBot: number,
    rand: () => number,
    s: StudioStateSubset
  ): THREE.Vector3[] {
    const arr: THREE.Vector3[] = [];
    const len = s.fixed_length_size
      ? s.combined_length
      : MathUtils.lerp(s.minimum_length, s.maximum_length, rand());
    const total = Math.max(2, points);
    const yScale = usableH / Math.max(1e-3, (s.fixed_length_size ? s.combined_length : s.maximum_length) || len);
    const xMaxBase = cellW * 0.33;

    for (let i = 0; i < total; i++) {
      const t = i / (total - 1);
      const y = t * len;

      const clDen = Math.max(1.0, s.clump_root + s.clump_tip);
      const clumpT = MathUtils.clamp((t * s.clump_tip + (1 - t) * s.clump_root) / clDen, 0, 1);
      const spreadK = (s.spread_amount_offset / 50) * (1 - clumpT);
      const baseX = StrandFactory.baseSpread(rand, xMaxBase, spreadK);

      const curlX = StrandFactory.curlX(t, s, xMaxBase);
      const frizzAmp = (s.enable_frizz_hair ? s.frizz_scale : 0) * 0.03 * xMaxBase;
      const frizz = (rand() - 0.5) * frizzAmp * (s.frizz_curve_enabled ? FrizzUtils.evalCurve(t, s.frizz_curve_points) : t);

      const mess =
        s.enable_messiness_hair && t >= s.messiness_starting_point
          ? (rand() - 0.5) * (s.messiness_strength * 0.02) * xMaxBase
          : 0;

      const x = baseX + curlX + frizz + mess;
      arr.push(new THREE.Vector3(x, padBot + y * yScale, 0));
    }

    // leve afunilamento na ponta
    arr[arr.length - 1].x *= 0.8;
    return arr;
  }

  private static curlX(t: number, s: StudioStateSubset, xMaxBase: number) {
    if (!s.enable_hair_curl) return 0;
    const amp = s.curl_amount * 0.02 * xMaxBase;
    const freq = Math.max(0.0001, s.curl_scale * 4 + s.curl_count);
    return amp * Math.sin(t * Math.PI * freq);
  }

  private static baseSpread(rand: () => number, xMax: number, spreadK: number) {
    return (rand() - 0.5) * xMax * spreadK;
  }
}
