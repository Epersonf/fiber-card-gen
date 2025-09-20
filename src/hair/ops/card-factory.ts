import * as THREE from "three";
import type { Scale } from "chroma-js";
import { StudioState } from "../../models/studio.int";
import { RNGUtils } from "../../utils/rng.utils";
import { HairMaterial } from "../hair-material";
import { StrandFactory } from "../strand-factory";
import { ColorOps } from "./color-ops";
import { GeometryOps } from "./geometry-ops";
import { SpawnOps } from "./spawn-ops";
import { ThicknessOps } from "./thickness-ops";

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
    gradientSampler?: Scale
  ): THREE.Group {
    const cardRand = RNGUtils.mulberry32(seed);
    const strandGroup = new THREE.Group();

    // padding/altura útil (compartilhado com gizmo e strand-factory)
    const { padBot, usableH } = SpawnOps.computePadding(cellW, cellH, s);

    for (let k = 0; k < strands; k++) {
      const curve = StrandFactory.makeStrandCurve(points, cellW, usableH, padBot, cardRand, s);
      if (s.enable_delete_hair && cardRand() < s.reduce_amount) continue;

      // perfil de espessura
      const thicknessArr = ThicknessOps.makeProfileFromCurvePoints(
        curve.length, s.root_thickness, s.tip_thickness, cellW
      );

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
