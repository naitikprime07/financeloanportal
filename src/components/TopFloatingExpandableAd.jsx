import { useEffect, useRef, useState } from 'react';
import { gamLog, gamWarn } from './gamDebug';
import './TopFloatingExpandableAd.css';

const NETWORK = String(import.meta.env.VITE_GAM_NETWORK_CODE || '').trim().replace(/^\/+|\/+$/g, '');
const rawPath = String(import.meta.env.VITE_GAM_AD_UNIT_CONTENT_TOP || '').trim();
const AD_PATH = rawPath.startsWith('/') ? rawPath : NETWORK && rawPath ? `/${NETWORK}/${rawPath.replace(/^\/+/, '')}` : '';
const AD_SIZES = [
  [970, 250], [900, 250], [970, 90], [728, 90], [468, 60],
  [336, 280], [320, 250], [300, 250], [320, 100], [320, 50], 'fluid',
];
const buildSizeMapping = (gt) => gt.sizeMapping()
  .addSize([1024, 0], [[970, 250], [900, 250], [970, 90], [728, 90]])
  .addSize([768, 0], [[728, 90], [468, 60]])
  .addSize([336, 0], ['fluid', [336, 280], [320, 250], [300, 250]])
  .addSize([320, 0], ['fluid', [320, 250], [300, 250]])
  .addSize([0, 0], ['fluid', [300, 250]])
  .build();

const getViewportWidth = () => typeof document === 'undefined'
  ? 0
  : document.documentElement.clientWidth || window.innerWidth || 0;

const readPixelDimension = (value) => {
  const raw = String(value || '').trim();
  if (!/^\d+(?:\.\d+)?(?:px)?$/.test(raw)) return 0;
  return Number.parseFloat(raw);
};

