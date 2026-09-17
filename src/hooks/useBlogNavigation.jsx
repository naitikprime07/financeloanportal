import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gamLog, gamWarn } from '../components/gamDebug';
import { getCurrentHost } from '../config/siteConfig';
import {
  isRewardCompletedForPageSession,
  markRewardCompletedForPageSession,
} from '../utils/rewardSessionState';
import GenderSelectionModal from '../components/GenderSelectionModal';

const NETWORK = String(import.meta.env.VITE_GAM_NETWORK_CODE || '').trim().replace(/^\/+|\/+$/g, '');
const normalizePath = (value) => {
  const path = String(value || '').trim();
  if (!path) return '';
  if (path.startsWith('/')) return path;
  return NETWORK ? `/${NETWORK}/${path.replace(/^\/+/, '')}` : '';
};
const REWARDED_PATH = normalizePath(
  import.meta.env.VITE_GAM_AD_UNIT_REWARDED || import.meta.env.VITE_GAM_AD_UNIT_CONTENT_TOP
);


const isSubdomain = (hostname) => {
  if (!hostname) return false;
  const cleanHost = hostname.split(':')[0].toLowerCase();
  const mainDomainPatterns = ['financeloanportal.com', 'www.financeloanportal.com', 'localhost', '127.0.0.1'];
  if (mainDomainPatterns.includes(cleanHost)) return false;
  if (cleanHost.endsWith('.financeloanportal.com')) {
    if (cleanHost === 'www.financeloanportal.com') return false;
    return true;
  }
  if (cleanHost === 'localhost' || cleanHost === '127.0.0.1') {
    const port = hostname.split(':')[1];
    if (port && port !== '5173') return true;
  }
  return false;
};


const BlogNavigationContext = createContext(null);

