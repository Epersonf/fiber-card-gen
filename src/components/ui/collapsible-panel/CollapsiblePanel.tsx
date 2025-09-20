import React, { useState, ReactNode } from 'react';
import './CollapsiblePanel.css';

interface CollapsiblePanelProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`collapsible-panel${open ? ' open' : ''}`}>  
      <button
        className="collapsible-panel__header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="collapsible-panel__arrow">{open ? '▼' : '▶'}</span>
        <span className="collapsible-panel__title">{title}</span>
      </button>
      {open && <div className="collapsible-panel__content">{children}</div>}
    </div>
  );
};
