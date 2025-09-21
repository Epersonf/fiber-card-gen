import React from "react";
import "./DSSelect.css";

interface DSSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const DSSelect: React.FC<DSSelectProps> = ({ label, children, ...props }) => (
  <label className="ds-select-label">
    {label && <span className="ds-select-label-text">{label}</span>}
    <select className="ds-select" {...props}>
      {children}
    </select>
  </label>
);

export default DSSelect;
