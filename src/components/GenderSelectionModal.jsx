import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import "./GenderSelectionModal.css";

const GenderSelectionModal = ({ isOpen, onContinue }) => {
  const [selectedGender, setSelectedGender] = useState("male");
  const [isProcessing, setIsProcessing] = useState(false);
  const firstButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    setSelectedGender("male");
    setIsProcessing(false);
    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("gender-modal-open");
    document.body.style.overflow = "hidden";

    // Detect Google's body-level native anchor shell, which is outside React.
    const markBottomAnchorShells = () => {
      const viewportHeight = window.innerHeight;
      document.querySelectorAll(
        'iframe[id^="google_ads_iframe"], iframe[src*="doubleclick.net"], iframe[src*="googlesyndication.com"]',
      ).forEach((frame) => {
        let element = frame;
        let anchorShell = null;
        while (element && element !== document.body) {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          if (
            (style.position === "fixed" || style.position === "sticky") &&
            rect.width > 0 && rect.height > 0 &&
            rect.height < viewportHeight * 0.9 &&
            rect.bottom >= viewportHeight - 8
          ) anchorShell = element;
          element = element.parentElement;
        }
        anchorShell?.setAttribute(
          "data-financeloanportal-bottom-anchor", "true",
        );
      });
    };
    markBottomAnchorShells();
    const anchorFrame = window.requestAnimationFrame(markBottomAnchorShells);
    const anchorObserver = new MutationObserver(markBottomAnchorShells);
    anchorObserver.observe(document.body, { childList: true, subtree: true });
    const focusTimer = window.setTimeout(
      () => firstButtonRef.current?.focus(),
      100,
    );

    return () => {
      window.clearTimeout(focusTimer);
      window.cancelAnimationFrame(anchorFrame);
      anchorObserver.disconnect();
      document.body.classList.remove("gender-modal-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleContinue = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    onContinue(selectedGender);
  };

  if (!isOpen) return null;

  return createPortal(
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
    </div>,
    document.body,
  );
};

export default GenderSelectionModal;
