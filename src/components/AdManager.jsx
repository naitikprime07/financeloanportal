export const GPT_SCRIPT_URL = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';

export const initializeGPT = () => {
  if (typeof window === 'undefined') return;
  window.googletag = window.googletag || { cmd: [] };
  if (window.__finvexaGptConfigured) return;
  window.__finvexaGptConfigured = true;

  window.googletag.cmd.push(() => {
    const gt = window.googletag;
    const pubads = gt.pubads();

    // Note: singleRequest is NOT compatible with SPA client-side navigation
    // where ad slots are dynamically added/removed between route changes.
    // Each new page's slots need their own ad request.
    gt.setConfig({
      collapseDiv: 'BEFORE_FETCH',
      centering: true,
      lazyLoad: {
        fetchMarginPercent: 200,
        renderMarginPercent: 100,
        mobileScaling: 2.0,
      },
    });
    pubads.setPrivacySettings({
      restrictDataProcessing: false,
      childDirectedTreatment: false,
      underAgeOfConsent: false,
    });
    gt.enableServices();
  });
};
