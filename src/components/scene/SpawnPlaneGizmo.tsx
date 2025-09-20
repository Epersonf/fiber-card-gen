// src/components/scene/SpawnPlaneGizmo.tsx
import * as THREE from "three";
import { useStudio } from "../../store/studio.store";
import { GroupLayout } from "../../hair/group-layout";
import { JSX } from "react";
import { SpawnOps } from "../../hair/ops/spawn-ops";

type Props = { enabled: boolean };

export default function SpawnPlaneGizmo({ enabled }: Props) {
  const s = useStudio();
  if (!enabled || !s.spawn_enabled) return null;

  const { cellW, cellH, cols, rows, W, H } = GroupLayout.computeCell(s);

  const { yTop, radiusX, radiusY, tiltRad } = SpawnOps.computeGizmoParams(cellW, cellH, s);

  const ringThickness = Math.max(1, Math.min(radiusX, radiusY) * 0.02);
  const color = new THREE.Color("#4f8cff");

  const items: JSX.Element[] = [];
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols && idx < s.cardsPerSheet; c++, idx++) {
      const pos = GroupLayout.cardWorldPos(c, r, cellW, cellH, s, W, H);

      items.push(
        <group
          key={`spawn-gizmo-${r}-${c}`}
          position={[pos.x, pos.y + yTop, pos.z]}
          rotation={[tiltRad, 0, 0]}
        >
          <group scale={[radiusX, 1, radiusY]}>
            <mesh renderOrder={2000}>
              <torusGeometry args={[1, Math.max(0.75, ringThickness / Math.max(radiusX, radiusY)), 8, 128]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.35}
                side={THREE.DoubleSide}
                depthTest={false}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>

            <lineSegments renderOrder={2001}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[
                    new Float32Array([
                      -1, 0, 0, 1, 0, 0,
                      0, 0, -1, 0, 0, 1,
                    ]),
                    3
                  ]}
                />
              </bufferGeometry>
              <lineBasicMaterial
                color={color}
                transparent
                opacity={0.55}
                depthTest={false}
                depthWrite={false}
                toneMapped={false}
              />
            </lineSegments>
          </group>
        </group>
      );
    }
  }

  return <>{items}</>;
}
