import { useEffect } from "react";
import { gamLog, gamWarn } from "./gamDebug";

const NETWORK = String(import.meta.env.VITE_GAM_NETWORK_CODE || "")
  .trim()
  .replace(/^\/+|\/+$/g, "");
const rawPath = String(import.meta.env.VITE_GAM_AD_UNIT_MOBILE_ANCHOR || "").trim();
const AD_PATH = rawPath.startsWith("/")
  ? rawPath
  : NETWORK && rawPath
    ? `/${NETWORK}/${rawPath.replace(/^\/+/, "")}`
    : "";

const BottomAnchorAd = () => {
  useEffect(() => {
    if (!AD_PATH) {
      gamWarn("bottom-anchor-not-configured", {
        variable: "VITE_GAM_AD_UNIT_MOBILE_ANCHOR",
      });
      return;
    }

    window.googletag = window.googletag || { cmd: [] };
    window.googletag.cmd.push(() => {
      const gt = window.googletag;

      // This slot belongs to the document, not a route. The global guard keeps
      // React StrictMode, route changes, and HMR from requesting it twice.
      if (window.__financeloanportalBottomAnchorAttempted) {
        gamLog("bottom-anchor-already-initialized", { path: AD_PATH });
        return;
      }
      window.__financeloanportalBottomAnchorAttempted = true;

      try {
        const slot = gt.defineOutOfPageSlot(
          AD_PATH,
          gt.enums.OutOfPageFormat.BOTTOM_ANCHOR,
        );

        if (!slot) {
          gamWarn("bottom-anchor-unsupported", {
            path: AD_PATH,
            reason: "GPT determined that the page or device is ineligible",
          });
          return;
        }

        slot.addService(gt.pubads());
        window.__financeloanportalBottomAnchorSlot = slot;
        const markAnchorShell = (event) => {
          if (event.slot !== slot) return;
          const slotElement = document.getElementById(slot.getSlotElementId());
          let shell = slotElement;
          while (shell?.parentElement && shell.parentElement !== document.body) {
            const position = window.getComputedStyle(shell).position;
            if (position === "fixed" || position === "sticky") break;
            shell = shell.parentElement;
          }
          shell?.setAttribute("data-financeloanportal-bottom-anchor", "true");
        };
        gt.pubads().addEventListener("slotRenderEnded", markAnchorShell);
        window.__financeloanportalBottomAnchorRenderHandler = markAnchorShell;
        gamLog("bottom-anchor-defined", {
          path: AD_PATH,
          format: "BOTTOM_ANCHOR",
        });
        gt.display(slot);
      } catch (error) {
        gamWarn("bottom-anchor-exception", {
          message: error instanceof Error ? error.message : String(error),
        });
      }
    });
  }, []);

  // GPT creates and manages the native anchor container and controls.
  return null;
};

export default BottomAnchorAd;
