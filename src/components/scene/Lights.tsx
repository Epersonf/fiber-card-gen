import { useStudio } from "../../store/studio.store";

export default function Lights() {
  const { lights } = useStudio();

  return (
    <>
      {lights.filter(light => light.enabled).map((light) => {
        const props = {
          position: light.position,
          intensity: light.intensity * 0.0005,
          color: light.color,
        };

        return light.type === 'directional' ? (
          <directionalLight key={light.id} {...props} />
        ) : (
          <pointLight key={light.id} {...props} />
        );
      })}
    </>
  );
}