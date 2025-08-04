// @AI-HINT: This is the AI Price Estimator utility page. It helps users estimate project costs. All styles are per-component only.
'use client';

import React, { useState } from 'react';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import './PriceEstimator.common.css';
import './PriceEstimator.light.css';
import './PriceEstimator.dark.css';

interface PriceEstimatorProps {
  theme?: 'light' | 'dark';
}

const PriceEstimator: React.FC<PriceEstimatorProps> = ({ theme = 'light' }) => {
  const [estimatedPrice, setEstimatedPrice] = useState<string | null>(null);

  const handleEstimation = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock estimation logic
    const randomPrice = (Math.random() * (5000 - 500) + 500).toFixed(2);
    setEstimatedPrice(`$${randomPrice} - $${(parseFloat(randomPrice) * 1.5).toFixed(2)}`);
  };

  return (
    <div className={`PriceEstimator PriceEstimator--${theme}`}>
      <div className="PriceEstimator-container">
        <header className="PriceEstimator-header">
          <h1>AI Project Price Estimator</h1>
          <p>Get a data-driven estimate for your project&apos;s budget.</p>
        </header>

        <form className={`PriceEstimator-form Card--${theme}`} onSubmit={handleEstimation}>
          <div className="form-grid">
            <Input theme={theme} label="Project Title" type="text" placeholder="e.g., E-commerce Website Redesign" required />
            <div className="full-span">
                <label htmlFor="description" className={`Input-label Input-label--${theme}`}>Project Description</label>
                <textarea id="description" className={`Textarea Textarea--${theme}`} rows={6} placeholder="Describe the project scope, key features, and deliverables..." required></textarea>
            </div>
            <Input theme={theme} label="Industry" type="text" placeholder="e.g., SaaS, Retail, Healthcare" />
            <div>
                <label htmlFor="complexity" className={`Input-label Input-label--${theme}`}>Complexity</label>
                <select id="complexity" className={`Select Select--${theme}`} required>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                </select>
            </div>
          </div>
          <Button theme={theme} variant="primary" type="submit">Estimate Price</Button>
        </form>

        {estimatedPrice && (
          <div className={`EstimationResult Card--${theme}`}>
            <h2>Estimated Price Range</h2>
            <p className="price">{estimatedPrice}</p>
            <small>This is an AI-generated estimate. Prices may vary based on freelancer bids and project specifics.</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceEstimator;
