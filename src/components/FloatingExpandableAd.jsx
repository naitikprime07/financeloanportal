import { useEffect, useRef, useState } from "react";
import { gamLog, gamWarn } from "./gamDebug";
import "./FloatingExpandableAd.css";

const NETWORK = String(import.meta.env.VITE_GAM_NETWORK_CODE || "")
  .trim()
  .replace(/^\/+|\/+$/g, "");

const normalizePath = (value) => {
  const path = String(value || "").trim();
  if (!path) return "";
  if (path.startsWith("/")) return path;
  return NETWORK ? `/${NETWORK}/${path.replace(/^\/+/, "")}` : "";
};

const STORAGE_KEY = 'floatingAdCollapsed';
// Reuse existing TOP ad ID instead of creating new ad unit
const AD_PATH = normalizePath(import.meta.env.VITE_GAM_AD_UNIT_CONTENT_TOP);

/**
 * FloatingExpandableAd - Premium publisher-style floating billboard ad
 *
 * Behaves like ads on major news sites (NYTimes, WSJ, CNN):
 * - Floats above content (does NOT push layout)
 * - Expands/collapses smoothly
 * - Remembers user preference
 * - Always reserves space for "ADVERTISEMENT" fallback
 *
 * @param {Object} props
 * @param {string|number} props.desktopHeight - Expanded height on desktop (default: 250)
 * @param {string|number} props.mobileHeight - Expanded height on mobile (default: 100)
 * @param {string|number} props.collapsedHeight - Collapsed height (default: 50)
 */
const FloatingExpandableAd = ({
  desktopHeight = 250,
  mobileHeight = 100,
  collapsedHeight = 50,
}) => {
  // Load saved state from localStorage (default: expanded)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [adState, setAdState] = useState("loading");
  const id = useRef(
    `gam-floating-expandable-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`
  );
  const slotRef = useRef(null);
  const retryCountRef = useRef(0);

  // Responsive ad sizes
  const AD_SIZES = [
    [970, 250],  // Desktop large billboard
    [900, 250],  // Desktop standard billboard
    [728, 90],   // Desktop leaderboard
    [468, 60],   // Tablet banner
    [320, 100],  // Mobile large
    [320, 50],   // Mobile standard
  ];

  const buildSizeMapping = (gt) => {
    return gt
      .sizeMapping()
      .addSize([1024, 0], [[970, 250], [900, 250], [728, 90]])
      .addSize([768, 0], [[728, 90], [468, 60]])
      .addSize([0, 0], [[320, 100], [320, 50]])
      .build();
  };

  // Toggle collapse/expand
  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(newState));
        gamLog('floating-ad-toggled', { collapsed: newState });
      } catch (error) {
        gamWarn('localStorage-failed', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
      return newState;
    });
  };

  // Initialize Google Ad Manager slot
  useEffect(() => {
    if (!AD_PATH || !AD_SIZES) {
      setAdState("empty");
      gamWarn("floating-ad-not-configured", {
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
        gamLog("slot-requested", {
          slot: "FLOATING_EXPANDABLE",
          path: AD_PATH,
          id: id.current,
        }),
      slotResponseReceived: (event) =>
        owns(event) &&
        gamLog("slot-response-received", {
          slot: "FLOATING_EXPANDABLE",
          path: AD_PATH,
        }),
      slotRenderEnded: (event) => {
        if (!active || !owns(event)) return;
        clearTimeout(timer);

        if (event.isEmpty) {
          // Retry logic
          if (retryCountRef.current < 2) {
            const nextRetry = retryCountRef.current + 1;
            retryCountRef.current = nextRetry;
            gamWarn("slot-no-fill-retrying", {
              slot: "FLOATING_EXPANDABLE",
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
              slot: "FLOATING_EXPANDABLE",
              path: AD_PATH,
              size: event.size,
              retries: retryCountRef.current,
            });
          }
        } else {
          setAdState("filled");
          retryCountRef.current = 0;
          gamLog("slot-rendered", {
            slot: "FLOATING_EXPANDABLE",
            path: AD_PATH,
            size: event.size,
            creativeId: event.creativeId,
            lineItemId: event.lineItemId,
          });
        }
      },
      slotOnload: (event) =>
        owns(event) &&
        gamLog("creative-iframe-loaded", {
          slot: "FLOATING_EXPANDABLE",
          path: AD_PATH,
        }),
      impressionViewable: (event) =>
        owns(event) &&
        gamLog("impression-viewable", {
          slot: "FLOATING_EXPANDABLE",
          path: AD_PATH,
        }),
    };

    gamLog("slot-queueing", {
      slot: "FLOATING_EXPANDABLE",
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
            slot: "FLOATING_EXPANDABLE",
            path: AD_PATH,
            id: id.current,
          });
          return;
        }

        const responsiveMapping = buildSizeMapping(gt);
        if (!responsiveMapping) {
          setAdState("empty");
          gamWarn("size-mapping-invalid", {
            slot: "FLOATING_EXPANDABLE",
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
          slot: "FLOATING_EXPANDABLE",
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
              slot: "FLOATING_EXPANDABLE",
              path: AD_PATH,
              timeoutMs: 15000,
            });
          }
        }, 15000);
      } catch (error) {
        setAdState("empty");
        gamWarn("slot-exception", {
          slot: "FLOATING_EXPANDABLE",
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
        gamLog("slot-destroyed", { slot: "FLOATING_EXPANDABLE", path: AD_PATH });
        slotRef.current = null;
      });
    };
  }, []);

  // Only show if ad loaded successfully
  // When empty: show minimal "ADVERTISEMENT" text only, no large container
  if (adState === "empty") {
    return (
      <div className="floating-ad-fallback-only">
        <span>ADVERTISEMENT</span>
      </div>
    );
  }

  // Show full floating ad when loading or filled
  return (
    <div
      className={`floating-expandable-ad ${isCollapsed ? "collapsed" : "expanded"} ad-state-${adState}`}
      style={{
        '--desktop-height': `${desktopHeight}px`,
        '--mobile-height': `${mobileHeight}px`,
        '--collapsed-height': `${collapsedHeight}px`,
      }}
      role="complementary"
      aria-label="Floating expandable advertisement"
    >
      <div className="floating-ad-container">
        {/* Ad Label */}
        {adState !== "filled" && <div className="floating-ad-label">ADVERTISEMENT</div>}

        {/* Ad Content */}
        <div className="floating-ad-content">
          <div className="ad-unit" id={id.current} />
        </div>

        {/* Collapse/Expand Toggle Button */}
        <button
          className="floating-ad-toggle"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? "Expand advertisement" : "Collapse advertisement"}
          aria-expanded={!isCollapsed}
          title={isCollapsed ? "Expand ad" : "Collapse ad"}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="toggle-icon"
          >
            <path
              d="M4 10L8 6L12 10"
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

export default FloatingExpandableAd;
