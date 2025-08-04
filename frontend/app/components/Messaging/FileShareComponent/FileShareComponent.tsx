// @AI-HINT: This component provides an interface for users to select and share a file in the chat.
'use client';

import React, { useState, useRef } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import Button from '@/app/components/Button/Button';
import './FileShareComponent.common.css';
import './FileShareComponent.light.css';
import './FileShareComponent.dark.css';

const FileShareComponent: React.FC = () => {
  const { theme } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSendFile = () => {
    if (selectedFile) {
      console.log('Sending file:', selectedFile.name);
      // In a real app, this would trigger an upload API call
      setSelectedFile(null);
    }
  };

  return (
    <div className={`FileShare-container FileShare-container--${theme}`}>
      <label htmlFor="file-upload" className="visually-hidden">Upload file</label>
      <input
        id="file-upload"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="visually-hidden"
      />
      {!selectedFile ? (
        <Button theme={theme} variant="secondary" onClick={handleButtonClick}>Share File</Button>
      ) : (
        <div className={`FileShare-preview FileShare-preview--${theme}`}>
          <span className="FileShare-fileName">{selectedFile.name}</span>
          <div className="FileShare-actions">
            <Button theme={theme} variant="primary" size="small" onClick={handleSendFile}>Send</Button>
            <Button theme={theme} variant="secondary" size="small" onClick={() => setSelectedFile(null)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileShareComponent;
