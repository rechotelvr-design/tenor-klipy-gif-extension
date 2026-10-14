const defaultSettings = {
  defaultProvider: 'all',
  tenorApiKey: 'YOUR_TENOR_API_KEY',
  klipyApiKey: 'YOUR_KLIPY_API_KEY',
  resultsLimit: 12,
  showTrendingOnLoad: true
};

const defaultProviderEl = document.querySelector('#defaultProvider');
const resultsLimitEl = document.querySelector('#resultsLimit');
const tenorApiKeyEl = document.querySelector('#tenorApiKey');
const klipyApiKeyEl = document.querySelector('#klipyApiKey');
const saveBtn = document.querySelector('#saveBtn');
const resetBtn = document.querySelector('#resetBtn');
const saveStatus = document.querySelector('#saveStatus');

async function loadSettings() {
  let settings = { ...defaultSettings };

  if (typeof chrome !== 'undefined' && chrome.storage) {
    const result = await chrome.storage.local.get('settings');
    settings = { ...settings, ...(result.settings || {}) };
  }

  defaultProviderEl.value = settings.defaultProvider || 'all';
  resultsLimitEl.value = settings.resultsLimit || 12;
  tenorApiKeyEl.value = settings.tenorApiKey || 'YOUR_TENOR_API_KEY';
  klipyApiKeyEl.value = settings.klipyApiKey || 'YOUR_KLIPY_API_KEY';
}

async function saveSettings() {
  const settings = {
    defaultProvider: defaultProviderEl.value,
    resultsLimit: Number(resultsLimitEl.value) || 12,
    tenorApiKey: tenorApiKeyEl.value.trim() || 'YOUR_TENOR_API_KEY',
    klipyApiKey: klipyApiKeyEl.value.trim() || 'YOUR_KLIPY_API_KEY',
    showTrendingOnLoad: true
  };

  if (typeof chrome !== 'undefined' && chrome.storage) {
    await chrome.storage.local.set({ settings });
  }

  saveStatus.textContent = 'Settings saved.';
}

saveBtn.addEventListener('click', async () => {
  try {
    await saveSettings();
  } catch (error) {
    saveStatus.textContent = 'Could not save settings.';
  }
});

resetBtn.addEventListener('click', async () => {
  defaultProviderEl.value = defaultSettings.defaultProvider;
  resultsLimitEl.value = defaultSettings.resultsLimit;
  tenorApiKeyEl.value = defaultSettings.tenorApiKey;
  klipyApiKeyEl.value = defaultSettings.klipyApiKey;

  if (typeof chrome !== 'undefined' && chrome.storage) {
    await chrome.storage.local.set({ settings: defaultSettings });
  }

  saveStatus.textContent = 'Settings reset to defaults.';
});

loadSettings();
