// @AI-HINT: This is the 'Post a Job' page for clients to create new project listings. All styles are per-component only.
'use client';

import React, { useState } from 'react';
import Input from '@/app/components/Input/Input';
import Button from '@/app/components/Button/Button';
import TagInput from '@/app/components/TagInput/TagInput';
import './PostJob.common.css';
import './PostJob.light.css';
import './PostJob.dark.css';

interface PostJobProps {
  theme?: 'light' | 'dark';
}

const PostJob: React.FC<PostJobProps> = ({ theme = 'light' }) => {
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
    <div className={`PostJob PostJob--${theme}`}>
      <div className="PostJob-container">
        <header className="PostJob-header">
          <h1>Post a New Job</h1>
          <p>Describe your project and find the perfect freelancer for the job.</p>
        </header>

        <form className="PostJob-form" onSubmit={handleSubmit}>
          <Input
            theme={theme}
            label="Project Title"
            type="text"
            placeholder="e.g., Build a responsive e-commerce website"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="Input-group">
            <label htmlFor="description">Project Description</label>
            <textarea
              id="description"
              className={`Textarea Textarea--${theme}`}
              rows={8}
              placeholder="Provide a detailed description of the work, required skills, and expected deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <TagInput label="Required Skills" tags={skills} setTags={setSkills} />
          <div className="PostJob-form-row">
            <Input
              theme={theme}
              label="Budget (USDC)"
              type="number"
              placeholder="e.g., 5000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
            <div className="Input-group">
              <label htmlFor="job-type">Job Type</label>
              <select 
                id="job-type" 
                className={`Select Select--${theme}`}
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              >
                <option>Fixed Price</option>
                <option>Hourly</option>
              </select>
            </div>
          </div>
          <Button theme={theme} variant="primary" type="submit">
            Post Job Listing
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
