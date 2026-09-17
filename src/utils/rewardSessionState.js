const completedHosts = new Set();
const listeners = new Set();

const normalizeHostname = (hostname) =>
  String(hostname || '').trim().toLowerCase().replace(/\.$/, '');

export const isRewardCompletedForPageSession = (hostname) =>
  completedHosts.has(normalizeHostname(hostname));

export const markRewardCompletedForPageSession = (hostname) => {
  const normalizedHostname = normalizeHostname(hostname);
  if (!normalizedHostname || completedHosts.has(normalizedHostname)) return;

  completedHosts.add(normalizedHostname);
  listeners.forEach((listener) => listener(normalizedHostname));
};

export const subscribeToPageSessionReward = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};