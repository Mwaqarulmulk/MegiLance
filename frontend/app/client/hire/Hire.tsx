// @AI-HINT: This is the 'Hire' page for clients to finalize hiring a freelancer for a project. All styles are per-component only.

'use client';

import React from 'react';
import Button from '@/app/components/Button/Button';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import './Hire.common.css';
import './Hire.light.css';
import './Hire.dark.css';

interface HireProps {
  theme?: 'light' | 'dark';
}

// Mock data for the hiring confirmation
const hireDetails = {
  projectName: 'AI Chatbot Integration',
  freelancerName: 'Jane S.',
  rate: '$65/hr',
  estimatedHours: 80,
  firstMilestone: {
    description: 'Project Setup and Initial UI/UX Mockups',
    amount: 1300,
  },
};

const Hire: React.FC<HireProps> = ({ theme = 'light' }) => {
  const totalEstimate = 65 * 80;

  return (
    <div className={`Hire Hire--${theme}`}>
      <div className="Hire-container">
        <header className="Hire-header">
          <h1>Confirm and Hire</h1>
          <p>You are about to hire <strong>{hireDetails.freelancerName}</strong> for the project: <strong>{hireDetails.projectName}</strong>.</p>
        </header>

        <div className={`Hire-card Hire-card--${theme}`}>
          <div className="Hire-freelancer-info">
            <UserAvatar theme={theme} name={hireDetails.freelancerName} />
            <h2>{hireDetails.freelancerName}</h2>
          </div>

          <div className="Hire-terms">
            <h3>Terms of Agreement</h3>
            <div className="Terms-grid">
              <div className="Term-item">
                <span>Rate</span>
                <strong>{hireDetails.rate}</strong>
              </div>
              <div className="Term-item">
                <span>Est. Hours</span>
                <strong>{hireDetails.estimatedHours}</strong>
              </div>
              <div className="Term-item">
                <span>Est. Total</span>
                <strong>${totalEstimate.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className="Hire-milestone">
            <h3>First Milestone</h3>
            <p>To begin the project, you need to fund the first milestone. The funds will be held in escrow and released upon your approval of the work.</p>
            <div className={`Milestone-details Milestone-details--${theme}`}>
              <span>{hireDetails.firstMilestone.description}</span>
              <strong>${hireDetails.firstMilestone.amount.toLocaleString()}</strong>
            </div>
          </div>

          <div className="Hire-actions">
            <Button theme={theme} variant="primary" size="large">Fund Milestone & Hire {hireDetails.freelancerName}</Button>
            <Button theme={theme} variant="outline">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hire;
