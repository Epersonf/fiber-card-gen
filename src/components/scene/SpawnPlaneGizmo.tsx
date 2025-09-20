// src/components/scene/SpawnPlaneGizmo.tsx
import * as THREE from "three";
import { useStudio } from "../../store/studio.store";
import { GroupLayout } from "../../hair/group-layout";
import { ThicknessUtils } from "../../utils/thickness.utils";
import { JSX } from "react";

type Props = { enabled: boolean };

export default function SpawnPlaneGizmo({ enabled }: Props) {
  const s = useStudio();
  if (!enabled || !s.spawn_enabled) return null;

  const { cellW, cellH, cols, rows, W, H } = GroupLayout.computeCell(s);

  // mesmos cálculos base usados no StrandFactory
  const maxRadiusPx = Math.max(
    ThicknessUtils.toRadiusPx(s.root_thickness, cellW),
    ThicknessUtils.toRadiusPx(s.tip_thickness, cellW)
  );
  const basePad = cellH * 0.09;
  const padTop = basePad + maxRadiusPx;
  const padBot = basePad + maxRadiusPx;
  const usableH = Math.max(1, cellH - padTop - padBot);

  const yTop = padBot + usableH; // altura onde o plane “nasce” dentro do card
  const radiusPx = (s.spawn_radius_ratio ?? 0.12) * cellW;
  const tiltRad = THREE.MathUtils.degToRad(s.spawn_tilt_deg ?? 6);

  const ringInner = Math.max(1, radiusPx - Math.max(1, radiusPx * 0.02));
  const ringOuter = radiusPx + Math.max(1, radiusPx * 0.02);

  const color = new THREE.Color("#4f8cff"); // gui accent

  const items: JSX.Element[] = [];
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols && idx < s.cardsPerSheet; c++, idx++) {
      const pos = GroupLayout.cardWorldPos(c, r, cellW, cellH, s, W, H);
      items.push(
        <group
          key={`spawn-gizmo-${r}-${c}`}
          position={[pos.x, pos.y + yTop, pos.z]}
          rotation={[tiltRad, 0, 0]} // mesmo eixo de tilt do StrandFactory (X)
        >
          {/* anel fino para o “disco” */}
          <mesh renderOrder={2000}>
            <ringGeometry args={[ringInner, ringOuter, 64]} />
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

          {/* cruz para indicar eixos locais do plane */}
          <lineSegments renderOrder={2001}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[
                  new Float32Array([
                    -radiusPx, 0, 0,
                    radiusPx, 0, 0,
                    0, 0, -radiusPx,
                    0, 0, radiusPx,
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
      );
    }
  }

  return <>{items}</>;
}
