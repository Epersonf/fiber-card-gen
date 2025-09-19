// src/utils/thickness.utils.ts
export class ThicknessUtils {
  /**
   * Converte "thickness" (0..~) em raio em pixels, proporcional à largura da célula.
   * Mínimo 0.25px para visibilidade.
   */
  static toRadiusPx(thickness: number, cellW: number): number {
    return Math.max(0.25, thickness * cellW * 0.20);
  }
}
