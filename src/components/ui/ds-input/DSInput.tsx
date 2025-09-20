import React from "react";
import "./DSInput.css";

interface DSInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const DSInput: React.FC<DSInputProps> = ({ label, ...props }) => (
  <label className="ds-input-label">
    {label && <span className="ds-input-label-text">{label}</span>}
    <input className="ds-input" {...props} />
  </label>
);

export default DSInput;
