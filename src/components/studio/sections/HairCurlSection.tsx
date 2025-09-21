import { useStudio } from "../../../store/studio.store";
import DSCheckbox from "../../ui/ds-checkbox/DSCheckbox";
import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import { RotateCw } from 'lucide-react';
import DSSlider from "../../ui/ds-slider/DSSlider";
import DSInput from "../../ui/ds-input/DSInput";
import { useBufferedNumberInput } from '../../../hooks/useBufferedNumberInput';
import LabelColumn from "../../ui/label-column/LabelColumn";

export default function HairCurlSection() {
  const s = useStudio(); const set = useStudio(st => st.set);
  const curlCount = useBufferedNumberInput(s.curl_count);

  return (
    <CollapsiblePanel title="Hair Curl" defaultOpen={false} icon={<RotateCw size={14} />}>
      <LabelColumn>

        <DSSlider label="Shape" min={0} max={20} step={0.01} value={s.curl_shape} onChange={e => set({ curl_shape: +e.target.value })} />
  <label><DSCheckbox checked={s.enable_hair_curl} onChange={e => set({ enable_hair_curl: e.target.checked })} label="Enable Hair Curl" /></label>
        {s.enable_hair_curl && (
          <>
            <label>Count
              <DSInput
                value={curlCount.value}
                onChange={(e) => curlCount.setValue((e.target as HTMLInputElement).value)}
                onBlur={curlCount.getOnBlur((n) => set({ curl_count: Math.max(0, Math.floor(n)) }))}
                onKeyDown={curlCount.getOnKeyDown()}
                type="text"
                placeholder="0"
              />
            </label>
            <DSSlider label="Amount" min={0} max={20} step={0.01} value={s.curl_amount} onChange={e => set({ curl_amount: +e.target.value })} />
            <DSSlider label="Scale" min={0} max={2} step={0.01} value={s.curl_scale} onChange={e => set({ curl_scale: +e.target.value })} />
          </>
        )}
      </LabelColumn>
    </CollapsiblePanel>
  );
}
