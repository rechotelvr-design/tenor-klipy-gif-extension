import { searchTenor, fetchTrendingTenor } from './tenor.js';
import { searchKlipy, fetchTrendingKlipy } from './klipy.js';
import { deduplicateGifs } from '../utils/normalize.js';

export function resolveProviders(providerPreference = 'all') {
  const allProviders = ['tenor', 'klipy'];

  if (!providerPreference || providerPreference === 'all') return allProviders;
  if (providerPreference === 'none') return [];
  return allProviders.filter((provider) => provider === providerPreference);
}

async function loadSample() {
  try {
    const url = chrome.runtime.getURL('assets/sample_gifs.json');
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn('Could not load sample gifs', e);
    return [];
  }
}

export async function searchGifs({ query = '', provider = 'all', limit = 12 } = {}) {
  const providers = resolveProviders(provider);
  const results = [];

  if (providers.length === 0) {
    const sample = await loadSample();
    return sample.slice(0, limit);
  }

  for (const selectedProvider of providers) {
    try {
      if (selectedProvider === 'tenor') {
        const items = await searchTenor({ query, limit });
        results.push(...items);
      }

      if (selectedProvider === 'klipy') {
        const items = await searchKlipy({ query, limit });
        results.push(...items);
      }
    } catch (error) {
      if (error && error.message) {
        console.warn(error.message);
      }
    }
  }

  const merged = deduplicateGifs(results).slice(0, limit);
  if (merged.length === 0) {
    const sample = await loadSample();
    return sample.slice(0, limit);
  }
  return merged;
}

export async function fetchTrendingGifs({ provider = 'all', limit = 12 } = {}) {
  const providers = resolveProviders(provider);
  const results = [];

  if (providers.length === 0) {
    const sample = await loadSample();
    return sample.slice(0, limit);
  }

  for (const selectedProvider of providers) {
    try {
      if (selectedProvider === 'tenor') {
        const items = await fetchTrendingTenor({ limit });
        results.push(...items);
      }

      if (selectedProvider === 'klipy') {
        const items = await fetchTrendingKlipy({ limit });
        results.push(...items);
      }
    } catch (error) {
      if (error && error.message) {
        console.warn(error.message);
      }
    }
  }

  const merged = deduplicateGifs(results).slice(0, limit);
  if (merged.length === 0) {
    const sample = await loadSample();
    return sample.slice(0, limit);
  }
  return merged;
}
