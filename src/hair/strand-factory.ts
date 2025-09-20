import * as THREE from "three";
import { StrandSetup } from "./ops/strand/strand-setup";
import { StrandOffsets } from "./ops/strand/strand-offsets";
import type { StudioState } from "../models/studio.int";

export class StrandFactory {
  static makeStrandCurve(
    points: number,
    cellW: number,
    usableH: number,
    padBot: number,
    rand: () => number,
    s: StudioState
  ): THREE.Vector3[] {
    // 1) Discretização + comprimento/altura local
    const tArr = StrandSetup.makeTArray(points);
    const L = StrandSetup.chooseLength(rand, s);
    const localHeight = StrandSetup.computeLocalHeight(L, usableH);

    // Limites Y na célula
    const yTop = padBot + usableH;
    const yMin = padBot;

    // 2) Frame do plano de spawn + ponto base
    const frame = StrandSetup.buildSpawnFrame(cellW, usableH + padBot, s);
    const spawnBase = StrandSetup.spawnBase(rand, frame, s.spawn_enabled ?? true);

    // 3) Parâmetros por-fio
    const r_k = StrandSetup.randomUnit(rand);
    const curlParams = StrandSetup.makeCurlParams(rand);
    const frizzParams = StrandSetup.makeFrizzParams(rand);

    // 4) Constrói a curva (sempre descendo a partir do plano)
    const arr: THREE.Vector3[] = [];
    const total = tArr.length;

    for (let i = 0; i < total; i++) {
      const t = tArr[i];
      const s_t = t * L;

      // Y: desce de yTop até yMin (clamp pra manter nos limites do card)
      let y = spawnBase.y - t * localHeight;
      y = Math.max(yMin, Math.min(yTop, y));

      // Offsets
      const { o_spread, o_clump } = StrandOffsets.spreadClump(t, r_k, s);
      const o_curl = StrandOffsets.curl(t, curlParams, s);
      const o_frizz = StrandOffsets.frizz(i, t, s_t, frizzParams, s);

      // XZ somente (todos os offsets acima já zeram Y)
      const x = spawnBase.x + o_spread.x + o_clump.x + o_curl.x + o_frizz.x;
      const z = spawnBase.z + o_spread.z + o_clump.z + o_curl.z + o_frizz.z;

      arr.push(new THREE.Vector3(x, y, z));
    }

    return arr;
  }
}
