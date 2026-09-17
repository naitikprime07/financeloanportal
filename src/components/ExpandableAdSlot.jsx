import { useEffect, useRef, useState } from "react";
import { gamLog, gamWarn } from "./gamDebug";
import "./ExpandableAdSlot.css";

const NETWORK = String(import.meta.env.VITE_GAM_NETWORK_CODE || "")
  .trim()
  .replace(/^\/+|\/+$/g, "");

const normalizePath = (value) => {
  const path = String(value || "").trim();
  if (!path) return "";
  if (path.startsWith("/")) return path;
  return NETWORK ? `/${NETWORK}/${path.replace(/^\/+/, "")}` : "";
};

/**
 * ExpandableAdSlot - Reusable expandable/collapsible ad component
 *
 * @param {Object} props
 * @param {string} props.placement - Ad placement identifier (e.g., "top-banner")
 * @param {string} props.adUnitPath - GAM ad unit path (environment variable name or full path)
 * @param {Array} props.adSizes - Array of ad sizes [[width, height], ...]
 * @param {Function} props.buildSizeMapping - Optional custom size mapping function
 * @param {string} props.expandedHeight - CSS height when expanded (e.g., "250px")
 * @param {string} props.collapsedHeight - CSS height when collapsed (e.g., "60px")
 * @param {boolean} props.rememberState - Save collapse state to localStorage (default: true)
 * @param {string} props.storageKey - Custom localStorage key (default: auto-generated from placement)
 * @param {boolean} props.defaultExpanded - Initial expanded state (default: true)
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.transitionDuration - Animation duration in ms (default: 400)
 */
