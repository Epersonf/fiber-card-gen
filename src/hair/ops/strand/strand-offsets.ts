// src/hair/ops/strand/strand-offsets.ts
import * as THREE from "three";
import { FrizzUtils } from "../../../utils/frizz.utils";
import { NoiseUtils } from "../../../utils/noise.utils";
import type { StudioState } from "../../../models/studio.int";
import { CurlParams } from "./curl-params";
import { FrizzParams } from "./frizz-params";

export class StrandOffsets {
  /** Envelope radial (hairline) e intensidade de agrupamento (clump) */
  private static sigmaC(t: number, hairlineShape: number) {
    return Math.pow(t, hairlineShape);
  }

  private static clump(t: number, s: StudioState) {
    // mantém a escala original (dividido por 1000) para equivalência
    const c = THREE.MathUtils.lerp(s.clump_root, s.clump_tip, t) / 1000;
    return c;
  }

  /** Spread + Clump no plano XZ */
  static spreadClump(t: number, r_k: THREE.Vector3, s: StudioState) {
    const c = this.clump(t, s);
    const sigma = this.sigmaC(t, s.hairline_shape);
    const spread = s.spread_amount_offset;

    const sc = sigma * c * spread;
    const o_spread = r_k.clone().multiplyScalar(sc);
    const o_clump = r_k.clone().multiplyScalar(sc * 0.5);

    // só XZ (mantemos Y = 0 nesse offset)
    o_spread.y = 0; o_clump.y = 0;
    return { o_spread, o_clump };
  }

  /** Curl por-fio, paramétrico em t */
  static curl(t: number, params: CurlParams, s: StudioState) {
    if (!s.enable_hair_curl) return new THREE.Vector3(0, 0, 0);

    const baseOmega = (s.curl_shape * Math.PI * 2) + (s.curl_count ?? 0) * Math.PI * 2;
    const omega = baseOmega * params.freqJit;
    const theta = omega * t + params.phase;
    const amp = (s.curl_amount * s.curl_scale) * params.ampJit;
    const phi = Math.PI / 2;

    const curlVec = new THREE.Vector3(
      Math.sin(theta) * amp * t,
      0,
      Math.sin(theta + phi) * amp * t
    ).applyQuaternion(params.qYaw);

    return curlVec;
  }

  /** Frizz por-fio (usar FBM e envelope opcional por curva) */
  static frizz(iRing: number, t: number, s_t: number, params: FrizzParams, s: StudioState) {
    if (!s.enable_frizz_hair) return new THREE.Vector3(0, 0, 0);

    const qx = iRing + params.offX;
    const qy = (s.messiness_scale) * s_t + params.offY;
    const n = NoiseUtils.fbm2(qx, qy);
    const centered = 2 * n - 1;

    const env = s.frizz_curve_enabled
      ? FrizzUtils.evalCurve(t, s.frizz_curve_points)
      : 1;

    const k = s.frizz_scale * env;

    // noise isótropo em XZ (mantém Y = 0)
    return new THREE.Vector3(centered * k, 0, centered * k);
  }
}
