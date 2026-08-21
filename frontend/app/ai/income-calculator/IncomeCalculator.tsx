// @AI-HINT: Standalone Freelance Income Calculator – multi-step wizard for income projections
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, ArrowRight, ArrowLeft, RotateCcw, Download,
  TrendingUp, PiggyBank, Shield, CheckCircle, BarChart2,
  Briefcase, Clock, Target, Heart, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToaster } from '@/app/components/molecules/Toast/ToasterProvider';
import commonStyles from './IncomeCalculator.common.module.css';
import lightStyles from './IncomeCalculator.light.module.css';
import darkStyles from './IncomeCalculator.dark.module.css';
import { AuroraBackground, ShineBadge, AnimatedGradientText, NumberTicker, Meteors, BorderBeam, celebrate } from '@/app/components/AI/kit';
import GuestBanner from '@/app/components/AI/GuestBanner/GuestBanner';
import { ExportMenu, type AIReport } from '@/app/components/AI/report';
import LeadMagnetHireBridge from '@/app/components/AI/LeadMagnetBridge/LeadMagnetHireBridge';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Country { key: string; label: string; currency: string }
interface ExpenseCategory { key: string; label: string; description: string; icon: string }
interface IncomeType { key: string; label: string }

interface OptionsData {
  countries: Country[];
  expense_categories: ExpenseCategory[];
  income_types: IncomeType[];
}

interface IncomeResult {
  income: { gross_annual: number; gross_monthly: number; breakdown: { source: string; annual: number; detail?: string }[] };
  expenses: { annual: number; monthly: number; breakdown: { category: string; monthly: number; annual: number; label: string }[]; expense_ratio: number };
  taxes: { income_tax: number; self_employment_tax: number; state_tax: number; total_tax: number; effective_rate: number; quarterly_estimate: number; country: string; currency: string };
  net_income: { annual: number; monthly: number; weekly: number; daily: number };
  effective_rates: { hourly: number; daily: number; billable_hours_year: number; billable_weeks: number };
  savings: { monthly_savings: number; annual_savings: number; monthly_retirement: number; emergency_fund_target: number; disposable_monthly: number };
  health: { score: number; level: string; insights: { type: string; title: string; message: string }[] };
  rate_recommendations: { break_even_hourly: number; comfortable_hourly: number; premium_hourly: number };
  meta: { currency: string; country: string };
}

