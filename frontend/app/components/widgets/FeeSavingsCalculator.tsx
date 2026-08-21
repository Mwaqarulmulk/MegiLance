"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './FeeSavingsCalculator.module.css';

interface FeeSavingsCalculatorProps {
  initialBudget?: number;
  title?: string;
  subtitle?: string;
  showCTA?: boolean;
}

export default function FeeSavingsCalculator({
  initialBudget = 5000,
  title = "Platform Fee & Net Earnings Calculator",
  subtitle = "Drag the slider to see how much more freelancers keep & clients save on MegiLance.",
  showCTA = true,
}: FeeSavingsCalculatorProps) {
  const [budget, setBudget] = useState<number>(initialBudget);
  const [copied, setCopied] = useState<boolean>(false);

  // Fee percentages
  const megilanceFeePct = 0; // 0% Launch
  const upworkFeePct = 0.15; // 15% avg
  const fiverrFeePct = 0.20; // 20%
  const toptalFeePct = 0.25; // ~25%+ markup

  // Calculations
  const megilanceTakeHome = budget * (1 - megilanceFeePct);
  const upworkTakeHome = budget * (1 - upworkFeePct);
  const fiverrTakeHome = budget * (1 - fiverrFeePct);
  const toptalTakeHome = budget * (1 - toptalFeePct);

  const savingsVsUpwork = megilanceTakeHome - upworkTakeHome;
  const savingsVsFiverr = megilanceTakeHome - fiverrTakeHome;

  const handleCopySummary = () => {
    const text = `💰 MegiLance Fee Savings Summary:
Project Budget: $${budget.toLocaleString()}
-----------------------------------
✅ MegiLance (0% Fee): Net Earnings $${megilanceTakeHome.toLocaleString()} ($0 lost)
❌ Upwork (~15% Fee): Net Earnings $${upworkTakeHome.toLocaleString()} ($${(budget - upworkTakeHome).toLocaleString()} lost)
❌ Fiverr (20% Fee): Net Earnings $${fiverrTakeHome.toLocaleString()} ($${(budget - fiverrTakeHome).toLocaleString()} lost)

Total Money Saved on MegiLance: $${savingsVsFiverr.toLocaleString()}!
Start hiring or working fee-free at https://megilance.site`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className={styles.container} role="region" aria-label="Fee Savings Calculator">
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      <div className={styles.sliderGroup}>
        <div className={styles.sliderHeader}>
          <span className={styles.sliderLabel}>Project Budget / Earnings</span>
          <span className={styles.sliderValue}>${budget.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={500}
          max={50000}
          step={500}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className={styles.sliderInput}
          aria-label="Project budget amount slider"
        />
      </div>

      <div className={styles.comparisonGrid}>
        {/* MegiLance */}
        <div className={`${styles.card} ${styles.cardHighlighted}`}>
          <span className={styles.badge}>0% Commission</span>
          <div>
            <h3 className={styles.platformName}>MegiLance</h3>
            <p className={styles.feeRate}>0% Platform Fee</p>
          </div>
          <div>
            <span className={styles.takeHomeLabel}>Net Take-Home</span>
            <div className={`${styles.takeHomeAmount} ${styles.takeHomeAmountHighlight}`}>
              ${megilanceTakeHome.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
              Keep 100% of your earnings
            </span>
          </div>
        </div>

        {/* Upwork */}
        <div className={styles.card}>
          <div>
            <h3 className={styles.platformName}>Upwork</h3>
            <p className={styles.feeRate}>~15% Fee (10-20% Tiered)</p>
          </div>
          <div>
            <span className={styles.takeHomeLabel}>Net Take-Home</span>
            <div className={styles.takeHomeAmount}>${upworkTakeHome.toLocaleString()}</div>
            <span className={styles.feeLost}>-${(budget - upworkTakeHome).toLocaleString()} Fee Lost</span>
          </div>
        </div>

        {/* Fiverr */}
        <div className={styles.card}>
          <div>
            <h3 className={styles.platformName}>Fiverr</h3>
            <p className={styles.feeRate}>20% Service Fee</p>
          </div>
          <div>
            <span className={styles.takeHomeLabel}>Net Take-Home</span>
            <div className={styles.takeHomeAmount}>${fiverrTakeHome.toLocaleString()}</div>
            <span className={styles.feeLost}>-${(budget - fiverrTakeHome).toLocaleString()} Fee Lost</span>
          </div>
        </div>

        {/* Toptal */}
        <div className={styles.card}>
          <div>
            <h3 className={styles.platformName}>Toptal / Traditional</h3>
            <p className={styles.feeRate}>25%+ Agency Markup</p>
          </div>
          <div>
            <span className={styles.takeHomeLabel}>Net Take-Home</span>
            <div className={styles.takeHomeAmount}>${toptalTakeHome.toLocaleString()}</div>
            <span className={styles.feeLost}>-${(budget - toptalTakeHome).toLocaleString()} Markup Lost</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: showCTA ? '1.5rem' : '0' }}>
        <p style={{ fontSize: '0.9rem', opacity: 0.85, marginBottom: '1rem' }}>
          💡 On a <strong>${budget.toLocaleString()}</strong> project, you save up to{' '}
          <strong style={{ color: '#10b981' }}>${savingsVsFiverr.toLocaleString()}</strong> compared to standard platforms!
        </p>
      </div>

      {showCTA && (
        <div className={styles.actions}>
          <Link href="/signup" className={styles.btnPrimary}>
            Start Free with 0% Fees
          </Link>
          <button onClick={handleCopySummary} className={styles.btnSecondary} type="button">
            {copied ? '✓ Copied Summary!' : '📋 Copy Savings Summary'}
          </button>
        </div>
      )}
    </section>
  );
}
