"use client";
import React, { useState } from 'react';
import commonStyles from './Compare.common.module.css';

const platforms = [
  {
    name: "MegiLance",
    fees: "5% service fee",
    escrow: "Yes — built-in",
    aiMatching: "Yes — ML-powered",
    milestones: "Zero-friction",
    payments: "Stripe + Crypto",
    realtime: "Socket.IO",
    highlighting: true,
  },
  {
    name: "Upwork",
    fees: "5-20% sliding scale",
    escrow: "Yes",
    aiMatching: "Basic",
    milestones: "Manual",
    payments: "PayPal / Wire",
    realtime: "Limited",
    highlighting: false,
  },
  {
    name: "Fiverr",
    fees: "20% flat",
    escrow: "Yes",
    aiMatching: "None",
    milestones: "Package-based",
    payments: "PayPal / Stripe",
    realtime: "Limited",
    highlighting: false,
  },
  {
    name: "Freelancer.com",
    fees: "10% or $5",
    escrow: "Yes (optional)",
    aiMatching: "None",
    milestones: "Manual",
    payments: "PayPal / Skrill",
    realtime: "Basic",
    highlighting: false,
  },
];

const comparisons = [
  { label: "Service Fee", key: "fees" },
  { label: "Escrow", key: "escrow" },
  { label: "AI Matching", key: "aiMatching" },
  { label: "Milestones", key: "milestones" },
  { label: "Payment Options", key: "payments" },
  { label: "Real-time Chat", key: "realtime" },
];

export default function CompareClient() {
  const [selected, setSelected] = useState<string[]>(["MegiLance", "Upwork"]);

  const toggle = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name].slice(-3)
    );
  };

  const visible = platforms.filter((p) => selected.includes(p.name));

  return (
    <main className={commonStyles.container}>
      <header className={commonStyles.header}>
        <h1 className={commonStyles.title}>Platform Comparison</h1>
        <p className={commonStyles.subtitle}>
          See how MegiLance stacks up against the competition.
        </p>
      </header>

      <section className={commonStyles.selector}>
        {platforms.map((p) => (
          <button
            key={p.name}
            onClick={() => toggle(p.name)}
            className={`${commonStyles.chip} ${selected.includes(p.name) ? commonStyles.chipActive : ""}`}
          >
            {p.name}
          </button>
        ))}
      </section>

      <section className={commonStyles.tableWrap}>
        <table className={commonStyles.table}>
          <thead>
            <tr>
              <th>Feature</th>
              {visible.map((p) => (
                <th key={p.name} className={p.highlighting ? commonStyles.highlight : ""}>
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisons.map((c) => (
              <tr key={c.key}>
                <td className={commonStyles.label}>{c.label}</td>
                {visible.map((p) => (
                  <td key={p.name} className={p.highlighting ? commonStyles.highlight : ""}>
                    {(p as Record<string, unknown>)[c.key] as string}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={commonStyles.cta}>
        <h2>Ready to experience the difference?</h2>
        <p>Join MegiLance and get matched with top talent using AI-powered matching.</p>
        <a href="/signup" className={commonStyles.button}>Get Started Free</a>
      </section>
    </main>
  );
}
