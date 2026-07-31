"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import FeeSavingsCalculator from '../../components/widgets/FeeSavingsCalculator';
import styles from './FreelancerRate.module.css';
import { jsonLdScriptProps, buildFAQJsonLd, buildWebApplicationJsonLd } from '../../../lib/seo';

const faqs = [
  {
    question: "How is my minimum hourly rate calculated?",
    answer: "Your recommended hourly rate factors in your annual take-home goal, non-billable overhead expenses, tax reserve (estimated ~25%), and total annual billable hours derived from your desired weekly work schedule and vacation buffer."
  },
  {
    question: "Why does billable hours differ from total worked hours?",
    answer: "Freelancers typically spend 20-35% of working hours on admin, invoicing, proposals, and client communication. Setting realistic billable hours ensures you hit your annual income target."
  },
  {
    question: "How much extra do I keep with MegiLance's 0% platform fee?",
    answer: "On traditional sites like Upwork (10-20% fee) and Fiverr (20% fee), earning $50,000 means losing up to $10,000 in commissions. On MegiLance, you keep 100% of your earnings ($0 fee)."
  },
  {
    question: "Can I adjust rates for specific skills or clients?",
    answer: "Yes! Use your minimum calculated hourly rate as your base baseline, and adjust upwards based on client project urgency, complexity, or niche specialization."
  }
];

