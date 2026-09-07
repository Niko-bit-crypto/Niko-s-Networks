// Safe LocalStorage wrapper to prevent quota or iframe security crashes
export const safeStorage = {
  getItem: (key, fallback = null) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return fallback;
      const val = window.localStorage.getItem(key);
      return val !== null ? val : fallback;
    } catch (err) {
      console.warn(`[Niko's Nightclub] SafeStorage read failed for "${key}":`, err);
      return fallback;
    }
  },

  getJSON: (key, fallback = []) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return fallback;
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed !== null && parsed !== undefined ? parsed : fallback;
    } catch (err) {
      console.warn(`[Niko's Nightclub] SafeStorage parse failed for "${key}":`, err);
      return fallback;
    }
  },

  setItem: (key, value) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const str = typeof value === 'string' ? value : JSON.stringify(value);
      window.localStorage.setItem(key, str);
      return true;
    } catch (err) {
      console.warn(`[Niko's Nightclub] SafeStorage write failed for "${key}":`, err);
      return false;
    }
  },

  removeItem: (key) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      window.localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.warn(`[Niko's Nightclub] SafeStorage remove failed for "${key}":`, err);
      return false;
    }
  },

  clearSafe: () => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.removeItem('niko_custom_games');
      window.localStorage.removeItem('niko_favorites');
    } catch (err) {
      console.warn("[Niko's Nightclub] SafeStorage clear failed:", err);
    }
  }
};
