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
  [970, 250], [900, 250], [970, 90], [728, 90], [468, 60],
  [336, 280], [320, 250], [300, 250], [320, 100], [320, 50], "fluid",
];

const buildSizeMapping = (gt) =>
  gt.sizeMapping()
    .addSize([1024, 0], [[970, 250], [900, 250], [970, 90], [728, 90]])
    .addSize([768, 0], [[728, 90], [468, 60]])
    .addSize([336, 0], ["fluid", [336, 280], [320, 250], [300, 250]])
    .addSize([320, 0], ["fluid", [320, 250], [300, 250]])
    .addSize([0, 0], ["fluid", [300, 250]])
    .build();

const viewportWidth = () =>
  typeof window === "undefined"
    ? 0
    : document.documentElement.clientWidth || window.innerWidth || 0;

const BottomAnchorAd = () => {
  const id = useRef(
    `gam-bottom-anchor-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`,
  );
  const slotRef = useRef(null);
  const measureFrameRef = useRef(0);
  const transitionDirectionRef = useRef("collapsing");
  const [loadState, setLoadState] = useState("loading");
  const [anchorState, setAnchorState] = useState("expanded");
  const [creativeSize, setCreativeSize] = useState(null);
  const [availableWidth, setAvailableWidth] = useState(viewportWidth);

  useEffect(() => {
    const updateWidth = () => setAvailableWidth(viewportWidth());
    window.addEventListener("resize", updateWidth);
    window.visualViewport?.addEventListener("resize", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
      window.visualViewport?.removeEventListener("resize", updateWidth);
    };
  }, []);

  useEffect(() => {
    if (!AD_PATH) {
      setLoadState("unavailable");
      return undefined;
    }

    window.googletag = window.googletag || { cmd: [] };
    let active = true;
    let timeoutId;

    const measureCreative = () => {
      window.cancelAnimationFrame(measureFrameRef.current);
      measureFrameRef.current = window.requestAnimationFrame(() => {
        const root = document.getElementById(id.current);
        const iframe = root?.querySelector('iframe');
        const rect = iframe?.getBoundingClientRect();
        const width = Number(iframe?.getAttribute('width')) || rect?.width;
        const height = Number(iframe?.getAttribute('height')) || rect?.height;
        if (active && width > 0 && height > 0) setCreativeSize([width, height]);
      });
    };

    const owns = (event) => event.slot === slotRef.current;
    const onRender = (event) => {
      if (!active || !owns(event)) return;
      window.clearTimeout(timeoutId);
      if (event.isEmpty) {
        setCreativeSize(null);
        setLoadState("unavailable");
        gamLog("bottom-anchor-no-fill", { path: AD_PATH });
        return;
      }

      const size = Array.isArray(event.size) ? event.size.map(Number) : null;
      setCreativeSize(
        size?.length === 2 && size.every((value) => Number.isFinite(value) && value > 0)
          ? size
          : null,
      );
      setLoadState("filled");
      setAnchorState("expanded");
      measureCreative();
      gamLog("bottom-anchor-rendered", { path: AD_PATH, size: event.size });
    };

    const onLoad = (event) => {
      if (!active || !owns(event)) return;
      measureCreative();
      gamLog("bottom-anchor-iframe-loaded", { path: AD_PATH });
    };

    const onRequested = (event) => {
      if (!active || !owns(event)) return;
      gamLog("bottom-anchor-requested", { path: AD_PATH });
    };

    window.googletag.cmd.push(() => {
      if (!active) return;
      const gt = window.googletag;
      try {
        const slot = gt.defineSlot(AD_PATH, AD_SIZES, id.current);
        if (!slot) {
          setLoadState("unavailable");
          gamWarn("bottom-anchor-define-failed", { path: AD_PATH });
          return;
        }
        slot.defineSizeMapping(buildSizeMapping(gt)).addService(gt.pubads());
        slotRef.current = slot;
        gt.pubads().addEventListener("slotRequested", onRequested);
        gt.pubads().addEventListener("slotRenderEnded", onRender);
        gt.pubads().addEventListener("slotOnload", onLoad);
        gamLog("bottom-anchor-defined", {
          path: AD_PATH,
          id: id.current,
          apiReady: Boolean(gt.apiReady),
          pubadsReady: Boolean(gt.pubadsReady),
        });
        gt.display(id.current);
        timeoutId = window.setTimeout(() => {
          if (!active) return;
          setLoadState("unavailable");
          gamWarn("bottom-anchor-timeout", { path: AD_PATH, timeoutMs: 15000 });
        }, 15000);
      } catch (error) {
        setLoadState("unavailable");
        gamWarn("bottom-anchor-exception", {
          message: error instanceof Error ? error.message : String(error),
        });
      }
    });

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(measureFrameRef.current);
      const slot = slotRef.current;
      slotRef.current = null;
      window.googletag?.cmd?.push(() => {
        window.googletag.pubads().removeEventListener("slotRequested", onRequested);
        window.googletag.pubads().removeEventListener("slotRenderEnded", onRender);
        window.googletag.pubads().removeEventListener("slotOnload", onLoad);
        if (slot) window.googletag.destroySlots([slot]);
      });
    };
  }, []);

  if (loadState === "unavailable") return null;

  const maxWidth = Math.max(1, availableWidth - 16);
  const scale = creativeSize ? Math.min(1, maxWidth / creativeSize[0]) : 1;
  const renderedWidth = creativeSize ? creativeSize[0] * scale : Math.min(320, maxWidth);
  const renderedHeight = creativeSize ? creativeSize[1] * scale : 50;

  const style = {
    "--anchor-width": `${renderedWidth}px`,
    "--anchor-height": `${renderedHeight}px`,
    "--anchor-creative-width": `${creativeSize?.[0] || renderedWidth}px`,
    "--anchor-creative-height": `${creativeSize?.[1] || renderedHeight}px`,
    "--anchor-scale": scale,
  };

  const handleToggle = () => {
    setAnchorState((current) => {
      let next;
      switch (current) {
        case "expanded":
          next = "collapsed";
          break;
        case "collapsed":
          next = "minimized";
          break;
        case "minimized":
          next = "collapsed";
          break;
        default:
          next = "expanded";
      }
      gamLog("bottom-anchor-state-changed", { path: AD_PATH, from: current, to: next });
      return next;
    });
  };

  const getIcon = () => {
    if (anchorState === "expanded") {
      return "m4 6 4 4 4-4";
    }
    return "m4 10 4-4 4 4";
  };

  return (
    <>
      <aside
        className={`bottom-anchor-ad is-${anchorState} is-${loadState}`}
        style={style}
        aria-label="Advertisement"
      >
        <div className="bottom-anchor-panel">
          {loadState === "filled" && (
            <button
              type="button"
              className="bottom-anchor-btn"
              onClick={handleToggle}
              aria-label={anchorState === "expanded" ? "Collapse advertisement" : "Expand advertisement"}
              aria-expanded={anchorState === "expanded"}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d={getIcon()} />
              </svg>
            </button>
          )}
          <div className="bottom-anchor-creative">
            <div className="bottom-anchor-slot" id={id.current} />
          </div>
        </div>
      </aside>
      <div
        className={`bottom-anchor-clearance is-${anchorState} is-${loadState}`}
        style={style}
        aria-hidden="true"
      />
    </>
  );
};

export default BottomAnchorAd;
