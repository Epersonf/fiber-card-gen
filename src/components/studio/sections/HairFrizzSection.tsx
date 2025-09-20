import { useStudio } from "../../../store/studio.store";
import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import DSSlider from "../../ui/ds-slider/DSSlider";

export default function HairFrizzSection() {
  const s = useStudio(); const set = useStudio(st => st.set);
  return (
    <CollapsiblePanel title="Hair Frizz" defaultOpen={false}>
      <label>Curve Enabled <input type="checkbox" checked={s.frizz_curve_enabled} onChange={e => set({ frizz_curve_enabled: e.target.checked })} /></label>
      <label><input type="checkbox" checked={s.enable_frizz_hair} onChange={e => set({ enable_frizz_hair: e.target.checked })} /> Enable Hair Frizz</label>
      {s.enable_frizz_hair && (
        <DSSlider label="Scale" min={0} max={5} step={0.01} value={s.frizz_scale} onChange={e => set({ frizz_scale: +e.target.value })} />
      )}
    </CollapsiblePanel>
  );
}
