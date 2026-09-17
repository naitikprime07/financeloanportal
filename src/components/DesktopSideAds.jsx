import { useEffect, useState } from 'react';
import AdUnit from './AdUnit';

const SIDE_AD_HEIGHT = 600;
const SIDE_AD_GAP = 16;

const DesktopSideAds = () => {
  const [layout, setLayout] = useState(() => ({
    isWideDesktop: window.matchMedia('(min-width: 1536px)').matches,
    top: SIDE_AD_GAP,
    footerBlocked: false,
  }));

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1536px)');
    let frameId = 0;

    const measure = () => {
      frameId = 0;
      const isWideDesktop = query.matches;
      const header = document.querySelector('.header');
      const footer = document.querySelector('.footer');
      const headerBottom = header?.getBoundingClientRect().bottom ?? 0;
      const top = Math.max(SIDE_AD_GAP, Math.round(headerBottom + SIDE_AD_GAP));
      const footerTop = footer?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
      const footerBlocked = footerTop <= top + SIDE_AD_HEIGHT + SIDE_AD_GAP;

      setLayout((current) => (
        current.isWideDesktop === isWideDesktop
        && current.top === top
        && current.footerBlocked === footerBlocked
          ? current
          : { isWideDesktop, top, footerBlocked }
      ));
    };

    const scheduleMeasure = () => {
      if (!frameId) frameId = window.requestAnimationFrame(measure);
    };

    measure();
    query.addEventListener('change', scheduleMeasure);
    window.addEventListener('resize', scheduleMeasure, { passive: true });
    window.addEventListener('scroll', scheduleMeasure, { passive: true });

    return () => {
      query.removeEventListener('change', scheduleMeasure);
      window.removeEventListener('resize', scheduleMeasure);
      window.removeEventListener('scroll', scheduleMeasure);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  if (!layout.isWideDesktop) return null;

  const railStyle = { '--side-ad-top': `${layout.top}px` };
  const railClass = `desktop-side-ad${layout.footerBlocked ? ' is-footer-blocked' : ''}`;

  return (
    <>
      <div className={`${railClass} desktop-side-ad-left`} style={railStyle}>
        <AdUnit slot="SIDE_LEFT" size="vertical" />
      </div>
      <div className={`${railClass} desktop-side-ad-right`} style={railStyle}>
        <AdUnit slot="SIDE_RIGHT" size="vertical" />
      </div>
    </>
  );
};

export default DesktopSideAds;
