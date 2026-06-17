'use client';

import React, { useState, useCallback } from 'react';

interface WizardStep {
  id: string;
  title: string;
  description: string;
}

const STEPS: WizardStep[] = [
  { id: 'category', title: 'Project Category', description: 'What type of project do you need?' },
  { id: 'description', title: 'Project Details', description: 'Describe your project' },
  { id: 'skills', title: 'Required Skills', description: 'What skills are needed?' },
  { id: 'budget', title: 'Budget & Timeline', description: 'Set your budget and timeline' },
  { id: 'review', title: 'Review & AI Brief', description: 'Review AI-enhanced project brief' },
  { id: 'match', title: 'AI Matching', description: 'Finding your perfect freelancer' },
];

const CATEGORIES = [
  'Web Development', 'Mobile Development', 'UI/UX Design', 'Data Science',
  'Content Writing', 'Digital Marketing', 'Video & Animation', 'DevOps',
  'Blockchain', 'AI & Machine Learning', 'Other',
];

const TIMELINE_OPTIONS = [
  'Less than 1 week', '1-2 weeks', '2-4 weeks', '1-2 months', '3+ months',
];

const COMPLEXITY_OPTIONS = [
  { value: 'simple', label: 'Simple', desc: 'Basic task, clear requirements' },
  { value: 'moderate', label: 'Moderate', desc: 'Standard project with some complexity' },
  { value: 'complex', label: 'Complex', desc: 'Advanced project, multiple components' },
];

