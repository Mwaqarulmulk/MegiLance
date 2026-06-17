// @AI-HINT: Reusable, theme-aware "How to use this tool" guide panel for AI tools.
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, Lightbulb, HelpCircle, Target, Sparkles } from 'lucide-react';

export interface GuideStep {
  title: string;
  text: string;
}
export interface GuideFAQ {
  q: string;
  a: string;
}

interface UserGuideProps {
  isDark: boolean;
  /** Short one-liner describing what the tool does. */
  overview: string;
  steps: GuideStep[];
  tips?: string[];
  faqs?: GuideFAQ[];
  /** How the result is computed / how accurate it is. */
  accuracyNote?: string;
  /** Start expanded? Defaults to false. */
  defaultOpen?: boolean;
  title?: string;
}

export default function UserGuide({
  isDark,
  overview,
  steps,
  tips = [],
  faqs = [],
  accuracyNote,
  defaultOpen = false,
  title = 'How to use this tool',
}: UserGuideProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const c = palette(isDark);

  return (
    <section
      style={{
        borderRadius: 16,
        border: `1px solid ${c.border}`,
        background: c.bg,
        overflow: 'hidden',
        marginBottom: 20,
        boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.06)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 18px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <BookOpen size={18} />
        </span>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontWeight: 700, fontSize: 15, color: c.strong }}>{title}</span>
          <span style={{ display: 'block', fontSize: 12.5, color: c.muted }}>{overview}</span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ color: c.muted }}>
          <ChevronDown size={20} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '4px 18px 20px' }}>
              {/* Steps */}
              <h4 style={headingStyle(c)}>
                <Target size={15} /> Step by step
              </h4>
              <ol style={{ listStyle: 'none', margin: '0 0 16px', padding: 0, display: 'grid', gap: 10 }}>
                {steps.map((s, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span
                      style={{
                        flexShrink: 0,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: c.numBg,
                        color: c.numFg,
                        fontWeight: 700,
                        fontSize: 12,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {i + 1}
                    </span>
                    <span>
                      <span style={{ display: 'block', fontWeight: 600, fontSize: 13.5, color: c.strong }}>{s.title}</span>
                      <span style={{ display: 'block', fontSize: 12.5, color: c.body, lineHeight: 1.5 }}>{s.text}</span>
                    </span>
                  </li>
                ))}
              </ol>

              {/* Tips */}
              {tips.length > 0 && (
                <>
                  <h4 style={headingStyle(c)}>
                    <Lightbulb size={15} /> Pro tips
                  </h4>
                  <ul style={{ margin: '0 0 16px', padding: '0 0 0 2px', listStyle: 'none', display: 'grid', gap: 7 }}>
                    {tips.map((t, i) => (
                      <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: c.body, lineHeight: 1.5 }}>
                        <Sparkles size={14} style={{ color: '#7C3AED', flexShrink: 0, marginTop: 2 }} />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* FAQ */}
              {faqs.length > 0 && (
                <>
                  <h4 style={headingStyle(c)}>
                    <HelpCircle size={15} /> FAQ
                  </h4>
                  <div style={{ display: 'grid', gap: 6, marginBottom: accuracyNote ? 16 : 0 }}>
                    {faqs.map((f, i) => (
                      <div key={i} style={{ borderRadius: 10, border: `1px solid ${c.border}`, overflow: 'hidden' }}>
                        <button
                          type="button"
                          onClick={() => setOpenFaq((p) => (p === i ? null : i))}
                          aria-expanded={openFaq === i}
                          style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 12px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: 13,
                            fontWeight: 600,
                            color: c.strong,
                          }}
                        >
                          {f.q}
                          <motion.span animate={{ rotate: openFaq === i ? 180 : 0 }} style={{ color: c.muted, flexShrink: 0 }}>
                            <ChevronDown size={16} />
                          </motion.span>
                        </button>
                        <AnimatePresence initial={false}>
                          {openFaq === i && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <p style={{ margin: 0, padding: '0 12px 12px', fontSize: 12.5, color: c.body, lineHeight: 1.55 }}>{f.a}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Accuracy / methodology */}
              {accuracyNote && (
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: c.noteBg,
                    border: `1px solid ${c.border}`,
                  }}
                >
                  <Sparkles size={16} style={{ color: '#4F46E5', flexShrink: 0, marginTop: 1 }} />
                  <p style={{ margin: 0, fontSize: 12, color: c.body, lineHeight: 1.55 }}>
                    <strong style={{ color: c.strong }}>How accurate is this? </strong>
                    {accuracyNote}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function headingStyle(c: ReturnType<typeof palette>): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    margin: '12px 0 8px',
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: c.accent,
  };
}

function palette(isDark: boolean) {
  return isDark
    ? {
        bg: 'rgba(30,41,59,0.5)',
        border: 'rgba(148,163,184,0.18)',
        strong: '#F1F5F9',
        body: '#CBD5E1',
        muted: '#94A3B8',
        accent: '#A5B4FC',
        numBg: 'rgba(99,102,241,0.25)',
        numFg: '#C7D2FE',
        noteBg: 'rgba(79,70,229,0.12)',
      }
    : {
        bg: '#FFFFFF',
        border: 'rgba(148,163,184,0.3)',
        strong: '#0F172A',
        body: '#475569',
        muted: '#64748B',
        accent: '#4F46E5',
        numBg: '#EEF2FF',
        numFg: '#4338CA',
        noteBg: '#F1F5FF',
      };
}
