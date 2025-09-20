import * as THREE from "three";
import { MathUtils } from "../utils/math.utils";
import { FrizzUtils } from "../utils/frizz.utils";
import { NoiseUtils } from "../utils/noise.utils";
import { StudioState } from "../models/studio.int";

export class StrandFactory {
  static makeStrandCurve(
    points: number,
    cellW: number,
    usableH: number,
    padBot: number,
    rand: () => number,
    s: StudioState
  ): THREE.Vector3[] {
    // 1) Discretização
    const total = Math.max(2, points);
    const tArr = Array.from({ length: total }, (_, i) => i / (total - 1));

    // 2) Comprimento (fixo ou aleatório)
    const L = s.fixed_length_size
      ? Math.max(0, s.combined_length)
      : MathUtils.lerp(s.minimum_length, s.maximum_length, rand());

    // 3) Altura-alvo dentro da célula (0..usableH)
    const REF = 20; // ou torne configurável
    const localFrac = MathUtils.clamp(L / Math.max(1e-6, REF), 0, 1);
    const minFrac = 0.1; // piso de 10% da célula
    const localHeight = THREE.MathUtils.lerp(minFrac * usableH, usableH, localFrac);

    // Topo (pivot) e fundo da célula
    const yTop = padBot + usableH;
    const yMin = padBot;

    // 4) Plane de spawn no TOPO (levemente inclinado) — fios SEMPRE descem a partir dele
    const spawnEnabled = s.spawn_enabled ?? true;
    const tiltRad = THREE.MathUtils.degToRad(s.spawn_tilt_deg ?? 6);
    const qTilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), tiltRad);

    // bases locais do plano (X e Z inclinados em torno de X)
    const e1 = new THREE.Vector3(1, 0, 0).applyQuaternion(qTilt); // eixo X do plano
    const e2 = new THREE.Vector3(0, 0, 1).applyQuaternion(qTilt); // eixo Z do plano

    // elipse (raios independentes em X/Y, ambos relativos à largura da célula)
    const radiusX = (s.spawn_radius_ratio_x ?? 0.12) * cellW;
    const radiusY = (s.spawn_radius_ratio_y ?? 0.12) * cellW;

    // amostra uniforme na elipse via círculo unitário escalado: (cosθ, sinθ) * sqrt(u)
    const u = rand(), v = rand();
    const r = Math.sqrt(u);
    const ang = 2 * Math.PI * v;
    const px = Math.cos(ang) * r * radiusX;
    const pz = Math.sin(ang) * r * radiusY;

    // “disco” no plano inclinado
    const disk = e1.clone().multiplyScalar(px).add(e2.clone().multiplyScalar(pz));

    // origem do fio no plano (em yTop + inclinação local do plano)
    const spawnBase = new THREE.Vector3(0, yTop, 0).add(spawnEnabled ? disk : new THREE.Vector3());

    // 5) Vetor randômico base para spread/clump
    const r_k = new THREE.Vector3(
      (rand() - 0.5) * 2,
      (rand() - 0.5) * 2,
      (rand() - 0.5) * 2
    );

    // 6) VARIAÇÃO POR FIO
    const curlPhase = 2 * Math.PI * rand();
    const curlAzimuth = 2 * Math.PI * rand();
    const curlFreqJit = 1 + 0.15 * (rand() - 0.5);
    const curlAmpJit = 1 + 0.25 * (rand() - 0.5);
    const frizzOffX = rand() * 1000;
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

      // >>> SEMPRE PARA BAIXO a partir do plano (spawnBase):
      const yTopLocal = spawnBase.y;          // topo “real” do fio = altura do plano naquele ponto
      let y = yTopLocal - t * localHeight;    // desce monotonicamente
      y = Math.max(yMin, Math.min(yTop, y));  // clamp entre limites da célula

      // Spread / Clump
      const spreadAmount = s.spread_amount_offset;
      const o_spread = r_k.clone().multiplyScalar(sigma_c(t) * c(t) * spreadAmount);
      const o_clump = r_k.clone().multiplyScalar(sigma_c(t) * c(t) * spreadAmount * 0.5);

      // Curl
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

      // Frizz (FBM)
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
