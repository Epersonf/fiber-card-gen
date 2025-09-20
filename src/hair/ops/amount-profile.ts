import { HairAmountCurveOpts } from "../../models/hair-amount-curve";

// src/hair/ops/AmountProfile.ts
export class AmountProfile {
  /** Retorna t moldado segundo a curva escolhida. */
  static shape(t: number, curve: HairAmountCurveOpts): number {
    switch (curve) {
      case 'quad': return t * t;
      case 'sqrt': return Math.sqrt(t);
      default: return t;
    }
  }

  /**
   * Calcula o nº de mechas para um card específico (idx),
   * interpolando entre [minStrands, maxStrands] conforme a curva.
   */
  static strandsForCard(
    idx: number,
    totalCards: number,
    minStrands: number,
    maxStrands: number,
    curve: HairAmountCurveOpts
  ) {
    const t = totalCards > 1 ? idx / (totalCards - 1) : 1;
    const shaped = this.shape(t, curve);
    const v = minStrands + (maxStrands - minStrands) * shaped;
    return Math.max(1, Math.floor(v));
  }
}
