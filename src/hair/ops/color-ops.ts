import * as THREE from "three";
import type { Scale } from "chroma-js";

/**
 * Operações relacionadas a cores (vértices, atributos).
 */
export class ColorOps {
  /**
   * Aplica um gradiente ao longo de um TubeGeometry, variando por anel (Y / t).
   * gradientSampler: chroma.scale(...).domain([0,1]) etc.
   */
  static applyGradientVertexColors(
    geom: THREE.TubeGeometry,
    gradientSampler: Scale,
    tubularSegments: number,
    radialSegments: number
  ) {
    const rings = tubularSegments + 1;
    const vertsPerRing = radialSegments + 1;
    const colors = new Float32Array((rings * vertsPerRing) * 3);

    for (let iRing = 0; iRing < rings; iRing++) {
      const t = iRing / (rings - 1);
      const [rCol, gCol, bCol] = gradientSampler(t).rgb();
      const R = rCol / 255, G = gCol / 255, B = bCol / 255;

      for (let j = 0; j < vertsPerRing; j++) {
        const idx3 = (iRing * vertsPerRing + j) * 3;
        colors[idx3 + 0] = R;
        colors[idx3 + 1] = G;
        colors[idx3 + 2] = B;
      }
    }

    geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }

  static clearVertexColors(geom: THREE.BufferGeometry) {
    if (geom.getAttribute("color")) {
      geom.deleteAttribute("color");
    }
  }
}
