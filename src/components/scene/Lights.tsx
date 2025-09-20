// src/components/scene/Lights.tsx
import { useStudio } from "../../store/studio.store";

export default function Lights() {
  const { lights, baseWidth, baseHeight } = useStudio();

  const halfW = baseWidth / 2;
  const halfH = baseHeight / 2;

  return (
    <>
      {lights.filter(l => l.enabled).map((light) => {
        const isDir = light.type === "directional";
        const intensity =
          isDir ? light.intensity * 0.0005 : light.intensity * 0.002; // point um pouco mais forte

        const common = {
          position: light.position,
          intensity,
          color: light.color,
          castShadow: true,
        } as const;

        return isDir ? (
          <directionalLight
            key={light.id}
            {...common}
            // shadow (pesado)
            shadow-mapSize-width={8192}
            shadow-mapSize-height={8192}
            shadow-blurSamples={32}
            shadow-camera-left={-halfW}
            shadow-camera-right={halfW}
            shadow-camera-top={halfH}
            shadow-camera-bottom={-halfH}
            shadow-camera-near={0.1}
            shadow-camera-far={40000}
            shadow-bias={-0.0001}
            shadow-normalBias={0.8}
            // direção: olha para target
          />
        ) : (
          <pointLight
            key={light.id}
            {...common}
            distance={light.distance ?? 0}
            decay={light.decay ?? 2}
            shadow-mapSize-width={4096}
            shadow-mapSize-height={4096}
            shadow-camera-near={0.1}
            shadow-camera-far={40000}
            shadow-bias={-0.0001}
            shadow-normalBias={0.8}
          />
        );
      })}
    </>
  );
}
