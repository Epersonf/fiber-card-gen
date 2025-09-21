import { useStudio } from "../../../store/studio.store";
import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import { Grid } from 'lucide-react';
import SizedBox from "../../ui/sized-box/SizedBox";
import LabelRow from "../../ui/label-row/LabelRow";
import DSInput from "../../ui/ds-input/DSInput";
import { useBufferedNumberInput } from '../../../hooks/useBufferedNumberInput';

export default function CardOptionsSection() {
  const s = useStudio();
  const set = useStudio(st => st.set);
  const gridCols = Math.ceil(Math.sqrt(s.cardsPerSheet));
  const gridRows = Math.ceil(s.cardsPerSheet / gridCols);

  // buffered inputs using reusable hook
  const pxX = useBufferedNumberInput(Math.round((s.cardsOffset?.x ?? 0) * s.baseSize));
  const pxY = useBufferedNumberInput(Math.round((s.cardsOffset?.y ?? 0) * s.baseSize));
  const cardsPerSheet = useBufferedNumberInput(s.cardsPerSheet);

  return (
  <CollapsiblePanel title="Cards Options" defaultOpen icon={<Grid size={14} />}>
      <label>Cards per Sheet
        <DSInput
          value={cardsPerSheet.value}
          onChange={(e) => cardsPerSheet.setValue((e.target as HTMLInputElement).value)}
          onBlur={cardsPerSheet.getOnBlur((n) => set({ cardsPerSheet: Math.max(1, Math.floor(n)) }))}
          onKeyDown={cardsPerSheet.getOnKeyDown()}
          type="text"
          placeholder="Cards per Sheet"
        />
      </label>
      <SizedBox height={10} />
      <label>Grid Layout <span>{gridCols} × {gridRows}</span></label>
      <SizedBox height={10} />
      <LabelRow>
        <label>
          Card Offset X
          <DSInput
            value={pxX.value}
            onChange={(e) => pxX.setValue((e.target as HTMLInputElement).value)}
            onBlur={pxX.getOnBlur((n) => set({ cardsOffset: { ...(s.cardsOffset || { x: 0, y: 0 }), x: n / s.baseSize } }))}
            onKeyDown={pxX.getOnKeyDown()}
            type="text"
            placeholder="0"
          />
        </label>
        <label>
          Card Offset Y
          <DSInput
            value={pxY.value}
            onChange={(e) => pxY.setValue((e.target as HTMLInputElement).value)}
            onBlur={pxY.getOnBlur((n) => set({ cardsOffset: { ...(s.cardsOffset || { x: 0, y: 0 }), y: n / s.baseSize } }))}
            onKeyDown={pxY.getOnKeyDown()}
            type="text"
            placeholder="0"
          />
        </label>
      </LabelRow>
    </CollapsiblePanel>
  );
}
