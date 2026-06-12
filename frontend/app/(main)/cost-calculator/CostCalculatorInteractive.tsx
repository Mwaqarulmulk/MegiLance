"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import commonStyles from './CostCalculator.common.module.css';

const skillRates: Record<string, number> = {
  "React": 75, "Next.js": 80, "Node.js": 70, "Python": 65, "TypeScript": 75,
  "Django": 60, "FastAPI": 70, "Flutter": 85, "React Native": 80, "AWS": 90,
  "Docker": 70, "Kubernetes": 95, "PostgreSQL": 60, "MongoDB": 55, "Figma": 50,
  "UI/UX": 60, "Machine Learning": 120, "DevOps": 85, "Go": 90, "Rust": 100,
};

const complexityMultiplier = { simple: 0.8, moderate: 1.0, complex: 1.5, "very complex": 2.0 };
const durationMultiplier = { "1-2 weeks": 0.9, "1 month": 1.0, "2-3 months": 1.1, "6+ months": 1.2 };

export default function CostCalculatorPage() {
  const [skill, setSkill] = useState("React");
  const [complexity, setComplexity] = useState("moderate");
  const [duration, setDuration] = useState("1 month");
  const [hours, setHours] = useState(100);
  const [estimate, setEstimate] = useState({ min: 0, max: 0, avg: 0 });

  useEffect(() => {
    const base = skillRates[skill] || 60;
    const cm = (complexityMultiplier as Record<string, number>)[complexity] || 1;
    const dm = (durationMultiplier as Record<string, number>)[duration] || 1;
    const low = Math.round(hours * base * cm * dm * 0.85);
    const high = Math.round(hours * base * cm * dm * 1.25);
    const avg = Math.round(hours * base * cm * dm);
    setEstimate({ min: low, max: high, avg });
  }, [skill, complexity, duration, hours]);

  return (
    <main className={commonStyles.container}>
      <header className={commonStyles.header}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <Image
            src="/images/sections/ai-price-estimator.png"
            alt="MegiLance AI Pricing Engine — get accurate project cost estimates with market rate data, confidence scores, and instant AI analysis"
            width={420}
            height={380}
            priority
            sizes="(max-width: 640px) 280px, 420px"
            style={{ width: '100%', maxWidth: '420px', height: 'auto', objectFit: 'contain' }}
          />
        </div>
        <h1 className={commonStyles.title}>Cost Calculator</h1>
        <p className={commonStyles.subtitle}>
          Estimate your project cost instantly using real market rates.
        </p>
      </header>

      <section className={commonStyles.calculator}>
        <div className={commonStyles.field}>
          <label>Skill / Technology</label>
          <select value={skill} onChange={(e) => setSkill(e.target.value)}>
            {Object.keys(skillRates).map((s) => (
              <option key={s} value={s}>{s} — ${skillRates[s]}/hr avg</option>
            ))}
          </select>
        </div>

        <div className={commonStyles.field}>
          <label>Project Complexity</label>
          <select value={complexity} onChange={(e) => setComplexity(e.target.value)}>
            <option value="simple">Simple</option>
            <option value="moderate">Moderate</option>
            <option value="complex">Complex</option>
            <option value="very complex">Very Complex</option>
          </select>
        </div>

        <div className={commonStyles.field}>
          <label>Duration</label>
          <select value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="1-2 weeks">1-2 weeks</option>
            <option value="1 month">1 month</option>
            <option value="2-3 months">2-3 months</option>
            <option value="6+ months">6+ months</option>
          </select>
        </div>

        <div className={commonStyles.field}>
          <label>Estimated Hours: {hours}</label>
          <input
            type="range"
            min={10}
            max={1000}
            step={10}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          />
        </div>

        <div className={commonStyles.result}>
          <div className={commonStyles.resultItem}>
            <span className={commonStyles.resultLabel}>Low Estimate</span>
            <span className={commonStyles.resultValue}>${estimate.min.toLocaleString()}</span>
          </div>
          <div className={commonStyles.resultItem}>
            <span className={commonStyles.resultLabel}>Average</span>
            <span className={commonStyles.resultValuePrimary}>${estimate.avg.toLocaleString()}</span>
          </div>
          <div className={commonStyles.resultItem}>
            <span className={commonStyles.resultLabel}>High Estimate</span>
            <span className={commonStyles.resultValue}>${estimate.max.toLocaleString()}</span>
          </div>
        </div>

        <p className={commonStyles.disclaimer}>
          Estimates are based on MegiLance marketplace averages. Actual rates vary by freelancer experience and location.
        </p>
      </section>
    </main>
  );
}
