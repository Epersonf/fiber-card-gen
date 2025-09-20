import React from "react";
import "./LabelColumn.css";

interface LabelColumnProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const LabelColumn: React.FC<LabelColumnProps> = ({ children, style }) => (
  <div className="label-column" style={style}>{children}</div>
);

export default LabelColumn;
