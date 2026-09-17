import { useEffect, useMemo, useRef, useState } from "react";
import { gamLog, gamWarn } from "./gamDebug";
import "./TopStickyExpandableAd.css";

const NETWORK = String(import.meta.env.VITE_GAM_NETWORK_CODE || "")
  .trim()
  .replace(/^\/+|\/+$/g, "");

const normalizePath = (value) => {
  const path = String(value || "").trim();
  if (!path) return "";
  if (path.startsWith("/")) return path;
  return NETWORK ? `/${NETWORK}/${path.replace(/^\/+/, "")}` : "";
};

const AD_PATH = normalizePath(import.meta.env.VITE_GAM_AD_UNIT_TOP_STICKY_EXPANDABLE);

// Responsive ad sizes for top sticky expandable ad
const AD_SIZES = [
  [970, 250],  // Desktop large
  [728, 90],   // Desktop medium
  [468, 60],   // Tablet
  [320, 100],  // Mobile large
  [320, 50],   // Mobile small
];

const buildSizeMapping = (gt) => {
  return gt
    .sizeMapping()
    .addSize([1024, 0], [[970, 250], [728, 90]])
    .addSize([768, 0], [[728, 90], [468, 60]])
    .addSize([0, 0], [[320, 100], [320, 50]])
    .build();
};

const STORAGE_KEY = 'finvexa-top-ad-expanded';

