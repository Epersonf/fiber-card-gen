import * as THREE from "three";
import { useStudio } from "../store/useStudio";

export function makeColorMaterial(): THREE.ShaderMaterial | THREE.MeshStandardMaterial {
  const s = useStudio.getState();
  
  if (!s.gradient_color_enabled) {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(...s.hair_color.slice(0, 3) as [number, number, number]),
      metalness: s.glossiness,
      roughness: s.sheen,
      side: THREE.DoubleSide
    });
  }

  return new THREE.ShaderMaterial({
    uniforms: {
      uRoot: { value: new THREE.Color(s.hair_color[0] * 0.9, s.hair_color[1] * 0.9, s.hair_color[2] * 0.9) },
      uTip: { value: new THREE.Color(...s.hair_color.slice(0, 3) as [number, number, number]) },
      uMetal: { value: s.glossiness },
      uRough: { value: s.sheen }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uRoot;
      uniform vec3 uTip;
      uniform float uMetal;
      uniform float uRough;
      varying vec2 vUv;
      
      void main() {
        vec3 color = mix(uRoot, uTip, vUv.y);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.DoubleSide
  });
}

export function makeNormalMaterial(space: "tangent" | "object" | "world") {
  // Improved normal material implementation
  return new THREE.MeshNormalMaterial();
}