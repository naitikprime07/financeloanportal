import { useEffect, useRef, useState } from "react";
import { gamLog, gamWarn } from "./gamDebug";
import "./BottomAnchorAd.css";

const NETWORK = String(import.meta.env.VITE_GAM_NETWORK_CODE || "")
  .trim()
  .replace(/^\/+|\/+$/g, "");
const rawPath = String(
  import.meta.env.VITE_GAM_AD_UNIT_MOBILE_ANCHOR ||
    import.meta.env.VITE_GAM_AD_UNIT_TOP_STICKY_EXPANDABLE ||
    "",
).trim();
const AD_PATH = rawPath.startsWith("/")
  ? rawPath
  : NETWORK && rawPath
    ? `/${NETWORK}/${rawPath.replace(/^\/+/, "")}`
    : "";
const AD_SIZES = [
  [970, 250],
  [900, 250],
  [970, 90],
  [728, 90],
  [468, 60],
  [336, 280],
  [320, 250],
  [300, 250],
  [320, 100],
  [320, 50],
  "fluid",
];
const buildSizeMapping = (gt) =>
  gt
    .sizeMapping()
    .addSize(
      [1024, 0],
      [
        [970, 250],
        [900, 250],
        [970, 90],
        [728, 90],
      ],
    )
    .addSize(
      [768, 0],
      [
        [728, 90],
        [468, 60],
      ],
    )
    .addSize([336, 0], ["fluid", [336, 280], [320, 250], [300, 250]])
    .addSize([320, 0], ["fluid", [320, 250], [300, 250]])
    .addSize([0, 0], ["fluid", [300, 250]])
    .build();

const getViewportWidth = () =>
  typeof document === "undefined"
    ? 0
    : document.documentElement.clientWidth || window.innerWidth || 0;

const readPixelDimension = (value) => {
  const raw = String(value || "").trim();
  if (!/^\d+(?:\.\d+)?(?:px)?$/.test(raw)) return 0;
  return Number.parseFloat(raw);
};

