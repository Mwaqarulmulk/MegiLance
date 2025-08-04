// @AI-HINT: This is the 'Post a Job' page for clients to create new project listings. All styles are per-component only.
'use client';

import React from 'react';
import Input from '@/app/components/Input/Input';
import Button from '@/app/components/Button/Button';
import './PostJob.common.css';
import './PostJob.light.css';
import './PostJob.dark.css';

interface PostJobProps {
  theme?: 'light' | 'dark';
}

const PostJob: React.FC<PostJobProps> = ({ theme = 'light' }) => {

  return (
    <div className={`PostJob PostJob--${theme}`}>
      <div className="PostJob-container">
        <header className="PostJob-header">
          <h1>Post a New Job</h1>
          <p>Describe your project and find the perfect freelancer for the job.</p>
        </header>

        <form className="PostJob-form">
          <Input
            theme={theme}
            label="Project Title"
            type="text"
            placeholder="e.g., Build a responsive e-commerce website"
          />
          <div className="Input-group">
            <label htmlFor="description">Project Description</label>
            <textarea
              id="description"
              className={`Textarea Textarea--${theme}`}
              rows={8}
              placeholder="Provide a detailed description of the work, required skills, and expected deliverables..."
            ></textarea>
          </div>
          <Input
            theme={theme}
            label="Required Skills"
            type="text"
            placeholder="e.g., React, Node.js, UI/UX Design"
          />
          <div className="PostJob-form-row">
            <Input
              theme={theme}
              label="Budget"
              type="number"
              placeholder="e.g., 5000"
            />
            <div className="Input-group">
              <label htmlFor="job-type">Job Type</label>
              <select id="job-type" className={`Select Select--${theme}`}>
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
