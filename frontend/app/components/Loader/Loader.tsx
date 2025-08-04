// @AI-HINT: This is a simple Loader/Spinner component, an atomic element used for indicating loading states.
'use client';

import React from 'react';
import './Loader.css';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
}

const Loader: React.FC<LoaderProps> = ({ size = 'medium' }) => {
  return (
    <div className={`Loader-container`}>
      <div className={`Loader spinner--${size}`}></div>
    </div>
  );
};

export default Loader;
