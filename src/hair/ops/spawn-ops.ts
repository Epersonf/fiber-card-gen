// src/hair/ops/SpawnOps.ts
import * as THREE from "three";
import { ThicknessUtils } from "../../utils/thickness.utils";
import type { StudioState } from "../../models/studio.int";

/**
 * Cálculos compartilhados do plano de spawn e padding do card.
 * Mantém 100% de compatibilidade com a lógica atual.
 */
export class SpawnOps {
  /** Padding e altura útil do card, em px. */
  static computePadding(cellW: number, cellH: number, s: StudioState) {
    const maxRadiusPx = Math.max(
      ThicknessUtils.toRadiusPx(s.root_thickness, cellW),
      ThicknessUtils.toRadiusPx(s.tip_thickness, cellW)
    );
    const basePad = cellH * 0.09;
    const padTop = basePad + maxRadiusPx;
    const padBot = basePad + maxRadiusPx;
    const usableH = Math.max(1, cellH - padTop - padBot);
    return { padTop, padBot, usableH };
  }

  /** Parâmetros do gizmo/plane de spawn para um card (topo local e elipse). */
  static computeGizmoParams(cellW: number, cellH: number, s: StudioState) {
    const { padBot, usableH } = this.computePadding(cellW, cellH, s);
    const yTop = padBot + usableH;
    const radiusX = (s.spawn_radius_ratio_x ?? 0.12) * cellW;
    const radiusY = (s.spawn_radius_ratio_y ?? 0.12) * cellW;
    const tiltRad = THREE.MathUtils.degToRad(s.spawn_tilt_deg ?? 6);
    return { padBot, usableH, yTop, radiusX, radiusY, tiltRad };
  }
}
