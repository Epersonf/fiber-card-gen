import { useStudio } from "../../../store/studio.store";
import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import { RotateCw } from 'lucide-react';
import DSSlider from "../../ui/ds-slider/DSSlider";

export default function HairCurlSection() {
  const s = useStudio(); const set = useStudio(st => st.set);
  return (
  <CollapsiblePanel title="Hair Curl" defaultOpen={false} icon={<RotateCw size={14} />}>
      <DSSlider label="Shape" min={0} max={20} step={0.01} value={s.curl_shape} onChange={e => set({ curl_shape: +e.target.value })} />
      <label><input type="checkbox" checked={s.enable_hair_curl} onChange={e => set({ enable_hair_curl: e.target.checked })} /> Enable Hair Curl</label>
      {s.enable_hair_curl && (
        <>
          <label>Count <input type="number" value={s.curl_count} onChange={e => set({ curl_count: +e.target.value })} /></label>
          <DSSlider label="Amount" min={0} max={20} step={0.01} value={s.curl_amount} onChange={e => set({ curl_amount: +e.target.value })} />
          <DSSlider label="Scale" min={0} max={2} step={0.01} value={s.curl_scale} onChange={e => set({ curl_scale: +e.target.value })} />
        </>
      )}
    </CollapsiblePanel>
  );
}
