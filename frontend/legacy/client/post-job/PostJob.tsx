// @AI-HINT: This is the 'Post a Job' page for clients to create new project listings. All styles are per-component only.
'use client';

import React, { useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import Input from '@/app/components/Input/Input';
import Button from '@/app/components/Button/Button';
import TagInput from '@/app/components/TagInput/TagInput';
import commonStyles from './PostJob.common.module.css';
import lightStyles from './PostJob.light.module.css';
import darkStyles from './PostJob.dark.module.css';


const PostJob: React.FC = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [jobType, setJobType] = useState('Fixed Price');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // @AI-HINT: In a real app, this would submit the data to a backend API.
    console.log({ title, description, skills, budget, jobType });
  };

  return (
    <div className={styles.postJobWrapper}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Post a New Job</h1>
          <p>Describe your project and find the perfect freelancer for the job.</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Project Title"
            type="text"
            placeholder="e.g., Build a responsive e-commerce website"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className={styles.inputGroup}>
            <label htmlFor="description">Project Description</label>
            <textarea
              id="description"
              className={styles.textarea}
              rows={8}
              placeholder="Provide a detailed description of the work, required skills, and expected deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <TagInput label="Required Skills" tags={skills} setTags={setSkills} />
          <div className={styles.formRow}>
            <Input
              label="Budget (USDC)"
              type="number"
              placeholder="e.g., 5000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
            <div className={styles.inputGroup}>
              <label htmlFor="job-type">Job Type</label>
              <select 
                id="job-type" 
                className={styles.select}
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              >
                <option>Fixed Price</option>
                <option>Hourly</option>
              </select>
            </div>
          </div>
          <Button variant="primary" type="submit">
            Post Job Listing
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
