// @AI-HINT: AI Skill Analyzer – multi-step wizard for freelancer skill analysis
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, ArrowRight, ArrowLeft, RotateCcw, CheckCircle,
  Target, TrendingUp, Zap, BookOpen, Star, BarChart2,
  Search, AlertTriangle, Award, Clock, X, Plus, Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import commonStyles from './SkillAnalyzer.common.module.css';
import lightStyles from './SkillAnalyzer.light.module.css';
import darkStyles from './SkillAnalyzer.dark.module.css';
import { AuroraBackground, ShineBadge, AnimatedGradientText, NumberTicker, Meteors, BorderBeam, celebrate, sideCannons } from '@/app/components/AI/kit';
import GuestBanner from '@/app/components/AI/GuestBanner/GuestBanner';
import { ExportMenu, type AIReport } from '@/app/components/AI/report';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SkillOption { key: string; label: string; category: string }
interface GroupedSkills { [category: string]: SkillOption[] }

interface SkillDetail {
  skill: string;
  label: string;
  category: string;
  demand_score: number;
  demand_trend: string;
  market_value_score: number;
  global_avg_rate: number;
  your_estimated_rate: number;
  max_rate_potential: number;
  service_types: string[];
}

interface Synergy { label: string; skills_present: string[]; skills_needed: string[]; current_match: number; total: number; rate_premium: number }
interface SkillGap {
  skill: string;
  label: string;
  category: string;
  demand_score: number;
  demand_trend: string;
  learn_time_months: number;
  potential_rate_increase: number;
  roi_per_month: number;
  priority: string;
  completes_synergy?: { label: string; current_match: number; total: number; rate_premium: number };
}

interface Recommendation {
  type: string;
  priority: string;
  title: string;
  description: string;
  skills_to_learn?: string[];
  rate_impact?: string;
}

interface AnalysisResult {
  profile_score: { score: number; level: string; label: string };
  skill_count: number;
  skills_analyzed: SkillDetail[];
  synergies: Synergy[];
  skill_gaps: SkillGap[];
  recommendations: Recommendation[];
  estimated_rate: { hourly_rate: number; range_low: number; range_high: number; currency: string };
  regional_context: Record<string, any>;
  unknown_skills: string[];
  meta: { experience_level: string; target_role: string | null; data_version: string };
}

const STEPS = ['Select Skills', 'Your Profile', 'Results'];

