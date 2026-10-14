import { searchTenor, fetchTrendingTenor } from './tenor.js';
import { searchKlipy, fetchTrendingKlipy } from './klipy.js';
import { deduplicateGifs } from '../utils/normalize.js';

export function resolveProviders(providerPreference = 'all') {
  const allProviders = ['tenor', 'klipy'];

  if (!providerPreference || providerPreference === 'all') return allProviders;
  if (providerPreference === 'none') return [];
  return allProviders.filter((provider) => provider === providerPreference);
}

export async function searchGifs({ query = '', provider = 'all', limit = 12 } = {}) {
  const providers = resolveProviders(provider);
  if (providers.length === 0) return [];

  const results = [];

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

  return deduplicateGifs(results).slice(0, limit);
}

export async function fetchTrendingGifs({ provider = 'all', limit = 12 } = {}) {
  const providers = resolveProviders(provider);
  if (providers.length === 0) return [];

  const results = [];

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

  return deduplicateGifs(results).slice(0, limit);
}
