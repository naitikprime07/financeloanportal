import { useEffect, useState } from 'react';
import AdUnit from './AdUnit';

const MobileAnchorAd = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Only show on mobile
  if (!isMobile) {
    return null;
  }

  return <AdUnit slot="ANCHOR" sticky={true} label={true} />;
};

export default MobileAnchorAd;
