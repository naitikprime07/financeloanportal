export const GAM_DEBUG = String(import.meta.env.VITE_GAM_DEBUG || '').toLowerCase() === 'true';
export const gamLog = (event, details = {}) => {
  if (!GAM_DEBUG) return;
  console.info(`[GAM] ${event}`, { time: new Date().toISOString(), ...details });
};
export const gamWarn = (event, details = {}) => {
  console.warn(`[GAM] ${event}`, { time: new Date().toISOString(), ...details });
};
