import { useStudio } from "../../../store/studio.store";
import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import DSSlider from "../../ui/ds-slider/DSSlider";

export default function HairlineShapeSection() {
  const s = useStudio(); const set = useStudio(st => st.set);
  return (
    <CollapsiblePanel title="Hairline Shape" defaultOpen={false}>
      <DSSlider label="Hairline Shape" min={0} max={1} step={0.01} value={s.hairline_shape} onChange={e => set({ hairline_shape: +e.target.value })} />
    </CollapsiblePanel>
  );
}
