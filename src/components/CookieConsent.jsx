import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CookieConsent.css';

const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setTimeout(() => setShow(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    window.dispatchEvent(new CustomEvent('finvexa:cookie-consent', { detail: { status: 'accepted' } }));
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    window.dispatchEvent(new CustomEvent('finvexa:cookie-consent', { detail: { status: 'rejected' } }));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="cookie-consent">
      <div className="cookie-content">
        <p>
          We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic.
          By clicking "Accept All", you consent to our use of cookies. <Link to="/privacy">Cookie Policy</Link>
        </p>
        <div className="cookie-buttons">
          <button onClick={handleAccept} className="cookie-btn-accept">Accept All</button>
          <button onClick={handleReject} className="cookie-btn-reject">Reject All</button>
        </div>
      </div>
      <button onClick={() => setShow(false)} className="cookie-close">×</button>
    </div>
  );
};

export default CookieConsent;
