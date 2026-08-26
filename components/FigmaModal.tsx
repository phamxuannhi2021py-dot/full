'use client';

import { useEffect } from 'react';

export function FigmaModal({
  open,
  title,
  children,
  onClose,
  wide = false,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return <div className="ct-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className={`ct-modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="ct-modal-title">
      <header><h2 id="ct-modal-title">{title}</h2><button type="button" onClick={onClose} aria-label="Đóng">×</button></header>
      <div className="ct-modal-content">{children}</div>
    </section>
  </div>;
}

export function InlineStatus({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  return <div className={`ct-inline-status ${error ? 'error' : 'success'}`} role="status">{error || success}</div>;
}