const BottomAnchorAd = () => {
  const id = useRef(
    `gam-bottom-anchor-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`,
  );
  const slotRef = useRef(null);
  const reportedSizeRef = useRef(null);
  const measureFrameRef = useRef(0);
  const [status, setStatus] = useState("loading");
  const [creativeSize, setCreativeSize] = useState(null);
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth);
  const [transitionDirection, setTransitionDirection] = useState("collapsing");
  const isMobile = viewportWidth < 768;

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(getViewportWidth());
    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);
    window.visualViewport?.addEventListener("resize", updateViewportWidth);
    return () => {
      window.removeEventListener("resize", updateViewportWidth);
      window.visualViewport?.removeEventListener("resize", updateViewportWidth);
    };
  }, []);

  useEffect(() => {
    if (!AD_PATH) {
      setStatus("unavailable");
      return undefined;
    }

    window.googletag = window.googletag || { cmd: [] };
    let active = true;
    let timeoutId;

    const measureCreative = () => {
      window.cancelAnimationFrame(measureFrameRef.current);
      measureFrameRef.current = window.requestAnimationFrame(() => {
        measureFrameRef.current = window.requestAnimationFrame(() => {
          if (!active) return;
          const root = document.getElementById(id.current);
          const elements = root
            ? [...root.querySelectorAll("iframe")]
                .reverse()
                .concat(root.firstElementChild || [])
            : [];

          const measurements = elements.flatMap((element) => {
            if (!element) return [];
            const width =
              readPixelDimension(element.getAttribute?.("width")) ||
              readPixelDimension(element.style?.width);
            const height =
              readPixelDimension(element.getAttribute?.("height")) ||
              readPixelDimension(element.style?.height);
            if (width > 0 && height > 0) return [[width, height]];
            const rect = element.getBoundingClientRect?.();
            return rect?.width > 0 && rect?.height > 0
              ? [[rect.width, rect.height]]
              : [];
          });
          const measured =
            measurements.sort((a, b) => b[0] * b[1] - a[0] * a[1])[0] || null;

          const finalSize = measured || reportedSizeRef.current;
          if (finalSize?.[0] > 0 && finalSize?.[1] > 0) {
            setCreativeSize(finalSize);
            gamLog("bottom-anchor-measured", {
              eventSize: reportedSizeRef.current,
              measured: finalSize,
            });
          }
        });
      });
    };

    const owns = (event) => event.slot === slotRef.current;
    const onRender = (event) => {
      if (!active || !owns(event)) return;
      window.clearTimeout(timeoutId);
      if (event.isEmpty) {
        reportedSizeRef.current = null;
        setCreativeSize(null);
        setStatus("unavailable");
        gamLog("bottom-anchor-no-fill", { path: AD_PATH });
        return;
      }

      const size = Array.isArray(event.size)
        ? event.size.map(Number).filter(Number.isFinite)
        : null;
      reportedSizeRef.current =
        size?.length === 2 && size.every((value) => value > 0) ? size : null;
      if (reportedSizeRef.current) setCreativeSize(reportedSizeRef.current);
      setStatus("expanded");
      gamLog("bottom-anchor-rendered", { path: AD_PATH, size: event.size });
      measureCreative();
    };

    const onLoad = (event) => {
      if (!active || !owns(event)) return;
      measureCreative();
      gamLog("bottom-anchor-iframe-loaded", { path: AD_PATH });
    };

    window.googletag.cmd.push(() => {
      if (!active) return;
      const gt = window.googletag;
      try {
        const gamSlot = gt.defineSlot(AD_PATH, AD_SIZES, id.current);
        if (!gamSlot) {
          setStatus("unavailable");
          return;
        }
        gamSlot.defineSizeMapping(buildSizeMapping(gt)).addService(gt.pubads());
        slotRef.current = gamSlot;
        gt.pubads().addEventListener("slotRenderEnded", onRender);
        gt.pubads().addEventListener("slotOnload", onLoad);
        gt.display(id.current);
        timeoutId = window.setTimeout(() => {
          if (!active) return;
          setCreativeSize(null);
          setStatus("unavailable");
          gamWarn("bottom-anchor-timeout", { path: AD_PATH, timeoutMs: 15000 });
        }, 15000);
      } catch (error) {
        setCreativeSize(null);
        setStatus("unavailable");
        gamWarn("bottom-anchor-exception", {
          message: error instanceof Error ? error.message : String(error),
        });
      }
    });

    return () => {
      active = false;
      window.cancelAnimationFrame(measureFrameRef.current);
      window.clearTimeout(timeoutId);
      const slotToDestroy = slotRef.current;
      slotRef.current = null;
      window.googletag?.cmd?.push(() => {
        window.googletag
          .pubads()
          .removeEventListener("slotRenderEnded", onRender);
        window.googletag.pubads().removeEventListener("slotOnload", onLoad);
        if (slotToDestroy) window.googletag.destroySlots([slotToDestroy]);
      });
    };
  }, []);

  const isFilled = ["expanded", "compact", "collapsed"].includes(status);
  const availableWidth = Math.max(viewportWidth, 1);
  const mobileScale = creativeSize ? availableWidth / creativeSize[0] : 1;
  const mobileHeight = creativeSize ? creativeSize[1] * mobileScale : 0;
  const compactScale = creativeSize
    ? Math.min(1, 110 / creativeSize[1], availableWidth / creativeSize[0])
    : 1;
  const style = creativeSize
    ? {
        "--bottom-ad-width": `${creativeSize[0]}px`,
        "--bottom-ad-height": `${creativeSize[1]}px`,
        "--bottom-ad-mobile-scale": mobileScale,
        "--bottom-ad-mobile-height": `${mobileHeight}px`,
        "--bottom-ad-compact-scale": compactScale,
        "--bottom-ad-compact-width": `${creativeSize[0] * compactScale}px`,
        "--bottom-ad-compact-height": `${creativeSize[1] * compactScale}px`,
      }
    : undefined;

  const toggleAd = () => {
    setStatus((current) => {
      // Mobile: Simple toggle between expanded and collapsed only
      if (isMobile) {
        if (current === "expanded") return "collapsed";
        if (current === "collapsed") return "expanded";
        // If somehow in compact state on mobile, treat as expanded
        if (current === "compact") return "collapsed";
        return current;
      }

      // Desktop: Keep 3-state behavior (expanded â†’ compact â†’ collapsed â†’ compact â†’ expanded)
      if (current === "expanded") {
        setTransitionDirection("collapsing");
        return "compact";
      }
      if (current === "compact")
        return transitionDirection === "collapsing" ? "collapsed" : "expanded";
      if (current === "collapsed") {
        setTransitionDirection("expanding");
        return "compact";
      }
      return current;
    });
  };

  const expanding =
    status === "collapsed" || transitionDirection === "expanding";
  return (
    <>
      <aside
        className={`bottom-anchor-ad is-${status}`}
        style={style}
        aria-label="Advertisement"
      >
        {!isFilled && <div className="bottom-anchor-label">ADVERTISEMENT</div>}
        <div
          className="bottom-anchor-creative"
          aria-hidden={!isFilled || status === "collapsed"}
        >
          <div className="bottom-anchor-slot" id={id.current} />
        </div>
        {isFilled && (
          <button
            type="button"
            className="bottom-anchor-toggle"
            onClick={toggleAd}
            aria-expanded={status === "expanded"}
            aria-label={
              expanding ? "Expand advertisement" : "Collapse advertisement"
            }
          >
            <span>{status === "collapsed" ? "Expand" : "Advertisement"}</span>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="m4 6 4 4 4-4" />
            </svg>
          </button>
        )}
      </aside>
      <div
        className={`bottom-anchor-clearance is-${status}`}
        style={style}
        aria-hidden="true"
      />
    </>
  );
};

export default BottomAnchorAd;

