/**
 * Centralized multi-domain site configuration.
 * Required production hosts are authoritative. VITE_DOMAIN_CONFIG may add
 * future hosts, but cannot override the final mappings listed here.
 */

const SUPPORTED_LANGUAGES = new Set(["hi", "en"]);

const normalizeHost = (value = "") => {
  const candidate = String(value).trim();
  if (!candidate) return "";
  try {
    const url = new URL(
      candidate.includes("://") ? candidate : "http://" + candidate,
    );
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    return isLocal && url.port ? `${hostname}:${url.port}` : hostname;
  } catch {
    return "";
  }
};

const normalizePriorityBlog = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/-english$/, "") || null;

const addDomainConfig = (configs, domain, config = {}) => {
  if (!config || typeof config !== "object") return;

  const host = normalizeHost(domain);
  const language = String(config.language || "")
    .trim()
    .toLowerCase();
  if (!host || !SUPPORTED_LANGUAGES.has(language)) return;

  const priorityBlog = normalizePriorityBlog(
    config.priorityBlog ?? config.blog,
  );

  configs[host] = {
    language,
    priorityBlog,
    // Backward-compatible alias for existing callers and environment files.
    blog: priorityBlog,
    adsEnabled: config.adsEnabled !== false,
    primaryCategory:
      String(config.primaryCategory || "")
        .trim()
        .toLowerCase() || null,
  };
};

const REQUIRED_SITE_CONFIG = Object.freeze({
  "www.financeloanplatform.com": {
    language: "hi",
    priorityBlog: "personal-loan",
    adsEnabled: true,
  },
  "carloan-hi.financeloanplatform.com": {
    language: "hi",
    priorityBlog: "car-loan",
    adsEnabled: true,
  },
  "aadhaarpeloan-hi.financeloanplatform.com": {
    language: "hi",
    priorityBlog: "aadhaar-loan",
    adsEnabled: true,
  },
  "personalloan-en.financeloanplatform.com": {
    language: "en",
    priorityBlog: "personal-loan",
    adsEnabled: true,
  },
  "carloan-en.financeloanplatform.com": {
    language: "en",
    priorityBlog: "car-loan",
    adsEnabled: true,
  },
  "aadhaarpeloan-en.financeloanplatform.com": {
    language: "en",
    priorityBlog: "aadhaar-loan",
    adsEnabled: true,
  },
  "personalloan1-hi.financeloanplatform.com": {
    language: "hi",
    priorityBlog: "personal-loan-online-apply-guide",
    adsEnabled: true,
  },
  "personalloan1-en.financeloanplatform.com": {
    language: "en",
    priorityBlog: "personal-loan-online-application-guide",
    adsEnabled: true,
  },
  "aadhaarpeloan1-hi.financeloanplatform.com": {
    language: "hi",
    priorityBlog: "aadhaarpe-loan-online-application-guide",
    adsEnabled: true,
  },
  "aadhaarpeloan1-en.financeloanplatform.com": {
    language: "en",
    priorityBlog: "aadhaarpe-loan-online-application-process-guide",
    adsEnabled: true,
  },
  "studentloan1-hi.financeloanplatform.com": {
    language: "hi",
    priorityBlog: "student-loan-online-education-finance-guide",
    adsEnabled: true,
  },
});

const isValidEnvironmentHost = (domain) => {
  const host = normalizeHost(domain);
  if (!host || host.includes("/") || host.includes("\\")) return false;
  if (/^localhost(?::\d+)?$/.test(host)) return true;
  if (/^127\.0\.0\.1(?::\d+)?$/.test(host)) return true;
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(host);
};

const parseDomainConfig = () => {
  const configs = {};
  const configString = (import.meta.env.VITE_DOMAIN_CONFIG || "").trim();

  if (configString) {
    try {
      const parsed = JSON.parse(configString);
      Object.entries(parsed).forEach(([domain, config]) => {
        if (isValidEnvironmentHost(domain)) {
          addDomainConfig(configs, domain, config);
        }
      });
    } catch {
      // Keep existing pipe-delimited deployments working during migration.
      configString.split("|").forEach((entry) => {
        const match = entry.trim().match(/^(.*):(hi|en)(?::([^:]*))?$/i);
        if (!match) return;
        if (isValidEnvironmentHost(match[1])) {
          addDomainConfig(configs, match[1], {
            language: match[2],
            primaryCategory: match[3],
          });
        }
      });
    }
  }

  // Final production requirements always win over stale server variables.
  Object.entries(REQUIRED_SITE_CONFIG).forEach(([domain, config]) =>
    addDomainConfig(configs, domain, config),
  );

  return configs;
};

