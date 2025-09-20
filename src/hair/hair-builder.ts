import * as THREE from "three";
import { GroupLayout } from "./group-layout";
import { StudioState } from "../models/studio.int";
import chroma from "chroma-js";
import { AmountProfile } from "./ops/amount-profile";
import { CardFactory } from "./ops/card-factory";

export class HairBuilder {
  static build(seed = 1, s: StudioState): THREE.Group {
    const g = new THREE.Group();
    g.userData.isHairRoot = true;

    const { cellW, cellH, cols, rows, W, H } = GroupLayout.computeCell(s);

    const points = Math.max(2, s.strand_points_count);

    const gradientSampler =
      s.gradient_color_enabled && s.hair_gradient_stops?.length >= 2
        ? chroma
          .scale(s.hair_gradient_stops.sort((a, b) => a.pos - b.pos).map(st => st.color))
          .domain([0, 1])
          .mode("lab")
        : undefined;

    const maxStrands = Math.max(1, Math.floor(s.hair_amount_max));
    const minStrands = Math.max(1, Math.floor(maxStrands * Math.min(Math.max(s.hair_amount_min_percent, 0), 1)));

    const totalCards = s.cardsPerSheet;
    let idx = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols && idx < totalCards; c++, idx++) {
        const strands = AmountProfile.strandsForCard(
          idx, totalCards, minStrands, maxStrands, s.hair_amount_curve
        );

        const strandGroup = CardFactory.buildCard(
          seed + idx, points, strands, cellW, cellH, s, gradientSampler
        );

        const card = new THREE.Group();
        const pos = GroupLayout.cardWorldPos(c, r, cellW, cellH, s, W, H);
        card.position.copy(pos);
        card.add(strandGroup);
        g.add(card);
      }
    }

    return g;
  }
}
