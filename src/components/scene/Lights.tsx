// src/components/scene/Lights.tsx
import { useStudio } from "../../store/studio.store";

export default function Lights() {
  const { lights, baseWidth, baseHeight } = useStudio();

  const halfW = baseWidth / 2;
  const halfH = baseHeight / 2;

  return (
    <>
      {lights.filter(l => l.enabled).map((light) => {
        const props = {
          position: light.position,
          intensity: light.intensity * 0.0005,
          color: light.color,
        };

        return light.type === "directional" ? (
          <directionalLight
            key={light.id}
            {...props}
            castShadow
            // mapa de sombra bem grande (pesado)
            shadow-mapSize-width={8192}
            shadow-mapSize-height={8192}
            // VSM: mais amostras para blur (bordas suaves sem lavar sombra)
            shadow-blurSamples={32}
            // cobre a folha inteira
            shadow-camera-left={-halfW}
            shadow-camera-right={halfW}
            shadow-camera-top={halfH}
            shadow-camera-bottom={-halfH}
            shadow-camera-near={0.1}
            shadow-camera-far={40000}
            // acne/bleeding
            shadow-bias={-0.0001}
            shadow-normalBias={0.8}
          />
        ) : (
          <pointLight
            key={light.id}
            {...props}
            castShadow
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
