import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gamLog, gamWarn } from "./gamDebug";
import nullButton from "../assets/buttons/nullButton.svg";
import "./BlogRewardedAd.css";

const NETWORK = String(import.meta.env.VITE_GAM_NETWORK_CODE || "")
  .trim()
  .replace(/^\/+|\/+$/g, "");
const normalizePath = (value) => {
  const path = String(value || "").trim();
  if (!path) return "";
  if (path.startsWith("/")) return path;
  return NETWORK ? `/${NETWORK}/${path.replace(/^\/+/, "")}` : "";
};
const REWARDED_PATH = normalizePath(
  import.meta.env.VITE_GAM_AD_UNIT_REWARDED ||
    import.meta.env.VITE_GAM_AD_UNIT_CONTENT_TOP,
);

const BlogRewardedAd = ({
  post,
  targetSlug,
  targetSlugs = [],
  ctaText = "\u0905\u092d\u0940 \u0906\u0935\u0947\u0926\u0928 \u0915\u0930\u0947\u0902",
  renderTrigger,
}) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("idle");
  const [activeTargetSlug, setActiveTargetSlug] = useState(null);
  const slotRef = useRef(null);
  const showRewardedRef = useRef(null);
  const pendingTargetRef = useRef(null);
  const pendingTargetsRef = useRef([]);
  const defaultTargetsRef = useRef([]);
  const defaultTargetRef = useRef(targetSlug);
  const scrollPositionRef = useRef(0);
  const openingRef = useRef(false);
  const rewardGrantedRef = useRef(false);
  const redirectedRef = useRef(false);
  const queuedOpenRef = useRef(false);
  defaultTargetRef.current = targetSlug;
  defaultTargetsRef.current = Array.from(
    new Set(
      targetSlugs.filter(
        (slug) => typeof slug === "string" && slug && slug !== post.id,
      ),
    ),
  );
  const pickRandomTarget = (targets = []) => {
    if (!targets.length) return defaultTargetRef.current;
    return targets[Math.floor(Math.random() * targets.length)];
  };

  const navigateOnce = (destination) => {
    if (
      !destination ||
      destination === post.id ||
      redirectedRef.current
    )
      return false;
    redirectedRef.current = true;
    navigate("/blog/" + destination);
    return true;
  };

  useEffect(() => {
    if (!REWARDED_PATH) {
      setStatus("failed");
      gamWarn("blog-rewarded-not-configured", {
        variables: [
          "VITE_GAM_AD_UNIT_REWARDED",
          "VITE_GAM_AD_UNIT_CONTENT_TOP",
        ],
      });
      return undefined;
    }

    setStatus("loading");
    setActiveTargetSlug(null);
    openingRef.current = false;
    rewardGrantedRef.current = false;
    redirectedRef.current = false;
    queuedOpenRef.current = false;
    pendingTargetRef.current = null;
    pendingTargetsRef.current = [];
    window.googletag = window.googletag || { cmd: [] };

    let active = true;
    let timeoutId;
    let initDelayTimer;
    const owns = (event) => event.slot === slotRef.current;

    const failSlot = (eventName, details = {}) => {
      const shouldContinue = queuedOpenRef.current;
      const destination =
        pendingTargetRef.current ||
        pickRandomTarget(pendingTargetsRef.current);
      queuedOpenRef.current = false;
      window.clearTimeout(timeoutId);
      showRewardedRef.current = null;
      openingRef.current = false;
      setStatus("failed");
      if (slotRef.current) {
        window.googletag?.destroySlots?.([slotRef.current]);
        slotRef.current = null;
      }
      gamWarn(eventName, { path: REWARDED_PATH, ...details });
      if (shouldContinue) {
        window.requestAnimationFrame(() => navigateOnce(destination));
      }
    };

    const startRequestTimeout = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        if (!active || !slotRef.current) return;
        failSlot("blog-rewarded-timeout", { timeoutMs: 30000 });
      }, 30000);
    };

    const handlers = {
      slotRequested: (event) => {
        if (!active || !owns(event)) return;
        startRequestTimeout();
        gamLog("blog-rewarded-requested", { path: REWARDED_PATH });
      },
      slotRenderEnded: (event) => {
        if (!active || !owns(event)) return;
        if (event.isEmpty) {
          failSlot("blog-rewarded-no-fill");
        }
      },
      rewardedSlotReady: (event) => {
        if (!active || !owns(event)) return;
        window.clearTimeout(timeoutId);
        const makeRewardedVisible = event.makeRewardedVisible;
        showRewardedRef.current = makeRewardedVisible;
        gamLog("blog-rewarded-ready", { path: REWARDED_PATH });
        if (!queuedOpenRef.current) {
          setStatus("ready");
          return;
        }

        queuedOpenRef.current = false;
        rewardGrantedRef.current = false;
        try {
          makeRewardedVisible();
          setStatus("showing");
        } catch (error) {
          failSlot("blog-rewarded-open-failed", {
            message: error instanceof Error ? error.message : String(error),
          });
        }
      },
      rewardedSlotGranted: (event) => {
        if (!active || !owns(event)) return;
        rewardGrantedRef.current = true;
        setStatus("closable");
        gamLog("blog-rewarded-granted", {
          path: REWARDED_PATH,
          payload: event.payload,
        });
      },
      rewardedSlotClosed: (event) => {
        if (!active || !owns(event)) return;
        showRewardedRef.current = null;
        openingRef.current = false;
        setStatus("closed");

        const destination =
          pendingTargetRef.current ||
          pickRandomTarget(pendingTargetsRef.current);
        window.requestAnimationFrame(() => {
          if (
            rewardGrantedRef.current &&
            destination &&
            destination !== post.id &&
            !redirectedRef.current
          ) {
            redirectedRef.current = true;
            navigate("/blog/" + destination);
            return;
          }
          pendingTargetRef.current = null;
          pendingTargetsRef.current = [];
          setActiveTargetSlug(null);
          window.scrollTo({
            top: scrollPositionRef.current,
            behavior: "instant",
          });
        });
        gamLog("blog-rewarded-closed", { path: REWARDED_PATH, destination });
      },
    };

    initDelayTimer = window.setTimeout(() => {
      window.googletag.cmd.push(() => {
        if (!active) return;
        const gt = window.googletag;
        try {
          const rewardedSlot = gt.defineOutOfPageSlot(
            REWARDED_PATH,
            gt.enums.OutOfPageFormat.REWARDED,
          );
          if (!rewardedSlot) {
            failSlot("blog-rewarded-unsupported");
            return;
          }
          rewardedSlot.addService(gt.pubads());
          slotRef.current = rewardedSlot;
          Object.entries(handlers).forEach(([eventName, handler]) =>
            gt.pubads().addEventListener(eventName, handler),
          );
          gt.display(rewardedSlot);
        } catch (error) {
          failSlot("blog-rewarded-exception", {
            message: error instanceof Error ? error.message : String(error),
          });
        }
      });
    }, 50);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      window.clearTimeout(initDelayTimer);
      showRewardedRef.current = null;
      const slotToDestroy = slotRef.current;
      slotRef.current = null;
      window.googletag?.cmd?.push(() => {
        Object.entries(handlers).forEach(([eventName, handler]) =>
          window.googletag.pubads().removeEventListener(eventName, handler),
        );
        if (slotToDestroy) window.googletag.destroySlots([slotToDestroy]);
      });
    };
  }, [post.id, navigate]);

  const openRewardedAd = (requestedTarget) => {
    const requestedTargets = Array.isArray(requestedTarget)
      ? Array.from(
          new Set(
            requestedTarget.filter(
              (slug) =>
                typeof slug === "string" && slug && slug !== post.id,
            ),
          ),
        )
      : typeof requestedTarget === "string"
        ? []
        : defaultTargetsRef.current;
    const requestedDestination =
      typeof requestedTarget === "string" ? requestedTarget : "";
    const destination =
      requestedDestination ||
      (requestedTargets.length ? "" : defaultTargetRef.current);
    if (
      (!destination && !requestedTargets.length) ||
      destination === post.id ||
      openingRef.current ||
      redirectedRef.current
    )
      return;

    pendingTargetRef.current = destination || null;
    pendingTargetsRef.current = requestedTargets;
    setActiveTargetSlug(destination || requestedTargets[0] || null);

    if (status === "failed") {
      navigateOnce(destination || pickRandomTarget(requestedTargets));
      return;
    }

    scrollPositionRef.current = window.scrollY;
    rewardGrantedRef.current = false;
    openingRef.current = true;

    if (status === "idle" || status === "loading") {
      queuedOpenRef.current = true;
      setStatus("waiting");
      return;
    }

    if (status !== "ready" || !showRewardedRef.current) {
      openingRef.current = false;
      return;
    }

    setStatus("opened");
    try {
      showRewardedRef.current();
      setStatus("showing");
    } catch (error) {
      showRewardedRef.current = null;
      openingRef.current = false;
      setStatus("failed");
      gamWarn("blog-rewarded-open-failed", {
        message: error instanceof Error ? error.message : String(error),
      });
      navigateOnce(destination || pickRandomTarget(requestedTargets));
    }
  };

  const buttonDisabled =
    openingRef.current ||
    ["waiting", "opened", "showing", "closable", "closed"].includes(status);
  const isBusy = buttonDisabled;
  if (renderTrigger) {
    return (
      <>
        {(status === "idle" ||
          status === "loading" ||
          status === "failed") && (
          <aside className="blog-rewarded-fallback" aria-label="Advertisement">
            ADVERTISEMENT
          </aside>
        )}
        {renderTrigger({
          status,
          isBusy,
          activeTargetSlug,
          openRewardedAd,
        })}
      </>
    );
  }

  return (
    <>
      {(status === "idle" ||
        status === "loading" ||
        status === "failed") && (
        <aside className="blog-rewarded-fallback" aria-label="Advertisement">
          ADVERTISEMENT
        </aside>
      )}
      <aside
        className={`blog-rewarded-card is-${status}`}
        aria-label="Rewarded advertisement"
      >
        <div className="loan-inline-cta">
          <button
            className="svg-cta-button"
            type="button"
            onClick={() => openRewardedAd()}
            disabled={buttonDisabled}
          >
            <img src={nullButton} alt="" aria-hidden="true" />
            <span className="svg-cta-label">
              {["idle", "loading", "ready", "failed"].includes(status) &&
                ctaText}
              {(["waiting", "opened", "showing"].includes(status)) &&
                "विज्ञापन जारी है…"}
              {status === "closable" && "विज्ञापन पूरा करें"}
              {status === "closed" && "विज्ञापन पूर्ण हुआ"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default BlogRewardedAd;
