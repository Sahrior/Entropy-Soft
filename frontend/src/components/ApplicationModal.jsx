import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import ApplicationForm from './ApplicationForm.jsx';
import StatusMessage from './StatusMessage.jsx';
import Button from './Button.jsx';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled])';

/** Accessible modal: focus trap, Escape to close, scroll lock, focus returns to the Apply button. */
export default function ApplicationModal({ title, onClose }) {
  const dialogRef = useRef(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    document.body.style.overflow = 'hidden';
    dialog.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = [...dialog.querySelectorAll(FOCUSABLE)];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="modal-overlay">
      <div ref={dialogRef} className="modal" role="dialog" aria-modal="true" aria-labelledby="apply-title" tabIndex={-1}>
        <div className="modal__header">
          <div>
            <h2 id="apply-title">Apply for this role</h2>
            <p>{title}</p>
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close application form">
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        {successMessage ? (
          <div className="modal__success">
            <StatusMessage type="success">{successMessage}</StatusMessage>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <ApplicationForm position={title} onSuccess={setSuccessMessage} />
        )}
      </div>
    </div>
  );
}
