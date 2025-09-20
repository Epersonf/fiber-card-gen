import { useMemo } from "react";
import { useStudio } from "../../../store/studio.store";
import DSButton from "../ds-button/DSButton";
import "./GradientStopsEditor.css";

export default function GradientStopsEditor() {
  const s = useStudio();
  const set = useStudio(st => st.set);

  const sorted = useMemo(
    () => [...s.hair_gradient_stops].sort((a, b) => a.pos - b.pos),
    [s.hair_gradient_stops]
  );

  return (
    <div className="grad-editor">
      {sorted.map((stp, i) => (
        <div className="grad-row" key={i}>
          <input
            type="color"
            value={stp.color}
            onChange={e => {
              const v = e.target.value;
              const next = s.hair_gradient_stops.map((x, idx) => idx === i ? { ...x, color: v } : x);
              set({ hair_gradient_stops: next });
            }}
          />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={stp.pos}
            onChange={e => {
              const v = Math.max(0, Math.min(1, +e.target.value));
              const next = s.hair_gradient_stops.map((x, idx) => idx === i ? { ...x, pos: v } : x);
              set({ hair_gradient_stops: next });
            }}
          />
          <span>{Math.round(stp.pos * 100)}%</span>
          <DSButton variant="ghost" onClick={() => {
            const next = s.hair_gradient_stops.filter((_, idx) => idx !== i);
            set({ hair_gradient_stops: next.length ? next : [{ pos: 0, color: '#000000' }, { pos: 1, color: '#ffffff' }] });
          }}>Remove</DSButton>
        </div>
      ))}
      <DSButton onClick={() => {
        const next = [...s.hair_gradient_stops, { pos: 0.5, color: '#888888' }];
        set({ hair_gradient_stops: next });
      }}>Add Stop</DSButton>
    </div>
  );
}
