import { useStudio } from "../../../store/studio.store";
import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import { Layers } from 'lucide-react';
import LabelRow from "../../ui/label-row/LabelRow";
import DSSlider from "../../ui/ds-slider/DSSlider";

export default function HairClumpingSection() {
  const s = useStudio(); const set = useStudio(st => st.set);
  return (
    <CollapsiblePanel title="Hair Clumping" defaultOpen={false} icon={<Layers size={14} />}>
      <LabelRow>
        <DSSlider label="Root" min={0} max={5000} step={0.01} value={s.clump_root} onChange={e => set({ clump_root: +e.target.value })} />
        <DSSlider label="Tip" min={0} max={5000} step={0.01} value={s.clump_tip} onChange={e => set({ clump_tip: +e.target.value })} />
      </LabelRow>
    </CollapsiblePanel>
  );
}
