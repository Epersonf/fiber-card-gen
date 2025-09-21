import { useStudio } from "../../../store/studio.store";
import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import { Sun } from 'lucide-react';
import DSButton from "../../ui/ds-button/DSButton";
import DSGroup from "../../ui/ds-group/DSGroup";
import LabelColumn from "../../ui/label-column/LabelColumn";
import SizedBox from "../../ui/sized-box/SizedBox";
import DSInput from "../../ui/ds-input/DSInput";
import { useBufferedNumberInput } from "../../../hooks/useBufferedNumberInput";

export default function LightsPanelSection() {
  const { lights, addLight, updateLight, removeLight } = useStudio();

  return (
    <CollapsiblePanel title="Lighting" defaultOpen={false} icon={<Sun size={14} />}>
      {lights.map((light) => (
        <LightEditor key={light.id} light={light} updateLight={updateLight} removeLight={removeLight} />
      ))}

      {/* Child component so hooks can be used per-light */}
      
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

interface LightEditorProps {
  light: any;
  updateLight: (id: string, updates: any) => void;
  removeLight: (id: string) => void;
}

function LightEditor({ light, updateLight, removeLight }: LightEditorProps) {
  const xBuf = useBufferedNumberInput(light.position[0]);
  const yBuf = useBufferedNumberInput(light.position[1]);
  const zBuf = useBufferedNumberInput(light.position[2]);
  const distBuf = useBufferedNumberInput(light.distance ?? 0);
  const decayBuf = useBufferedNumberInput(light.decay ?? 2);

  return (
    <DSGroup title={`Light ${light.id}`}>
      <LabelColumn>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'start', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
            <label style={{ fontSize: 12 }}>X</label>
            <DSInput
              type="number"
              value={xBuf.value}
              onChange={e => xBuf.setValue(e.target.value)}
              onBlur={() => xBuf.getOnBlur((n) => updateLight(light.id, { position: [n, light.position[1], light.position[2]] }))()}
              style={{ width: 72 }}
            />
          </div>
          <SizedBox width={8} inline />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
            <label style={{ fontSize: 12 }}>Y</label>
            <DSInput
              type="number"
              value={yBuf.value}
              onChange={e => yBuf.setValue(e.target.value)}
              onBlur={() => yBuf.getOnBlur((n) => updateLight(light.id, { position: [light.position[0], n, light.position[2]] }))()}
              style={{ width: 72 }}
            />
          </div>
          <SizedBox width={8} inline />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
            <label style={{ fontSize: 12 }}>Z</label>
            <DSInput
              type="number"
              value={zBuf.value}
              onChange={e => zBuf.setValue(e.target.value)}
              onBlur={() => zBuf.getOnBlur((n) => updateLight(light.id, { position: [light.position[0], light.position[1], n] }))()}
              style={{ width: 72 }}
            />
          </div>
        </div>

        {light.type === 'point' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
            <DSInput label="Distance" type="number" min={0} step={1} value={distBuf.value} onChange={e => distBuf.setValue(e.target.value)} onBlur={() => distBuf.getOnBlur((n) => updateLight(light.id, { distance: n }))()} />
            <SizedBox width={8} inline />
            <DSInput label="Decay" type="number" min={0} step={0.1} value={decayBuf.value} onChange={e => decayBuf.setValue(e.target.value)} onBlur={() => decayBuf.getOnBlur((n) => updateLight(light.id, { decay: n }))()} />
          </div>
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
      </LabelColumn>
    </DSGroup>
  );
}

