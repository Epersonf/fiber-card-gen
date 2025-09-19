import * as THREE from "three";
import { type StudioStateSubset } from "./types";

export class HairMaterial {
  static standard(s: StudioStateSubset) {
    const [r, g, b] = s.hair_color;
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(r, g, b),
      metalness: s.glossiness,
      roughness: s.sheen,
    });
  }
}
