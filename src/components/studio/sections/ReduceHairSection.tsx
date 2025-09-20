import { useStudio } from "../../../store/studio.store";
import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import DSSlider from "../../ui/ds-slider/DSSlider";

export default function ReduceHairSection() {
  const s = useStudio(); const set = useStudio(st => st.set);
  return (
    <CollapsiblePanel title="Reduce Hair" defaultOpen={false}>
      <label><input type="checkbox" checked={s.enable_delete_hair} onChange={e => set({ enable_delete_hair: e.target.checked })} /> Enable Reduce Hair</label>
      {s.enable_delete_hair && (
        <DSSlider label="Amount" min={0} max={1} step={0.01} value={s.reduce_amount} onChange={e => set({ reduce_amount: +e.target.value })} />
      )}
    </CollapsiblePanel>
  );
}
