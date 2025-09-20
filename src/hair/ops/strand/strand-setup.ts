// src/hair/ops/strand/strand-setup.ts
import * as THREE from "three";
import { MathUtils } from "../../../utils/math.utils";
import { SpawnOps } from "../spawn-ops";
import type { StudioState } from "../../../models/studio.int";
import { SpawnFrame } from "./spawn-frame.type";
import { CurlParams } from "./curl-params";
import { FrizzParams } from "./frizz-params";

export class StrandSetup {
  /** Discretização 0..1 */
  static makeTArray(points: number) {
    const total = Math.max(2, points);
    return Array.from({ length: total }, (_, i) => i / (total - 1));
  }

  /** Comprimento alvo do fio */
  static chooseLength(rand: () => number, s: StudioState) {
    return s.fixed_length_size
      ? Math.max(0, s.combined_length)
      : MathUtils.lerp(s.minimum_length, s.maximum_length, rand());
  }

  /** Altura útil dentro da célula (em px) derivada de L */
  static computeLocalHeight(L: number, usableH: number) {
    const REF = 20;      // mesma referência do código original
    const minFrac = 0.1; // piso de 10% da célula
    const localFrac = MathUtils.clamp(L / Math.max(1e-6, REF), 0, 1);
    return THREE.MathUtils.lerp(minFrac * usableH, usableH, localFrac);
  }

  /** Base do plano de spawn (frame e elipse), compatível com SpawnOps */
  static buildSpawnFrame(cellW: number, cellH: number, s: StudioState): SpawnFrame {
    const { padBot, usableH, yTop, radiusX, radiusY, tiltRad } =
      SpawnOps.computeGizmoParams(cellW, cellH, s);

    const qTilt = new THREE.Quaternion()
      .setFromAxisAngle(new THREE.Vector3(1, 0, 0), tiltRad);

    // bases do plano inclinado
    const e1 = new THREE.Vector3(1, 0, 0).applyQuaternion(qTilt);
    const e2 = new THREE.Vector3(0, 0, 1).applyQuaternion(qTilt);

    return { yTop, yMin: padBot, e1, e2, radiusX, radiusY, tiltRad };
  }

  /** Amostra uniforme num disco elíptico (no plano e1/e2). */
  static sampleSpawnDisk(rand: () => number, frame: SpawnFrame) {
    const u = rand(), v = rand();
    const r = Math.sqrt(u);
    const ang = 2 * Math.PI * v;
    const px = Math.cos(ang) * r * frame.radiusX;
    const pz = Math.sin(ang) * r * frame.radiusY;
    return frame.e1.clone().multiplyScalar(px).add(frame.e2.clone().multiplyScalar(pz));
  }

  /** Posição base de spawn, já em coordenadas “do card” (x,z) e y = topo local */
  static spawnBase(rand: () => number, frame: SpawnFrame, enabled: boolean) {
    const disk = enabled ? this.sampleSpawnDisk(rand, frame) : new THREE.Vector3();
    return new THREE.Vector3(0, frame.yTop, 0).add(disk);
  }

  /** Vetor aleatório base para variações (spread/clump) */
  static randomUnit(rand: () => number) {
    return new THREE.Vector3(
      (rand() - 0.5) * 2,
      (rand() - 0.5) * 2,
      (rand() - 0.5) * 2
    );
  }

  /** Parâmetros por-fio de curl */
  static makeCurlParams(rand: () => number): CurlParams {
    const phase = 2 * Math.PI * rand();
    const azimuth = 2 * Math.PI * rand();
    const freqJit = 1 + 0.15 * (rand() - 0.5);
    const ampJit = 1 + 0.25 * (rand() - 0.5);
    const qYaw = new THREE.Quaternion()
      .setFromAxisAngle(new THREE.Vector3(0, 1, 0), azimuth);
    return { phase, azimuth, freqJit, ampJit, qYaw };
  }

  /** Parâmetros por-fio de frizz */
  static makeFrizzParams(rand: () => number): FrizzParams {
    return { offX: rand() * 1000, offY: rand() * 1000 };
  }
}