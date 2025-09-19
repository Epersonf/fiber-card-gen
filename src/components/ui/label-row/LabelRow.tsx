// src/components/ui/LabelRow.tsx
import React from "react";
import "./LabelRow.css";

export default function LabelRow({ children }: { children: React.ReactNode }) {
  return <div className="label-row">{children}</div>;
}
