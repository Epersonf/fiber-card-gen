import * as THREE from "three";
import { MathUtils } from "../utils/math.utils";
import { FrizzUtils } from "../utils/frizz.utils";
import { type StudioStateSubset } from "./types";
import { NoiseUtils } from "../utils/noise.utils";

export class StrandFactory {
  static makeStrandCurve(
    points: number,
    cellW: number,
    usableH: number,
    padBot: number,
    rand: () => number,
    s: StudioStateSubset
  ): THREE.Vector3[] {
    // 1) Discretização
    const total = Math.max(2, points);
    const tArr = Array.from({ length: total }, (_, i) => i / (total - 1));

    // 2) Comprimento aleatório
    const L = s.fixed_length_size ? s.combined_length : MathUtils.lerp(s.minimum_length, s.maximum_length, rand());
    const yScale = usableH / Math.max(1e-3, (s.fixed_length_size ? s.combined_length : s.maximum_length) || L);

    // 3) Parâmetros base
    const xMaxBase = cellW * 0.33;
    const zScaleBase = cellW * 0.06;

    // 4) Vetor randômico para spread/clumping
    const r_k = new THREE.Vector3(
      (rand() - 0.5) * 2,
      (rand() - 0.5) * 2,
      (rand() - 0.5) * 2
    );

    // 5) Funções de perfil ao longo da curva
    function c(t: number) {
      return MathUtils.lerp(s.clump_root, s.clump_tip, t) / 1000;
    }

    function sigma_c(t: number) {
      return Math.pow(t, s.hairline_shape);
    }
    function sigma_f(t: number) {
      // Frizz envelope
      return s.frizz_curve_enabled ? Math.pow(FrizzUtils.evalCurve(t, s.frizz_curve_points), 1.0) : 1.0;
    }

    // 6) Pipeline
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < total; i++) {
      const t = tArr[i];
      const s_t = t * L;
      const y = padBot + s_t * yScale;

      // Spread/clumping
      const spreadAmount = s.spread_amount_offset;
      const o_spread = r_k.clone().multiplyScalar(sigma_c(t) * c(t) * spreadAmount);

      // Clumping (aperto)
      const o_clump = r_k.clone().multiplyScalar(sigma_c(t) * c(t) * spreadAmount * 0.5);

      // Curl
      let o_curl = new THREE.Vector3(0, 0, 0);
      if (s.enable_hair_curl) {
        const omega = s.curl_shape * Math.PI * 2;
        const theta = omega * t;
        const amp = s.curl_amount * s.curl_scale;

        // Modelo Lissajous com fase
        const phi = Math.PI / 2; // 90° de defasagem
        const u_curl_x = Math.sin(theta);
        const u_curl_y = Math.sin(theta + phi);

        // Rotacionar para o plano ortogonal (aproximação)
        const curlVec = new THREE.Vector3(
          u_curl_x * amp * t,
          0,
          u_curl_y * amp * t
        );

        o_curl = curlVec;
      }

      // Frizz
      let o_frizz = new THREE.Vector3(0, 0, 0);
      if (s.enable_frizz_hair) {
        const kappa = s.messiness_scale;
        const qx = i;
        const qy = kappa * s_t;

        // Usar FBM noise
        const noise = NoiseUtils.fbm(qx, qy);
        const centeredNoise = 2 * noise - 1;

        // Aplicar envelope de curva
        const env = s.frizz_curve_enabled ?
          FrizzUtils.evalCurve(t, s.frizz_curve_points) : 1;

        o_frizz = new THREE.Vector3(
          centeredNoise,
          centeredNoise,
          centeredNoise
        ).multiplyScalar(s.frizz_scale * env);
      }

      // Soma pipeline
      const p = new THREE.Vector3(
        o_spread.x + o_clump.x + o_curl.x + o_frizz.x,
        y,
        o_spread.z + o_clump.z + o_curl.z + o_frizz.z
      );
      arr.push(p);
    }

    // Afunilamento na ponta
    arr[arr.length - 1].x *= 0.8;
    return arr;
  }

  // ...existing code...
}
