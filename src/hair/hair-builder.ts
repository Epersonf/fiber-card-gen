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
    const strands = Math.max(1, 18 + s.hair_amount_offset);
    const points = Math.max(2, s.strand_points_count);
    const rand = RNGUtils.mulberry32(seed);

    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols && idx < s.cardsPerSheet; c++, idx++) {
        const card = new THREE.Group();

        const cardPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(cellW, cellH),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 })
        );
        (cardPlane as any).userData = { isCardPlane: true };
        card.add(cardPlane);

        const strandGroup = new THREE.Group();

        for (let i = 0; i < strands; i++) {
          const maxRadiusPx = Math.max(
            ThicknessUtils.toRadiusPx(s.root_thickness, cellW),
            ThicknessUtils.toRadiusPx(s.tip_thickness, cellW)
          );
          const basePad = cellH * 0.09;
          const padTop = basePad + maxRadiusPx;
          const padBot = basePad + maxRadiusPx;
          const usableH = Math.max(1, cellH - padTop - padBot);

          const curve = StrandFactory.makeStrandCurve(points, cellW, usableH, padBot, rand, s);
          curve[0].y = padBot;
          curve[curve.length - 1].y = cellH - padTop;

          const path = new THREE.CatmullRomCurve3(curve, false, "centripetal", 0.0);
          const tubularSegments = points * 3;
          const radius = MathUtils.lerp(
            ThicknessUtils.toRadiusPx(s.root_thickness, cellW),
            ThicknessUtils.toRadiusPx(Math.max(0, s.tip_thickness), cellW),
            0.5
          );

          const tube = new THREE.TubeGeometry(path, tubularSegments, radius, 8, false);
          tube.computeBoundingBox();
          const center = new THREE.Vector3();
          tube.boundingBox!.getCenter(center);
          tube.translate(-center.x, -center.y, -center.z);

          const mesh = new THREE.Mesh(tube, HairMaterial.standard(s));
          strandGroup.add(mesh);
        }

        // centraliza os fios no card
        const bbox = new THREE.Box3().setFromObject(strandGroup);
        const ctr = new THREE.Vector3();
        bbox.getCenter(ctr);
        strandGroup.position.sub(ctr);

        card.add(strandGroup);

        const pos = GroupLayout.cardWorldPos(c, r, cellW, cellH, s, W, H);
        card.position.copy(pos);

        g.add(card);
      }
    }
    return g;
  }
}
