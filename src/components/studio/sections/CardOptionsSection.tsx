import { useStudio } from "../../../store/studio.store";
import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import { Grid } from 'lucide-react';
import SizedBox from "../../ui/sized-box/SizedBox";
import LabelRow from "../../ui/label-row/LabelRow";
import { useEffect, useState } from 'react';

export default function CardOptionsSection() {
  const s = useStudio();
  const set = useStudio(st => st.set);
  const gridCols = Math.ceil(Math.sqrt(s.cardsPerSheet));
  const gridRows = Math.ceil(s.cardsPerSheet / gridCols);

  // Local px state for inputs — keep these stable across baseSize changes.
  const [pxX, setPxX] = useState<number>(Math.round((s.cardsOffset?.x ?? 0) * s.baseSize));
  const [pxY, setPxY] = useState<number>(Math.round((s.cardsOffset?.y ?? 0) * s.baseSize));

  // Sync when the actual stored offset changes (but NOT when baseSize changes), so imports/resets update the inputs.
  // Intentionally omit s.baseSize from deps: we don't want inputs to auto-rescale when resolution/baseSize changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setPxX(Math.round((s.cardsOffset?.x ?? 0) * s.baseSize));
    setPxY(Math.round((s.cardsOffset?.y ?? 0) * s.baseSize));
    // Intentionally not including s.baseSize in deps — we don't want to re-scale the inputs when resolution changes
  }, [s.baseSize, s.cardsOffset?.x, s.cardsOffset?.y]);

  return (
  <CollapsiblePanel title="Cards Options" defaultOpen icon={<Grid size={14} />}>
      <label>Cards per Sheet <input type="number" min={1} value={s.cardsPerSheet} onChange={e => set({ cardsPerSheet: +e.target.value })} /></label>
      <SizedBox height={10} />
      <label>Grid Layout <span>{gridCols} × {gridRows}</span></label>
      <SizedBox height={10} />
      <LabelRow>
        <label>
          Card Offset X
          <input
            type="number"
            value={pxX}
            onChange={e => setPxX(parseFloat(e.target.value) || 0)}
            onBlur={() => set({ cardsOffset: { ...(s.cardsOffset || { x: 0, y: 0 }), x: pxX / s.baseSize } })}
            onKeyDown={(e) => { if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); } }}
          />
        </label>
        <label>
          Card Offset Y
          <input
            type="number"
            value={pxY}
            onChange={e => setPxY(parseFloat(e.target.value) || 0)}
            onBlur={() => set({ cardsOffset: { ...(s.cardsOffset || { x: 0, y: 0 }), y: pxY / s.baseSize } })}
            onKeyDown={(e) => { if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); } }}
          />
        </label>
      </LabelRow>
    </CollapsiblePanel>
  );
}
