import { useRef } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { SceneRendererUtils } from "../../utils/scene-renderer.utils";

export default function FrameGizmo2D({ targetW, targetH }: { targetW: number; targetH: number }) {
  const { scene } = useThree();
  const geomRef = useRef<THREE.BufferGeometry>(null!);
  const lineRef = useRef<THREE.LineSegments>(null!);

  // 4 lados = 4 pares => 8 vértices (LineSegments liga 0-1, 2-3, 4-5, 6-7)
  const ensureGeom = (count = 8) => {
    const g = geomRef.current;
    const pos = g.getAttribute("position");
    if (!pos || pos.count !== count) {
      g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(count * 3), 3));
    }
  };

  useFrame(() => {
    const hb = SceneRendererUtils.hairBounds(scene);
    if (!hb) return;

    const size = new THREE.Vector3(); hb.getSize(size);
    const center = new THREE.Vector3(); hb.getCenter(center);

    const margin = 1.06;
    let w = size.x * margin;
    let h = size.y * margin;

    const aspect = targetW / targetH;
    const boxAspect = w / h;
    if (boxAspect > aspect) {
      h = w / aspect;
    } else {
      w = h * aspect;
    }

    const left = center.x - w / 2;
    const right = center.x + w / 2;
    const top = center.y + h / 2;
    const bottom = center.y - h / 2;

    ensureGeom();
    const posAttr = geomRef.current.getAttribute("position") as THREE.BufferAttribute;

    const pts = [
      // topo
      left, top, 0, right, top, 0,
      // direita
      right, top, 0, right, bottom, 0,
      // base
      right, bottom, 0, left, bottom, 0,
      // esquerda
      left, bottom, 0, left, top, 0,
    ];

    for (let i = 0; i < pts.length; i++) (posAttr.array as any)[i] = pts[i];
    posAttr.needsUpdate = true;

    // necessário para materiais tracejados
    if (lineRef.current) lineRef.current.computeLineDistances();
  });

  return (
    <group renderOrder={3000}>
      <lineSegments ref={lineRef}>
        <bufferGeometry ref={geomRef} />
        <lineDashedMaterial
          color={"#4f8cff"}
          dashSize={8}
          gapSize={6}
          depthTest={false}
          depthWrite={false}
          transparent
          opacity={0.9}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  );
}
