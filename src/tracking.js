import { useEffect } from 'react';

const recentEvents = new Map();
const DUPLICATE_WINDOW_MS = 1500;
export const BLOG_VIEW_EVENT_NAME = (import.meta.env.VITE_BLOG_VIEW_EVENT_NAME || 'blog_view').trim() || 'blog_view';
const trackingDebug = import.meta.env.VITE_TRACKING_DEBUG === 'true';

const applyPixelTemplate = (template, eventName, params) => {
  const values = {
    event: eventName,
    event_name: eventName,
    path: params.page_path || window.location.pathname,
    url: params.page_location || window.location.href,
    title: params.blog_title || document.title,
    slug: params.blog_slug || '',
    category: params.blog_category || '',
  };

  return Object.entries(values).reduce(
    (url, [key, value]) => url.replaceAll(`{${key}}`, encodeURIComponent(value)),
    template,
  );
};

export const trackCustomEvent = (eventName, params = {}, options = {}) => {
  if (!eventName || typeof window === 'undefined') return false;

  const dedupeKey = options.dedupeKey || `${eventName}:${window.location.pathname}`;
  const now = Date.now();
  const previous = recentEvents.get(dedupeKey) || 0;
  if (now - previous < DUPLICATE_WINDOW_MS) return false;
  recentEvents.set(dedupeKey, now);

  const eventParams = {
    ...params,
    event_name: eventName,
    page_path: params.page_path || window.location.pathname,
    page_location: params.page_location || window.location.href,
  };

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams);
  } else {
    window.dataLayer.push({ event: eventName, ...eventParams });
  }

  if (options.metaPixelId && typeof window.fbq === 'function') {
    window.fbq('trackSingleCustom', options.metaPixelId, eventName, eventParams);
  }

  window.dispatchEvent(new CustomEvent(`finvexa:${eventName}`, { detail: eventParams }));

  if (trackingDebug) console.info('[tracking]', eventName, eventParams);

  const pixelTemplate = import.meta.env.VITE_BLOG_VIEW_PIXEL_URL || '';
  if (pixelTemplate && options.firePixel !== false) {
    const pixel = new Image(1, 1);
    pixel.width = 1;
    pixel.height = 1;
    pixel.alt = '';
    pixel.referrerPolicy = 'strict-origin-when-cross-origin';
    pixel.src = applyPixelTemplate(pixelTemplate, eventName, eventParams);
  }

  return true;
};

export const useBlogViewTracking = (post) => {
  useEffect(() => {
    if (!post?.id) return;

    trackCustomEvent(
      BLOG_VIEW_EVENT_NAME,
      {
        blog_slug: post.id,
        blog_title: post.title,
        blog_category: post.categoryName || post.category,
        page_path: window.location.pathname,
        page_location: window.location.href,
      },
      { dedupeKey: `${BLOG_VIEW_EVENT_NAME}:${post.id}:${window.location.pathname}` },
    );
  }, [post?.id, post?.title, post?.category, post?.categoryName]);
};