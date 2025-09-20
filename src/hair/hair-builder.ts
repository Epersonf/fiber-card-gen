import * as THREE from "three";
import { RNGUtils } from "../utils/rng.utils";
import { ThicknessUtils } from "../utils/thickness.utils";
import { MathUtils } from "../utils/math.utils";
import { type StudioStateSubset } from "./types";
import { GroupLayout } from "./group-layout";
import { StrandFactory } from "./strand-factory";
import { HairMaterial } from "./hair-material";

export class HairBuilder {
  static build(seed = 1, s: StudioStateSubset): THREE.Group {
    const g = new THREE.Group();
    const { cellW, cellH, cols, rows, W, H } = GroupLayout.computeCell(s);
    const baseStrands = Math.max(1, 18 + s.hair_amount_offset);
    const minStrands = Math.max(1, Math.floor(baseStrands * 0.05));
    const maxStrands = baseStrands;
    const totalCards = s.cardsPerSheet;
    const points = Math.max(2, s.strand_points_count);

    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols && idx < totalCards; c++, idx++) {
        const progress = totalCards > 1 ? idx / (totalCards - 1) : 0;
        const strands = Math.floor(THREE.MathUtils.lerp(minStrands, maxStrands, progress));
        const card = new THREE.Group();
        const cardRand = RNGUtils.mulberry32(seed + idx);
        const strandGroup = new THREE.Group();

        for (let k = 0; k < strands; k++) {
          // ruído base (mantido)
          const _rk = new THREE.Vector3(
            (cardRand() - 0.5) * 2,
            (cardRand() - 0.5) * 2,
            (cardRand() - 0.5) * 2
          );

          const maxRadiusPx = Math.max(
            ThicknessUtils.toRadiusPx(s.root_thickness, cellW),
            ThicknessUtils.toRadiusPx(s.tip_thickness, cellW)
          );
          const basePad = cellH * 0.09;
          const padTop = basePad + maxRadiusPx;
          const padBot = basePad + maxRadiusPx;
          const usableH = Math.max(1, cellH - padTop - padBot);

          const curve = StrandFactory.makeStrandCurve(points, cellW, usableH, padBot, cardRand, s);
          if (s.enable_delete_hair && cardRand() < s.reduce_amount) continue;

          const thicknessArr = curve.map((_, i) => {
            const t = i / (curve.length - 1);
            return MathUtils.lerp(
              ThicknessUtils.toRadiusPx(s.root_thickness, cellW),
              ThicknessUtils.toRadiusPx(Math.max(0, s.tip_thickness), cellW),
              t
            );
          });

          const path = new THREE.CatmullRomCurve3(curve, false, "centripetal", 0.0);
          const tubularSegments = points * 3;
          const radius = thicknessArr.reduce((a, b) => a + b, 0) / thicknessArr.length;

          const tube = new THREE.TubeGeometry(path, tubularSegments, radius, 8, false);
          // ❌ não computeBoundingBox / não translate para o centro

          const mesh = new THREE.Mesh(tube, HairMaterial.standard(s));
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          strandGroup.add(mesh);
        }

        // ❌ não recentralize o strandGroup pelo bbox
        const pos = GroupLayout.cardWorldPos(c, r, cellW, cellH, s, W, H);
        card.position.copy(pos);
        card.add(strandGroup);
        g.add(card);
      }
    }
    return g;
  }
}
