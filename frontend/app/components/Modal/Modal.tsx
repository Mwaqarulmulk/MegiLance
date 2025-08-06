// @AI-HINT: This is the Modal component for dialogs, confirmations, and overlays. All styles are per-component only. See Modal.common.css, Modal.light.css, and Modal.dark.css for theming.
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoClose } from 'react-icons/io5';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import commonStyles from './Modal.common.module.css';
import lightStyles from './Modal.light.module.css';
import darkStyles from './Modal.dark.module.css';

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
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme();

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

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const modalContent = (
    <div
      className={cn(commonStyles.modalOverlay, themeStyles.modalOverlay)}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={cn(commonStyles.modalContent, themeStyles.modalContent, commonStyles[size], className)}
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className={cn(commonStyles.modalHeader, themeStyles.modalHeader)}>
          {title && <h2 id="modal-title" className={cn(commonStyles.modalTitle, themeStyles.modalTitle)}>{title}</h2>}
          <button onClick={onClose} className={cn(commonStyles.closeButton, themeStyles.closeButton)} aria-label="Close modal">
            <IoClose />
          </button>
        </div>
        <div className={cn(commonStyles.modalBody, themeStyles.modalBody)}>
          {children}
        </div>
        {footer && (
          <div className={cn(commonStyles.modalFooter, themeStyles.modalFooter)}>
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
