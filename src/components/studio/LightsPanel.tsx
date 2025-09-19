import DSGroup from "../ui/ds-group/DSGroup";
import DSButton from "../ui/ds-button/DSButton";
import LabelRow from "../ui/label-row/LabelRow";
import { useStudio } from "../../store/studio.store";

export default function LightsPanel() {
  const { lights, addLight, updateLight, removeLight } = useStudio();

  return (
    <DSGroup title="Lighting">
      {lights.map((light) => (
        <DSGroup key={light.id} title={`Light ${light.id}`}>
          <label>
            Enabled
            <input
              type="checkbox"
              checked={light.enabled}
              onChange={(e) => updateLight(light.id, { enabled: e.target.checked })}
            />
          </label>
          <label>
            Type
            <select
              value={light.type}
              onChange={(e) => updateLight(light.id, { type: e.target.value as 'directional' | 'point' })}
            >
              <option value="directional">Directional</option>
              <option value="point">Point</option>
            </select>
          </label>
          <LabelRow>
            <label>X <input type="number" value={light.position[0]} onChange={(e) => updateLight(light.id, { position: [parseFloat(e.target.value), light.position[1], light.position[2]] })} /></label>
            <label>Y <input type="number" value={light.position[1]} onChange={(e) => updateLight(light.id, { position: [light.position[0], parseFloat(e.target.value), light.position[2]] })} /></label>
            <label>Z <input type="number" value={light.position[2]} onChange={(e) => updateLight(light.id, { position: [light.position[0], light.position[1], parseFloat(e.target.value)] })} /></label>
          </LabelRow>
          <label>
            Intensity
            <input
              type="range"
              min="0"
              max="10000"
              value={light.intensity}
              onChange={(e) => updateLight(light.id, { intensity: parseInt(e.target.value) })}
            />
            <span>{light.intensity}</span>
          </label>
          <label>
            Color
            <input
              type="color"
              value={light.color}
              onChange={(e) => updateLight(light.id, { color: e.target.value })}
            />
          </label>
          <DSButton onClick={() => removeLight(light.id)}>Remove Light</DSButton>
        </DSGroup>
      ))}
      <DSButton onClick={() => addLight({
        type: 'directional',
        position: [0, 0, 5],
        intensity: 3500,
        color: '#ffffff',
        enabled: true
      })}>
        Add Light
      </DSButton>
    </DSGroup>
  );
}