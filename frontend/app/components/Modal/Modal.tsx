// @AI-HINT: This is the Modal component for dialogs, confirmations, and overlays. All styles are per-component only. See Modal.common.css, Modal.light.css, and Modal.dark.css for theming.
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoClose } from 'react-icons/io5';
import { useTheme } from '@/app/contexts/ThemeContext';
import './Modal.common.css';
import './Modal.light.css';
import './Modal.dark.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, footer, size = 'medium', className = '' }) => {
  const { theme } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleFocusTrap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.addEventListener('keydown', handleFocusTrap);
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('keydown', handleFocusTrap);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const modalContent = (
    <div
      className={`Modal-overlay Modal-overlay--${theme}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`Modal-content Modal-content--${theme} Modal-content--${size} ${className}`}
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="Modal-header">
          {title && <h2 id="modal-title" className="Modal-title">{title}</h2>}
          <button onClick={onClose} className="Modal-close-button" aria-label="Close modal">
            <IoClose />
          </button>
        </div>
        <div className="Modal-body">
          {children}
        </div>
        {footer && (
          <div className="Modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  if (!isOpen || !isMounted) {
    return null;
  }

  return createPortal(modalContent, document.body);
};

export default Modal;