const TopStickyExpandableAd = () => {
  // Load initial state from localStorage, default to true (expanded)
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });
  const [adState, setAdState] = useState("loading");
  const id = useRef(
    `gam-top-sticky-expandable-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`
  );
  const slotRef = useRef(null);
  const retryCountRef = useRef(0);

  // Toggle expand/collapse and save to localStorage
  const toggleExpanded = () => {
    setIsExpanded((prev) => {
      const newState = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(newState));
      } catch (error) {
        gamWarn('localStorage-failed', { error: error instanceof Error ? error.message : String(error) });
      }
      return newState;
    });
  };

  // Initialize ad
  useEffect(() => {
    if (!AD_PATH || !AD_SIZES) {
      setAdState("empty");
      gamWarn("top-sticky-expandable-not-configured", {
        hasNetworkCode: Boolean(NETWORK),
        hasPath: Boolean(AD_PATH),
      });
      return undefined;
    }

    window.googletag = window.googletag || { cmd: [] };
    let active = true;
    let timer;

    const owns = (event) => event.slot === slotRef.current;
    const handlers = {
      slotRequested: (event) =>
        owns(event) &&
        gamLog("slot-requested", { slot: "TOP_STICKY_EXPANDABLE", path: AD_PATH, id: id.current }),
      slotResponseReceived: (event) =>
        owns(event) && gamLog("slot-response-received", { slot: "TOP_STICKY_EXPANDABLE", path: AD_PATH }),
      slotRenderEnded: (event) => {
        if (!active || !owns(event)) return;
        clearTimeout(timer);

        if (event.isEmpty) {
          // Retry logic for no-fill scenarios
          if (retryCountRef.current < 2) {
            const nextRetry = retryCountRef.current + 1;
            retryCountRef.current = nextRetry;
            gamWarn("slot-no-fill-retrying", {
              slot: "TOP_STICKY_EXPANDABLE",
              path: AD_PATH,
              retryCount: nextRetry,
            });
            setTimeout(() => {
              if (active && slotRef.current) {
                window.googletag?.cmd?.push(() => {
                  window.googletag.pubads().refresh([slotRef.current]);
                });
              }
            }, 2000 * nextRetry);
          } else {
            setAdState("empty");
            gamWarn("slot-no-fill", {
              slot: "TOP_STICKY_EXPANDABLE",
              path: AD_PATH,
              size: event.size,
              retries: retryCountRef.current,
            });
          }
        } else {
          setAdState("filled");
          retryCountRef.current = 0;
          gamLog("slot-rendered", {
            slot: "TOP_STICKY_EXPANDABLE",
            path: AD_PATH,
            size: event.size,
            creativeId: event.creativeId,
            lineItemId: event.lineItemId,
          });
        }
      },
      slotOnload: (event) =>
        owns(event) && gamLog("creative-iframe-loaded", { slot: "TOP_STICKY_EXPANDABLE", path: AD_PATH }),
      impressionViewable: (event) =>
        owns(event) && gamLog("impression-viewable", { slot: "TOP_STICKY_EXPANDABLE", path: AD_PATH }),
    };

    gamLog("slot-queueing", {
      slot: "TOP_STICKY_EXPANDABLE",
      path: AD_PATH,
      sizes: AD_SIZES,
      id: id.current,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    });

    window.googletag.cmd.push(() => {
      if (!active) return;
      const gt = window.googletag;
      try {
        const gamSlot = gt.defineSlot(AD_PATH, AD_SIZES, id.current);
        if (!gamSlot) {
          setAdState("empty");
          gamWarn("define-slot-returned-null", {
            slot: "TOP_STICKY_EXPANDABLE",
            path: AD_PATH,
            id: id.current,
          });
          return;
        }

        const responsiveMapping = buildSizeMapping(gt);
        if (!responsiveMapping) {
          setAdState("empty");
          gamWarn("size-mapping-invalid", {
            slot: "TOP_STICKY_EXPANDABLE",
            path: AD_PATH,
            sizes: AD_SIZES,
          });
          return;
        }

        gamSlot.defineSizeMapping(responsiveMapping).addService(gt.pubads());
        slotRef.current = gamSlot;

        Object.entries(handlers).forEach(([eventName, handler]) =>
          gt.pubads().addEventListener(eventName, handler)
        );

        gamLog("slot-defined", {
          slot: "TOP_STICKY_EXPANDABLE",
          path: AD_PATH,
          sizes: AD_SIZES,
          id: id.current,
          apiReady: Boolean(gt.apiReady),
          pubadsReady: Boolean(gt.pubadsReady),
        });

        gt.display(id.current);

        timer = setTimeout(() => {
          if (active) {
            setAdState("empty");
            gamWarn("slot-timeout", {
              slot: "TOP_STICKY_EXPANDABLE",
              path: AD_PATH,
              timeoutMs: 15000,
            });
          }
        }, 15000);
      } catch (error) {
        setAdState("empty");
        gamWarn("slot-exception", {
          slot: "TOP_STICKY_EXPANDABLE",
          path: AD_PATH,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    });

    return () => {
      active = false;
      clearTimeout(timer);
      window.googletag?.cmd?.push(() => {
        Object.entries(handlers).forEach(([eventName, handler]) =>
          window.googletag.pubads().removeEventListener(eventName, handler)
        );
        if (slotRef.current) window.googletag.destroySlots([slotRef.current]);
        gamLog("slot-destroyed", { slot: "TOP_STICKY_EXPANDABLE", path: AD_PATH });
        slotRef.current = null;
      });
    };
  }, []);

  // Don't render anything if ad is not configured or failed to load
  if (adState === "empty") {
    return null;
  }

  return (
    <div
      className={`top-sticky-expandable-ad ${isExpanded ? "expanded" : "minimized"} ad-state-${adState}`}
      role="complementary"
      aria-label="Top expandable advertisement"
    >
      <div className="top-sticky-ad-container">
        {adState !== "filled" && <div className="top-sticky-ad-label">ADVERTISEMENT</div>}
        <div className="top-sticky-ad-content">
          {AD_PATH && AD_SIZES && <div className="ad-unit" id={id.current} />}
        </div>
        <button
          className="top-sticky-ad-toggle"
          onClick={toggleExpanded}
          aria-label={isExpanded ? "Minimize advertisement" : "Expand advertisement"}
          aria-expanded={isExpanded}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="toggle-icon"
          >
            <path
              d="M5 12.5L10 7.5L15 12.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TopStickyExpandableAd;
