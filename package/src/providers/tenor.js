import { readSettings, getRuntimeConfig } from '../utils/config.js';
import { createProviderError, isPlaceholderKey } from '../utils/errors.js';
import { normalizeTenorGif } from '../utils/normalize.js';

const TENOR_BASE_URL = 'https://tenor.googleapis.com/v2';

async function getApiKey() {
  const settings = await readSettings();
  const runtimeConfig = getRuntimeConfig();
  return settings.tenorApiKey || runtimeConfig.tenorApiKey || 'YOUR_TENOR_API_KEY';
}

export async function searchTenor({ query = '', limit = 12, pos = '' } = {}) {
  const apiKey = await getApiKey();

  if (isPlaceholderKey(apiKey)) {
    throw createProviderError('tenor', 'API key is not configured. Add your Tenor API key in Settings or use a backend proxy.');
  }

  const url = new URL(`${TENOR_BASE_URL}/search`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('q', query.trim() || 'trending');
  url.searchParams.set('limit', String(limit));
  if (pos) url.searchParams.set('pos', String(pos));
  url.searchParams.set('media_filter', 'minimal');

  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    throw createProviderError('tenor', `Request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const results = Array.isArray(payload.results) ? payload.results : [];

  return results.map(normalizeTenorGif);
}

export async function fetchTrendingTenor({ limit = 12 } = {}) {
  const apiKey = await getApiKey();

  if (isPlaceholderKey(apiKey)) {
    throw createProviderError('tenor', 'API key is not configured. Add your Tenor API key in Settings or use a backend proxy.');
  }

  const url = new URL(`${TENOR_BASE_URL}/featured`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('media_filter', 'minimal');

  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    throw createProviderError('tenor', `Trending request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const results = Array.isArray(payload.results) ? payload.results : [];
  return results.map(normalizeTenorGif);
}
