import { useStudio } from "../../../store/studio.store";
import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import { Grid } from 'lucide-react';
import SizedBox from "../../ui/sized-box/SizedBox";

export default function RenderOptionsSection() {
  const s = useStudio();
  const set = useStudio(st => st.set);
  const gridCols = Math.ceil(Math.sqrt(s.cardsPerSheet));
  const gridRows = Math.ceil(s.cardsPerSheet / gridCols);

  return (
  <CollapsiblePanel title="Cards Options" defaultOpen icon={<Grid size={14} />}>
      <label>Cards per Sheet <input type="number" min={1} value={s.cardsPerSheet} onChange={e => set({ cardsPerSheet: +e.target.value })} /></label>
      <SizedBox height={10} />
      <label>Grid Layout <span>{gridCols} × {gridRows}</span></label>
    </CollapsiblePanel>
  );
}