export default function FreelancerRateInteractive() {
  const [desiredSalary, setDesiredSalary] = useState<number>(75000);
  const [weeklyHours, setWeeklyHours] = useState<number>(35);
  const [vacationWeeks, setVacationWeeks] = useState<number>(4);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(300);
  const [taxRatePct, setTaxRatePct] = useState<number>(25);

  // Calculations
  const workingWeeksPerYear = 52 - vacationWeeks;
  const totalBillableHoursYear = Math.max(1, Math.round(workingWeeksPerYear * weeklyHours * 0.75)); // 75% billable ratio
  const annualExpenses = monthlyExpenses * 12;
  const grossIncomeNeeded = Math.round((desiredSalary + annualExpenses) / (1 - taxRatePct / 100));
  const hourlyRateNeeded = Math.ceil(grossIncomeNeeded / totalBillableHoursYear);

  // Platform fee comparison ($0 on MegiLance vs 20% on traditional platforms)
  const traditionalPlatformFeeLost = Math.round(grossIncomeNeeded * 0.20);

  const faqSchema = buildFAQJsonLd(faqs);
  const toolSchema = buildWebApplicationJsonLd({
    name: "Freelancer Hourly Rate & Net Income Calculator",
    description: "Calculate your ideal hourly billing rate based on annual target income, billable hours, expenses, and taxes. See 0% platform fee savings.",
    path: "/freelancer-rate-calculator",
    category: "BusinessApplication",
  });

  return (
    <>
      <script {...jsonLdScriptProps(toolSchema)} />
      <script {...jsonLdScriptProps(faqSchema)} />

      <main className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Freelancer Hourly Rate Calculator</h1>
          <p className={styles.subtitle}>
            Determine your ideal hourly rate to reach your annual income goals, cover taxes & overhead, and maximize net earnings with MegiLance's 0% platform fee.
          </p>
        </header>

        <div className={styles.calculatorGrid}>
          {/* Form Controls */}
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>⚙️ Your Financial & Work Goals</h2>

            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="desiredSalary">Target Net Annual Income</label>
                <span className={styles.valueBadge}>${desiredSalary.toLocaleString()}</span>
              </div>
              <input
                id="desiredSalary"
                type="number"
                step={5000}
                min={10000}
                max={500000}
                value={desiredSalary}
                onChange={(e) => setDesiredSalary(Number(e.target.value))}
                className={styles.inputNumber}
              />
              <span className={styles.fieldHint}>Take-home money desired per year after taxes & expenses</span>
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="weeklyHours">Work Hours / Week</label>
                <span className={styles.valueBadge}>{weeklyHours} hrs/wk</span>
              </div>
              <input
                id="weeklyHours"
                type="range"
                min={10}
                max={60}
                step={1}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className={styles.rangeInput}
              />
              <span className={styles.fieldHint}>Total hours spent working each week (~75% will be billable)</span>
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="vacationWeeks">Vacation & Days Off</label>
                <span className={styles.valueBadge}>{vacationWeeks} weeks/year</span>
              </div>
              <input
                id="vacationWeeks"
                type="range"
                min={1}
                max={10}
                step={1}
                value={vacationWeeks}
                onChange={(e) => setVacationWeeks(Number(e.target.value))}
                className={styles.rangeInput}
              />
              <span className={styles.fieldHint}>Holidays, sick days, and vacation buffer</span>
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="monthlyExpenses">Monthly Business Expenses</label>
                <span className={styles.valueBadge}>${monthlyExpenses}/mo</span>
              </div>
              <input
                id="monthlyExpenses"
                type="number"
                step={50}
                min={0}
                max={5000}
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                className={styles.inputNumber}
              />
              <span className={styles.fieldHint}>Software subscriptions, hardware, internet, software licenses</span>
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="taxRatePct">Estimated Tax Rate</label>
                <span className={styles.valueBadge}>{taxRatePct}%</span>
              </div>
              <input
                id="taxRatePct"
                type="range"
                min={10}
                max={45}
                step={1}
                value={taxRatePct}
                onChange={(e) => setTaxRatePct(Number(e.target.value))}
                className={styles.rangeInput}
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className={styles.resultsCard}>
            <div>
              <h2 className={styles.formTitle}>📊 Recommended Rate Breakdown</h2>
              
              <div className={styles.rateDisplay}>
                <div className={styles.rateLabel}>Minimum Recommended Rate</div>
                <div className={styles.rateBig}>${hourlyRateNeeded}<span style={{ fontSize: '1.5rem' }}>/hr</span></div>
              </div>

              <div className={styles.statRow}>
                <span>Gross Revenue Required:</span>
                <span className={styles.statVal}>${grossIncomeNeeded.toLocaleString()}/yr</span>
              </div>
              <div className={styles.statRow}>
                <span>Annual Billable Hours:</span>
                <span className={styles.statVal}>{totalBillableHoursYear.toLocaleString()} hrs</span>
              </div>
              <div className={styles.statRow}>
                <span>Annual Expenses:</span>
                <span className={styles.statVal}>${annualExpenses.toLocaleString()}</span>
              </div>
              <div className={styles.statRow}>
                <span>Target Net Salary:</span>
                <span className={styles.statVal} style={{ color: '#60a5fa' }}>${desiredSalary.toLocaleString()}</span>
              </div>
            </div>

            <div className={styles.savingsBox}>
              <div className={styles.savingsText}>
                🎉 0% Platform Fee Savings:
              </div>
              <p style={{ fontSize: '0.9rem', margin: '0.5rem 0 0.75rem 0', opacity: 0.9 }}>
                By using MegiLance instead of 20% fee sites, you save{' '}
                <strong style={{ color: '#34d399' }}>${traditionalPlatformFeeLost.toLocaleString()}</strong> every year!
              </p>
              <Link
                href="/(auth)/signup"
                style={{
                  display: 'inline-block',
                  padding: '0.6rem 1.25rem',
                  background: '#34d399',
                  color: '#000000',
                  fontWeight: 700,
                  borderRadius: '0.5rem',
                  textDecoration: 'none'
                }}
              >
                Create 0% Fee Freelancer Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Live Visual Fee Comparison Component */}
        <FeeSavingsCalculator
          initialBudget={grossIncomeNeeded}
          title="Compare Your Net Income Across Platforms"
          subtitle="See how much more money you keep on MegiLance compared to legacy platforms."
          showCTA={false}
        />

        {/* FAQ Section for AEO & Search Engines */}
        <section className={styles.faqSection}>
          <h2 className={styles.faqTitle}>Frequently Asked Questions (FAQ)</h2>
          <div className={styles.faqGrid}>
            {faqs.map((faq, i) => (
              <div key={i} className={styles.faqCard}>
                <h3 className={styles.faqQuestion}>{faq.question}</h3>
                <p className={styles.faqAnswer}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
