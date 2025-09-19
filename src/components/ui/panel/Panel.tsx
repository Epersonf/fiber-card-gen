// src/components/ui/Panel.tsx
import React from "react";
import "./Panel.css";

export default function Panel({ children }: { children: React.ReactNode }) {
  return <aside className="panel">{children}</aside>;
}
