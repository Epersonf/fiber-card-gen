// src/components/ui/DSGroup.tsx
import React from "react";
import "./DSGroup.css";

export default function DSGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="ds-group">
      <h4 className="ds-group__title">{title}</h4>
      <div className="ds-group__content">{children}</div>
    </section>
  );
}