const EXPERIENCE_LEVELS = [
  { key: 'junior', label: 'Junior', desc: '0-2 years' },
  { key: 'mid', label: 'Mid-Level', desc: '2-5 years' },
  { key: 'senior', label: 'Senior', desc: '5-10 years' },
  { key: 'expert', label: 'Expert', desc: '10+ years' },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StepSkills({
  cs, ts, grouped, selected, onToggle, searchTerm, onSearch,
}: {
  cs: typeof commonStyles; ts: typeof lightStyles;
  grouped: GroupedSkills; selected: string[];
  onToggle: (s: string) => void; searchTerm: string; onSearch: (v: string) => void;
}) {
  const categories = Object.keys(grouped);

  return (
    <div className={cn(cs.formCard, ts.formCard)}>
      <h3 className={cn(cs.formTitle, ts.formTitle)}>
        <Brain size={18} /> Select Your Skills
      </h3>
      <p className={cn(cs.formHint, ts.formHint)}>Choose skills you&apos;re proficient in ({selected.length} selected)</p>

      <div className={cs.searchRow}>
        <Search size={16} className={cn(cs.searchIcon, ts.searchIcon)} />
        <input
          type="text" className={cn(cs.searchInput, ts.searchInput)}
          placeholder="Search skills..." value={searchTerm}
          onChange={e => onSearch(e.target.value)}
        />
      </div>

      {selected.length > 0 && (
        <div className={cs.tagList}>
          {selected.map(s => (
            <span key={s} className={cn(cs.tag, ts.tag)}>
              {s.replace(/_/g, ' ')}
              <button type="button" onClick={() => onToggle(s)}><X size={12} /></button>
            </span>
          ))}
        </div>
      )}

      <div className={cs.categoryList}>
        {categories.map(cat => {
          const skills = grouped[cat].filter(
            sk => !searchTerm || sk.label.toLowerCase().includes(searchTerm.toLowerCase())
          );
          if (skills.length === 0) return null;
          return (
            <div key={cat} className={cs.categoryGroup}>
              <div className={cn(cs.categoryLabel, ts.categoryLabel)}>{cat}</div>
              <div className={cs.skillGrid}>
                {skills.map(sk => (
                  <button
                    key={sk.key} type="button"
                    onClick={() => onToggle(sk.key)}
                    className={cn(
                      cs.skillChip, ts.skillChip,
                      selected.includes(sk.key) && cs.skillChipSelected,
                      selected.includes(sk.key) && ts.skillChipSelected,
                    )}
                  >
                    {selected.includes(sk.key) && <CheckCircle size={12} />}
                    {sk.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepProfile({
  cs, ts, experience, country, targetRole, onChange,
}: {
  cs: typeof commonStyles; ts: typeof lightStyles;
  experience: string; country: string; targetRole: string;
  onChange: (f: string, v: string) => void;
}) {
  return (
    <div className={cn(cs.formCard, ts.formCard)}>
      <h3 className={cn(cs.formTitle, ts.formTitle)}>
        <Target size={18} /> Your Profile
      </h3>

      <div className={cs.formGroup}>
        <label className={cn(cs.label, ts.label)}>Experience Level</label>
        <div className={cs.expGrid}>
          {EXPERIENCE_LEVELS.map(e => (
            <button
              key={e.key} type="button"
              onClick={() => onChange('experience', e.key)}
              className={cn(
                cs.expCard, ts.expCard,
                experience === e.key && cs.expCardSelected,
                experience === e.key && ts.expCardSelected,
              )}
            >
              <span className={cs.expLabel}>{e.label}</span>
              <span className={cn(cs.expDesc, ts.expDesc)}>{e.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={cs.formRow}>
        <div className={cs.formGroup}>
          <label className={cn(cs.label, ts.label)}>Country Code</label>
          <input
            type="text" className={cn(cs.textInput, ts.textInput)}
            value={country} onChange={e => onChange('country', e.target.value.toUpperCase())}
            placeholder="PK" maxLength={2}
          />
          <span className={cn(cs.labelHint, ts.labelHint)}>ISO 2-letter code (US, PK, IN, GB...)</span>
        </div>
        <div className={cs.formGroup}>
          <label className={cn(cs.label, ts.label)}>Target Role <span className={cn(cs.labelHint, ts.labelHint)}>(optional)</span></label>
          <input
            type="text" className={cn(cs.textInput, ts.textInput)}
            value={targetRole} onChange={e => onChange('targetRole', e.target.value)}
            placeholder="e.g. Full-Stack Developer"
          />
        </div>
      </div>
    </div>
  );
}

function ProcessingView({ cs, ts }: { cs: typeof commonStyles; ts: typeof lightStyles }) {
  const steps = ['Mapping skill demand...', 'Finding synergies...', 'Identifying gaps...', 'Building recommendations...'];
  return (
    <div className={cn(cs.processingContainer, ts.processingContainer)}>
      <div className={cs.processingOrb}>
        <div className={cn(cs.processingOrbInner, ts.processingOrbInner)}><Brain size={32} /></div>
      </div>
      <h3 className={cn(cs.formTitle, ts.formTitle)}>Analyzing Your Skills</h3>
      <p className={cn(cs.processingSubtitle, ts.processingSubtitle)}>AI is mapping your skill profile against 2025 market data</p>
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
  cs, ts, result,
}: { cs: typeof commonStyles; ts: typeof lightStyles; result: AnalysisResult }) {
  useEffect(() => {
    if (result.profile_score.score >= 80) sideCannons(); else celebrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cs.resultsContainer}>
      {/* Hero - Profile Score */}
      <div className={cn(cs.priceHero, ts.priceHero, 'relative overflow-hidden')}>
        <div className={cs.priceHeroGlow} />
        <Meteors number={10} />
        <BorderBeam size={220} duration={9} />
        <div className={cn(cs.priceHeroLabel, ts.priceHeroLabel)}>Profile Score</div>
        <div className={cn(cs.priceHeroValue, ts.priceHeroValue)}><NumberTicker value={result.profile_score.score} />/100</div>
        <div className={cs.priceHeroMeta}>
          <span className={cn(cs.priceHeroMetaItem, ts.priceHeroMetaItem)}>
            <Award size={14} /> {result.profile_score.label}
          </span>
          <span className={cn(cs.priceHeroMetaItem, ts.priceHeroMetaItem)}>
            {result.skill_count} skills analyzed
          </span>
          <span className={cn(cs.priceHeroMetaItem, ts.priceHeroMetaItem)}>
            ${result.estimated_rate.range_low.toFixed(0)}-${result.estimated_rate.range_high.toFixed(0)}/hr
          </span>
        </div>
      </div>

      <div className={cs.resultsGrid}>
        {/* Skills Analyzed */}
        <div className={cn(cs.resultCard, ts.resultCard)}>
          <div className={cs.resultCardHeader}>
            <div className={cn(cs.resultCardIcon, ts.resultCardIcon)}><BarChart2 size={18} /></div>
            <h4 className={cn(cs.resultCardTitle, ts.resultCardTitle)}>Skill Demand</h4>
          </div>
          {result.skills_analyzed.map((sk, i) => (
            <div key={i} className={cs.skillRow}>
              <div className={cs.skillRowHeader}>
                <span className={cn(cs.skillName, ts.skillName)}>{sk.skill.replace(/_/g, ' ')}</span>
                <span className={cn(cs.demandBadge, ts.demandBadge)}>
                  {sk.demand_trend}
                </span>
              </div>
              <div className={cs.skillBarTrack}>
                <div
                  className={cn(cs.skillBarFill, ts.skillBarFill)}
                  style={{ width: `${Math.min(sk.demand_score, 100)}%` }}
                />
              </div>
              <div className={cs.skillRowMeta}>
                <span className={cn(cs.skillMetaItem, ts.skillMetaItem)}>
                  {sk.demand_trend === 'surging' ? '🚀' : sk.demand_trend === 'growing' ? '📈' : sk.demand_trend === 'stable' ? '➡️' : '📉'} {sk.demand_trend}
                </span>
                <span className={cn(cs.skillMetaItem, ts.skillMetaItem)}>${sk.your_estimated_rate.toFixed(2)}/hr</span>
              </div>
            </div>
          ))}
        </div>

        {/* Synergies */}
        <div className={cn(cs.resultCard, ts.resultCard)}>
          <div className={cs.resultCardHeader}>
            <div className={cn(cs.resultCardIcon, ts.resultCardIcon)}><Zap size={18} /></div>
            <h4 className={cn(cs.resultCardTitle, ts.resultCardTitle)}>Skill Synergies ({result.synergies.length})</h4>
          </div>
          {result.synergies.length === 0 ? (
            <p className={cn(cs.emptyMsg, ts.emptyMsg)}>No synergies detected. Add complementary skills to unlock combinations.</p>
          ) : (
            result.synergies.map((syn, i) => (
              <div key={i} className={cn(cs.synergyItem, ts.synergyItem)}>
                <div className={cn(cs.synergyName, ts.synergyName)}>{syn.label}</div>
                <div className={cs.synergyCombo}>
                  {syn.skills_present.map((s, j) => (
                    <React.Fragment key={j}>
                      {j > 0 && <span className={cn(cs.synergyPlus, ts.synergyPlus)}>+</span>}
                      <span className={cn(cs.synergySkill, ts.synergySkill)}>{s.replace(/_/g, ' ')}</span>
                    </React.Fragment>
                  ))}
                </div>
                <div className={cn(cs.synergyBonus, ts.synergyBonus)}>{syn.current_match}/{syn.total} skills · {((syn.rate_premium - 1) * 100).toFixed(0)}% premium</div>
              </div>
            ))
          )}
        </div>

        {/* Skill Gaps */}
        <div className={cn(cs.resultCard, ts.resultCard)}>
          <div className={cs.resultCardHeader}>
            <div className={cn(cs.resultCardIcon, ts.resultCardIcon)}><Target size={18} /></div>
            <h4 className={cn(cs.resultCardTitle, ts.resultCardTitle)}>Top Skill Gaps</h4>
          </div>
          {result.skill_gaps.slice(0, 6).map((gap, i) => (
            <div key={i} className={cn(cs.gapItem, ts.gapItem)}>
              <div className={cs.gapHeader}>
                <span className={cn(cs.gapName, ts.gapName)}>{gap.label || gap.skill.replace(/_/g, ' ')}</span>
                <span className={cn(cs.gapRoi, ts.gapRoi)}>{gap.priority}</span>
              </div>
              <div className={cn(cs.gapReason, ts.gapReason)}>+${gap.potential_rate_increase.toFixed(2)}/hr potential</div>
              <div className={cs.gapMeta}>
                <span className={cn(cs.gapMetaItem, ts.gapMetaItem)}>
                  <Clock size={12} /> ~{gap.learn_time_months.toFixed(0)}mo to learn
                </span>
                <span className={cn(cs.gapMetaItem, ts.gapMetaItem)}>
                  Demand: {gap.demand_score}/100
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Regional Context */}
        <div className={cn(cs.resultCard, ts.resultCard)}>
          <div className={cs.resultCardHeader}>
            <div className={cn(cs.resultCardIcon, ts.resultCardIcon)}><Globe size={18} /></div>
            <h4 className={cn(cs.resultCardTitle, ts.resultCardTitle)}>Regional Context</h4>
          </div>
          <div className={cs.calcList}>
            {Object.entries(result.regional_context).slice(0, 6).map(([key, val], i) => (
              <div key={i} className={cn(cs.calcRow, ts.calcRow)}>
                <span>{key.replace(/_/g, ' ')}</span>
                <span>{typeof val === 'number' ? `$${val.toFixed(2)}/hr` : String(val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className={cn(cs.resultCard, ts.resultCard, cs.resultCardFullWidth)}>
          <div className={cs.resultCardHeader}>
            <div className={cn(cs.resultCardIcon, ts.resultCardIcon)}><Star size={18} /></div>
            <h4 className={cn(cs.resultCardTitle, ts.resultCardTitle)}>Recommendations</h4>
          </div>
          <div className={cs.recsGrid}>
            {result.recommendations.map((rec, i) => (
              <div key={i} className={cn(cs.recItem, ts.recItem)}>
                <div className={cs.recHeader}>
                  <span className={cn(cs.recTitle, ts.recTitle)}>{rec.title}</span>
                  <span className={cn(cs.recPriority, ts.recPriority)}>{rec.priority}</span>
                </div>
                <div className={cn(cs.recMsg, ts.recMsg)}>{rec.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

function buildSkillReport(r: AnalysisResult): AIReport {
  const cur = r.estimated_rate.currency || 'USD';
  return {
    toolName: 'AI Skill Analyzer',
    title: 'Freelance Skill Analysis Report',
    subtitle: `Target Role: ${r.meta.target_role || 'Freelancer'} · Experience: ${r.meta.experience_level}`,
    fileBaseName: 'megilance-skills-report',
    kpis: [
      { label: 'Profile Score', value: `${r.profile_score.score}/100`, hint: r.profile_score.level },
      { label: 'Estimated Rate', value: `${cur} ${r.estimated_rate.hourly_rate.toFixed(0)}/hr`, hint: `Range: ${cur}${r.estimated_rate.range_low}-${cur}${r.estimated_rate.range_high}` },
      { label: 'Skills Analyzed', value: `${r.skill_count} skills` },
      { label: 'Synergies Active', value: `${r.synergies.length} combos` },
    ],
    sections: [
      {
        heading: 'Skills Assessment',
        blocks: [
          {
            kind: 'table',
            columns: ['Skill', 'Demand Score', 'Global Avg Rate', 'Max Rate Potential'],
            rows: r.skills_analyzed.map(s => [
              s.label,
              s.demand_score,
              `$${s.global_avg_rate.toFixed(2)}/hr`,
              `$${s.max_rate_potential.toFixed(2)}/hr`,
            ]),
          }
        ]
      },
      {
        heading: 'Skill Gaps & Opportunities',
        blocks: [
          {
            kind: 'table',
            columns: ['Gap Skill', 'Priority', 'Potential Rate Increase', 'Learn Time'],
            rows: r.skill_gaps.map(g => [
              g.label || g.skill,
              g.priority,
              `+$${g.potential_rate_increase.toFixed(2)}/hr`,
              `${g.learn_time_months.toFixed(1)} months`,
            ]),
          }
        ]
      },
      {
        heading: 'Actionable Career Recommendations',
        blocks: [
          {
            kind: 'bullets',
            items: r.recommendations.map(rec => `${rec.title}: ${rec.description} (Priority: ${rec.priority})`)
          }
        ]
      }
    ]
  };
}

const getSkillSummaryText = (result: AnalysisResult) => {
  const cur = result.estimated_rate.currency || 'USD';
  return `MEGILANCE AI SKILL ANALYSIS REPORT
------------------------------------
Target Role: ${result.meta.target_role || 'Freelancer'}
Experience: ${result.meta.experience_level}

MARKET STATS SUMMARY:
- Profile Score: ${result.profile_score.score}/100 (${result.profile_score.level})
- Estimated Rate: ${cur} ${result.estimated_rate.hourly_rate.toFixed(2)}/hr
- Skill Count: ${result.skill_count}

SKILL SET METRICS:
${result.skills_analyzed.map(s => `- ${s.label} (${s.category}): Demand: ${s.demand_score}/100, Global Avg: $${s.global_avg_rate.toFixed(2)}/hr`).join('\n')}

TOP SKILL GAPS:
${result.skill_gaps.map(g => `- ${g.label || g.skill} (${g.priority}): potential +$${g.potential_rate_increase.toFixed(2)}/hr, learn time ~${g.learn_time_months.toFixed(1)}mo`).join('\n')}

RECOMMENDATIONS:
${result.recommendations.map(rec => `- [${rec.priority}] ${rec.title}: ${rec.description}`).join('\n')}

Generated by MegiLance AI Tools (megilance.com)
`;
};

export default function SkillAnalyzer() {
  const { resolvedTheme } = useTheme();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [grouped, setGrouped] = useState<GroupedSkills>({});
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [experience, setExperience] = useState('mid');
  const [country, setCountry] = useState('US');
  const [targetRole, setTargetRole] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/skill-analyzer/skills').then(r => r.json()).then((data: any[]) => {
      const groups: GroupedSkills = {};
      for (const cat of data) {
        groups[cat.label] = (cat.skills || []).map((sk: any) => ({
          key: sk.key, label: sk.label, category: cat.key,
        }));
      }
      setGrouped(groups);
    }).catch(() => {});
  }, []);

  const toggleSkill = useCallback((key: string) => {
    setSelected(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]);
  }, []);

  const handleProfileChange = useCallback((f: string, v: string) => {
    if (f === 'experience') setExperience(v);
    else if (f === 'country') setCountry(v);
    else if (f === 'targetRole') setTargetRole(v);
  }, []);

  const handleSubmit = async () => {
    setStep(2);
    setLoading(true);
    setError(null);
    try {
      const body = {
        skills: selected,
        experience_level: experience,
        country_code: country || 'US',
        target_role: targetRole || undefined,
      };
      const res = await fetch('/api/v1/skill-analyzer/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
          <ShineBadge className={cn(isDark ? 'text-blue-100' : 'text-blue-700')}><Brain size={14} /> AI-Powered</ShineBadge>
        </span>
        <h1 className={cn(cs.title, ts.title)}><AnimatedGradientText>Skill Analyzer</AnimatedGradientText></h1>
        <p className={cn(cs.subtitle, ts.subtitle)}>Analyze your skills against 2025 market demand and find high-ROI gaps</p>
      </header>

      <GuestBanner toolName="Skill Analyzer" variant="inline" />

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
          {step === 0 && <StepSkills cs={cs} ts={ts} grouped={grouped} selected={selected} onToggle={toggleSkill} searchTerm={searchTerm} onSearch={setSearchTerm} />}
          {step === 1 && <StepProfile cs={cs} ts={ts} experience={experience} country={country} targetRole={targetRole} onChange={handleProfileChange} />}
          {step === 2 && loading && <ProcessingView cs={cs} ts={ts} />}
          {step === 2 && !loading && error && (
            <div className={cn(cs.processingContainer, ts.processingContainer)}>
              <AlertTriangle size={48} />
              <h3 className={cn(cs.formTitle, ts.formTitle)}>Something Went Wrong</h3>
              <p className={cn(cs.processingSubtitle, ts.processingSubtitle)}>{error}</p>
              <button className={cn(cs.navButtonNext, ts.navButtonNext)} onClick={() => { setStep(1); setError(null); }} style={{ marginTop: '1rem' }}>
                <ArrowLeft size={16} /> Go Back &amp; Try Again
              </button>
            </div>
          )}
          {step === 2 && !loading && !error && result && <ResultsDashboard cs={cs} ts={ts} result={result} />}
        </motion.div>
      </AnimatePresence>

      {!(step === 2 && loading) && !(step === 2 && error) && (
        <div className={cs.navBar}>
          {step > 0 && step < 2 && <button className={cn(cs.navButtonBack, ts.navButtonBack)} onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Back</button>}
          <div className={cs.navSpacer} />
          {step === 0 && <button className={cn(cs.navButtonNext, ts.navButtonNext)} disabled={selected.length === 0} onClick={() => setStep(1)}>Next <ArrowRight size={16} /></button>}
          {step === 1 && <button className={cn(cs.navButtonNext, ts.navButtonNext)} onClick={handleSubmit}>Analyze Skills <ArrowRight size={16} /></button>}
          {step === 2 && result && (
            <div className={cn(cs.actionsBar, "flex flex-wrap gap-2 items-center")}>
              <button className={cn(cs.actionBtnSecondary, ts.actionBtnSecondary)} onClick={reset}><RotateCcw size={16} /> New Analysis</button>
              <button 
                className={cn(cs.actionBtnSecondary, ts.actionBtnSecondary, "flex items-center gap-1.5")} 
                onClick={() => {
                  navigator.clipboard.writeText(getSkillSummaryText(result));
                  alert("Summary copied to clipboard!");
                }}
              >
                Copy Summary
              </button>
              <ExportMenu report={() => buildSkillReport(result)} />
            </div>
          )}
        </div>
      )}

      <div className={cn(cs.disclaimer, ts.disclaimer)}>
        Analysis based on 2025 market data from Upwork, Arc.dev, and industry surveys.
      </div>
    </div>
  );
}
