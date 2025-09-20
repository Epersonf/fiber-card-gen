// src/hair/ops/ThicknessOps.ts
import { ThicknessUtils } from "../../utils/thickness.utils";
import { MathUtils } from "../../utils/math.utils";

/**
 * Geração de perfis de espessura ao longo da mecha.
 */
export class ThicknessOps {
  /**
   * Constrói um array de raios (em px) com mesmo tamanho de `curvePoints`.
   * Interpola linearmente entre root e tip (ambos em "thickness" normalizado),
   * convertendo para px com base em cellW.
   */
  static makeProfileFromCurvePoints(
    curvePointsCount: number,
    rootThickness: number,
    tipThickness: number,
    cellW: number
  ): number[] {
    const rootPx = ThicknessUtils.toRadiusPx(rootThickness, cellW);
    const tipPx = ThicknessUtils.toRadiusPx(Math.max(0, tipThickness), cellW);

    const arr = new Array<number>(curvePointsCount);
    const last = Math.max(1, curvePointsCount - 1);
    for (let i = 0; i < curvePointsCount; i++) {
      const t = i / last;
      arr[i] = MathUtils.lerp(rootPx, tipPx, t);
    }
    return arr;
  }
}
