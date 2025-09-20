import React from "react";
import "./DSRange.css";

interface DSRangeProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  value: number | string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  displayValue?: string;
}

const DSRange: React.FC<DSRangeProps> = ({ label, displayValue, ...props }) => (
  <label className="ds-range-label">
    {label && <span className="ds-range-label-text">{label}</span>}
    <input className="ds-range" type="range" {...props} />
    {displayValue !== undefined && <span className="ds-range-value">{displayValue}</span>}
  </label>
);

export default DSRange;
