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

    // 2) Comprimento (fixo ou aleatório)
    const L = s.fixed_length_size
      ? Math.max(0, s.combined_length)
      : MathUtils.lerp(s.minimum_length, s.maximum_length, rand());

    // 3) Altura-alvo na célula: proporcional ao slider
    //    - fixed: slider 0..20 → 0..usableH
    //    - rand:  0..maximum_length → 0..usableH
    const MAX_UI = s.fixed_length_size ? 20 : Math.max(1e-3, s.maximum_length);
    const localHeight = MathUtils.clamp(L / MAX_UI, 0, 1) * usableH;

    // Limites de Y da célula
    const yMax = padBot + usableH;

    // 4) Plane de spawn inclinado (disco)
    const spawnEnabled = s.spawn_enabled ?? true;
    const tiltRad = THREE.MathUtils.degToRad(s.spawn_tilt_deg ?? 6);
    const qTilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), tiltRad);
    const e1 = new THREE.Vector3(1, 0, 0).applyQuaternion(qTilt);
    const e2 = new THREE.Vector3(0, 0, 1).applyQuaternion(qTilt);
    const radiusPx = (s.spawn_radius_ratio ?? 0.12) * cellW;

    // amostra uniforme no disco (sqrt para distribuição uniforme)
    const u = rand(), v = rand();
    const r = radiusPx * Math.sqrt(u);
    const ang = 2 * Math.PI * v;
    const disk = e1.clone().multiplyScalar(r * Math.cos(ang)).add(e2.clone().multiplyScalar(r * Math.sin(ang)));

    const spawnBase = new THREE.Vector3(0, padBot, 0).add(spawnEnabled ? disk : new THREE.Vector3());

    // 5) Vetor randômico base para spread/clump
    const r_k = new THREE.Vector3(
      (rand() - 0.5) * 2,
      (rand() - 0.5) * 2,
      (rand() - 0.5) * 2
    );

    // 6) Perfis
    const c = (t: number) => MathUtils.lerp(s.clump_root, s.clump_tip, t) / 1000;
    const sigma_c = (t: number) => Math.pow(t, s.hairline_shape);

    // 7) Geração da curva
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < total; i++) {
      const t = tArr[i];
      const s_t = t * L; // usado no domínio do frizz
      let y = spawnBase.y + t * localHeight; // crescimento real controlado por L
      y = Math.min(y, yMax);                 // não vaza a célula

      // Spread (ruído) + Clump (aperto)
      const spreadAmount = s.spread_amount_offset;
      const o_spread = r_k.clone().multiplyScalar(sigma_c(t) * c(t) * spreadAmount);
      const o_clump = r_k.clone().multiplyScalar(sigma_c(t) * c(t) * spreadAmount * 0.5);

      // Curl (no plano xz do card; alinhamento à tangente pode ser adicionado depois)
      let o_curl = new THREE.Vector3(0, 0, 0);
      if (s.enable_hair_curl) {
        const omega = (s.curl_shape * Math.PI * 2) + (s.curl_count ?? 0) * Math.PI * 2;
        const theta = omega * t;
        const amp = s.curl_amount * s.curl_scale;
        const phi = Math.PI / 2;
        const u_cx = Math.sin(theta);
        const u_cz = Math.sin(theta + phi);
        o_curl = new THREE.Vector3(u_cx * amp * t, 0, u_cz * amp * t);
      }

      // Frizz (FBM centrado)
      let o_frizz = new THREE.Vector3(0, 0, 0);
      if (s.enable_frizz_hair) {
        const kappa = s.messiness_scale;
        const qx = i;
        const qy = kappa * s_t;
        const n = NoiseUtils.fbm(qx, qy);
        const centered = 2 * n - 1;
        const env = s.frizz_curve_enabled ? FrizzUtils.evalCurve(t, s.frizz_curve_points) : 1;
        o_frizz = new THREE.Vector3(centered, centered, centered).multiplyScalar(s.frizz_scale * env);
      }

      // Ponto final
      const p = new THREE.Vector3(
        spawnBase.x + o_spread.x + o_clump.x + o_curl.x + o_frizz.x,
        y,
        spawnBase.z + o_spread.z + o_clump.z + o_curl.z + o_frizz.z
      );
      arr.push(p);
    }

    // leve afunilamento geométrico (opcional)
    arr[arr.length - 1].x *= 0.8;
    return arr;
  }

}