const TopFloatingExpandableAd = () => {
  const id = useRef(`gam-top-floating-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`);
  const slotRef = useRef(null);
  const reportedSizeRef = useRef(null);
  const measureFrameRef = useRef(0);
  const [status, setStatus] = useState('loading');
  const [creativeSize, setCreativeSize] = useState(null);
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth);
  const [transitionDirection, setTransitionDirection] = useState('collapsing');
  const isMobile = viewportWidth < 768;

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(getViewportWidth());
    updateViewportWidth();
    window.addEventListener('resize', updateViewportWidth);
    window.visualViewport?.addEventListener('resize', updateViewportWidth);
    return () => {
      window.removeEventListener('resize', updateViewportWidth);
      window.visualViewport?.removeEventListener('resize', updateViewportWidth);
    };
  }, []);

  useEffect(() => {
    if (!AD_PATH) {
      setStatus('unavailable');
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
            ? [...root.querySelectorAll('iframe')].reverse().concat(root.firstElementChild || [])
            : [];

          const measurements = elements.flatMap((element) => {
            if (!element) return [];
            const width = readPixelDimension(element.getAttribute?.('width'))
              || readPixelDimension(element.style?.width);
            const height = readPixelDimension(element.getAttribute?.('height'))
              || readPixelDimension(element.style?.height);
            if (width > 0 && height > 0) return [[width, height]];
            const rect = element.getBoundingClientRect?.();
            return rect?.width > 0 && rect?.height > 0 ? [[rect.width, rect.height]] : [];
          });
          const measured = measurements.sort((a, b) => (b[0] * b[1]) - (a[0] * a[1]))[0] || null;

          const finalSize = measured || reportedSizeRef.current;
          if (finalSize?.[0] > 0 && finalSize?.[1] > 0) {
            setCreativeSize(finalSize);
            gamLog('top-floating-measured', { eventSize: reportedSizeRef.current, measured: finalSize });
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
        setStatus('unavailable');
        gamLog('top-floating-no-fill', { path: AD_PATH });
        return;
      }

      const size = Array.isArray(event.size) ? event.size.map(Number).filter(Number.isFinite) : null;
      reportedSizeRef.current = size?.length === 2 && size.every((value) => value > 0) ? size : null;
      if (reportedSizeRef.current) setCreativeSize(reportedSizeRef.current);
      setStatus('expanded');
      gamLog('top-floating-rendered', { path: AD_PATH, size: event.size });
      measureCreative();
    };

    const onLoad = (event) => {
      if (!active || !owns(event)) return;
      measureCreative();
      gamLog('top-floating-iframe-loaded', { path: AD_PATH });
    };

    window.googletag.cmd.push(() => {
      if (!active) return;
      const gt = window.googletag;
      try {
        const gamSlot = gt.defineSlot(AD_PATH, AD_SIZES, id.current);
        if (!gamSlot) {
          setStatus('unavailable');
          return;
        }
        gamSlot.defineSizeMapping(buildSizeMapping(gt)).addService(gt.pubads());
        slotRef.current = gamSlot;
        gt.pubads().addEventListener('slotRenderEnded', onRender);
        gt.pubads().addEventListener('slotOnload', onLoad);
        gt.display(id.current);
        timeoutId = window.setTimeout(() => {
          if (!active) return;
          setCreativeSize(null);
          setStatus('unavailable');
          gamWarn('top-floating-timeout', { path: AD_PATH, timeoutMs: 15000 });
        }, 15000);
      } catch (error) {
        setCreativeSize(null);
        setStatus('unavailable');
        gamWarn('top-floating-exception', { message: error instanceof Error ? error.message : String(error) });
      }
    });

    return () => {
      active = false;
      window.cancelAnimationFrame(measureFrameRef.current);
      window.clearTimeout(timeoutId);
      const slotToDestroy = slotRef.current;
      slotRef.current = null;
      window.googletag?.cmd?.push(() => {
        window.googletag.pubads().removeEventListener('slotRenderEnded', onRender);
        window.googletag.pubads().removeEventListener('slotOnload', onLoad);
        if (slotToDestroy) window.googletag.destroySlots([slotToDestroy]);
      });
    };
  }, []);

  const isFilled = ['expanded', 'compact', 'collapsed'].includes(status);
  const availableWidth = Math.max(viewportWidth, 1);
  const mobileScale = creativeSize ? availableWidth / creativeSize[0] : 1;
  const mobileHeight = creativeSize ? creativeSize[1] * mobileScale : 0;
  const compactScale = creativeSize
    ? Math.min(1, 110 / creativeSize[1], availableWidth / creativeSize[0])
    : 1;
  const style = creativeSize ? {
    '--top-ad-width': `${creativeSize[0]}px`,
    '--top-ad-height': `${creativeSize[1]}px`,
    '--top-ad-mobile-scale': mobileScale,
    '--top-ad-mobile-height': `${mobileHeight}px`,
    '--top-ad-compact-scale': compactScale,
    '--top-ad-compact-width': `${creativeSize[0] * compactScale}px`,
    '--top-ad-compact-height': `${creativeSize[1] * compactScale}px`,
  } : undefined;

  const toggleAd = () => {
    setStatus((current) => {
      // Mobile: Simple toggle between expanded and collapsed only
      if (isMobile) {
        if (current === 'expanded') return 'collapsed';
        if (current === 'collapsed') return 'expanded';
        // If somehow in compact state on mobile, treat as expanded
        if (current === 'compact') return 'collapsed';
        return current;
      }

      // Desktop: Keep 3-state behavior (expanded → compact → collapsed → compact → expanded)
      if (current === 'expanded') {
        setTransitionDirection('collapsing');
        return 'compact';
      }
      if (current === 'compact') return transitionDirection === 'collapsing' ? 'collapsed' : 'expanded';
      if (current === 'collapsed') {
        setTransitionDirection('expanding');
        return 'compact';
      }
      return current;
    });
  };

  const expanding = status === 'collapsed' || transitionDirection === 'expanding';
  return (
    <>
      <aside className={`top-floating-ad is-${status}`} style={style} aria-label="Advertisement">
        {!isFilled && <div className="top-floating-label">ADVERTISEMENT</div>}
        <div className="top-floating-creative" aria-hidden={!isFilled || status === 'collapsed'}>
          <div className="top-floating-slot" id={id.current} />
        </div>
        {isFilled && (
          <button type="button" className="top-floating-toggle" onClick={toggleAd}
            aria-expanded={status === 'expanded'}
            aria-label={expanding ? 'Expand advertisement' : 'Collapse advertisement'}>
            <span>{status === 'collapsed' ? 'Expand' : 'Advertisement'}</span>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 10 4-4 4 4" /></svg>
          </button>
        )}
      </aside>
      <div className={`top-floating-clearance is-${status}`} style={style} aria-hidden="true" />
    </>
  );
};

export default TopFloatingExpandableAd;
