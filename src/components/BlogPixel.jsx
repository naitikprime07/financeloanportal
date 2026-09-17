import { useEffect } from "react";
import { getBlogPixelConfig } from "../utils/getBlogPixel";

const META_SCRIPT_ID = "finvexa-meta-pixel-script";
const CONSENT_EVENT = "finvexa:cookie-consent";
const initializedPixelIds = new Set();
const recentPageViews = new Map();

const hasInitializedPixel = (pixelId) => {
  if (initializedPixelIds.has(pixelId)) return true;
  try {
    return Boolean(
      window.fbq?.getState?.().pixels?.some(
        (pixel) => String(pixel.id) === String(pixelId),
      ),
    );
  } catch {
    return false;
  }
};

const ensureMetaPixel = () => {
  let fbq = window.fbq;
  if (typeof fbq !== "function") {
    fbq = function (...args) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
  }

  if (!document.getElementById(META_SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = META_SCRIPT_ID;
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    script.onerror = () => script.remove();
    document.head.appendChild(script);
  }

  return fbq;
};

const BlogPixel = ({ blog }) => {
  const config = getBlogPixelConfig(blog);
  const pixelId = config?.pixelId || null;
  const pageViewEnabled = config?.events?.includes("PageView") === true;

  useEffect(() => {
    if (!pixelId || !pageViewEnabled) return undefined;

    const activate = () => {
      try {
        if (localStorage.getItem("cookieConsent") !== "accepted") return;

        const fbq = ensureMetaPixel();
        if (!hasInitializedPixel(pixelId)) {
          fbq("init", pixelId);
          initializedPixelIds.add(pixelId);
        }

        const pageKey = `${pixelId}:${window.location.pathname}`;
        const now = Date.now();
        if (now - (recentPageViews.get(pageKey) || 0) < 2000) return;
        recentPageViews.set(pageKey, now);
        fbq("trackSingle", pixelId, "PageView");
      } catch {
        // Pixel failures must never affect blog rendering or navigation.
      }
    };

    const handleConsent = (event) => {
      if (event.detail?.status === "accepted") activate();
    };

    const handleStorage = (event) => {
      if (event.key === "cookieConsent" && event.newValue === "accepted") activate();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") activate();
    };

    window.addEventListener(CONSENT_EVENT, handleConsent);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", activate);
    document.addEventListener("visibilitychange", handleVisibility);
    activate();

    return () => {
      window.removeEventListener(CONSENT_EVENT, handleConsent);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", activate);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [pixelId, pageViewEnabled, blog?.id]);

  return null;
};

export default BlogPixel;