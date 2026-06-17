// @AI-HINT: Reusable "Export Report" dropdown for AI tools — generates branded PDF / Word from an AIReport.
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileDown, FileText, FileType2, Loader2, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIReport } from './reportTypes';
import { exportReportPDF } from './pdf';
import { exportReportDOCX } from './docx';

interface ExportMenuProps {
  /** The report to export — pass a builder fn so it's only computed on click. */
  report: AIReport | (() => AIReport);
  className?: string;
  /** Visual size of the trigger button. */
  size?: 'sm' | 'md';
  label?: string;
}

type Busy = null | 'pdf' | 'docx';

export default function ExportMenu({ report, className, size = 'md', label = 'Export Report' }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<Busy>(null);
  const [done, setDone] = useState<Busy>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const resolve = useCallback(() => (typeof report === 'function' ? report() : report), [report]);

  const handle = useCallback(
    async (kind: 'pdf' | 'docx') => {
      if (busy) return;
      setBusy(kind);
      try {
        const r = resolve();
        if (kind === 'pdf') exportReportPDF(r);
        else await exportReportDOCX(r);
        setDone(kind);
        setTimeout(() => setDone(null), 2000);
      } catch (err) {
        console.error('Report export failed:', err);
        // eslint-disable-next-line no-alert
        alert('Sorry — the report could not be generated. Please try again.');
      } finally {
        setBusy(null);
        setOpen(false);
      }
    },
    [busy, resolve],
  );

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }} className={className}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={!!busy}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(EXPORT_BTN, size === 'sm' && EXPORT_BTN_SM)}
        style={EXPORT_BTN_STYLE}
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
        {busy ? 'Generating…' : label}
        <ChevronDown size={14} style={{ opacity: 0.8 }} />
      </button>

      {open && (
        <div role="menu" style={MENU_STYLE}>
          <button type="button" role="menuitem" onClick={() => handle('pdf')} style={ITEM_STYLE} className={ITEM_CLS}>
            <span style={ICON_WRAP('#FEE2E2')}>
              {done === 'pdf' ? <Check size={16} color="#15803D" /> : <FileText size={16} color="#DC2626" />}
            </span>
            <span style={{ textAlign: 'left' }}>
              <span style={ITEM_TITLE}>Download PDF</span>
              <span style={ITEM_SUB}>Branded, print-ready report</span>
            </span>
          </button>
          <button type="button" role="menuitem" onClick={() => handle('docx')} style={ITEM_STYLE} className={ITEM_CLS}>
            <span style={ICON_WRAP('#DBEAFE')}>
              {done === 'docx' ? <Check size={16} color="#15803D" /> : <FileType2 size={16} color="#2563EB" />}
            </span>
            <span style={{ textAlign: 'left' }}>
              <span style={ITEM_TITLE}>Download Word</span>
              <span style={ITEM_SUB}>Editable .docx document</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

/* Inline styles keep this drop-in for any tool regardless of its CSS modules. */
const EXPORT_BTN = 'inline-flex items-center gap-2 font-semibold transition-transform hover:-translate-y-0.5';
const EXPORT_BTN_SM = 'text-sm';
const EXPORT_BTN_STYLE: React.CSSProperties = {
  padding: '10px 18px',
  borderRadius: 12,
  border: 'none',
  cursor: 'pointer',
  color: '#fff',
  background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
  boxShadow: '0 6px 18px rgba(79,70,229,0.35)',
  fontSize: 14,
};
const MENU_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  right: 0,
  minWidth: 250,
  background: 'var(--card-bg, #fff)',
  borderRadius: 14,
  border: '1px solid rgba(148,163,184,0.25)',
  boxShadow: '0 16px 48px rgba(15,23,42,0.22)',
  padding: 8,
  zIndex: 50,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};
const ITEM_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
};
const ITEM_CLS = 'hover:bg-black/5 dark:hover:bg-white/10';
const ICON_WRAP = (bg: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 34,
  height: 34,
  borderRadius: 9,
  background: bg,
  flexShrink: 0,
});
const ITEM_TITLE: React.CSSProperties = { display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--text-strong, #0F172A)' };
const ITEM_SUB: React.CSSProperties = { display: 'block', fontSize: 11.5, color: 'var(--text-muted, #64748B)' };
