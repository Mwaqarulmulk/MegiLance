// @AI-HINT: This component provides a UI for inputting a list of tags, e.g., for required skills.
'use client';

import React, { useState, KeyboardEvent } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './TagInput.common.css';
import './TagInput.light.css';
import './TagInput.dark.css';

interface TagInputProps {
  label: string;
  tags: string[];
  setTags: (tags: string[]) => void;
}

const TagInput: React.FC<TagInputProps> = ({ label, tags, setTags }) => {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className={`TagInput-container TagInput-container--${theme}`}>
      <label className="TagInput-label">{label}</label>
      <div className={`TagInput-wrapper TagInput-wrapper--${theme}`}>
        {tags.map(tag => (
          <div key={tag} className={`TagInput-tag TagInput-tag--${theme}`}>
            {tag}
            <button onClick={() => removeTag(tag)} className="TagInput-remove-btn">
              &times;
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a skill..."
          className="TagInput-input"
        />
      </div>
    </div>
  );
};

export default TagInput;
