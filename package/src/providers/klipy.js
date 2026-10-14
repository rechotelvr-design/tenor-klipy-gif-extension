import { readSettings, getRuntimeConfig } from '../utils/config.js';
import { createProviderError, isPlaceholderKey } from '../utils/errors.js';
import { normalizeKlipyGif } from '../utils/normalize.js';

const KLIpy_BASE_URL = 'https://api.klipy.com/v1';

async function getApiKey() {
  const settings = await readSettings();
  const runtimeConfig = getRuntimeConfig();
  return settings.klipyApiKey || runtimeConfig.klipyApiKey || 'YOUR_KLIPY_API_KEY';
}

export async function searchKlipy({ query = '', limit = 12 } = {}) {
  const apiKey = await getApiKey();

  if (isPlaceholderKey(apiKey)) {
    throw createProviderError('klipy', 'API key is not configured. Add your Klipy API key in Settings or use a backend proxy.');
  }

  const url = new URL(`${KLIpy_BASE_URL}/search`);
  url.searchParams.set('query', query.trim() || 'trending');
  url.searchParams.set('limit', String(limit));
  if (apiKey) url.searchParams.set('api_key', apiKey);

  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    throw createProviderError('klipy', `Request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const results = Array.isArray(payload.results) ? payload.results : Array.isArray(payload.items) ? payload.items : [];
  return results.map(normalizeKlipyGif);
}

export async function fetchTrendingKlipy({ limit = 12 } = {}) {
  const apiKey = await getApiKey();

  if (isPlaceholderKey(apiKey)) {
    throw createProviderError('klipy', 'API key is not configured. Add your Klipy API key in Settings or use a backend proxy.');
  }

  const url = new URL(`${KLIpy_BASE_URL}/trending`);
  url.searchParams.set('limit', String(limit));
  if (apiKey) url.searchParams.set('api_key', apiKey);

  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    throw createProviderError('klipy', `Trending request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const results = Array.isArray(payload.results) ? payload.results : Array.isArray(payload.items) ? payload.items : [];
  return results.map(normalizeKlipyGif);
}
