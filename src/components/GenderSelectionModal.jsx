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

    // GAM injects the native anchor as a body-level sibling, outside React.
    // Mark every external iframe/fixed layer so the global modal state can
    // suppress it without unmounting or changing the underlying GPT slot.
    const markExternalViewportLayers = () => {
      const modalRoot = document.querySelector(".gender-modal-overlay");

      Array.from(document.body.children).forEach((element) => {
        if (element === modalRoot || element.id === "root") return;

        const style = window.getComputedStyle(element);
        const containsIframe =
          element.tagName === "IFRAME" || Boolean(element.querySelector("iframe"));
        const isViewportLayer =
          style.position === "fixed" || style.position === "sticky";

        if (containsIframe || isViewportLayer) {
          element.setAttribute(
            "data-financeloanportal-modal-background",
            "true",
          );
        }
      });

      document.querySelectorAll("iframe").forEach((frame) => {
        let element = frame;
        while (element?.parentElement && element.parentElement !== document.body) {
          element = element.parentElement;
        }
        if (element && element !== modalRoot && element.id !== "root") {
          element.setAttribute(
            "data-financeloanportal-modal-background",
            "true",
          );
        }
      });
    };

    markExternalViewportLayers();
    const layerFrame = window.requestAnimationFrame(markExternalViewportLayers);
    const layerObserver = new MutationObserver(markExternalViewportLayers);
    layerObserver.observe(document.body, { childList: true, subtree: true });
    // GPT may apply fixed positioning after inserting its shell.
    const layerScanTimer = window.setInterval(markExternalViewportLayers, 250);
    const focusTimer = window.setTimeout(
      () => firstButtonRef.current?.focus(),
      100,
    );

    return () => {
      window.clearTimeout(focusTimer);
      window.cancelAnimationFrame(layerFrame);
      layerObserver.disconnect();
      window.clearInterval(layerScanTimer);
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
