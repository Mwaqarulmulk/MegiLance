// @AI-HINT: This is the AI Fraud Check utility page. It helps users analyze text for potential fraud. All styles are per-component only.
'use client';

import React, { useState } from 'react';
import Button from '@/app/components/Button/Button';
import './FraudCheck.common.css';
import './FraudCheck.light.css';
import './FraudCheck.dark.css';

interface FraudCheckProps {
  theme?: 'light' | 'dark';
}

interface AnalysisResult {
  score: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  warnings: string[];
}

const FraudCheck: React.FC<FraudCheckProps> = ({ theme = 'light' }) => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAnalysisResult(null);

    // Mock analysis logic
    setTimeout(() => {
      const score = Math.random();
      let riskLevel: AnalysisResult['riskLevel'] = 'Low';
      const warnings: string[] = [];

      if (score > 0.9) {
        riskLevel = 'Critical';
        warnings.push('Contains blacklisted phrases: "guaranteed payment", "telegram"');
        warnings.push('External contact information detected.');
      } else if (score > 0.7) {
        riskLevel = 'High';
        warnings.push('Suspicious link detected.');
      } else if (score > 0.4) {
        riskLevel = 'Medium';
        warnings.push('Vague project description.');
      }

      setAnalysisResult({ score: Math.round(score * 100), riskLevel, warnings });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className={`FraudCheck FraudCheck--${theme}`}>
      <div className="FraudCheck-container">
        <header className="FraudCheck-header">
          <h1>AI Fraud & Spam Analyzer</h1>
          <p>Paste any text to check for signs of fraudulent activity or spam.</p>
        </header>

        <form className={`FraudCheck-form Card--${theme}`} onSubmit={handleAnalysis}>
          <textarea
            className={`Textarea Textarea--${theme}`}
            rows={10}
            placeholder="Paste project description, message, or user bio here..."
            required
          />
          <Button theme={theme} variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Analyze Text'}
          </Button>
        </form>

        {analysisResult && (
          <div className={`AnalysisResult Card--${theme} risk--${analysisResult.riskLevel}`}>
            <h2>Analysis Complete</h2>
            <div className="Result-summary">
              <div className="Result-score">{analysisResult.score}%</div>
              <div className="Result-level">{analysisResult.riskLevel} Risk</div>
            </div>
            {analysisResult.warnings.length > 0 && (
              <div className="Result-warnings">
                <h3>Potential Issues Found:</h3>
                <ul>
                  {analysisResult.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FraudCheck;
