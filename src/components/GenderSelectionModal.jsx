import { useEffect, useState, useRef } from "react";
import "./GenderSelectionModal.css";

const GenderSelectionModal = ({ isOpen, onContinue }) => {
  const [selectedGender, setSelectedGender] = useState("male");
  const [isProcessing, setIsProcessing] = useState(false);
  const firstButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return undefined;
    }

    setSelectedGender("male");
    setIsProcessing(false);
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(
      () => firstButtonRef.current?.focus(),
      100,
    );

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleContinue = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    onContinue(selectedGender);
  };

  if (!isOpen) return null;

  return (
    <div
      className="gender-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gender-modal-title"
    >
      <div className="gender-modal-content" role="document">
        <h2 id="gender-modal-title" className="gender-modal-title">
          Cash Loan
        </h2>

        <div className="gender-options">
          <button
            ref={firstButtonRef}
            type="button"
            className={`gender-option ${selectedGender === "male" ? "selected" : ""}`}
            onClick={() => !isProcessing && setSelectedGender("male")}
            disabled={isProcessing}
            aria-pressed={selectedGender === "male"}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="10" cy="14" r="6" />
              <line x1="14.5" y1="9.5" x2="20" y2="4" />
              <line x1="17" y1="4" x2="20" y2="4" />
              <line x1="20" y1="4" x2="20" y2="7" />
            </svg>
            <span>Male</span>
          </button>

          <button
            type="button"
            className={`gender-option ${selectedGender === "female" ? "selected" : ""}`}
            onClick={() => !isProcessing && setSelectedGender("female")}
            disabled={isProcessing}
            aria-pressed={selectedGender === "female"}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="8" r="6" />
              <line x1="12" y1="14" x2="12" y2="22" />
              <line x1="9" y1="19" x2="15" y2="19" />
            </svg>
            <span>Female</span>
          </button>
        </div>

        <button
          type="button"
          className="gender-continue-btn"
          onClick={handleContinue}
          disabled={isProcessing}
        >
          {isProcessing ? "Loading Ad..." : "Continue"}
        </button>

        {isProcessing && (
          <div
            className="gender-modal-spinner"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="spinner" />
          </div>
        )}
      </div>
    </div>
  );
};

export default GenderSelectionModal;
