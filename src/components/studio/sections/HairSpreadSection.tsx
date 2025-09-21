import { useStudio } from "../../../store/studio.store";
import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import { Shuffle } from 'lucide-react';
import DSSlider from "../../ui/ds-slider/DSSlider";

export default function HairSpreadSection() {
  const s = useStudio(); const set = useStudio(st => st.set);
  return (
    <CollapsiblePanel title="Hair Spread" defaultOpen={false} icon={<Shuffle size={14} />}>
      <DSSlider label="Amount" min={-50} max={50} step={0.1} value={s.spread_amount_offset} onChange={e => set({ spread_amount_offset: +e.target.value })} />
    </CollapsiblePanel>
  );
}
