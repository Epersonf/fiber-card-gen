import { useStudio } from "../../../store/studio.store";
import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import { Grid } from 'lucide-react';
import SizedBox from "../../ui/sized-box/SizedBox";
import LabelRow from "../../ui/label-row/LabelRow";

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
      <SizedBox height={10} />
      <LabelRow>
        <label>
          Card Offset X (px)
          <input type="number" value={(s.cardsOffset?.x ?? 0)} onChange={e => set({ cardsOffset: { ...(s.cardsOffset || { x: 0, y: 0 }), x: parseFloat(e.target.value) || 0 } })} />
        </label>
        <label>
          Card Offset Y (px)
          <input type="number" value={(s.cardsOffset?.y ?? 0)} onChange={e => set({ cardsOffset: { ...(s.cardsOffset || { x: 0, y: 0 }), y: parseFloat(e.target.value) || 0 } })} />
        </label>
      </LabelRow>
    </CollapsiblePanel>
  );
}
