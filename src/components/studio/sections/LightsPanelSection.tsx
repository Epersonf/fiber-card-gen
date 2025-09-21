import { useStudio } from "../../../store/studio.store";
import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import { Sun } from 'lucide-react';
import DSButton from "../../ui/ds-button/DSButton";
import DSGroup from "../../ui/ds-group/DSGroup";
import LabelRow from "../../ui/label-row/LabelRow";

export default function LightsPanelSection() {
  const { lights, addLight, updateLight, removeLight } = useStudio();

  return (
    <CollapsiblePanel title="Lighting" defaultOpen={false} icon={<Sun size={14} />}>
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
          {light.type === 'point' && (
            <LabelRow>
              <label>Distance <input type="number" min={0} step={1} value={light.distance ?? 0} onChange={(e) => updateLight(light.id, { distance: parseFloat(e.target.value) })} /></label>
              <label>Decay <input type="number" min={0} step={0.1} value={light.decay ?? 2} onChange={(e) => updateLight(light.id, { decay: parseFloat(e.target.value) })} /></label>
            </LabelRow>
          )}
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
        type: 'point',
        position: [0, 0, 500],
        intensity: 10000,
        color: '#ffffff',
        enabled: true,
        distance: 4000,
        decay: 0.15,
      })}>
        Add Light
      </DSButton>
    </CollapsiblePanel>
  );
}

