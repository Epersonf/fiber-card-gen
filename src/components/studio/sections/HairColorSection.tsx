import { useStudio } from "../../../store/studio.store";
import DSCheckbox from "../../ui/ds-checkbox/DSCheckbox";
import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import { Image as ImageIcon } from 'lucide-react';
import LabelColumn from "../../ui/label-column/LabelColumn";
import LabelRow from "../../ui/label-row/LabelRow";
import DSSlider from "../../ui/ds-slider/DSSlider";
import GradientStopsEditor from "../../ui/gradient-stops/GradientStopsEditor";

export default function HairColorSection() {
  const s = useStudio(); const set = useStudio(st => st.set);

  return (
  <CollapsiblePanel title="Hair Color" defaultOpen={false} icon={<ImageIcon size={14} />}>
      <LabelColumn>
        <label>
          Gradient Color
          <DSCheckbox checked={s.gradient_color_enabled} onChange={e => set({ gradient_color_enabled: e.target.checked })} />
        </label>
        {s.gradient_color_enabled ? (
          <GradientStopsEditor />
        ) : (
          <label>Color
            <input
              type="color"
              value={"#" + [0, 1, 2].map(i => Math.round(s.hair_color[i] * 255).toString(16).padStart(2, "0")).join("")}
              onChange={e => {
                const hex = e.target.value;
                const r = parseInt(hex.slice(1, 3), 16) / 255;
                const g = parseInt(hex.slice(3, 5), 16) / 255;
                const b = parseInt(hex.slice(5, 7), 16) / 255;
                set({ hair_color: [r, g, b, 1] });
              }}
            />
          </label>
        )}
      </LabelColumn>
      <LabelRow>
        <DSSlider label="Glossiness" min={0} max={1} step={0.01} value={s.glossiness}
          onChange={e => set({ glossiness: +e.target.value })} displayValue={s.glossiness.toFixed(2)} />
        <DSSlider label="Sheen" min={0} max={1} step={0.01} value={s.sheen}
          onChange={e => set({ sheen: +e.target.value })} displayValue={s.sheen.toFixed(2)} />
      </LabelRow>
    </CollapsiblePanel>
  );
}
