// src/components/ui/SceneContainer.tsx
import React from "react";
import "./SceneContainer.css";

export default function SceneContainer({ children }: { children: React.ReactNode }) {
  return <div className="scene">{children}</div>;
}
