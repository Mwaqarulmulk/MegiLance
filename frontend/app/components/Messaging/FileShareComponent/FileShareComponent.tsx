// @AI-HINT: This component provides an interface for users to select and share a file in the chat.
'use client';

import React, { useState, useRef } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import Button from '@/app/components/Button/Button';
import { cn } from '@/lib/utils';
import commonStyles from './FileShareComponent.common.module.css';
import lightStyles from './FileShareComponent.light.module.css';
import darkStyles from './FileShareComponent.dark.module.css';

const FileShareComponent: React.FC = () => {
  const { theme } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!theme) return null;

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

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
    <div className={cn(commonStyles.container, themeStyles.themeWrapper)}>
      <label htmlFor="file-upload" className={commonStyles.visuallyHidden}>Upload file</label>
      <input
        id="file-upload"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className={commonStyles.visuallyHidden}
      />
      {!selectedFile ? (
        <Button variant="secondary" onClick={handleButtonClick}>Share File</Button>
      ) : (
        <div className={commonStyles.preview}>
          <span className={commonStyles.fileName}>{selectedFile.name}</span>
          <div className={commonStyles.actions}>
            <Button variant="primary" size="small" onClick={handleSendFile}>Send</Button>
            <Button variant="secondary" size="small" onClick={() => setSelectedFile(null)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileShareComponent;
