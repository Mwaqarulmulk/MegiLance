// @AI-HINT: This component provides a simple editor for administrators to update policy documents like Terms of Service.
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import Button from '@/app/components/Button/Button';
import './AdminPolicyEditor.common.css';
import './AdminPolicyEditor.light.css';
import './AdminPolicyEditor.dark.css';

// Mock policy content
const mockPolicies = {
  terms: `Welcome to MegiLance... By using our services, you agree to these terms...`,
  privacy: `Your privacy is important to us... We collect data to improve our services...`,
  kyc: `Know Your Customer (KYC) guidelines require us to verify the identity of our users...`,
};

type PolicyType = 'terms' | 'privacy' | 'kyc';

const AdminPolicyEditor: React.FC = () => {
  const { theme } = useTheme();
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyType>('terms');
  const [content, setContent] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setContent(mockPolicies[selectedPolicy]);
  }, [selectedPolicy]);

  const handleSave = () => {
    console.log(`Saving ${selectedPolicy} policy:`, content);
    mockPolicies[selectedPolicy] = content; // In a real app, this would be an API call
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className={`PolicyEditor-container PolicyEditor-container--${theme}`}>
      <h2 className="PolicyEditor-title">Admin Policy Editor</h2>
      <div className={`PolicyEditor-editor PolicyEditor-editor--${theme}`}>
        <div className="PolicyEditor-controls">
            <label htmlFor="policy-select" className="sr-only">Select a policy to edit</label>
            <select
              id="policy-select"
              value={selectedPolicy}
              onChange={(e) => setSelectedPolicy(e.target.value as PolicyType)}
              className={`PolicyEditor-select PolicyEditor-select--${theme}`}
            >
              <option value="terms">Terms of Service</option>
              <option value="privacy">Privacy Policy</option>
              <option value="kyc">KYC Policy</option>
            </select>
          </div>
        <label htmlFor="policy-content" className="sr-only">Policy content</label>
        <textarea
          id="policy-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`PolicyEditor-textarea PolicyEditor-textarea--${theme}`}
          rows={20}
        />
        <div className="PolicyEditor-actions">
          <Button theme={theme} variant="primary" onClick={handleSave}>Save Policy</Button>
          {isSaved && <span className="Save-confirmation">Policy saved!</span>}
        </div>
      </div>
    </div>
  );
};

export default AdminPolicyEditor;
