// src/components/scene/SpawnPlaneGizmo.tsx
import * as THREE from "three";
import { useStudio } from "../../store/studio.store";
import { GroupLayout } from "../../hair/group-layout";
import { ThicknessUtils } from "../../utils/thickness.utils";
import { JSX } from "react";

type Props = { enabled: boolean };

/**
 * Gizmo do plano de spawn:
 * - Mostra um “anel” elíptico (Radius X/Y) no topo do card, com a mesma inclinação (Tilt).
 * - A elipse é desenhada escalando um torus de raio 1 para [radiusX, 1, radiusY] (barato e simples).
 * - As cruzes de eixos (X/Z locais) também são escaladas para a elipse.
 */
export default function SpawnPlaneGizmo({ enabled }: Props) {
  const s = useStudio();
  if (!enabled || !s.spawn_enabled) return null;

  const { cellW, cellH, cols, rows, W, H } = GroupLayout.computeCell(s);

  // mesmos cálculos base usados no StrandFactory para posicionar o plano no topo útil do card
  const maxRadiusPx = Math.max(
    ThicknessUtils.toRadiusPx(s.root_thickness, cellW),
    ThicknessUtils.toRadiusPx(s.tip_thickness, cellW)
  );
  const basePad = cellH * 0.09;
  const padTop = basePad + maxRadiusPx;
  const padBot = basePad + maxRadiusPx;
  const usableH = Math.max(1, cellH - padTop - padBot);

  const yTop = padBot + usableH; // altura onde o plane “nasce” dentro do card
  const radiusX = (s.spawn_radius_ratio_x ?? 0.12) * cellW;
  const radiusY = (s.spawn_radius_ratio_y ?? 0.12) * cellW;
  const tiltRad = THREE.MathUtils.degToRad(s.spawn_tilt_deg ?? 6);

  const ringThickness = Math.max(1, Math.min(radiusX, radiusY) * 0.02);
  const color = new THREE.Color("#4f8cff"); // cor de acento do UI

  const items: JSX.Element[] = [];
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols && idx < s.cardsPerSheet; c++, idx++) {
      const pos = GroupLayout.cardWorldPos(c, r, cellW, cellH, s, W, H);

      items.push(
        <group
          key={`spawn-gizmo-${r}-${c}`}
          position={[pos.x, pos.y + yTop, pos.z]}
          rotation={[tiltRad, 0, 0]} // inclinação em X (mesmo eixo do StrandFactory)
        >
          {/* Grupo escalado para virar elipse (X/Z) */}
          <group scale={[radiusX, 1, radiusY]}>
            {/* “anel” fino (torus com raio principal 1, depois escalado) */}
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

            {/* cruz (eixos locais X/Z do plano) */}
            <lineSegments renderOrder={2001}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[
                    new Float32Array([
                      -1, 0, 0, 1, 0, 0, // X
                      0, 0, -1, 0, 0, 1, // Z
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
