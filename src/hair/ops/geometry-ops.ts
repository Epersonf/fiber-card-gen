import * as THREE from "three";

/**
 * Operações geométricas de baixo nível sobre meshes e buffers.
 */
export class GeometryOps {
  /**
   * Re-encapa um TubeGeometry para usar um raio customizado por anel (thicknessArr).
   * Assume TubeGeometry com (tubularSegments, radialSegments) e path contínuo.
   */
  static applyRingRadii(
    geom: THREE.TubeGeometry,
    path: THREE.Curve<THREE.Vector3>,
    thicknessArr: number[],
    tubularSegments: number,
    radialSegments: number
  ) {
    const rings = tubularSegments + 1;
    const vertsPerRing = radialSegments + 1;
    const P = geom.attributes.position as THREE.BufferAttribute;

    for (let iRing = 0; iRing < rings; iRing++) {
      const t = iRing / (rings - 1);
      const idxArr = Math.min(Math.round(t * (thicknessArr.length - 1)), thicknessArr.length - 1);
      const ri = thicknessArr[idxArr];
      const center = path.getPointAt(iRing / tubularSegments);

      for (let j = 0; j < vertsPerRing; j++) {
        const idx3 = (iRing * vertsPerRing + j) * 3;
        const x = (P.array as any)[idx3 + 0];
        const y = (P.array as any)[idx3 + 1];
        const z = (P.array as any)[idx3 + 2];
        const vx = x - center.x;
        const vy = y - center.y;
        const vz = z - center.z;
        const len = Math.hypot(vx, vy, vz) || 1;
        (P.array as any)[idx3 + 0] = center.x + (vx / len) * ri;
        (P.array as any)[idx3 + 1] = center.y + (vy / len) * ri;
        (P.array as any)[idx3 + 2] = center.z + (vz / len) * ri;
      }
    }

    P.needsUpdate = true;
    geom.computeVertexNormals();
    geom.computeBoundingSphere();
  }
}
