import { useStudio } from "../../../store/studio.store";
import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import { Target } from 'lucide-react';
import LabelRow from "../../ui/label-row/LabelRow";
import DSSlider from "../../ui/ds-slider/DSSlider";
import DSInput from "../../ui/ds-input/DSInput";
import DSSelect from "../../ui/ds-select/DSSelect";
import { useBufferedNumberInput } from "../../../hooks/useBufferedNumberInput";

export default function SpawnAmountSection() {
  const s = useStudio();
  const set = useStudio(st => st.set);
  const hairAmountMaxBuf = useBufferedNumberInput(s.hair_amount_max);

  return (
  <CollapsiblePanel title="Spawn & Amount" defaultOpen icon={<Target size={14} />}>
      <label>
        Enabled
        <input type="checkbox" checked={s.spawn_enabled} onChange={e => set({ spawn_enabled: e.target.checked })} />
      </label>

      <LabelRow>
        <DSSlider label="Radius X" min={0} max={0.5} step={0.005} value={s.spawn_radius_ratio_x}
          onChange={e => set({ spawn_radius_ratio_x: +e.target.value })}
          displayValue={(s.spawn_radius_ratio_x * 100).toFixed(1) + '%'} />
        <DSSlider label="Radius Y" min={0} max={0.5} step={0.005} value={s.spawn_radius_ratio_y}
          onChange={e => set({ spawn_radius_ratio_y: +e.target.value })}
          displayValue={(s.spawn_radius_ratio_y * 100).toFixed(1) + '%'} />
        <DSSlider label="Tilt (deg)" min={-45} max={45} step={0.5} value={s.spawn_tilt_deg}
          onChange={e => set({ spawn_tilt_deg: +e.target.value })}
          displayValue={s.spawn_tilt_deg.toFixed(1) + '°'} />
      </LabelRow>

      <LabelRow>
        <DSInput label="Hair Amount Max"
          type="number"
          min={1}
          step={1}
          value={hairAmountMaxBuf.value}
          onChange={e => hairAmountMaxBuf.setValue(e.target.value)}
          onBlur={() => hairAmountMaxBuf.getOnBlur((n) => set({ hair_amount_max: Math.max(1, Math.floor(n || 1)) }))()}
          onKeyDown={hairAmountMaxBuf.getOnKeyDown()} />
        <DSSlider label="First Card %" min={0} max={1} step={0.01} value={s.hair_amount_min_percent}
          onChange={e => set({ hair_amount_min_percent: +e.target.value })}
          displayValue={(s.hair_amount_min_percent * 100).toFixed(0) + '%'} />
      </LabelRow>

      <LabelRow>
        <DSSelect label="Curve" value={s.hair_amount_curve} onChange={e => set({ hair_amount_curve: e.target.value as any })}>
          <option value="linear">Linear</option>
          <option value="quad">Quadratic (t²)</option>
          <option value="sqrt">Sqrt (√t)</option>
        </DSSelect>
      </LabelRow>
    </CollapsiblePanel>
  );
}
