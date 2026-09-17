import { useEffect, useMemo, useRef, useState } from "react";
import { gamLog, gamWarn } from "./gamDebug";
import "./AdUnit.css";

const NETWORK = String(import.meta.env.VITE_GAM_NETWORK_CODE || "")
  .trim()
  .replace(/^\/+|\/+$/g, "");
const normalizePath = (value) => {
  const path = String(value || "").trim();
  if (!path) return "";
  if (path.startsWith("/")) return path;
  return NETWORK ? `/${NETWORK}/${path.replace(/^\/+/, "")}` : "";
};
const PATHS = {
  TOP: normalizePath(import.meta.env.VITE_GAM_AD_UNIT_CONTENT_TOP),
  MIDDLE_1: normalizePath(import.meta.env.VITE_GAM_AD_UNIT_CONTENT_MIDDLE_1),
  MIDDLE_2: normalizePath(import.meta.env.VITE_GAM_AD_UNIT_CONTENT_MIDDLE_2),
  BLOG_FEATURED: normalizePath(import.meta.env.VITE_GAM_AD_UNIT_CONTENT_MIDDLE_2),
  MIDDLE_3: normalizePath(import.meta.env.VITE_GAM_AD_UNIT_CONTENT_MIDDLE_3),
  BOTTOM: normalizePath(import.meta.env.VITE_GAM_AD_UNIT_CONTENT_BOTTOM),
  ANCHOR: normalizePath(import.meta.env.VITE_GAM_AD_UNIT_MOBILE_ANCHOR),
  NATIVE: normalizePath(import.meta.env.VITE_GAM_AD_UNIT_NATIVE_IN_CONTENT),
  SIDE_LEFT: normalizePath(import.meta.env.VITE_GAM_AD_UNIT_DESKTOP_SIDE_LEFT),
  SIDE_RIGHT: normalizePath(
    import.meta.env.VITE_GAM_AD_UNIT_DESKTOP_SIDE_RIGHT,
  ),
  BLOG_SIDEBAR: normalizePath(import.meta.env.VITE_GAM_AD_UNIT_BLOG_SIDEBAR),
};
const SIZES = {
  TOP: [
    [970, 250],
    [900, 250],
    [970, 90],
    [728, 90],
    [468, 60],
    [320, 100],
    [320, 50],
  ],
  BOTTOM: [
    [970, 90],
    [728, 90],
    [468, 60],
    [320, 100],
    [320, 50],
  ],
  MIDDLE_1: [
    [336, 280],
    [300, 250],
    [320, 100],
    [320, 50],
  ],
  MIDDLE_2: [
    [336, 280],
    [300, 250],
    [320, 100],
    [320, 50],
  ],
  BLOG_FEATURED: [
    [336, 280],
    [300, 250],
    [320, 100],
    [320, 50],
  ],
  MIDDLE_3: [[728, 90], [336, 280], [300, 250], [320, 100], [320, 50], "fluid"],
  NATIVE: ["fluid", [336, 280], [300, 250]],
  ANCHOR: [
    [320, 100],
    [320, 50],
  ],
  SIDE_LEFT: [
    [160, 600],
    [120, 600],
  ],
  SIDE_RIGHT: [
    [160, 600],
    [120, 600],
  ],
  BLOG_SIDEBAR: [
    [300, 250],
    [320, 100],
  ],
};
const BLOG_NORMAL_SIZES = [[300, 600], [300, 250]];
const BLOG_HORIZONTAL_SIZES = [[728, 90], [468, 60], [320, 100], [320, 50]];
const BLOG_POSTER_SIZES = [[300, 250], [250, 250]];

const getBlogNormalSizes = (availableWidth) =>
  availableWidth >= 300 ? BLOG_NORMAL_SIZES : [];

const getBlogHorizontalSizes = (availableWidth) => {
  if (availableWidth >= 728) return [[728, 90]];
  if (availableWidth >= 468) return [[468, 60]];
  if (availableWidth >= 320) return [[320, 100], [320, 50]];
  return [];
};

const getBlogPosterSizes = (availableWidth) => {
  if (availableWidth >= 300) return BLOG_POSTER_SIZES;
  if (availableWidth >= 250) return [[250, 250]];
  return [];
};

