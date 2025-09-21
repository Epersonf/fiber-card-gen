import { useStudio } from "../../../store/studio.store";
import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import { Grid } from 'lucide-react';
import SizedBox from "../../ui/sized-box/SizedBox";
import LabelRow from "../../ui/label-row/LabelRow";
import { useEffect, useState, useRef } from 'react';
import DSInput from "../../ui/ds-input/DSInput";

export default function CardOptionsSection() {
  const s = useStudio();
  const set = useStudio(st => st.set);
  const gridCols = Math.ceil(Math.sqrt(s.cardsPerSheet));
  const gridRows = Math.ceil(s.cardsPerSheet / gridCols);

  // Local px state for inputs (strings) — allow free typing (e.g. leading '-') and commit on blur/Enter
  const [pxXInput, setPxXInput] = useState<string>(Math.round((s.cardsOffset?.x ?? 0) * s.baseSize).toString());
  const [pxYInput, setPxYInput] = useState<string>(Math.round((s.cardsOffset?.y ?? 0) * s.baseSize).toString());

  // Local state for cardsPerSheet (buffered input)
  const [cardsPerSheetInput, setCardsPerSheetInput] = useState<string>(String(s.cardsPerSheet));

  // Sync when the actual stored offset or cardsPerSheet changes (but NOT when baseSize changes),
  // so imports/resets update the inputs. We intentionally do not re-scale inputs when baseSize changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // keep a ref of last seen normalized offsets to detect real changes
  const lastOffsetsRef = useRef<{ x: number; y: number }>({ x: s.cardsOffset?.x ?? 0, y: s.cardsOffset?.y ?? 0 });

  useEffect(() => {
    const curX = s.cardsOffset?.x ?? 0;
    const curY = s.cardsOffset?.y ?? 0;
    // update inputs only if the stored normalized offsets actually changed
    if (curX !== lastOffsetsRef.current.x || curY !== lastOffsetsRef.current.y) {
      setPxXInput(Math.round(curX * s.baseSize).toString());
      setPxYInput(Math.round(curY * s.baseSize).toString());
      lastOffsetsRef.current.x = curX;
      lastOffsetsRef.current.y = curY;
    }
    setCardsPerSheetInput(String(s.cardsPerSheet));
  }, [s.cardsOffset?.x, s.cardsOffset?.y, s.cardsPerSheet, s.baseSize]);

  return (
  <CollapsiblePanel title="Cards Options" defaultOpen icon={<Grid size={14} />}>
      <label>Cards per Sheet
        <DSInput
          value={cardsPerSheetInput}
          onChange={(e) => setCardsPerSheetInput((e.target as HTMLInputElement).value)}
          onBlur={() => {
            const parsed = parseInt(cardsPerSheetInput, 10);
            const clamped = Math.max(1, Number.isNaN(parsed) ? s.cardsPerSheet : parsed);
            set({ cardsPerSheet: clamped });
            setCardsPerSheetInput(String(clamped));
          }}
          onKeyDown={(e) => { if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); } }}
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
            value={pxXInput}
            onChange={(e) => setPxXInput((e.target as HTMLInputElement).value)}
            onBlur={() => {
              const px = parseFloat(pxXInput);
              const final = Number.isNaN(px) ? 0 : px;
              set({ cardsOffset: { ...(s.cardsOffset || { x: 0, y: 0 }), x: final / s.baseSize } });
              setPxXInput(String(Math.round(final)));
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); } }}
            type="text"
            placeholder="0"
          />
        </label>
        <label>
          Card Offset Y
          <DSInput
            value={pxYInput}
            onChange={(e) => setPxYInput((e.target as HTMLInputElement).value)}
            onBlur={() => {
              const px = parseFloat(pxYInput);
              const final = Number.isNaN(px) ? 0 : px;
              set({ cardsOffset: { ...(s.cardsOffset || { x: 0, y: 0 }), y: final / s.baseSize } });
              setPxYInput(String(Math.round(final)));
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); } }}
            type="text"
            placeholder="0"
          />
        </label>
      </LabelRow>
    </CollapsiblePanel>
  );
}
