import * as THREE from "three";
import { StudioState } from "../models/studio.int";

export class HairMaterial {
  static standard(s: StudioState) {
    if (s.gradient_color_enabled) {
      return new THREE.MeshStandardMaterial({
        vertexColors: true,
        metalness: s.glossiness,
        roughness: s.sheen,
      });
    }
    const [r, g, b] = s.hair_color;
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(r, g, b),
      metalness: s.glossiness,
      roughness: s.sheen,
    });
  }
}
