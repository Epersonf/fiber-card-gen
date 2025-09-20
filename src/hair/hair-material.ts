import * as THREE from "three";
import { StudioState } from "../models/studio.int";

export class HairMaterial {
  static standard(s: StudioState) {
    const [r, g, b] = s.hair_color;
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(r, g, b),
      metalness: s.glossiness,
      roughness: s.sheen,
    });
  }
}
