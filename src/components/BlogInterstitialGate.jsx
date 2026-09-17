import { useEffect } from 'react';
import { gamLog, gamWarn } from './gamDebug';

const TARGET_ID = 'blog-continue-reading-target';
const NETWORK = String(import.meta.env.VITE_GAM_NETWORK_CODE || '').trim().replace(/^\/+|\/+$/g, '');
const rawPath = String(import.meta.env.VITE_GAM_AD_UNIT_INTERSTITIAL || '').trim();
const INTERSTITIAL_PATH = rawPath.startsWith('/')
  ? rawPath
  : NETWORK && rawPath
    ? `/${NETWORK}/${rawPath.replace(/^\/+/, '')}`
    : '';

const BlogInterstitialGate = () => {
  useEffect(() => {
    if (!INTERSTITIAL_PATH) {
      gamWarn('interstitial-not-configured', { variable: 'VITE_GAM_AD_UNIT_INTERSTITIAL' });
      return undefined;
    }

    window.googletag = window.googletag || { cmd: [] };
    let active = true;
    let interstitialSlot = null;
    let renderTimer;

    const destroyInterstitial = () => {
      clearTimeout(renderTimer);
      if (!interstitialSlot) return;
      window.googletag.destroySlots([interstitialSlot]);
      interstitialSlot = null;
    };

    const onRender = (event) => {
      if (event.slot !== interstitialSlot) return;
      clearTimeout(renderTimer);
      (event.isEmpty ? gamWarn : gamLog)(
        event.isEmpty ? 'interstitial-no-fill' : 'interstitial-rendered',
        { path: INTERSTITIAL_PATH, creativeId: event.creativeId, lineItemId: event.lineItemId },
      );
      // Keep filled slots alive for GPT's accessible, frequency-capped
      // interstitial and native Close (X), but promptly remove empty slots.
      if (event.isEmpty) destroyInterstitial();
    };
    const onLoad = (event) => {
      if (event.slot === interstitialSlot) gamLog('interstitial-loaded', { path: INTERSTITIAL_PATH });
    };

    window.googletag.cmd.push(() => {
      if (!active || !document.getElementById(TARGET_ID)) return;
      const gt = window.googletag;
      interstitialSlot = gt.defineOutOfPageSlot(
        INTERSTITIAL_PATH,
        gt.enums.OutOfPageFormat.INTERSTITIAL,
      );

      if (!interstitialSlot) {
        gamWarn('interstitial-unsupported', {
          path: INTERSTITIAL_PATH,
          reason: 'Page, browser, storage consent, frequency cap, or device is ineligible',
        });
        return;
      }

      interstitialSlot.addService(gt.pubads()).setConfig({
        interstitial: {
          triggers: {
            continueReading: true,
          },
        },
        continueButton: {
          font: 'Arial, sans-serif',
          fontColor: '#ffffff',
          backgroundColor: '#4f86c9',
          targetId: TARGET_ID,
        },
      });

      gt.pubads().addEventListener('slotRenderEnded', onRender);
      gt.pubads().addEventListener('slotOnload', onLoad);
      gamLog('interstitial-defined', { path: INTERSTITIAL_PATH, trigger: 'continueReading', targetId: TARGET_ID });
      renderTimer = window.setTimeout(() => {
        if (!active || !interstitialSlot) return;
        gamWarn('interstitial-timeout', { path: INTERSTITIAL_PATH, timeoutMs: 15000 });
        destroyInterstitial();
      }, 15000);
      gt.display(interstitialSlot);
    });

    return () => {
      active = false;
      clearTimeout(renderTimer);
      window.googletag?.cmd?.push(() => {
        window.googletag.pubads().removeEventListener('slotRenderEnded', onRender);
        window.googletag.pubads().removeEventListener('slotOnload', onLoad);
        destroyInterstitial();
      });
    };
  }, []);

  return null;
};

export { TARGET_ID as BLOG_INTERSTITIAL_TARGET_ID };
export default BlogInterstitialGate;
