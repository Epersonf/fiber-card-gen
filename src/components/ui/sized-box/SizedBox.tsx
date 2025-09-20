import React from "react";
import "./SizedBox.css";

interface SizedBoxProps {
  width?: number | string;
  height?: number | string;
  inline?: boolean;
}

const SizedBox: React.FC<SizedBoxProps> = ({ width, height, inline = false }) => {
  const className = `sized-box${inline ? " inline" : ""}`;
  const style: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };
  return <span className={className} style={style} />;
};

export default SizedBox;
