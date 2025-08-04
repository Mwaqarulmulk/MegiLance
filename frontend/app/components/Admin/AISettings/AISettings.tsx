// @AI-HINT: This component provides a form for administrators to configure and fine-tune AI model parameters.
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import Button from '@/app/components/Button/Button';
import './AISettings.common.css';
import './AISettings.light.css';
import './AISettings.dark.css';

interface AISettingsState {
  fraudDetectionThreshold: number;
  matchmakingRankWeight: number;
  sentimentAnalysisModel: 'BERT-base' | 'DistilBERT';
}

const initialSettings: AISettingsState = {
  fraudDetectionThreshold: 0.85,
  matchmakingRankWeight: 0.6,
  sentimentAnalysisModel: 'DistilBERT',
};

const AISettings: React.FC = () => {
  const { theme } = useTheme();
  const [settings, setSettings] = useState(initialSettings);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: name.includes('Weight') || name.includes('Threshold') ? parseFloat(value) : value }));
    setIsSaved(false);
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className={`AISettings-container AISettings-container--${theme}`}>
      <h2 className="AISettings-title">AI & Machine Learning Settings</h2>
      <div className={`AISettings-form AISettings-form--${theme}`}>
        <div className="Form-group">
          <label htmlFor="fraudDetectionThreshold">Fraud Detection Sensitivity</label>
          <input
            type="range"
            id="fraudDetectionThreshold"
            name="fraudDetectionThreshold"
            min="0.5"
            max="1.0"
            step="0.01"
            value={settings.fraudDetectionThreshold}
            onChange={handleChange}
          />
          <span>{settings.fraudDetectionThreshold.toFixed(2)}</span>
          <small>Higher values will flag more activity as potentially fraudulent.</small>
        </div>

        <div className="Form-group">
          <label htmlFor="matchmakingRankWeight">Matchmaking Rank Weight</label>
          <input
            type="range"
            id="matchmakingRankWeight"
            name="matchmakingRankWeight"
            min="0.1"
            max="1.0"
            step="0.05"
            value={settings.matchmakingRankWeight}
            onChange={handleChange}
          />
          <span>{settings.matchmakingRankWeight.toFixed(2)}</span>
          <small>Determines the importance of freelancer rank in job matching.</small>
        </div>

        <div className="Form-group">
          <label htmlFor="sentimentAnalysisModel">Sentiment Analysis Model</label>
          <select
            id="sentimentAnalysisModel"
            name="sentimentAnalysisModel"
            value={settings.sentimentAnalysisModel}
            onChange={handleChange}
            className={`AISettings-select AISettings-select--${theme}`}>
            <option value="BERT-base">BERT (Higher Accuracy)</option>
            <option value="DistilBERT">DistilBERT (Faster Performance)</option>
          </select>
          <small>Select the model for analyzing review sentiment.</small>
        </div>

        <div className="Form-actions">
          <Button theme={theme} variant="primary" onClick={handleSave}>Save Changes</Button>
          {isSaved && <span className="Save-confirmation">Settings saved!</span>}
        </div>
      </div>
    </div>
  );
};

export default AISettings;
