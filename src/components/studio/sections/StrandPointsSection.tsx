import { useStudio } from "../../../store/studio.store";
import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import { List } from 'lucide-react';
import DSSlider from "../../ui/ds-slider/DSSlider";

export default function StrandPointsSection() {
  const s = useStudio(); const set = useStudio(st => st.set);
  return (
  <CollapsiblePanel title="Strand Points" defaultOpen={false} icon={<List size={14} />}>
      <DSSlider label="Points Count" min={2} max={25} value={s.strand_points_count}
        onChange={e => set({ strand_points_count: +e.target.value })}
        displayValue={s.strand_points_count} />
    </CollapsiblePanel>
  );
}
