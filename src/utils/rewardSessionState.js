const STORAGE_KEY_PREFIX = 'blogRewardCompleted:';
const completedHosts = new Set();
const listeners = new Set();

const normalizeHostname = (hostname) =>
  String(hostname || '').trim().toLowerCase().replace(/\.$/, '');

const storageKey = (hostname) => `${STORAGE_KEY_PREFIX}${hostname}`;

const readSessionCompletion = (hostname) => {
  try {
    return window.sessionStorage.getItem(storageKey(hostname)) === 'true';
  } catch {
    return false;
  }
};

export const isRewardCompletedForPageSession = (hostname) => {
  const normalizedHostname = normalizeHostname(hostname);
  if (!normalizedHostname) return false;
  if (completedHosts.has(normalizedHostname)) return true;

  const completed = readSessionCompletion(normalizedHostname);
  if (completed) completedHosts.add(normalizedHostname);
  return completed;
};

export const markRewardCompletedForPageSession = (hostname) => {
  const normalizedHostname = normalizeHostname(hostname);
  if (!normalizedHostname || completedHosts.has(normalizedHostname)) return;

  completedHosts.add(normalizedHostname);
  try {
    window.sessionStorage.setItem(storageKey(normalizedHostname), 'true');
  } catch {
    // The in-memory fallback still prevents duplicates during this page load.
  }
  listeners.forEach((listener) => listener(normalizedHostname));
};

export const subscribeToPageSessionReward = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};