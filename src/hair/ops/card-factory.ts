import * as THREE from "three";
import type { Scale } from "chroma-js";
import { StudioState } from "../../models/studio.int";
import { RNGUtils } from "../../utils/rng.utils";
import { ThicknessUtils } from "../../utils/thickness.utils";
import { HairMaterial } from "../hair-material";
import { StrandFactory } from "../strand-factory";
import { ColorOps } from "./color-ops";
import { GeometryOps } from "./geometry-ops";

/**
 * Constrói o conteúdo de um card (um grupo com N mechas).
 */
export class CardFactory {
  static buildCard(
    seed: number,
    points: number,
    strands: number,
    cellW: number,
    cellH: number,
    s: StudioState,
    gradientSampler?: Scale,
  ): THREE.Group {
    const cardRand = RNGUtils.mulberry32(seed);
    const strandGroup = new THREE.Group();

    for (let k = 0; k < strands; k++) {
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

      // thickness ao longo da mecha
      const thicknessArr = curve.map((_, i) => {
        const t = i / (curve.length - 1);
        return THREE.MathUtils.lerp(
          ThicknessUtils.toRadiusPx(s.root_thickness, cellW),
          ThicknessUtils.toRadiusPx(Math.max(0, s.tip_thickness), cellW),
          t
        );
      });

      // curva e geometria
      const path = new THREE.CatmullRomCurve3(curve, false, "centripetal", 0.0);
      const tubularSegments = points * 3;
      const radialSegments = 8;
      const geom = new THREE.TubeGeometry(path, tubularSegments, 1, radialSegments, false);

      // raio por anel
      GeometryOps.applyRingRadii(geom, path, thicknessArr, tubularSegments, radialSegments);

      // cores (gradiente opcional)
      if (gradientSampler) {
        ColorOps.applyGradientVertexColors(geom, gradientSampler, tubularSegments, radialSegments);
      } else {
        ColorOps.clearVertexColors(geom);
      }

      const mesh = new THREE.Mesh(geom, HairMaterial.standard(s));
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.isHair = true;
      strandGroup.add(mesh);
    }

    return strandGroup;
  }
}
