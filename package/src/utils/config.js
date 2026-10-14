export function getRuntimeConfig() {
  const runtimeConfig = globalThis.__GIF_EXT_CONFIG__ || {};
  return {
    tenorApiKey: runtimeConfig.tenorApiKey || 'YOUR_TENOR_API_KEY',
    klipyApiKey: runtimeConfig.klipyApiKey || 'YOUR_KLIPY_API_KEY',
    defaultProvider: runtimeConfig.defaultProvider || 'all'
  };
}

export async function readSettings() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const stored = await chrome.storage.local.get('settings');
    return stored.settings || {};
  }

  return {};
}

export async function writeSettings(settings) {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ settings });
  }
}
