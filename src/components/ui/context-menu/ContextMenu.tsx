import React, { useState, ReactNode, useRef, useEffect } from 'react';

type Item = {
  key: string;
  label: string;
  onClick: () => void;
};

type Props = {
  trigger: ReactNode;
  items: Item[];
  align?: 'left' | 'right';
};

export default function ContextMenu({ trigger, items, align = 'left' }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={() => setOpen(o => !o)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: '100%',
            marginTop: 6,
            minWidth: 160,
            background: '#1f1f1f',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
            padding: 6,
            borderRadius: 6,
            zIndex: 60,
            right: align === 'right' ? 0 : 'auto',
            left: align === 'left' ? 0 : 'auto',
          }}
        >
          {items.map((it) => (
            <div
              key={it.key}
              role="menuitem"
              onClick={() => { it.onClick(); setOpen(false); }}
              style={{
                padding: '8px 10px',
                borderRadius: 4,
                color: '#fff',
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {it.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
