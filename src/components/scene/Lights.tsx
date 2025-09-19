import { useStudio } from "../../store/studio.store";

export default function Lights() {
  const { light_intensity, light_source_location } = useStudio();
  
  return (
    <>
      <ambientLight intensity={light_intensity * 0.001} />
      <directionalLight 
        position={[0.5, 1, light_source_location]} 
        intensity={light_intensity * 0.0005}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </>
  );
}