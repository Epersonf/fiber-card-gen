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

    // 3) Altura-alvo dentro da célula (0..usableH)
    const MAX_UI = s.fixed_length_size ? 20 : Math.max(1e-3, s.maximum_length);
    const localHeight = MathUtils.clamp(L / MAX_UI, 0, 1) * usableH;

    // Topo (pivot) e fundo da célula
    const yTop = padBot + usableH;
    const yMin = padBot;

    // 4) Plane de spawn no TOPO (levemente inclinado)
    const spawnEnabled = s.spawn_enabled ?? true;
    const tiltRad = THREE.MathUtils.degToRad(s.spawn_tilt_deg ?? 6);
    const qTilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), tiltRad);
    const e1 = new THREE.Vector3(1, 0, 0).applyQuaternion(qTilt);
    const e2 = new THREE.Vector3(0, 0, 1).applyQuaternion(qTilt);
    const radiusPx = (s.spawn_radius_ratio ?? 0.12) * cellW;

    // amostra uniforme no disco
    const u = rand(), v = rand();
    const r = radiusPx * Math.sqrt(u);
    const ang = 2 * Math.PI * v;
    const disk = e1.clone().multiplyScalar(r * Math.cos(ang)).add(e2.clone().multiplyScalar(r * Math.sin(ang)));

    const spawnBase = new THREE.Vector3(0, yTop, 0).add(spawnEnabled ? disk : new THREE.Vector3());

    // 5) Vetor randômico base para spread/clump
    const r_k = new THREE.Vector3(
      (rand() - 0.5) * 2,
      (rand() - 0.5) * 2,
      (rand() - 0.5) * 2
    );

    // 6) VARIAÇÃO POR FIO (mesmo em fixed length)
    const curlPhase = 2 * Math.PI * rand();          // fase aleatória
    const curlAzimuth = 2 * Math.PI * rand();          // rotação Y do curl
    const curlFreqJit = 1 + 0.15 * (rand() - 0.5);     // ±15% frequência
    const curlAmpJit = 1 + 0.25 * (rand() - 0.5);     // ±25% amplitude
    const frizzOffX = rand() * 1000;                 // offset de noise por fio
    const frizzOffY = rand() * 1000;

    const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), curlAzimuth);

    // 7) Perfis
    const c = (t: number) => MathUtils.lerp(s.clump_root, s.clump_tip, t) / 1000;
    const sigma_c = (t: number) => Math.pow(t, s.hairline_shape);

    // 8) Curva
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < total; i++) {
      const t = tArr[i];
      const s_t = t * L;

      // Cresce do topo para baixo
      let y = yTop - t * localHeight;
      y = Math.max(yMin, Math.min(yTop, y));

      // Spread / Clump
      const spreadAmount = s.spread_amount_offset;
      const o_spread = r_k.clone().multiplyScalar(sigma_c(t) * c(t) * spreadAmount);
      const o_clump = r_k.clone().multiplyScalar(sigma_c(t) * c(t) * spreadAmount * 0.5);

      // Curl (com jitter de fase/freq/amp + rotação em Y)
      let o_curl = new THREE.Vector3(0, 0, 0);
      if (s.enable_hair_curl) {
        const baseOmega = (s.curl_shape * Math.PI * 2) + (s.curl_count ?? 0) * Math.PI * 2;
        const omega = baseOmega * curlFreqJit;
        const theta = omega * t + curlPhase;
        const amp = (s.curl_amount * s.curl_scale) * curlAmpJit;
        const phi = Math.PI / 2;

        const curlVec = new THREE.Vector3(
          Math.sin(theta) * amp * t,
          0,
          Math.sin(theta + phi) * amp * t
        ).applyQuaternion(qYaw);

        o_curl = curlVec;
      }

      // Frizz (FBM) com seed por fio
      let o_frizz = new THREE.Vector3(0, 0, 0);
      if (s.enable_frizz_hair) {
        const kappa = s.messiness_scale;
        const qx = i + frizzOffX;
        const qy = kappa * s_t + frizzOffY;
        const n = NoiseUtils.fbm2(qx, qy);
        const centered = 2 * n - 1;
        const env = s.frizz_curve_enabled ? FrizzUtils.evalCurve(t, s.frizz_curve_points) : 1;
        o_frizz = new THREE.Vector3(centered, centered, centered).multiplyScalar(s.frizz_scale * env);
      }

      arr.push(new THREE.Vector3(
        spawnBase.x + o_spread.x + o_clump.x + o_curl.x + o_frizz.x,
        y,
        spawnBase.z + o_spread.z + o_clump.z + o_curl.z + o_frizz.z
      ));
    }

    return arr;
  }



}
