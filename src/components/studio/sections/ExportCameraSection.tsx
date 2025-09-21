import { CollapsiblePanel } from "../../ui/collapsible-panel/CollapsiblePanel";
import { useStudio } from "../../../store/studio.store";
import { ChangeEvent, useState } from "react";
import DSInput from "../../ui/ds-input/DSInput";
import DSSlider from "../../ui/ds-slider/DSSlider";
import LabelColumn from "../../ui/label-column/LabelColumn";

export function ExportCameraSection() {
  const studio = useStudio();
  const [baseSizeInput, setBaseSizeInput] = useState<string>(studio.baseSize.toString());

  const commitBaseSize = () => {
    // parse and clamp to max 512
      const parsed = parseInt(baseSizeInput, 10);
      if (Number.isNaN(parsed)) {
        setBaseSizeInput(String(studio.baseSize));
        return;
      }
      // Enforce a minimum of 512 (do not allow values below 512)
      const clamped = Math.max(parsed, 512);
    studio.set({ baseSize: clamped });
    setBaseSizeInput(clamped.toString());
  };

  return (
    <CollapsiblePanel title="Export Camera">
      <LabelColumn>
        <label>Base Size</label>
        <DSInput
          value={baseSizeInput}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setBaseSizeInput(e.target.value)}
          onBlur={() => commitBaseSize()}
          onKeyDown={(e) => { if (e.key === 'Enter') commitBaseSize(); }}
          type="number"
          placeholder="Base Size (px)"
        />
      </LabelColumn>

      <LabelColumn>
        <label>Resolution Scale</label>
        <DSSlider
          min={0.1}
          max={2}
          step={0.05}
          value={studio.percentage}
          onChange={(e: ChangeEvent<HTMLInputElement>) => 
            studio.set({ percentage: Number(e.target.value) })
          }
          displayValue={`${(studio.percentage * 100).toFixed(0)}%`}
        />
      </LabelColumn>

      <LabelColumn>
        <label>Camera Offset</label>
        <DSInput
          value={studio.exportCameraOffset.x.toString()}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            studio.set({
              exportCameraOffset: { ...studio.exportCameraOffset, x: parseFloat(e.target.value) || 0 },
            })
          }
          type="number"
          placeholder="X Offset"
        />
        <DSInput
          value={studio.exportCameraOffset.y.toString()}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            studio.set({
              exportCameraOffset: { ...studio.exportCameraOffset, y: parseFloat(e.target.value) || 0 },
            })
          }
          type="number"
          placeholder="Y Offset"
        />
      </LabelColumn>

      <LabelColumn>
        <label>Camera Scale</label>
        <DSSlider
          min={0.1}
          max={2}
          step={0.05}
          value={studio.exportCameraScale}
          onChange={(e: ChangeEvent<HTMLInputElement>) => 
            studio.set({ exportCameraScale: Number(e.target.value) })
          }
          displayValue={`${(studio.exportCameraScale * 100).toFixed(0)}%`}
        />
      </LabelColumn>
    </CollapsiblePanel>
  );
}