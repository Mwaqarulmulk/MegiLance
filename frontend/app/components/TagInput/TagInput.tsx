// @AI-HINT: This component provides a UI for inputting a list of tags, e.g., for required skills.
'use client';

import React, { useState, KeyboardEvent } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import commonStyles from './TagInput.common.module.css';
import lightStyles from './TagInput.light.module.css';
import darkStyles from './TagInput.dark.module.css';

interface TagInputProps {
  label: string;
  tags: string[];
  setTags: (tags: string[]) => void;
}

const TagInput: React.FC<TagInputProps> = ({ label, tags, setTags }) => {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState('');

  if (!theme) return null;

  const themeStyles = theme === 'light' ? lightStyles : darkStyles;

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
    <div className={cn(commonStyles.tagInputContainer, themeStyles.tagInputContainer)}>
      <label className={cn(commonStyles.tagInputLabel, themeStyles.tagInputLabel)}>{label}</label>
      <div className={cn(commonStyles.tagInputWrapper, themeStyles.tagInputWrapper)}>
        {tags.map(tag => (
          <div key={tag} className={cn(commonStyles.tagInputTag, themeStyles.tagInputTag)}>
            {tag}
            <button onClick={() => removeTag(tag)} className={cn(commonStyles.tagInputRemoveBtn, themeStyles.tagInputRemoveBtn)}>
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
          className={cn(commonStyles.tagInputInput, themeStyles.tagInputInput)}
        />
      </div>
    </div>
  );
};

export default TagInput;
