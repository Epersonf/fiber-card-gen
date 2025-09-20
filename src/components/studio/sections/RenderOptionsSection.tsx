import { useStudio } from "../../../store/studio.store";
import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import DSSlider from "../../ui/ds-slider/DSSlider";
import SizedBox from "../../ui/sized-box/SizedBox";

export default function RenderOptionsSection() {
  const s = useStudio();
  const set = useStudio(st => st.set);
  const gridCols = Math.ceil(Math.sqrt(s.cardsPerSheet));
  const gridRows = Math.ceil(s.cardsPerSheet / gridCols);

  return (
    <CollapsiblePanel title="Render Options" defaultOpen>
      <label>Base Width <input type="number" value={s.baseWidth} onChange={e => set({ baseWidth: +e.target.value })} /></label>
      <SizedBox height={10} />
      <label>Base Height <input type="number" value={s.baseHeight} onChange={e => set({ baseHeight: +e.target.value })} /></label>
      <SizedBox height={10} />
      <DSSlider label="Percentage" min={0.35} max={1.5} step={0.05} value={s.percentage} onChange={e => set({ percentage: +e.target.value })} displayValue={`${(s.percentage * 100).toFixed(0)}%`} />
      <SizedBox height={10} />
      <label>Cards per Sheet <input type="number" min={1} value={s.cardsPerSheet} onChange={e => set({ cardsPerSheet: +e.target.value })} /></label>
      <SizedBox height={10} />
      <label>Grid Layout <span>{gridCols} × {gridRows}</span></label>
      <SizedBox height={10} />
      <label>Margin (px) <input type="number" min={0} value={s.marginPx} onChange={e => set({ marginPx: +e.target.value })} /></label>
    </CollapsiblePanel>
  );
}
