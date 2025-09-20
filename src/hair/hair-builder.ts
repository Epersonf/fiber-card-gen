import * as THREE from "three";
import { RNGUtils } from "../utils/rng.utils";
import { ThicknessUtils } from "../utils/thickness.utils";
import { MathUtils } from "../utils/math.utils";
import { GroupLayout } from "./group-layout";
import { StrandFactory } from "./strand-factory";
import { HairMaterial } from "./hair-material";
import { StudioState } from "../models/studio.int";
import chroma from "chroma-js";

export class HairBuilder {
  static build(seed = 1, s: StudioState): THREE.Group {
    const g = new THREE.Group();
    g.userData.isHairRoot = true;
    const { cellW, cellH, cols, rows, W, H } = GroupLayout.computeCell(s);
    const baseStrands = Math.max(1, 18 + s.hair_amount_offset);
    const minStrands = Math.max(1, Math.floor(baseStrands * 0.05));
    const maxStrands = baseStrands;
    const totalCards = s.cardsPerSheet;
    const points = Math.max(2, s.strand_points_count);

    // Pré-cria o sampler do gradiente quando habilitado
    const gradientSampler =
      s.gradient_color_enabled && s.hair_gradient_stops?.length >= 2
        ? chroma
          .scale(s.hair_gradient_stops
            .sort((a, b) => a.pos - b.pos)
            .map(st => st.color))
          .domain([0, 1])
          // Escolha o espaço que preferir: 'lab' dá blends suaves
          .mode("lab")
        : null;

    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols && idx < totalCards; c++, idx++) {
        const progress = totalCards > 1 ? idx / (totalCards - 1) : 0;
        const strands = Math.floor(THREE.MathUtils.lerp(minStrands, maxStrands, progress));
        const card = new THREE.Group();
        const cardRand = RNGUtils.mulberry32(seed + idx);
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

          // raio por ponto: root (t=0, topo) -> tip (t=1, parte inferior)
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
          const radialSegments = 8;

          // cria com raio 1; depois reescala cada anel p/ o raio desejado
          const geom = new THREE.TubeGeometry(path, tubularSegments, 1, radialSegments, false);
          const P = geom.attributes.position as THREE.BufferAttribute;

          const rings = tubularSegments + 1;      // número de anéis ao longo do tubo
          const vertsPerRing = radialSegments + 1; // seam fechado duplica 1 vértice

          for (let iRing = 0; iRing < rings; iRing++) {
            const t = iRing / (rings - 1);
            const idxArr = Math.min(
              Math.round(t * (thicknessArr.length - 1)),
              thicknessArr.length - 1
            );
            const ri = thicknessArr[idxArr];

            // centro do anel no caminho
            const center = path.getPointAt(iRing / tubularSegments);

            for (let j = 0; j < vertsPerRing; j++) {
              const idx3 = (iRing * vertsPerRing + j) * 3;

              const x = (P.array as any)[idx3 + 0];
              const y = (P.array as any)[idx3 + 1];
              const z = (P.array as any)[idx3 + 2];

              // vetor do centro ao vértice
              const vx = x - center.x;
              const vy = y - center.y;
              const vz = z - center.z;
              const len = Math.hypot(vx, vy, vz) || 1;

              // normaliza e aplica novo raio
              (P.array as any)[idx3 + 0] = center.x + (vx / len) * ri;
              (P.array as any)[idx3 + 1] = center.y + (vy / len) * ri;
              (P.array as any)[idx3 + 2] = center.z + (vz / len) * ri;
            }
          }

          P.needsUpdate = true;
          geom.computeVertexNormals();
          geom.computeBoundingSphere();

          // ------ GRADIENTE POR VÉRTICE (root -> tip) ------
          if (gradientSampler) {
            const colors = new Float32Array((rings * vertsPerRing) * 3);
            for (let iRing = 0; iRing < rings; iRing++) {
              const t = iRing / (rings - 1);
              const [rCol, gCol, bCol] = gradientSampler(t).rgb(); // 0..255
              const R = rCol / 255, G = gCol / 255, B = bCol / 255;

              for (let j = 0; j < vertsPerRing; j++) {
                const idx3 = (iRing * vertsPerRing + j) * 3;
                colors[idx3 + 0] = R;
                colors[idx3 + 1] = G;
                colors[idx3 + 2] = B;
              }
            }
            geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
          } else if (geom.getAttribute("color")) {
            geom.deleteAttribute("color");
          }
          // -----------------------------------------------

          const mesh = new THREE.Mesh(geom, HairMaterial.standard(s));
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.userData.isHair = true;
          strandGroup.add(mesh);
        }

        // posiciona card na folha (sem recentralizar por bbox)
        const pos = GroupLayout.cardWorldPos(c, r, cellW, cellH, s, W, H);
        card.position.copy(pos);
        card.add(strandGroup);
        g.add(card);
      }
    }
    return g;
  }
}
