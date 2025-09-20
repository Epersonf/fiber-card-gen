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
    const total = Math.max(2, points);

    // ---- Comprimento lógico (slider / min-max) ----
    const L = s.fixed_length_size
      ? Math.max(0, s.combined_length)
      : MathUtils.lerp(s.minimum_length, s.maximum_length, rand());

    // Fração visível (0..1) – só até aqui geraremos pontos
    const tMax = MathUtils.clamp(
      s.fixed_length_size
        ? L / 20 // slider 0..20
        : L / Math.max(1e-3, s.maximum_length),
      0, 1
    );

    // Garantir pelo menos 2 pontos
    const keep = Math.max(2, Math.round(1 + (total - 1) * tMax));
    const tArr = Array.from({ length: keep }, (_, i) => (keep === 1 ? 0 : (i / (keep - 1)) * tMax));

    // ---- Topo como pivot / spawn plane no topo ----
    const yTop = padBot + usableH;
    const yMin = padBot;

    const tiltRad = THREE.MathUtils.degToRad(s.spawn_tilt_deg ?? 6);
    const qTilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), tiltRad);
    const e1 = new THREE.Vector3(1, 0, 0).applyQuaternion(qTilt);
    const e2 = new THREE.Vector3(0, 0, 1).applyQuaternion(qTilt);
    const radiusPx = (s.spawn_radius_ratio ?? 0.12) * cellW;

    // disco uniforme
    const u = rand(), v = rand();
    const r = radiusPx * Math.sqrt(u);
    const ang = 2 * Math.PI * v;
    const disk = e1.clone().multiplyScalar(r * Math.cos(ang)).add(e2.clone().multiplyScalar(r * Math.sin(ang)));

    const spawnBase = new THREE.Vector3(0, yTop, 0).add((s.spawn_enabled ?? true) ? disk : new THREE.Vector3());

    // ruído base para spread/clump
    const r_k = new THREE.Vector3((rand() - 0.5) * 2, (rand() - 0.5) * 2, (rand() - 0.5) * 2);

    const c = (t: number) => MathUtils.lerp(s.clump_root, s.clump_tip, t) / 1000;
    const sigma_c = (t: number) => Math.pow(t, s.hairline_shape);

    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < tArr.length; i++) {
      const t = tArr[i];          // 0 (topo) → tMax (corta antes da base)
      const s_t = t * L;          // domínio do frizz/curl baseado no comprimento lógico

      // Y sem escala: topo → base linear, cortado por tMax
      let y = yTop - t * usableH;
      y = Math.max(yMin, Math.min(yTop, y));

      // spread/clump
      const spreadAmount = s.spread_amount_offset;
      const o_spread = r_k.clone().multiplyScalar(sigma_c(t) * c(t) * spreadAmount);
      const o_clump = r_k.clone().multiplyScalar(sigma_c(t) * c(t) * spreadAmount * 0.5);

      // curl
      let o_curl = new THREE.Vector3(0, 0, 0);
      if (s.enable_hair_curl) {
        const omega = (s.curl_shape * Math.PI * 2) + (s.curl_count ?? 0) * Math.PI * 2;
        const theta = omega * t;
        const amp = s.curl_amount * s.curl_scale;
        o_curl = new THREE.Vector3(Math.sin(theta) * amp * t, 0, Math.sin(theta + Math.PI / 2) * amp * t);
      }

      // frizz
      let o_frizz = new THREE.Vector3(0, 0, 0);
      if (s.enable_frizz_hair) {
        const kappa = s.messiness_scale;
        const n = NoiseUtils.fbm(i, kappa * s_t);
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

    // afunilamento leve opcional
    arr[arr.length - 1].x *= 0.8;
    return arr;
  }


}
