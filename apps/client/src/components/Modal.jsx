import React, { useEffect, useRef } from 'react';

export default function Modal({ open, title, children, onClose }) {
  const overlayRef = useRef();
  const closeBtnRef = useRef();

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      document.addEventListener('keydown', onKey);
      // save scroll & focus
      const focused = document.activeElement;
      // focus close button when modal opens
      setTimeout(() => closeBtnRef.current && closeBtnRef.current.focus(), 0);
      return () => {
        document.removeEventListener('keydown', onKey);
        focused && focused.focus && focused.focus();
      };
    }
    return undefined;
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
      className="modal-overlay"
      ref={overlayRef}
      onMouseDown={(e) => {
        // close when clicking outside the dialog
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="modal" role="document">
        <div className="modal-header">
          <div className="h2">{title}</div>
          <button aria-label="Close dialog" ref={closeBtnRef} className="btn ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
