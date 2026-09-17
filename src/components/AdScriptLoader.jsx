import { useEffect } from 'react';
import { GPT_SCRIPT_URL, initializeGPT } from './AdManager';
import { gamLog, gamWarn } from './gamDebug';

const AdScriptLoader = () => {
  useEffect(() => {
    window.googletag = window.googletag || { cmd: [] };
    initializeGPT();
    const existing = document.querySelector(`script[data-finvexa-gpt="true"], script[src="${GPT_SCRIPT_URL}"]`);
    if (existing) {
      existing.dataset.finvexaGpt = 'true';
      gamLog('script-already-present', { apiReady: Boolean(window.googletag.apiReady) });
      return undefined;
    }
    gamLog('script-requested', { url: GPT_SCRIPT_URL });
    const script = document.createElement('script');
    script.async = true;
    script.dataset.finvexaGpt = 'true';
    script.src = GPT_SCRIPT_URL;
    script.onload = () => gamLog('script-loaded', { apiReady: Boolean(window.googletag.apiReady) });
    script.onerror = () => {
      gamWarn('script-load-failed', { url: GPT_SCRIPT_URL, possibleCause: 'network, CSP, DNS, or ad blocker' });
      script.remove();
    };
    document.head.appendChild(script);
    return undefined;
  }, []);
  return null;
};
export default AdScriptLoader;

