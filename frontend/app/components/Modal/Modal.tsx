// @AI-HINT: This is the Modal component for dialogs, confirmations, and overlays. All styles are per-component only. See Modal.common.css, Modal.light.css, and Modal.dark.css for theming.
import React, { useEffect, useRef } from "react";
import "./Modal.common.css";
import "./Modal.light.css";
import "./Modal.dark.css";

export interface ModalProps {
  theme?: "light" | "dark";
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ theme = "light", open, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={`Modal Modal--${theme}`} role="dialog" aria-modal="true" ref={modalRef}>
      <div className="Modal-backdrop" onClick={onClose} />
      <div className="Modal-content">
        {title && <header className="Modal-header"><h2>{title}</h2></header>}
        <main className="Modal-body">{children}</main>
        <button className="Modal-close" onClick={onClose} aria-label="Close modal">×</button>
      </div>
    </div>
  );
};

export default Modal;