const useBlogNavigationController = () => {
  const navigate = useNavigate();
  const [isGenderModalOpen, setIsGenderModalOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState(null);
  const [adStatus, setAdStatus] = useState('idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const pendingBlogSlugRef = useRef(null);
  const slotRef = useRef(null);
  const showRewardedRef = useRef(null);
  const rewardGrantedRef = useRef(false);
  const navigationLockedRef = useRef(false);
  const currentHostnameRef = useRef(getCurrentHost());
  const isSubdomainRef = useRef(isSubdomain(getCurrentHost()));
  const completedRef = useRef(false);

  useEffect(() => {
    const hostname = getCurrentHost();
    currentHostnameRef.current = hostname;
    isSubdomainRef.current = isSubdomain(hostname);
    completedRef.current = isRewardCompletedForPageSession(hostname);
    gamLog('blog-nav-init', { hostname, isSubdomain: isSubdomainRef.current, completed: completedRef.current });
    // This controller is mounted once by Layout, so the gate covers every route.
    if (isSubdomainRef.current && !completedRef.current) {
      setIsGenderModalOpen(true);
      gamLog('subdomain-first-visit-auto-popup', { hostname });
    }
    if (!isSubdomainRef.current || completedRef.current) {
      setAdStatus('disabled');
      return undefined;
    }
    if (!REWARDED_PATH) {
      setAdStatus('failed');
      gamWarn('blog-nav-rewarded-not-configured', { variables: ['VITE_GAM_AD_UNIT_REWARDED', 'VITE_GAM_AD_UNIT_CONTENT_TOP'] });
      return undefined;
    }
    window.googletag = window.googletag || { cmd: [] };
    let active = true;
    let timeoutId;
    const handlers = {
      rewardedSlotReady: (event) => {
        if (!active || event.slot !== slotRef.current) return;
        clearTimeout(timeoutId);
        showRewardedRef.current = event.makeRewardedVisible;
        setAdStatus('ready');
        gamLog('blog-nav-rewarded-ready', { path: REWARDED_PATH });
      },
      rewardedSlotGranted: (event) => {
        if (!active || event.slot !== slotRef.current) return;
        rewardGrantedRef.current = true;
        setAdStatus('granted');
        gamLog('blog-nav-rewarded-granted', { path: REWARDED_PATH });
      },
      rewardedSlotClosed: (event) => {
        if (!active || event.slot !== slotRef.current) return;
        showRewardedRef.current = null;
        setAdStatus('closed');
        gamLog('blog-nav-rewarded-closed', { granted: rewardGrantedRef.current });
        if (rewardGrantedRef.current) {
          const hostname = currentHostnameRef.current;
          markRewardCompletedForPageSession(hostname);
          completedRef.current = true;
          setIsGenderModalOpen(false);
          setIsProcessing(false);
          pendingBlogSlugRef.current = null;
          rewardGrantedRef.current = false;
          navigationLockedRef.current = false;
          setSelectedGender(null);
          setAdStatus('disabled');
        } else {
          setIsGenderModalOpen(false);
          setIsProcessing(false);
          pendingBlogSlugRef.current = null;
          rewardGrantedRef.current = false;
          navigationLockedRef.current = false;
          setSelectedGender(null);
        }
      },
      slotRenderEnded: (event) => {
        if (!active || event.slot !== slotRef.current) return;
        if (event.isEmpty) {
          clearTimeout(timeoutId);
          setAdStatus('failed');
          gamWarn('blog-nav-rewarded-no-fill', { path: REWARDED_PATH });
          setIsGenderModalOpen(false);
          setIsProcessing(false);
          pendingBlogSlugRef.current = null;
          navigationLockedRef.current = false;
          setSelectedGender(null);
        }
      },
    };
    const initTimeout = setTimeout(() => {
      window.googletag.cmd.push(() => {
        if (!active) return;
        const gt = window.googletag;
        try {
          setAdStatus('loading');
          const rewardedSlot = gt.defineOutOfPageSlot(REWARDED_PATH, gt.enums.OutOfPageFormat.REWARDED);
          if (!rewardedSlot) {
            setAdStatus('failed');
            gamWarn('blog-nav-rewarded-unsupported', { path: REWARDED_PATH });
            setIsGenderModalOpen(false);
            return;
          }
          rewardedSlot.addService(gt.pubads());
          slotRef.current = rewardedSlot;
          Object.entries(handlers).forEach(([eventName, handler]) => gt.pubads().addEventListener(eventName, handler));
          gt.display(rewardedSlot);
          gamLog('blog-nav-rewarded-defined', { path: REWARDED_PATH });
          timeoutId = setTimeout(() => {
            if (active) {
              setAdStatus('failed');
              setIsGenderModalOpen(false);
              setIsProcessing(false);
              gamWarn('blog-nav-rewarded-timeout', { path: REWARDED_PATH, timeoutMs: 30000 });
            }
          }, 30000);
        } catch (error) {
          setAdStatus('failed');
          gamWarn('blog-nav-rewarded-exception', { path: REWARDED_PATH, message: error instanceof Error ? error.message : String(error) });
        }
      });
    }, 100);
    return () => {
      active = false;
      clearTimeout(timeoutId);
      clearTimeout(initTimeout);
      const slotToDestroy = slotRef.current;
      slotRef.current = null;
      showRewardedRef.current = null;
      window.googletag?.cmd?.push(() => {
        Object.entries(handlers).forEach(([eventName, handler]) => window.googletag.pubads().removeEventListener(eventName, handler));
        if (slotToDestroy) window.googletag.destroySlots([slotToDestroy]);
      });
    };
  }, []);

  const navigateToBlog = useCallback((blogSlug, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    // Blog clicks remain independent; BlogInterstitialGate handles the visit.
    gamLog('blog-nav-open', { blogSlug, hostname: currentHostnameRef.current });
    navigate(`/blog/${blogSlug}`);
  }, [navigate]);

  const handleGenderContinue = useCallback((gender) => {
    setSelectedGender(gender);
    setIsProcessing(true);
    gamLog('blog-nav-gender-selected', { gender, blogSlug: pendingBlogSlugRef.current, hostname: currentHostnameRef.current });
    if (adStatus === 'ready' && showRewardedRef.current) {
      try {
        setAdStatus('showing');
        showRewardedRef.current();
        gamLog('blog-nav-rewarded-shown', { path: REWARDED_PATH, gender });
      } catch (error) {
        setAdStatus('failed');
        gamWarn('blog-nav-rewarded-show-failed', { message: error instanceof Error ? error.message : String(error) });
        setIsGenderModalOpen(false);
        setIsProcessing(false);
        pendingBlogSlugRef.current = null;
        navigationLockedRef.current = false;
        setSelectedGender(null);
      }
    } else {
      gamWarn('blog-nav-ad-not-available', { adStatus });
      setIsGenderModalOpen(false);
      setIsProcessing(false);
      pendingBlogSlugRef.current = null;
      navigationLockedRef.current = false;
      setSelectedGender(null);
    }
  }, [adStatus]);


  return { navigateToBlog, isGenderModalOpen, selectedGender, adStatus, isProcessing, handleGenderContinue };
};
export const BlogNavigationProvider = ({ children }) => {
  const value = useBlogNavigationController();
  return (
    <BlogNavigationContext.Provider value={value}>
      {children}
      <GenderSelectionModal
        isOpen={value.isGenderModalOpen}
        onContinue={value.handleGenderContinue}
      />
    </BlogNavigationContext.Provider>
  );
};

export const useBlogNavigation = () => {
  const value = useContext(BlogNavigationContext);
  if (!value) throw new Error('useBlogNavigation must be used within BlogNavigationProvider');
  return value;
};
