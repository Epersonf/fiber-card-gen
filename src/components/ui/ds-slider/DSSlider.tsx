import React from "react";
import "./DSSlider.css";

interface DSSliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  value: number | string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  displayValue?: string | number;
}

const DSSlider: React.FC<DSSliderProps> = ({ label, displayValue, ...props }) => (
  <label className="ds-slider-label">
    {label && <span className="ds-slider-label-text">{label}</span>}
    <input className="ds-slider" type="range" {...props} />
    {displayValue !== undefined && <span className="ds-slider-value">{displayValue}</span>}
  </label>
);

export default DSSlider;
