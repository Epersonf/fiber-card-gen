// src/components/ui/Toolbar.tsx
import React from "react";
import "./Toolbar.css";

export default function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="toolbar">{children}</div>;
}
