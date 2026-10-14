chrome.runtime.onInstalled.addListener(async () => {
  const defaults = {
    settings: {
      defaultProvider: 'both',
      tenorApiKey: 'YOUR_TENOR_API_KEY',
      klipyApiKey: 'YOUR_KLIPY_API_KEY',
      resultsLimit: 12,
      showTrendingOnLoad: true
    }
  };

  const existing = await chrome.storage.local.get('settings');
  if (!existing.settings) {
    await chrome.storage.local.set(defaults);
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'open-options') {
    chrome.runtime.openOptionsPage();
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === 'copy') {
    navigator.clipboard.writeText(message.text).then(() => {
      sendResponse({ ok: true });
    }).catch(() => {
      sendResponse({ ok: false, error: 'Clipboard access failed.' });
    });
    return true;
  }

  sendResponse({ ok: false, error: 'Unsupported message.' });
  return true;
});