export const MAIN_DOMAIN =
  import.meta.env.VITE_MAIN_DOMAIN || "https://www.financeloanplatform.com";
export const ENGLISH_DOMAIN =
  import.meta.env.VITE_ENGLISH_DOMAIN ||
  "https://personalloan-en.financeloanplatform.com";
export const HINDI_DOMAIN = import.meta.env.VITE_HINDI_DOMAIN || MAIN_DOMAIN;
export const DEFAULT_LANGUAGE = import.meta.env.VITE_DEFAULT_LANGUAGE || "hi";

export const SITE_CONFIG = Object.freeze(parseDomainConfig());

const FALLBACK_CONFIG = Object.freeze({
  language: SUPPORTED_LANGUAGES.has(DEFAULT_LANGUAGE) ? DEFAULT_LANGUAGE : "hi",
  priorityBlog: null,
  blog: null,
  adsEnabled: true,
  primaryCategory: null,
});

export const getCurrentHost = () => {
  if (typeof window === "undefined") return normalizeHost(MAIN_DOMAIN);
  const hostname = window.location.hostname.toLowerCase().replace(/\.$/, "");
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  return isLocal ? window.location.host.toLowerCase() : hostname;
};

export const getCurrentDomain = () => {
  if (typeof window === "undefined") return MAIN_DOMAIN;
  return window.location.origin;
};

export const getSiteConfigForHost = (host) => {
  const hostname = normalizeHost(host);

  if (SITE_CONFIG[hostname]) return SITE_CONFIG[hostname];

  const englishHost = normalizeHost(ENGLISH_DOMAIN);
  if (hostname === englishHost) {
    return { ...FALLBACK_CONFIG, language: "en" };
  }

  const hindiHost = normalizeHost(HINDI_DOMAIN);
  if (hostname === hindiHost) {
    return { ...FALLBACK_CONFIG, language: "hi" };
  }

  return FALLBACK_CONFIG;
};

export const getCurrentSiteConfig = () =>
  getSiteConfigForHost(getCurrentHost());

export const getCurrentSiteLanguage = () => getCurrentSiteConfig().language;

export const getCurrentLanguage = getCurrentSiteLanguage;

export const getPriorityBlog = () => getCurrentSiteConfig().priorityBlog;

export const getCurrentBlog = getPriorityBlog;

export const getAdsEnabled = () => getCurrentSiteConfig().adsEnabled;

export const getPrimaryCategory = () => getCurrentSiteConfig().primaryCategory;

export const getCurrentCategory = getPrimaryCategory;

export const isHindiSite = () => getCurrentSiteLanguage() === "hi";

export const isEnglishSite = () => getCurrentSiteLanguage() === "en";

const domainToOrigin = (host) =>
  host.startsWith("localhost") || host.startsWith("127.0.0.1")
    ? "http://" + host
    : "https://" + host;

const findConfiguredDomain = (language, priorityBlog) => {
  const match = Object.entries(SITE_CONFIG).find(
    ([, config]) =>
      config.language === language &&
      config.priorityBlog === (priorityBlog || null),
  );
  return match ? domainToOrigin(match[0]) : null;
};

export const getLanguageSwitchDomain = () => {
  const current = getCurrentSiteConfig();
  const targetLanguage = current.language === "hi" ? "en" : "hi";
  const configuredDomain = findConfiguredDomain(
    targetLanguage,
    current.priorityBlog,
  );

  if (configuredDomain) return configuredDomain;
  return targetLanguage === "hi" ? HINDI_DOMAIN : ENGLISH_DOMAIN;
};

export const getLanguageSwitchUrl = (path = "/") => {
  const targetDomain = getLanguageSwitchDomain().replace(new RegExp("/+$"), "");
  const cleanPath = path.startsWith("/") ? path : "/" + path;
  return targetDomain + cleanPath;
};

export const getCanonicalUrl = (path = "/") => {
  const currentDomain = getCurrentDomain().replace(new RegExp("/+$"), "");
  const cleanPath = path.startsWith("/") ? path : "/" + path;
  return currentDomain + cleanPath;
};

export default {
  SITE_CONFIG,
  MAIN_DOMAIN,
  ENGLISH_DOMAIN,
  HINDI_DOMAIN,
  DEFAULT_LANGUAGE,
  getCurrentHost,
  getCurrentDomain,
  getSiteConfigForHost,
  getCurrentSiteConfig,
  getCurrentSiteLanguage,
  getCurrentLanguage,
  getPriorityBlog,
  getCurrentBlog,
  getAdsEnabled,
  getPrimaryCategory,
  getCurrentCategory,
  isHindiSite,
  isEnglishSite,
  getLanguageSwitchDomain,
  getLanguageSwitchUrl,
  getCanonicalUrl,
};