export default function FindTalentPage() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [timeline, setTimeline] = useState('');
  const [complexity, setComplexity] = useState('moderate');
  const [aiBrief, setAiBrief] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null);
  const [hireSuccess, setHireSuccess] = useState(false);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const getAiBrief = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/ai/project-brief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          category, description, skills, budget_min: Number(budgetMin) || null,
          budget_max: Number(budgetMax) || null, timeline, complexity, industry: null,
          deliverables: null, additional_notes: null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiBrief(data);
      }
    } catch (e) {
      console.error('AI brief failed:', e);
    } finally {
      setLoading(false);
    }
  }, [category, description, skills, budgetMin, budgetMax, timeline, complexity]);

  const getMatches = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/ai/smart-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          category, skills, budget_min: Number(budgetMin) || 500,
          budget_max: Number(budgetMax) || 2000, timeline, complexity, industry: null,
          deliverables: null, preferences: null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
      }
    } catch (e) {
      console.error('Smart match failed:', e);
    } finally {
      setLoading(false);
    }
  }, [category, skills, budgetMin, budgetMax, timeline, complexity]);

  const handleHire = async (freelancerId: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/ai/hire/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          freelancer_id: freelancerId,
          project_brief: { title: `${category} Project`, description, category, skills, experience_level: complexity, timeline },
          agreed_amount: Number(budgetMax) || 1000,
          milestone_plan: [],
          message_to_freelancer: null,
        }),
      });
      if (res.ok) {
        setHireSuccess(true);
        setSelectedFreelancer(matches.find(m => m.freelancer_id === freelancerId));
      }
    } catch (e) {
      console.error('Hire failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    if (step === 3) {
      await getAiBrief();
    }
    if (step === 4) {
      await getMatches();
    }
    setStep(Math.min(step + 1, STEPS.length - 1));
  };

  const prevStep = () => setStep(Math.max(step - 1, 0));

  const canProceed = () => {
    switch (step) {
      case 0: return !!category;
      case 1: return description.length >= 20;
      case 2: return skills.length > 0;
      case 3: return !!timeline;
      default: return true;
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Find the Perfect Talent</h1>
      <p style={{ color: '#6b7280', marginBottom: 32 }}>
        Describe your project and our AI will match you with the best freelancers.
      </p>

      {/* Progress Bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 32 }}>
        {STEPS.map((s, i) => (
          <div key={s.id} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? '#6366f1' : '#e5e7eb' }} />
        ))}
      </div>

      <div style={{ marginBottom: 16, color: '#6b7280', fontSize: 14 }}>
        Step {step + 1} of {STEPS.length}: {STEPS[step].title}
      </div>

      {/* Step Content */}
      <div style={{ minHeight: 300 }}>
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>What type of project do you need?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  style={{
                    padding: '16px', borderRadius: 8, border: category === cat ? '2px solid #6366f1' : '1px solid #e5e7eb',
                    background: category === cat ? '#eef2ff' : 'white', cursor: 'pointer', textAlign: 'left', fontWeight: 500,
                  }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Describe your project</h2>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe what you need built, designed, or delivered. Be as specific as possible for better AI matching..."
              style={{ width: '100%', minHeight: 200, padding: 16, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 15, resize: 'vertical' }} />
            <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 8 }}>{description.length} characters (minimum 20)</p>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Required Skills</h2>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Type a skill and press Enter..."
                style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 15 }} />
              <button onClick={addSkill}
                style={{ padding: '10px 20px', borderRadius: 8, background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {skills.map(skill => (
                <span key={skill} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: '#eef2ff', color: '#4f46e5', fontSize: 14 }}>
                  {skill}
                  <button onClick={() => removeSkill(skill)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontSize: 16 }}>×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Budget & Timeline</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Min Budget (USD)</label>
                <input type="number" value={budgetMin} onChange={e => setBudgetMin(e.target.value)}
                  placeholder="500" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 15 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Max Budget (USD)</label>
                <input type="number" value={budgetMax} onChange={e => setBudgetMax(e.target.value)}
                  placeholder="2000" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 15 }} />
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Timeline</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TIMELINE_OPTIONS.map(t => (
                  <button key={t} onClick={() => setTimeline(t)}
                    style={{
                      padding: '8px 16px', borderRadius: 20, border: timeline === t ? '2px solid #6366f1' : '1px solid #e5e7eb',
                      background: timeline === t ? '#eef2ff' : 'white', cursor: 'pointer', fontSize: 14,
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Project Complexity</label>
              <div style={{ display: 'flex', gap: 12 }}>
                {COMPLEXITY_OPTIONS.map(c => (
                  <button key={c.value} onClick={() => setComplexity(c.value)}
                    style={{
                      flex: 1, padding: '12px', borderRadius: 8, border: complexity === c.value ? '2px solid #6366f1' : '1px solid #e5e7eb',
                      background: complexity === c.value ? '#eef2ff' : 'white', cursor: 'pointer', textAlign: 'left',
                    }}>
                    <div style={{ fontWeight: 600 }}>{c.label}</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>AI-Enhanced Project Brief</h2>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🤖</div>
                AI is analyzing your project...
              </div>
            ) : aiBrief ? (
              <div style={{ background: '#f9fafb', borderRadius: 12, padding: 24 }}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Enriched Description</h3>
                  <p style={{ lineHeight: 1.6 }}>{aiBrief.enriched_description}</p>
                </div>
                {aiBrief.suggested_skills?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Suggested Skills</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {aiBrief.suggested_skills.map((s: string) => (
                        <span key={s} style={{ padding: '4px 10px', borderRadius: 12, background: '#dbeafe', color: '#1d4ed8', fontSize: 13 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>Estimated Budget</div>
                    <div style={{ fontWeight: 600 }}>${aiBrief.estimated_budget_min} - ${aiBrief.estimated_budget_max}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>Timeline</div>
                    <div style={{ fontWeight: 600 }}>{aiBrief.estimated_timeline}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>AI Confidence</div>
                    <div style={{ fontWeight: 600 }}>{Math.round(aiBrief.ai_confidence * 100)}%</div>
                  </div>
                </div>
                {aiBrief.missing_info?.length > 0 && (
                  <div style={{ marginTop: 16, padding: 12, background: '#fef3c7', borderRadius: 8, fontSize: 14 }}>
                    <strong>💡 AI Suggestions:</strong> {aiBrief.missing_info.join(', ')}
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: '#6b7280' }}>Click "Next" to generate AI brief</p>
            )}
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Your Matched Freelancers</h2>
            {hireSuccess ? (
              <div style={{ textAlign: 'center', padding: 40, background: '#f0fdf4', borderRadius: 12 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Successfully Hired!</h3>
                <p style={{ color: '#6b7280' }}>
                  {selectedFreelancer?.display_name} has been notified. Check your messages for updates.
                </p>
              </div>
            ) : loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
                AI is finding the best matches...
              </div>
            ) : matches.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {matches.map((m, i) => (
                  <div key={m.freelancer_id} style={{
                    display: 'flex', gap: 16, padding: 20, borderRadius: 12, border: '1px solid #e5e7eb',
                    background: 'white', alignItems: 'center',
                  }}>
                    <div style={{ width: 48, height: 48, borderRadius: 24, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#6366f1', fontSize: 18 }}>
                      #{i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{m.display_name}</div>
                      <div style={{ color: '#6b7280', fontSize: 14 }}>{m.headline || m.highlight}</div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13, color: '#6b7280' }}>
                        <span>Fit: <strong style={{ color: '#6366f1' }}>{Math.round(m.fit_score)}%</strong></span>
                        <span>Skills: <strong>{Math.round(m.skill_match * 100)}%</strong></span>
                        {m.hourly_rate && <span>${m.hourly_rate}/hr</span>}
                        {m.rating && <span>⭐ {m.rating}</span>}
                      </div>
                    </div>
                    <button onClick={() => handleHire(m.freelancer_id)}
                      style={{ padding: '10px 24px', borderRadius: 8, background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                      Hire
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>No matches found. Try adjusting your requirements.</p>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: '1px solid #e5e7eb' }}>
        <button onClick={prevStep} disabled={step === 0}
          style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.5 : 1 }}>
          Back
        </button>
        {step < STEPS.length - 1 && (
          <button onClick={nextStep} disabled={!canProceed() || loading}
            style={{ padding: '10px 24px', borderRadius: 8, background: '#6366f1', color: 'white', border: 'none', cursor: canProceed() && !loading ? 'pointer' : 'not-allowed', opacity: canProceed() && !loading ? 1 : 0.5 }}>
            {loading ? 'Processing...' : step === 4 ? 'Find Matches' : 'Next'}
          </button>
        )}
      </div>
    </div>
  );
}
