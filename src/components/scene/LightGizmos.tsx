// src/components/scene/LightGizmos.tsx
import * as THREE from "three";
import { useStudio } from "../../store/studio.store";
import { GroupLayout } from "../../hair/group-layout";

type Props = { enabled: boolean };

export default function LightGizmos({ enabled }: Props) {
  const { lights } = useStudio();
  const s = useStudio();
  if (!enabled) return null;

  const { W, H } = GroupLayout.computeSheetSize(s);
  const sheet = Math.min(W, H);
  const base = Math.max(sheet * 0.03, 60);
  const up = new THREE.Vector3(0, 1, 0);

  return (
    <>
      {lights.filter(l => l.enabled).map((light) => {
        const color = light.color as any;

        if (light.type === "point") {
          const radius = light.distance && light.distance > 0 ? light.distance : base;
          const centerSize = Math.max(base * 0.08, radius * 0.01);
          const ringThickness = Math.max(radius * 0.004, 0.75);
          const pos = light.position as any;

          return (
            <group key={`gizmo-${light.id}`} position={pos}>
              {/* range (esfera wireframe, bem transparente) */}
              <mesh renderOrder={999}>
                <sphereGeometry args={[radius, 24, 16]} />
                <meshBasicMaterial
                  color={color}
                  wireframe
                  transparent
                  opacity={0.06}
                  depthTest={false}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>

              {/* três anéis ortogonais */}
              <mesh rotation={[Math.PI / 2, 0, 0]} renderOrder={1000}>
                <torusGeometry args={[radius, ringThickness, 8, 64]} />
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={0.15}
                  depthTest={false}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
              <mesh rotation={[0, Math.PI / 2, 0]} renderOrder={1000}>
                <torusGeometry args={[radius, ringThickness, 8, 64]} />
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={0.12}
                  depthTest={false}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
              <mesh renderOrder={1000}>
                <torusGeometry args={[radius, ringThickness, 8, 64]} />
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={0.12}
                  depthTest={false}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>

              {/* ponto central */}
              <mesh renderOrder={1001}>
                <sphereGeometry args={[centerSize, 16, 12]} />
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={1}
                  depthTest={false}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                  toneMapped={false}
                />
              </mesh>
            </group>
          );
        }

        // directional: haste + cone, orientado para target (ou 0,0,0)
        const origin = new THREE.Vector3().fromArray(light.position);
        const dir = new THREE.Vector3(0, 0, 0).sub(origin);
        if (dir.lengthSq() === 0) dir.set(0, -1, 0);
        dir.normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);

        const shaft = base * 3;
        const width = base * 0.05;

        return (
          <group key={`gizmo-${light.id}`} position={light.position as any} quaternion={quat}>
            <mesh renderOrder={999}>
              <cylinderGeometry args={[width, width, shaft, 8]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.25}
                depthTest={false}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
            <mesh position={[0, shaft / 2 + base * 0.3, 0]} renderOrder={999}>
              <coneGeometry args={[base * 0.3, base * 0.6, 12]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.35}
                depthTest={false}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          </group>
        );
      })}
    </>
  );
}
