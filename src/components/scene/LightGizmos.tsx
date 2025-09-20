// src/components/scene/LightGizmos.tsx
import * as THREE from "three";
import { useMemo } from "react";
import { useStudio } from "../../store/studio.store";

type Props = { enabled: boolean };

export default function LightGizmos({ enabled }: Props) {
  const { lights, baseWidth, baseHeight } = useStudio();
  if (!enabled) return null;

  const iconSize = Math.max(Math.min(baseWidth, baseHeight) * 0.03, 60);
  const shaftLen = iconSize * 3;
  const up = new THREE.Vector3(0, 1, 0);

  return (
    <>
      {lights.filter(l => l.enabled).map(light => {
        const color = light.color;
        if (light.type === "directional") {
          const origin = new THREE.Vector3(...light.position);
          const dir = new THREE.Vector3().copy(origin).multiplyScalar(-1).normalize();
          const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);

          return (
            <group key={`gizmo-${light.id}`} position={light.position as any} quaternion={quat}>
              {/* haste */}
              <mesh castShadow={false} receiveShadow={false} renderOrder={999}>
                <cylinderGeometry args={[iconSize * 0.05, iconSize * 0.05, shaftLen, 8]} />
                <meshBasicMaterial color={color} depthTest={false} transparent opacity={0.9} toneMapped={false} />
              </mesh>
              {/* posicionado para partir da origem do grupo */}
              <group position={[0, shaftLen / 2, 0]}>
                {/* ponta (cone) */}
                <mesh position={[0, shaftLen / 2 + iconSize * 0.3, 0]} castShadow={false} receiveShadow={false} renderOrder={999}>
                  <coneGeometry args={[iconSize * 0.3, iconSize * 0.6, 12]} />
                  <meshBasicMaterial color={color} depthTest={false} transparent opacity={0.95} toneMapped={false} />
                </mesh>
              </group>
            </group>
          );
        } else {
          // point light: esfera simples
          return (
            <group key={`gizmo-${light.id}`} position={light.position as any}>
              <mesh castShadow={false} receiveShadow={false} renderOrder={999}>
                <sphereGeometry args={[iconSize * 0.35, 16, 16]} />
                <meshBasicMaterial color={color} wireframe depthTest={false} transparent opacity={1} toneMapped={false} />
              </mesh>
            </group>
          );
        }
      })}
    </>
  );
}
