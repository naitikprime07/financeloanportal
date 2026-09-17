import { useEffect, useState, useRef } from 'react';
import './GenderSelectionModal.css';

const GenderSelectionModal = ({ isOpen, onClose, onContinue }) => {
  const [selectedGender, setSelectedGender] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const modalRef = useRef(null);
  const firstButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setSelectedGender(null);
      setIsProcessing(false);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Focus first button for accessibility
      setTimeout(() => {
        firstButtonRef.current?.focus();
      }, 100);
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }
    };

    const handleBackButton = (e) => {
      if (isOpen && !isProcessing) {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    window.addEventListener('popstate', handleBackButton);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isOpen, isProcessing, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isProcessing) {
      onClose();
    }
  };

  const handleContinue = () => {
    if (!selectedGender || isProcessing) return;
    setIsProcessing(true);
    onContinue(selectedGender);
  };

  if (!isOpen) return null;

  return (
    <div
      className="gender-modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gender-modal-title"
    >
      <div
        className="gender-modal-content"
        ref={modalRef}
        role="document"
      >
        <button
          className="gender-modal-close"
          onClick={onClose}
          disabled={isProcessing}
          aria-label="Close"
          type="button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h2 id="gender-modal-title" className="gender-modal-title">
          Select Your Gender
        </h2>

        <div className="gender-options">
          <button
            ref={firstButtonRef}
            type="button"
            className={`gender-option ${selectedGender === 'male' ? 'selected' : ''}`}
            onClick={() => !isProcessing && setSelectedGender('male')}
            disabled={isProcessing}
            aria-pressed={selectedGender === 'male'}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="10" cy="14" r="6"></circle>
              <line x1="14.5" y1="9.5" x2="20" y2="4"></line>
              <line x1="17" y1="4" x2="20" y2="4"></line>
              <line x1="20" y1="4" x2="20" y2="7"></line>
            </svg>
            <span>Male</span>
          </button>

          <button
            type="button"
            className={`gender-option ${selectedGender === 'female' ? 'selected' : ''}`}
            onClick={() => !isProcessing && setSelectedGender('female')}
            disabled={isProcessing}
            aria-pressed={selectedGender === 'female'}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="6"></circle>
              <line x1="12" y1="14" x2="12" y2="22"></line>
              <line x1="9" y1="19" x2="15" y2="19"></line>
            </svg>
            <span>Female</span>
          </button>
        </div>

        <button
          type="button"
          className="gender-continue-btn"
          onClick={handleContinue}
          disabled={!selectedGender || isProcessing}
        >
          {isProcessing ? 'Loading Ad...' : 'Continue'}
        </button>

        {isProcessing && (
          <div className="gender-modal-spinner" aria-live="polite" aria-busy="true">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenderSelectionModal;