const buildMapping = (gt, key, blogNormal = false, horizontal = false, availableWidth = 0, poster = false) => {
  if (poster) {
    const eligibleSizes = getBlogPosterSizes(availableWidth);
    if (!eligibleSizes.length) return null;
    return gt.sizeMapping().addSize([0, 0], eligibleSizes).build();
  }
  if (horizontal)
    return gt.sizeMapping().addSize([0, 0], getBlogHorizontalSizes(availableWidth)).build();
  if (blogNormal) {
    const eligibleSizes = getBlogNormalSizes(availableWidth);
    return gt.sizeMapping().addSize([0, 0], eligibleSizes).build();
  }
  if (key === "BLOG_FEATURED")
    return gt
      .sizeMapping()
      .addSize([1024, 0], [[336, 280], [300, 250]])
      .addSize([768, 0], [[336, 280], [300, 250]])
      .addSize([0, 0], [[320, 100], [320, 50]])
      .build();
  if (key === "BLOG_SIDEBAR")
    return gt.sizeMapping().addSize([0, 0], SIZES.BLOG_SIDEBAR).build();
  if (key === "ANCHOR")
    return gt.sizeMapping().addSize([0, 0], SIZES.ANCHOR).build();
  if (key.startsWith("SIDE_"))
    return gt
      .sizeMapping()
      .addSize([1536, 0], SIZES[key])
      .addSize([0, 0], [])
      .build();
  if (key === "TOP")
    return gt
      .sizeMapping()
      .addSize([1024, 0], [[970, 250], [900, 250], [970, 90], [728, 90]])
      .addSize([768, 0], [[728, 90], [468, 60]])
      .addSize([0, 0], [[320, 100], [320, 50]])
      .build();
  if (key === "BOTTOM")
    return gt
      .sizeMapping()
      .addSize(
        [1024, 0],
        [
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
      .addSize(
        [0, 0],
        [
          [320, 100],
          [320, 50],
        ],
      )
      .build();
  if (key === "NATIVE" || key === "MIDDLE_3")
    return gt
      .sizeMapping()
      .addSize([768, 0], [[728, 90], [336, 280], [300, 250], "fluid"])
      .addSize([0, 0], [[336, 280], [300, 250], [320, 100], [320, 50], "fluid"])
      .build();
  return gt
    .sizeMapping()
    .addSize(
      [1024, 0],
      [
        [336, 280],
        [300, 250],
      ],
    )
    .addSize(
      [768, 0],
      [
        [336, 280],
        [300, 250],
      ],
    )
    .addSize(
      [0, 0],
      [
        [320, 100],
        [320, 50],
      ],
    )
    .build();
};

const getBlogFeaturedViewportBand = () => {
  if (typeof window === "undefined") return "desktop";
  if (window.innerWidth >= 752) return "desktop";
  if (window.innerWidth >= 352) return "mobile-large";
  if (window.innerWidth >= 336) return "mobile-medium";
  return "mobile-small";
};

const AdUnit = ({
  slot,
  size = "responsive",
  className = "",
  label = true,
  sticky = false,
  fallbackContent = null,
  enableRefresh = false,
  refreshInterval = 30000,
}) => {
  const id = useRef(
    `gam-${slot.toLowerCase()}-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`,
  );
  const slotRef = useRef(null);
  const [state, setState] = useState("loading");
  const [renderedSize, setRenderedSize] = useState(null);
  const [viewportBand, setViewportBand] = useState(getBlogFeaturedViewportBand);
  const refreshTimerRef = useRef(null);
  const key =
    size === "native" && PATHS.NATIVE
      ? "NATIVE"
      : size === "blog-featured"
        ? "BLOG_FEATURED"
        : slot;
  const path = PATHS[key] || "";
  const blogNormal = size === "blog-normal";
  const horizontal = size === "blog-horizontal";
  const poster = size === "blog-poster";
  const sizes = useMemo(
    () => poster ? BLOG_POSTER_SIZES : horizontal ? BLOG_HORIZONTAL_SIZES : blogNormal ? BLOG_NORMAL_SIZES : SIZES[key],
    [blogNormal, horizontal, poster, key],
  );
  useEffect(() => {
    if (key !== "BLOG_FEATURED" && !blogNormal && !horizontal && !poster) return undefined;
    const updateViewportBand = () =>
      setViewportBand(getBlogFeaturedViewportBand());
    window.addEventListener("resize", updateViewportBand);
    return () => window.removeEventListener("resize", updateViewportBand);
  }, [key, blogNormal, horizontal, poster]);
  useEffect(() => {
    setState("loading");
    setRenderedSize(null);
    if (!path || !sizes) {
      setState("empty");
      gamWarn("slot-not-configured", {
        slot,
        key,
        hasNetworkCode: Boolean(NETWORK),
        hasPath: Boolean(path),
        hasSizes: Boolean(sizes),
      });
      return undefined;
    }
    window.googletag = window.googletag || { cmd: [] };
    let active = true,
      timer;
    const owns = (event) => event.slot === slotRef.current;
    const handlers = {
      slotRequested: (event) => {
        if (!active || !owns(event)) return;
        clearTimeout(timer);
        setState("loading");
        gamLog("slot-requested", { slot, key, path, id: id.current });
        timer = window.setTimeout(() => {
          if (active && slotRef.current) {
            setState("empty");
            gamWarn("slot-timeout", { slot, key, path, timeoutMs: 15000 });
          }
        }, 15000);
      },
      slotResponseReceived: (event) =>
        owns(event) && gamLog("slot-response-received", { slot, key, path }),
      slotRenderEnded: (event) => {
        if (!active || !owns(event)) return;
        clearTimeout(timer);

        if (event.isEmpty) {
          setRenderedSize(null);
          setState("empty");
          gamLog("slot-no-fill", { slot, key, path, size: event.size });
          return;
        }

        setState("filled");
        setRenderedSize(Array.isArray(event.size) ? event.size : null);
        gamLog("slot-rendered", {
          slot,
          key,
          path,
          size: event.size,
          creativeId: event.creativeId,
          lineItemId: event.lineItemId,
        });

        if (enableRefresh && refreshInterval > 0) {
          refreshTimerRef.current = setInterval(() => {
            if (slotRef.current && document.visibilityState === "visible") {
              window.googletag?.cmd?.push(() => {
                gamLog("slot-refresh", { slot, key, path });
                window.googletag.pubads().refresh([slotRef.current]);
              });
            }
          }, refreshInterval);
        }
      },
      slotOnload: (event) =>
        owns(event) && gamLog("creative-iframe-loaded", { slot, key, path }),
      impressionViewable: (event) =>
        owns(event) && gamLog("impression-viewable", { slot, key, path }),
    };
    gamLog("slot-queueing", {
      slot,
      key,
      path,
      sizes,
      id: id.current,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    });
      window.googletag.cmd.push(() => {
        if (!active) return;
        const gt = window.googletag;
        try {
          const gamSlot = gt.defineSlot(path, sizes, id.current);
          if (!gamSlot) {
            setState("empty");
            gamWarn("define-slot-returned-null", {
              slot,
              key,
              path,
              id: id.current,
            });
            return;
          }
          const availableWidth = document.getElementById(id.current)?.clientWidth || window.innerWidth;
          const responsiveMapping = buildMapping(gt, key, blogNormal, horizontal, availableWidth, poster);
          if (!responsiveMapping) {
            setState("empty");
            gamWarn("size-mapping-invalid", { slot, key, path, sizes });
            return;
          }
          gamSlot.defineSizeMapping(responsiveMapping).addService(gt.pubads());
          slotRef.current = gamSlot;
          Object.entries(handlers).forEach(([eventName, handler]) =>
            gt.pubads().addEventListener(eventName, handler),
          );
          gamLog("slot-defined", {
            slot,
            key,
            path,
            sizes,
            id: id.current,
            apiReady: Boolean(gt.apiReady),
            pubadsReady: Boolean(gt.pubadsReady),
          });
          gt.display(id.current);
        } catch (error) {
          setState("empty");
          gamWarn("slot-exception", {
            slot,
            key,
            path,
            message: error instanceof Error ? error.message : String(error),
          });
        }
      });
    return () => {
      active = false;
      clearTimeout(timer);
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      // Detach this effect's slot synchronously. A queued GPT cleanup must not
      // read the mutable ref after a route change and destroy the next blog's
      // newly-created slot.
      const slotToDestroy = slotRef.current;
      slotRef.current = null;
      window.googletag?.cmd?.push(() => {
        Object.entries(handlers).forEach(([eventName, handler]) =>
          window.googletag.pubads().removeEventListener(eventName, handler),
        );
        if (slotToDestroy) window.googletag.destroySlots([slotToDestroy]);
        gamLog("slot-destroyed", { slot, key, path, hadSlot: Boolean(slotToDestroy) });
      });
    };
  }, [key, path, sizes, slot, enableRefresh, refreshInterval, viewportBand, blogNormal, horizontal, poster]);
  return (
    <aside
      className={`ad-unit-wrapper is-${state} ${sticky ? "ad-sticky" : ""} ${className}`}
      aria-label="Advertisement"
      style={renderedSize ? {
        "--ad-rendered-width": `${renderedSize[0]}px`,
        "--ad-rendered-height": `${renderedSize[1]}px`,
      } : undefined}
    >
      {label && state !== "filled" && <div className="ad-label">ADVERTISEMENT</div>}
      {path && sizes && <div className="ad-unit" id={id.current} />}
      {state === "empty" && fallbackContent && (
        <div className="ad-fallback">{fallbackContent}</div>
      )}
    </aside>
  );
};
export default AdUnit;