const ExpandableAdSlot = ({
  placement = "expandable-ad",
  adUnitPath,
  adSizes = [[728, 90], [320, 50]],
  buildSizeMapping = null,
  expandedHeight = "250px",
  collapsedHeight = "60px",
  rememberState = true,
  storageKey = null,
  defaultExpanded = true,
  className = "",
  transitionDuration = 400,
}) => {
  const finalStorageKey = storageKey || `finvexa-ad-${placement}-expanded`;
  const adPath = normalizePath(adUnitPath);

  // Load initial state from localStorage if enabled
  const [isExpanded, setIsExpanded] = useState(() => {
    if (!rememberState) return defaultExpanded;
    try {
      const stored = localStorage.getItem(finalStorageKey);
      return stored !== null ? stored === 'true' : defaultExpanded;
    } catch {
      return defaultExpanded;
    }
  });

  const [adState, setAdState] = useState("loading");
  const id = useRef(
    `gam-${placement}-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`
  );
  const slotRef = useRef(null);
  const retryCountRef = useRef(0);

  // Toggle expand/collapse
  const toggleExpanded = () => {
    setIsExpanded((prev) => {
      const newState = !prev;
      if (rememberState) {
        try {
          localStorage.setItem(finalStorageKey, String(newState));
        } catch (error) {
          gamWarn('localStorage-failed', {
            placement,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
      return newState;
    });
  };

  // Default size mapping if not provided
  const defaultBuildSizeMapping = (gt) => {
    return gt
      .sizeMapping()
      .addSize([1024, 0], adSizes.filter(s => Array.isArray(s) && s[0] >= 728))
      .addSize([768, 0], adSizes.filter(s => Array.isArray(s) && s[0] >= 468 && s[0] < 728))
      .addSize([0, 0], adSizes.filter(s => Array.isArray(s) && s[0] < 468))
      .build();
  };

  const sizeMapper = buildSizeMapping || defaultBuildSizeMapping;

  // Initialize ad
  useEffect(() => {
    if (!adPath || !adSizes || adSizes.length === 0) {
      setAdState("empty");
      gamWarn("expandable-ad-not-configured", {
        placement,
        hasNetworkCode: Boolean(NETWORK),
        hasPath: Boolean(adPath),
        hasSizes: Boolean(adSizes && adSizes.length > 0),
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
        gamLog("slot-requested", { slot: placement, path: adPath, id: id.current }),
      slotResponseReceived: (event) =>
        owns(event) && gamLog("slot-response-received", { slot: placement, path: adPath }),
      slotRenderEnded: (event) => {
        if (!active || !owns(event)) return;
        clearTimeout(timer);

        if (event.isEmpty) {
          if (retryCountRef.current < 2) {
            const nextRetry = retryCountRef.current + 1;
            retryCountRef.current = nextRetry;
            gamWarn("slot-no-fill-retrying", {
              slot: placement,
              path: adPath,
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
              slot: placement,
              path: adPath,
              size: event.size,
              retries: retryCountRef.current,
            });
          }
        } else {
          setAdState("filled");
          retryCountRef.current = 0;
          gamLog("slot-rendered", {
            slot: placement,
            path: adPath,
            size: event.size,
            creativeId: event.creativeId,
            lineItemId: event.lineItemId,
          });
        }
      },
      slotOnload: (event) =>
        owns(event) && gamLog("creative-iframe-loaded", { slot: placement, path: adPath }),
      impressionViewable: (event) =>
        owns(event) && gamLog("impression-viewable", { slot: placement, path: adPath }),
    };

    gamLog("slot-queueing", {
      slot: placement,
      path: adPath,
      sizes: adSizes,
      id: id.current,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    });

    window.googletag.cmd.push(() => {
      if (!active) return;
      const gt = window.googletag;
      try {
        const gamSlot = gt.defineSlot(adPath, adSizes, id.current);
        if (!gamSlot) {
          setAdState("empty");
          gamWarn("define-slot-returned-null", {
            slot: placement,
            path: adPath,
            id: id.current,
          });
          return;
        }

        const responsiveMapping = sizeMapper(gt);
        if (!responsiveMapping) {
          setAdState("empty");
          gamWarn("size-mapping-invalid", {
            slot: placement,
            path: adPath,
            sizes: adSizes,
          });
          return;
        }

        gamSlot.defineSizeMapping(responsiveMapping).addService(gt.pubads());
        slotRef.current = gamSlot;

        Object.entries(handlers).forEach(([eventName, handler]) =>
          gt.pubads().addEventListener(eventName, handler)
        );

        gamLog("slot-defined", {
          slot: placement,
          path: adPath,
          sizes: adSizes,
          id: id.current,
          apiReady: Boolean(gt.apiReady),
          pubadsReady: Boolean(gt.pubadsReady),
        });

        gt.display(id.current);

        timer = setTimeout(() => {
          if (active) {
            setAdState("empty");
            gamWarn("slot-timeout", {
              slot: placement,
              path: adPath,
              timeoutMs: 15000,
            });
          }
        }, 15000);
      } catch (error) {
        setAdState("empty");
        gamWarn("slot-exception", {
          slot: placement,
          path: adPath,
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
        gamLog("slot-destroyed", { slot: placement, path: adPath });
        slotRef.current = null;
      });
    };
  }, [placement, adPath, adSizes, sizeMapper]);

  // Always show container to prevent layout shift, even if empty
  const showContent = adState === "filled" || adState === "loading";

  return (
    <div
      className={`expandable-ad-slot ${isExpanded ? "expanded" : "collapsed"} ad-state-${adState} ${className}`}
      style={{
        '--expanded-height': expandedHeight,
        '--collapsed-height': collapsedHeight,
        '--transition-duration': `${transitionDuration}ms`,
      }}
      role="complementary"
      aria-label={`${placement} advertisement`}
      data-placement={placement}
    >
      <div className="expandable-ad-container">
        {adState !== "filled" && <div className="expandable-ad-label">ADVERTISEMENT</div>}
        <div className="expandable-ad-content">
          {showContent && <div className="ad-unit" id={id.current} />}
        </div>
        <button
          className="expandable-ad-toggle"
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

export default ExpandableAdSlot;