const STEPS = ['Income', 'Expenses', 'Tax & Goals', 'Results'];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StepIncome({
  cs, ts, form, incomeTypes, onChange,
}: { cs: typeof commonStyles; ts: typeof lightStyles; form: Record<string, any>; incomeTypes: IncomeType[]; onChange: (f: string, v: any) => void }) {
  return (
    <div className={cn(cs.formCard, ts.formCard)}>
      <h3 className={cn(cs.formTitle, ts.formTitle)}>Income Details</h3>
      <div className={cs.formGroup}>
        <label className={cn(cs.label, ts.label)}>Income Type</label>
        <div className={cs.typeGrid}>
          {incomeTypes.map(t => (
            <button key={t.key} type="button" onClick={() => onChange('income_type', t.key)}
              className={cn(cs.typeCard, ts.typeCard, form.income_type === t.key && cs.typeCardSelected, form.income_type === t.key && ts.typeCardSelected)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {(form.income_type === 'hourly' || form.income_type === 'mixed') && (
        <div className={cs.formRow}>
          <div className={cs.formGroup}>
            <label className={cn(cs.label, ts.label)}>Hourly Rate</label>
            <input type="number" className={cn(cs.numberInput, ts.numberInput)} value={form.rate} onChange={e => onChange('rate', e.target.value)} placeholder="75" min={0} />
          </div>
          <div className={cs.formGroup}>
            <label className={cn(cs.label, ts.label)}>Hours/Week</label>
            <input type="number" className={cn(cs.numberInput, ts.numberInput)} value={form.hours_per_week} onChange={e => onChange('hours_per_week', e.target.value)} placeholder="40" min={1} max={80} />
          </div>
        </div>
      )}
      {form.income_type === 'daily' && (
        <div className={cs.formRow}>
          <div className={cs.formGroup}>
            <label className={cn(cs.label, ts.label)}>Day Rate</label>
            <input type="number" className={cn(cs.numberInput, ts.numberInput)} value={form.rate} onChange={e => onChange('rate', e.target.value)} placeholder="500" min={0} />
          </div>
          <div className={cs.formGroup}>
            <label className={cn(cs.label, ts.label)}>Days/Week</label>
            <input type="number" className={cn(cs.numberInput, ts.numberInput)} value={form.days_per_week} onChange={e => onChange('days_per_week', e.target.value)} placeholder="5" min={1} max={7} />
          </div>
        </div>
      )}
      {(form.income_type === 'project' || form.income_type === 'mixed') && (
        <div className={cs.formRow}>
          <div className={cs.formGroup}>
            <label className={cn(cs.label, ts.label)}>Projects/Year</label>
            <input type="number" className={cn(cs.numberInput, ts.numberInput)} value={form.projects_per_year} onChange={e => onChange('projects_per_year', e.target.value)} placeholder="6" min={0} />
          </div>
          <div className={cs.formGroup}>
            <label className={cn(cs.label, ts.label)}>Avg Project Value</label>
            <input type="number" className={cn(cs.numberInput, ts.numberInput)} value={form.avg_project_value} onChange={e => onChange('avg_project_value', e.target.value)} placeholder="5000" min={0} />
          </div>
        </div>
      )}
      {(form.income_type === 'retainer' || form.income_type === 'mixed') && (
        <div className={cs.formRow}>
          <div className={cs.formGroup}>
            <label className={cn(cs.label, ts.label)}>Monthly Retainer</label>
            <input type="number" className={cn(cs.numberInput, ts.numberInput)} value={form.monthly_retainer} onChange={e => onChange('monthly_retainer', e.target.value)} placeholder="3000" min={0} />
          </div>
          <div className={cs.formGroup}>
            <label className={cn(cs.label, ts.label)}>Retainer Clients</label>
            <input type="number" className={cn(cs.numberInput, ts.numberInput)} value={form.retainer_clients} onChange={e => onChange('retainer_clients', e.target.value)} placeholder="2" min={0} />
          </div>
        </div>
      )}
      <div className={cs.formRow}>
        <div className={cs.formGroup}>
          <label className={cn(cs.label, ts.label)}>Weeks/Year</label>
          <input type="number" className={cn(cs.numberInput, ts.numberInput)} value={form.weeks_per_year} onChange={e => onChange('weeks_per_year', e.target.value)} placeholder="48" min={1} max={52} />
        </div>
        <div className={cs.formGroup}>
          <label className={cn(cs.label, ts.label)}>Vacation Weeks</label>
          <input type="number" className={cn(cs.numberInput, ts.numberInput)} value={form.vacation_weeks} onChange={e => onChange('vacation_weeks', e.target.value)} placeholder="4" min={0} max={20} />
        </div>
      </div>
    </div>
  );
}

function StepExpenses({
  cs, ts, categories, expenses, onChange,
}: { cs: typeof commonStyles; ts: typeof lightStyles; categories: ExpenseCategory[]; expenses: Record<string, string>; onChange: (k: string, v: string) => void }) {
  return (
    <div className={cn(cs.formCard, ts.formCard)}>
      <h3 className={cn(cs.formTitle, ts.formTitle)}>Monthly Expenses <span className={cn(cs.labelHint, ts.labelHint)}>(per month)</span></h3>
      <div className={cs.expenseGrid}>
        {categories.map(cat => (
          <div key={cat.key} className={cs.expenseItem}>
            <label className={cn(cs.label, ts.label)}>{cat.label}</label>
            <input type="number" className={cn(cs.numberInput, ts.numberInput)} value={expenses[cat.key] || ''} onChange={e => onChange(cat.key, e.target.value)} placeholder="0" min={0} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StepTaxGoals({
  cs, ts, form, countries, onChange,
}: { cs: typeof commonStyles; ts: typeof lightStyles; form: Record<string, any>; countries: Country[]; onChange: (f: string, v: any) => void }) {
  return (
    <div className={cn(cs.formCard, ts.formCard)}>
      <h3 className={cn(cs.formTitle, ts.formTitle)}>Tax & Financial Goals</h3>
      <div className={cs.formRow}>
        <div className={cs.formGroup}>
          <label className={cn(cs.label, ts.label)}>Country</label>
          <select className={cn(cs.select, ts.select)} value={form.country} onChange={e => onChange('country', e.target.value)}>
            {countries.map(c => <option key={c.key} value={c.key}>{c.label} ({c.currency})</option>)}
          </select>
        </div>
        <div className={cs.formGroup}>
          <label className={cn(cs.label, ts.label)}>State Tax Rate (%)</label>
          <input type="number" className={cn(cs.numberInput, ts.numberInput)} value={form.state_tax_rate} onChange={e => onChange('state_tax_rate', e.target.value)} placeholder="0" min={0} max={20} step={0.1} />
        </div>
      </div>
      <div className={cs.formRow}>
        <div className={cs.formGroup}>
          <label className={cn(cs.label, ts.label)}>Savings Goal (%)</label>
          <input type="number" className={cn(cs.numberInput, ts.numberInput)} value={form.savings_goal_percent} onChange={e => onChange('savings_goal_percent', e.target.value)} placeholder="20" min={0} max={80} />
        </div>
        <div className={cs.formGroup}>
          <label className={cn(cs.label, ts.label)}>Retirement (%)</label>
          <input type="number" className={cn(cs.numberInput, ts.numberInput)} value={form.retirement_contribution_percent} onChange={e => onChange('retirement_contribution_percent', e.target.value)} placeholder="10" min={0} max={50} />
        </div>
      </div>
      <div className={cs.formRow}>
        <div className={cs.formGroup}>
          <label className={cn(cs.label, ts.label)}>Emergency Fund (months)</label>
          <input type="number" className={cn(cs.numberInput, ts.numberInput)} value={form.emergency_fund_months} onChange={e => onChange('emergency_fund_months', e.target.value)} placeholder="6" min={1} max={24} />
        </div>
        <div className={cs.formGroup}>
          <label className={cn(cs.label, ts.label)}>Sick Days/Year</label>
          <input type="number" className={cn(cs.numberInput, ts.numberInput)} value={form.sick_days} onChange={e => onChange('sick_days', e.target.value)} placeholder="5" min={0} max={30} />
        </div>
      </div>
    </div>
  );
}

function ProcessingView({ cs, ts }: { cs: typeof commonStyles; ts: typeof lightStyles }) {
  const steps = ['Calculating gross income...', 'Computing tax obligations...', 'Analyzing financial health...', 'Generating projections...'];
  return (
    <div className={cn(cs.processingContainer, ts.processingContainer)}>
      <div className={cs.processingOrb}>
        <div className={cn(cs.processingOrbInner, ts.processingOrbInner)}><TrendingUp size={32} /></div>
      </div>
      <h3 className={cn(cs.formTitle, ts.formTitle)}>Crunching Numbers</h3>
      <p className={cn(cs.processingSubtitle, ts.processingSubtitle)}>Analyzing your income, expenses, and tax situation</p>
      <div className={cs.processingSteps}>
        {steps.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.5, duration: 0.4 }} className={cs.processingStep}>
            <div className={cn(cs.processingStepCircle, ts.processingStepCircle)}><CheckCircle size={14} /></div>
            <span>{s}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ResultsDashboard({
  cs, ts, result, fmt,
}: { cs: typeof commonStyles; ts: typeof lightStyles; result: IncomeResult; fmt: (n: number) => string }) {
  const cur = result.meta.currency;
  const healthColor = result.health.score >= 85 ? '#27ae60' : result.health.score >= 65 ? '#f39c12' : '#e81123';

  useEffect(() => { celebrate(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div className={cs.resultsContainer}>
      {/* Hero */}
      <div className={cn(cs.priceHero, ts.priceHero, 'relative overflow-hidden')}>
        <div className={cs.priceHeroGlow} />
        <Meteors number={10} />
        <BorderBeam size={220} duration={9} />
        <div className={cn(cs.priceHeroLabel, ts.priceHeroLabel)}>Annual Net Income</div>
        <div className={cn(cs.priceHeroValue, ts.priceHeroValue)}><NumberTicker value={result.net_income.annual} prefix={`${cur} `} /></div>
        <div className={cs.priceHeroMeta}>
          <span className={cn(cs.priceHeroMetaItem, ts.priceHeroMetaItem)}>{cur} {fmt(result.net_income.monthly)}/mo</span>
          <span className={cn(cs.priceHeroMetaItem, ts.priceHeroMetaItem)}>{cur} {fmt(result.effective_rates.hourly)}/hr effective</span>
          <span className={cn(cs.priceHeroMetaItem, ts.priceHeroMetaItem)}>{result.meta.country}</span>
        </div>
      </div>

      <div className={cs.resultsGrid}>
        {/* Income Breakdown */}
        <div className={cn(cs.resultCard, ts.resultCard)}>
          <div className={cs.resultCardHeader}>
            <div className={cn(cs.resultCardIcon, ts.resultCardIcon)}><DollarSign size={18} /></div>
            <h4 className={cn(cs.resultCardTitle, ts.resultCardTitle)}>Gross Income</h4>
          </div>
          <div className={cn(cs.bigStat, ts.bigStat)}>{cur} {fmt(result.income.gross_annual)}</div>
          {result.income.breakdown.map((b, i) => (
            <div key={i} className={cs.breakdownRow}>
              <span className={cn(cs.breakdownLabel, ts.breakdownLabel)}>{b.source}</span>
              <span className={cn(cs.breakdownValue, ts.breakdownValue)}>{cur} {fmt(b.annual)}</span>
            </div>
          ))}
        </div>

        {/* Tax Breakdown */}
        <div className={cn(cs.resultCard, ts.resultCard)}>
          <div className={cs.resultCardHeader}>
            <div className={cn(cs.resultCardIcon, ts.resultCardIcon)}><BarChart2 size={18} /></div>
            <h4 className={cn(cs.resultCardTitle, ts.resultCardTitle)}>Tax Breakdown</h4>
          </div>
          <div className={cs.calcList}>
            <div className={cn(cs.calcRow, ts.calcRow)}><span>Income Tax</span><span>{cur} {fmt(result.taxes.income_tax)}</span></div>
            <div className={cn(cs.calcRow, ts.calcRow)}><span>Self-Employment Tax</span><span>{cur} {fmt(result.taxes.self_employment_tax)}</span></div>
            {result.taxes.state_tax > 0 && <div className={cn(cs.calcRow, ts.calcRow)}><span>State Tax</span><span>{cur} {fmt(result.taxes.state_tax)}</span></div>}
            <div className={cn(cs.calcRow, ts.calcRow, cs.calcRowTotal)}><span>Total Tax</span><span>{cur} {fmt(result.taxes.total_tax)}</span></div>
            <div className={cn(cs.calcRow, ts.calcRow)}><span>Effective Rate</span><span>{result.taxes.effective_rate}%</span></div>
            <div className={cn(cs.calcRow, ts.calcRow)}><span>Quarterly Estimate</span><span>{cur} {fmt(result.taxes.quarterly_estimate)}</span></div>
          </div>
        </div>

        {/* Savings & Goals */}
        <div className={cn(cs.resultCard, ts.resultCard)}>
          <div className={cs.resultCardHeader}>
            <div className={cn(cs.resultCardIcon, ts.resultCardIcon)}><PiggyBank size={18} /></div>
            <h4 className={cn(cs.resultCardTitle, ts.resultCardTitle)}>Savings & Goals</h4>
          </div>
          <div className={cs.calcList}>
            <div className={cn(cs.calcRow, ts.calcRow)}><span>Monthly Savings</span><span>{cur} {fmt(result.savings.monthly_savings)}</span></div>
            <div className={cn(cs.calcRow, ts.calcRow)}><span>Monthly Retirement</span><span>{cur} {fmt(result.savings.monthly_retirement)}</span></div>
            <div className={cn(cs.calcRow, ts.calcRow)}><span>Emergency Fund Target</span><span>{cur} {fmt(result.savings.emergency_fund_target)}</span></div>
            <div className={cn(cs.calcRow, ts.calcRow, cs.calcRowTotal)}><span>Disposable/Month</span><span>{cur} {fmt(result.savings.disposable_monthly)}</span></div>
          </div>
        </div>

        {/* Financial Health */}
        <div className={cn(cs.resultCard, ts.resultCard)}>
          <div className={cs.resultCardHeader}>
            <div className={cn(cs.resultCardIcon, ts.resultCardIcon)}><Heart size={18} /></div>
            <h4 className={cn(cs.resultCardTitle, ts.resultCardTitle)}>Financial Health</h4>
          </div>
          <div className={cs.scoreBar}>
            <div className={cs.scoreBarTrack}>
              <div className={cs.scoreBarFill} style={{ width: `${result.health.score}%`, background: healthColor }} />
            </div>
            <span className={cn(cs.scoreValue, ts.scoreValue)}>{result.health.score}/100</span>
          </div>
          {result.health.insights.map((ins, i) => (
            <div key={i} className={cn(cs.insightItem, ts.insightItem, ts[`insight_${ins.type}`])}>
              <div className={cn(cs.insightTitle, ts.insightTitle)}>{ins.title}</div>
              <div className={cn(cs.insightMsg, ts.insightMsg)}>{ins.message}</div>
            </div>
          ))}
        </div>

        {/* Rate Recommendations */}
        <div className={cn(cs.resultCard, ts.resultCard, cs.resultCardFullWidth)}>
          <div className={cs.resultCardHeader}>
            <div className={cn(cs.resultCardIcon, ts.resultCardIcon)}><Target size={18} /></div>
            <h4 className={cn(cs.resultCardTitle, ts.resultCardTitle)}>Rate Recommendations</h4>
          </div>
          <div className={cs.rateCards}>
            {[
              { label: 'Break-Even', value: result.rate_recommendations.break_even_hourly, color: '#e81123' },
              { label: 'Comfortable', value: result.rate_recommendations.comfortable_hourly, color: '#f39c12' },
              { label: 'Premium', value: result.rate_recommendations.premium_hourly, color: '#27ae60' },
            ].map((r, i) => (
              <div key={i} className={cn(cs.rateCard, ts.rateCard)}>
                <div className={cs.rateCardDot} style={{ background: r.color }} />
                <div className={cn(cs.rateCardLabel, ts.rateCardLabel)}>{r.label}</div>
                <div className={cn(cs.rateCardValue, ts.rateCardValue)}>{cur} {fmt(r.value)}/hr</div>
              </div>
            ))}
          </div>
        </div>

        {/* 1-Click Hiring Bridge & Instant Matching Lead Magnet */}
        <LeadMagnetHireBridge
          toolName="income-calculator"
          result={result}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

function buildIncomeReport(r: IncomeResult): AIReport {
  const cur = r.meta.currency;
  const cap = (s: string) => (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    toolName: 'AI Income Calculator',
    title: 'Freelance Income Projection Report',
    subtitle: `Projected Net Income for Freelancing in ${r.meta.country}`,
    fileBaseName: 'megilance-income-report',
    kpis: [
      { label: 'Annual Net Income', value: `${cur} ${r.net_income.annual.toLocaleString()}`, hint: `${cur} ${r.net_income.monthly.toLocaleString()}/mo` },
      { label: 'Gross Annual Income', value: `${cur} ${r.income.gross_annual.toLocaleString()}` },
      { label: 'Effective Rate', value: `${cur} ${r.effective_rates.hourly.toLocaleString()}/hr` },
      { label: 'Financial Health', value: `${r.health.score}/100`, hint: r.health.level },
    ],
    meta: [
      { label: 'Country', value: r.meta.country },
      { label: 'Income Type', value: cap(r.income.breakdown[0]?.source || 'freelance') },
    ],
    sections: [
      {
        heading: 'Income Breakdown',
        blocks: [
          {
            kind: 'keyValue',
            rows: r.income.breakdown.map(b => ({ label: b.source, value: `${cur} ${b.annual.toLocaleString()}` })),
          }
        ]
      },
      {
        heading: 'Expenses & Deductions',
        blocks: [
          {
            kind: 'keyValue',
            rows: [
              { label: 'Annual Expenses', value: `${cur} ${r.expenses.annual.toLocaleString()}` },
              { label: 'Expense Ratio', value: `${r.expenses.expense_ratio}%` },
              ...r.expenses.breakdown.map(b => ({ label: b.label, value: `${cur} ${b.annual.toLocaleString()}/yr` }))
            ]
          }
        ]
      },
      {
        heading: 'Taxes Obligations',
        blocks: [
          {
            kind: 'keyValue',
            rows: [
              { label: 'Income Tax', value: `${cur} ${r.taxes.income_tax.toLocaleString()}` },
              { label: 'Self-Employment Tax', value: `${cur} ${r.taxes.self_employment_tax.toLocaleString()}` },
              { label: 'State Tax', value: `${cur} ${r.taxes.state_tax.toLocaleString()}` },
              { label: 'Total Tax', value: `${cur} ${r.taxes.total_tax.toLocaleString()}` },
              { label: 'Effective Tax Rate', value: `${r.taxes.effective_rate}%` },
              { label: 'Quarterly Estimated Payment', value: `${cur} ${r.taxes.quarterly_estimate.toLocaleString()}` },
            ]
          }
        ]
      },
      {
        heading: 'Financial Recommendations',
        blocks: [
          {
            kind: 'bullets',
            items: r.health.insights.map(i => `${i.title}: ${i.message}`)
          }
        ]
      }
    ]
  };
}

const getSummaryText = (result: IncomeResult) => {
  const cur = result.meta.currency;
  return `MEGILANCE INCOME PROJECTION REPORT
--------------------------------------
Country: ${result.meta.country}
Currency: ${cur}

Gross Annual Income: ${cur} ${result.income.gross_annual.toLocaleString()}
Gross Monthly Income: ${cur} ${result.income.gross_monthly.toLocaleString()}

Total Annual Expenses: ${cur} ${result.expenses.annual.toLocaleString()}
Expense Ratio: ${result.expenses.expense_ratio}%

Tax Breakdown:
- Income Tax: ${cur} ${result.taxes.income_tax.toLocaleString()}
- Self-Employment Tax: ${cur} ${result.taxes.self_employment_tax.toLocaleString()}
- State Tax: ${cur} ${result.taxes.state_tax.toLocaleString()}
- Total Tax: ${cur} ${result.taxes.total_tax.toLocaleString()}
- Effective Tax Rate: ${result.taxes.effective_rate}%
- Quarterly Estimate: ${cur} ${result.taxes.quarterly_estimate.toLocaleString()}

Net Income:
- Annual Net: ${cur} ${result.net_income.annual.toLocaleString()}
- Monthly Net: ${cur} ${result.net_income.monthly.toLocaleString()}
- Weekly Net: ${cur} ${result.net_income.weekly.toLocaleString()}
- Daily Net: ${cur} ${result.net_income.daily.toLocaleString()}

Rate Recommendations:
- Break-Even: ${cur} ${result.rate_recommendations.break_even_hourly.toLocaleString()}/hr
- Comfortable: ${cur} ${result.rate_recommendations.comfortable_hourly.toLocaleString()}/hr
- Premium: ${cur} ${result.rate_recommendations.premium_hourly.toLocaleString()}/hr

Financial Health Score: ${result.health.score}/100 (${result.health.level})
Generated by MegiLance AI Tools (megilance.com)
`;
};

export default function IncomeCalculator() {
  const toaster = useToaster();
  const { resolvedTheme } = useTheme();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<OptionsData | null>(null);
  const [result, setResult] = useState<IncomeResult | null>(null);

  const [form, setForm] = useState<Record<string, any>>({
    income_type: 'hourly', rate: '', hours_per_week: 40, weeks_per_year: 48,
    days_per_week: 5, projects_per_year: 6, avg_project_value: 5000,
    monthly_retainer: '', retainer_clients: '', vacation_weeks: 4,
    country: 'us', state_tax_rate: 0, savings_goal_percent: 20,
    retirement_contribution_percent: 10, emergency_fund_months: 6, sick_days: 5,
  });
  const [expenses, setExpenses] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/income-calculator/options').then(r => r.json()).then(setOptions).catch(() => {});
  }, []);

  const handleChange = useCallback((f: string, v: any) => setForm(p => ({ ...p, [f]: v })), []);
  const handleExpense = useCallback((k: string, v: string) => setExpenses(p => ({ ...p, [k]: v })), []);

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSubmit = async () => {
    setStep(3);
    setLoading(true);
    setError(null);
    try {
      const monthlyExp: Record<string, number> = {};
      for (const [k, v] of Object.entries(expenses)) {
        const n = parseFloat(v);
        if (n > 0) monthlyExp[k] = n;
      }
      const body = {
        income_type: form.income_type,
        rate: parseFloat(form.rate) || 0,
        hours_per_week: parseFloat(form.hours_per_week) || 40,
        weeks_per_year: parseFloat(form.weeks_per_year) || 48,
        days_per_week: parseFloat(form.days_per_week) || 5,
        projects_per_year: parseInt(form.projects_per_year) || 6,
        avg_project_value: parseFloat(form.avg_project_value) || 5000,
        monthly_retainer: parseFloat(form.monthly_retainer) || 0,
        retainer_clients: parseInt(form.retainer_clients) || 0,
        country: form.country,
        state_tax_rate: parseFloat(form.state_tax_rate) || 0,
        monthly_expenses: monthlyExp,
        savings_goal_percent: parseFloat(form.savings_goal_percent) || 20,
        emergency_fund_months: parseInt(form.emergency_fund_months) || 6,
        retirement_contribution_percent: parseFloat(form.retirement_contribution_percent) || 10,
        vacation_weeks: parseInt(form.vacation_weeks) || 4,
        sick_days: parseInt(form.sick_days) || 5,
      };
      const res = await fetch('/api/v1/income-calculator/calculate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || errData?.message || `Server error (${res.status}). Please try again.`);
      }
      const data = await res.json();
      setResult(data);
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const reset = () => { setStep(0); setResult(null); setLoading(false); setError(null); };

  const cs = commonStyles;
  const ts = resolvedTheme === 'light' ? lightStyles : darkStyles;
  const isDark = resolvedTheme !== 'light';

  return (
    <div className={cn(cs.container, ts.container, 'relative overflow-hidden')}>
      <AuroraBackground isDark={isDark} particleCount={45} />
      <header className={cn(cs.header, 'relative z-10')}>
        <span className="mb-3 inline-flex justify-center">
          <ShineBadge className={cn(isDark ? 'text-blue-100' : 'text-blue-700')}><TrendingUp size={14} /> AI-Powered</ShineBadge>
        </span>
        <h1 className={cn(cs.title, ts.title)}><AnimatedGradientText>Income Calculator</AnimatedGradientText></h1>
        <p className={cn(cs.subtitle, ts.subtitle)}>Project your freelance income, taxes, and financial health</p>
      </header>

      <GuestBanner toolName="Income Calculator" variant="inline" />

      <div className={cs.stepper}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={cs.stepItem}>
              <div className={cn(cs.stepDot, ts.stepDot, i === step && cs.stepDotActive, i === step && ts.stepDotActive, i < step && cs.stepDotCompleted, i < step && ts.stepDotCompleted)}>
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className={cn(cs.stepLabel, ts.stepLabel, i === step && cs.stepLabelActive, i === step && ts.stepLabelActive)}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={cn(cs.stepLine, ts.stepLine, i < step && cs.stepLineActive, i < step && ts.stepLineActive)} />}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
          {step === 0 && options && <StepIncome cs={cs} ts={ts} form={form} incomeTypes={options.income_types} onChange={handleChange} />}
          {step === 1 && options && <StepExpenses cs={cs} ts={ts} categories={options.expense_categories} expenses={expenses} onChange={handleExpense} />}
          {step === 2 && options && <StepTaxGoals cs={cs} ts={ts} form={form} countries={options.countries} onChange={handleChange} />}
          {step === 3 && loading && <ProcessingView cs={cs} ts={ts} />}
          {step === 3 && !loading && error && (
            <div className={cn(cs.processingContainer, ts.processingContainer)}>
              <AlertTriangle size={48} />
              <h3 className={cn(cs.formTitle, ts.formTitle)}>Something Went Wrong</h3>
              <p className={cn(cs.processingSubtitle, ts.processingSubtitle)}>{error}</p>
              <button className={cn(cs.navButtonNext, ts.navButtonNext)} onClick={() => { setStep(2); setError(null); }} style={{ marginTop: '1rem' }}>
                <ArrowLeft size={16} /> Go Back &amp; Try Again
              </button>
            </div>
          )}
          {step === 3 && !loading && !error && result && <ResultsDashboard cs={cs} ts={ts} result={result} fmt={fmt} />}
        </motion.div>
      </AnimatePresence>

      {!(step === 3 && loading) && !(step === 3 && error) && (
        <div className={cs.navBar}>
          {step > 0 && step < 3 && <button className={cn(cs.navButtonBack, ts.navButtonBack)} onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Back</button>}
          <div className={cs.navSpacer} />
          {step < 2 && <button className={cn(cs.navButtonNext, ts.navButtonNext)} onClick={() => setStep(step + 1)}>Next <ArrowRight size={16} /></button>}
          {step === 2 && <button className={cn(cs.navButtonNext, ts.navButtonNext)} onClick={handleSubmit}>Calculate <ArrowRight size={16} /></button>}
          {step === 3 && result && (
            <div className={cn(cs.actionsBar, "flex flex-wrap gap-2 items-center")}>
              <button className={cn(cs.actionBtnSecondary, ts.actionBtnSecondary)} onClick={reset}><RotateCcw size={16} /> Recalculate</button>
              <button 
                className={cn(cs.actionBtnSecondary, ts.actionBtnSecondary, "flex items-center gap-1.5")} 
                onClick={() => {
                  navigator.clipboard.writeText(getSummaryText(result));
                  toaster.notify({
                    title: "Copied",
                    description: "Summary copied to clipboard!",
                    variant: "success",
                  });
                }}
              >
                Copy Summary
              </button>
              <ExportMenu report={() => buildIncomeReport(result)} />
            </div>
          )}
        </div>
      )}

      <div className={cn(cs.disclaimer, ts.disclaimer)}>
        Estimates for planning purposes only. Consult a qualified accountant for tax advice.
      </div>
    </div>
  );
}
