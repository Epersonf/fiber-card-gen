import { useStudio } from "../../../store/studio.store";
import DSCheckbox from "../../ui/ds-checkbox/DSCheckbox";
import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import { Wind } from 'lucide-react';
import DSSlider from "../../ui/ds-slider/DSSlider";
import LabelColumn from "../../ui/label-column/LabelColumn";
import CurveEditor from "../../ui/curve-editor/CurveEditor";

export default function HairFrizzSection() {
  const s = useStudio(); const set = useStudio(st => st.set);

  const onCurveChange = (pts: { x: number; y: number }[]) => {
    // accept N points: clamp each coordinate to 0..1 and store them
    const clamped = pts.map(p => ({ x: Math.min(1, Math.max(0, p.x)), y: Math.min(1, Math.max(0, p.y)) }));
    set({ frizz_curve_points: clamped });
  };

  return (
    <CollapsiblePanel title="Hair Frizz" defaultOpen={false} icon={<Wind size={14} />}>
      <LabelColumn>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DSCheckbox checked={s.enable_frizz_hair} onChange={e => set({ enable_frizz_hair: e.target.checked })} label="Enable Hair Frizz" />
        </label>
        {s.enable_frizz_hair && (
          <>
            <DSSlider label="Scale" min={0} max={50} step={0.01} value={s.frizz_scale} onChange={e => set({ frizz_scale: +e.target.value })} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Curve Enabled
              <DSCheckbox checked={s.frizz_curve_enabled} onChange={e => set({ frizz_curve_enabled: e.target.checked })} />
            </label>
            {s.frizz_curve_enabled && (
              <div style={{ paddingTop: 8 }}>
                <CurveEditor points={s.frizz_curve_points} onChange={onCurveChange} width={320} height={96} />
              </div>
            )}
          </>
        )}
      </LabelColumn>
    </CollapsiblePanel>
  );
}
