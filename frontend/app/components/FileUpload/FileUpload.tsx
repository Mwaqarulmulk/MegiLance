// @AI-HINT: FileUpload component for drag-and-drop file uploads with progress tracking
'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { FaCloudUploadAlt, FaTimes, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import Button from '@/app/components/Button/Button';

import commonStyles from './FileUpload.common.module.css';
import lightStyles from './FileUpload.light.module.css';
import darkStyles from './FileUpload.dark.module.css';

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  uploadType: 'avatar' | 'portfolio' | 'document';
  onUploadComplete?: (url: string) => void;
  error?: string;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = 'image/*',
  maxSize = 10,
  uploadType,
  onUploadComplete,
  error,
  className,
}) => {
  const { resolvedTheme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;
  const styles = {
    container: cn(commonStyles.container, themeStyles.container, className),
    label: cn(commonStyles.label, themeStyles.label),
    dropzone: cn(
      commonStyles.dropzone,
      themeStyles.dropzone,
      isDragging && commonStyles.dropzoneDragging,
      isDragging && themeStyles.dropzoneDragging,
      (error || uploadError) && commonStyles.dropzoneError,
      (error || uploadError) && themeStyles.dropzoneError
    ),
    icon: cn(commonStyles.icon, themeStyles.icon),
    text: cn(commonStyles.text, themeStyles.text),
    hint: cn(commonStyles.hint, themeStyles.hint),
    progress: cn(commonStyles.progress, themeStyles.progress),
    progressBar: cn(commonStyles.progressBar, themeStyles.progressBar),
    success: cn(commonStyles.success, themeStyles.success),
    error: cn(commonStyles.error, themeStyles.error),
    preview: cn(commonStyles.preview, themeStyles.preview),
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setUploadError(`File size exceeds ${maxSize}MB limit`);
      return;
    }

    // Validate file type
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      setUploadError(`Invalid file type. Please upload ${accept}`);
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('access_token');
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(`/backend/api/uploads/${uploadType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const data = await response.json();
        setUploadedUrl(data.url);
        onUploadComplete?.(data.url);
      } else {
        const error = await response.json();
        setUploadError(error.detail || 'Upload failed');
      }
    } catch (err) {
      setUploadError('An error occurred during upload');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleRemove = () => {
    setUploadedUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      
      {!uploadedUrl ? (
        <div
          className={styles.dropzone}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            aria-label="Upload file"
          />
          
          {uploading ? (
            <div className={styles.progress}>
              <FaSpinner className="animate-spin" size={48} />
              <div className={styles.progressBar}>
                <div style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className={styles.text}>Uploading... {uploadProgress}%</p>
            </div>
          ) : (
            <>
              <FaCloudUploadAlt className={styles.icon} size={48} />
              <p className={styles.text}>
                Drag and drop your file here, or click to browse
              </p>
              <p className={styles.hint}>
                Max file size: {maxSize}MB | Accepted: {accept}
              </p>
            </>
          )}
        </div>
      ) : (
        <div className={styles.success}>
          <FaCheckCircle size={24} className="text-green-500" />
          <span>File uploaded successfully!</span>
          <Button variant="danger" size="sm" onClick={handleRemove}>
            <FaTimes /> Remove
          </Button>
          {uploadType !== 'document' && (
            <div className={styles.preview}>
              <img src={uploadedUrl} alt="Uploaded file" />
            </div>
          )}
        </div>
      )}

      {(error || uploadError) && (
        <div className={styles.error}>{error || uploadError}</div>
      )}
    </div>
  );
};

export default FileUpload;
