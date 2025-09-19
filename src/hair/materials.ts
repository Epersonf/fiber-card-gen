import * as THREE from "three";
import { useStudio } from "../store/useStudio";

/** Material para Color Map (com ou sem gradiente). */
export function makeColorMaterial(): THREE.ShaderMaterial | THREE.MeshStandardMaterial {
  const s = useStudio.getState();
  if (!s.gradient_color_enabled) {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(...s.hair_color.slice(0, 3) as [number, number, number]),
      metalness: s.glossiness,
      roughness: s.sheen
    });
  }
  // Gradiente simples root->tip via vUv.y
  const col = s.hair_color;
  const root = new THREE.Color(col[0] * 0.9, col[1] * 0.9, col[2] * 0.9);
  const tip = new THREE.Color(col[0], col[1], col[2]);
  return new THREE.ShaderMaterial({
    uniforms: {
      uRoot: { value: new THREE.Vector3(root.r, root.g, root.b) },
      uTip: { value: new THREE.Vector3(tip.r, tip.g, tip.b) },
      uMetal: { value: s.glossiness },
      uRough: { value: s.sheen }
    },
    vertexShader: `
      varying float vT;
      void main(){
        vT = position.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uRoot;
      uniform vec3 uTip;
      uniform float uMetal;
      uniform float uRough;
      varying float vT;
      void main(){
        float t = clamp(vT, 0.0, 1.0);
        vec3 c = mix(uRoot, uTip, t);
        gl_FragColor = vec4(c, 1.0);
      }
    `,
  });
}

/** Material para Normal Map (object/world “fake tangent” via matriz). */
export function makeNormalMaterial(space: "tangent" | "object" | "world") {
  if (space === "world") return new THREE.MeshNormalMaterial();
  // Para simplificar no export, MeshNormalMaterial já serve (object-space).
  // Tangent-space correto exigiria TBN/shader; deixamos MeshNormalMaterial com ortho e alinhamento.
  return new THREE.MeshNormalMaterial();
}
