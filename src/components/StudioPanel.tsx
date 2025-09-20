// src/components/StudioPanel.tsx


import { useStudio } from "../store/studio.store";
import LightsPanel from "./studio/LightsPanel";
import LabelRow from "./ui/label-row/LabelRow";
import Panel from "./ui/panel/Panel";
import { CollapsiblePanel } from "./ui/collapsible-panel/CollapsiblePanel";
import DSSlider from "./ui/ds-slider/DSSlider";
import SizedBox from "./ui/sized-box/SizedBox";

export default function StudioPanel() {
  const s = useStudio();
  const set = useStudio((st) => st.set);
  const gridCols = Math.ceil(Math.sqrt(s.cardsPerSheet));
  const gridRows = Math.ceil(s.cardsPerSheet / gridCols);

  return (
    <Panel>
      <div className="studio-panel">
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

        <CollapsiblePanel title="Hair Amount" defaultOpen={false}>
          <DSSlider label="Amount" min={-50} max={50} value={s.hair_amount_offset} onChange={e => set({ hair_amount_offset: +e.target.value })} displayValue={s.hair_amount_offset} />
          <SizedBox height={10} />
          <CollapsiblePanel title="Strand Points" defaultOpen={false}>
            <DSSlider label="Points Count" min={2} max={25} value={s.strand_points_count} onChange={e => set({ strand_points_count: +e.target.value })} displayValue={s.strand_points_count} />
          </CollapsiblePanel>
        </CollapsiblePanel>

        <CollapsiblePanel title="Hair Color" defaultOpen={false}>
          <label>
            Gradient Color
            <input type="checkbox" checked={s.gradient_color_enabled} onChange={e => set({ gradient_color_enabled: e.target.checked })} />
          </label>
          {!s.gradient_color_enabled && (
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
          <LabelRow>
            <DSSlider label="Glossiness" min={0} max={1} step={0.01} value={s.glossiness} onChange={e => set({ glossiness: +e.target.value })} displayValue={s.glossiness.toFixed(2)} />
            <DSSlider label="Sheen" min={0} max={1} step={0.01} value={s.sheen} onChange={e => set({ sheen: +e.target.value })} displayValue={s.sheen.toFixed(2)} />
          </LabelRow>
        </CollapsiblePanel>

        <CollapsiblePanel title="Hair Strand Thickness" defaultOpen={false}>
          <LabelRow>
            <DSSlider label="Root" min={0} max={0.07} step={0.001} value={s.root_thickness} onChange={e => set({ root_thickness: +e.target.value })} />
            <DSSlider label="Tip" min={0} max={0.07} step={0.001} value={s.tip_thickness} onChange={e => set({ tip_thickness: +e.target.value })} />
          </LabelRow>
        </CollapsiblePanel>

        <CollapsiblePanel title="Hair Length" defaultOpen={false}>
          <label>Fixed <input type="checkbox" checked={s.fixed_length_size} onChange={e => set({ fixed_length_size: e.target.checked })} /></label>
          {s.fixed_length_size ? (
            <DSSlider label="Length" min={0} max={20} step={0.01} value={s.combined_length} onChange={e => set({ combined_length: +e.target.value })} />
          ) : (
            <LabelRow>
              <DSSlider label="Minimum" min={0} max={20} step={0.01} value={s.minimum_length} onChange={e => set({ minimum_length: +e.target.value })} />
              <DSSlider label="Maximum" min={0} max={20} step={0.01} value={s.maximum_length} onChange={e => set({ maximum_length: +e.target.value })} />
            </LabelRow>
          )}
        </CollapsiblePanel>

        <CollapsiblePanel title="Hair Spread" defaultOpen={false}>
          <DSSlider label="Amount" min={-50} max={50} step={0.1} value={s.spread_amount_offset} onChange={e => set({ spread_amount_offset: +e.target.value })} />
        </CollapsiblePanel>

        <CollapsiblePanel title="Hair Clumping" defaultOpen={false}>
          <LabelRow>
            <DSSlider label="Root" min={0} max={5000} step={0.01} value={s.clump_root} onChange={e => set({ clump_root: +e.target.value })} />
            <DSSlider label="Tip" min={0} max={5000} step={0.01} value={s.clump_tip} onChange={e => set({ clump_tip: +e.target.value })} />
          </LabelRow>
        </CollapsiblePanel>

        <CollapsiblePanel title="Hairline Shape" defaultOpen={false}>
          <DSSlider label="Hairline Shape" min={0} max={1} step={0.01} value={s.hairline_shape} onChange={e => set({ hairline_shape: +e.target.value })} />
        </CollapsiblePanel>

        <CollapsiblePanel title="Hair Frizz" defaultOpen={false}>
          <label>Curve Enabled <input type="checkbox" checked={s.frizz_curve_enabled} onChange={e => set({ frizz_curve_enabled: e.target.checked })} /></label>
          <label><input type="checkbox" checked={s.enable_frizz_hair} onChange={e => set({ enable_frizz_hair: e.target.checked })} /> Enable Hair Frizz</label>
          {s.enable_frizz_hair && (
            <>
              <DSSlider label="Scale" min={0} max={5} step={0.01} value={s.frizz_scale} onChange={e => set({ frizz_scale: +e.target.value })} />
            </>
          )}
        </CollapsiblePanel>

        <CollapsiblePanel title="Reduce Hair" defaultOpen={false}>
          <label><input type="checkbox" checked={s.enable_delete_hair} onChange={e => set({ enable_delete_hair: e.target.checked })} /> Enable Reduce Hair</label>
          {s.enable_delete_hair && (
            <DSSlider label="Amount" min={0} max={1} step={0.01} value={s.reduce_amount} onChange={e => set({ reduce_amount: +e.target.value })} />
          )}
        </CollapsiblePanel>

        <CollapsiblePanel title="Hair Curl" defaultOpen={false}>
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

        <CollapsiblePanel title="Messiness/Roughness" defaultOpen={false}>
          <label><input type="checkbox" checked={s.enable_messiness_hair} onChange={e => set({ enable_messiness_hair: e.target.checked })} /> Enable Messiness/Roughness</label>
          {s.enable_messiness_hair && (
            <>
              <DSSlider label="Strength" min={0} max={10} step={0.01} value={s.messiness_strength} onChange={e => set({ messiness_strength: +e.target.value })} />
              <DSSlider label="Scale" min={0.01} max={10} step={0.01} value={s.messiness_scale} onChange={e => set({ messiness_scale: +e.target.value })} />
              <DSSlider label="Starting Point" min={0} max={1} step={0.01} value={s.messiness_starting_point} onChange={e => set({ messiness_starting_point: +e.target.value })} />
              <DSSlider label="Messiness Amount" min={0} max={1} step={0.01} value={s.messiness_amount} onChange={e => set({ messiness_amount: +e.target.value })} />
            </>
          )}
        </CollapsiblePanel>

        <LightsPanel />
      </div>
    </Panel>
  );
}
