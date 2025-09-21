import { useStudio } from "../../../store/studio.store";
import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import { Feather } from 'lucide-react';
import LabelRow from "../../ui/label-row/LabelRow";
import DSSlider from "../../ui/ds-slider/DSSlider";

export default function HairStrandThicknessSection() {
  const s = useStudio(); const set = useStudio(st => st.set);
  return (
    <CollapsiblePanel title="Hair Strand Thickness" defaultOpen={false} icon={<Feather size={14} />}>
      <LabelRow>
        <DSSlider label="Root" min={0} max={0.07} step={0.001} value={s.root_thickness} onChange={e => set({ root_thickness: +e.target.value })} />
        <DSSlider label="Tip" min={0} max={0.07} step={0.001} value={s.tip_thickness} onChange={e => set({ tip_thickness: +e.target.value })} />
      </LabelRow>
    </CollapsiblePanel>
  );
}
