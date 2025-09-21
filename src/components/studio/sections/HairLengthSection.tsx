import { useStudio } from "../../../store/studio.store";
import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import { Scissors } from 'lucide-react';
import LabelRow from "../../ui/label-row/LabelRow";
import DSSlider from "../../ui/ds-slider/DSSlider";

export default function HairLengthSection() {
  const s = useStudio(); const set = useStudio(st => st.set);
  return (
    <CollapsiblePanel title="Hair Length" defaultOpen={false} icon={<Scissors size={14} />}>
      <label>Fixed <input type="checkbox" checked={s.fixed_length_size} onChange={e => set({ fixed_length_size: e.target.checked })} /></label>
      {s.fixed_length_size ? (
        <DSSlider label="Length" min={0} max={20} step={0.01} value={s.combined_length} onChange={e => set({ combined_length: +e.target.value })} />
      ) : (
        <LabelRow>
          <DSSlider label="Minimum" min={0} max={20} step={0.01} value={s.minimum_length} onChange={e => set({ minimum_length: +e.target.value })} />
          <DSSlider label="Maximum" min={0} max={20} step={0.01} value={s.maximum_length} onChange={e => set({ maximum_length: +e.target.value })} />
        </LabelRow>
      )}
    </CollapsiblePanel>
  );
}
