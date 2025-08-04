// @AI-HINT: This is the Modal component for dialogs, confirmations, and overlays. All styles are per-component only. See Modal.common.css, Modal.light.css, and Modal.dark.css for theming.
'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './Modal.common.css';
import './Modal.light.css';
import './Modal.dark.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  const { theme } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`Modal-overlay Modal-overlay--${theme}`} onClick={onClose} role="dialog" aria-modal="true">
      <div className={`Modal-content Modal-content--${theme}`} ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <div className="Modal-header">
          {title && <h2 className="Modal-title">{title}</h2>}
          <button onClick={onClose} className="Modal-close-button" aria-label="Close modal">&times;</button>
        </div>
        <div className="Modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
