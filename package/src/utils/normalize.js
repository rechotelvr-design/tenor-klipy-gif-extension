export function normalizeTenorGif(item = {}) {
  const media = Array.isArray(item.media) ? item.media[0] : {};
  const gif = media.gif || {};
  const tinygif = media.tinygif || {};
  const nanogif = media.nanogif || {};
  const dims = gif.dims || tinygif.dims || nanogif.dims || [0, 0];

  return {
    id: item.id || `${item.title || 'tenor'}-${Date.now()}`,
    title: item.title || item.content_description || 'Tenor GIF',
    provider: 'tenor',
    previewUrl: tinygif.url || nanogif.url || gif.url || '',
    gifUrl: gif.url || item.itemurl || '',
    pageUrl: item.itemurl || item.url || gif.url || '',
    width: Number(dims[0]) || 0,
    height: Number(dims[1]) || 0,
    description: item.content_description || item.title || 'Tenor GIF',
    attribution: item.author || null
  };
}

export function normalizeKlipyGif(item = {}) {
  const media = item.media || item.images || item.image_urls || {};
  const image = Array.isArray(media) ? media[0] : media;
  const preview = image?.preview || image?.thumb || image?.gif || image?.url || item.preview_url || item.gif_url || '';
  const gifUrl = item.gif_url || image?.gif || image?.url || item.source_url || '';
  const pageUrl = item.page_url || item.url || item.link || gifUrl;
  const width = Number(item.width || image?.width || 0);
  const height = Number(item.height || image?.height || 0);

  return {
    id: item.id || `${(item.title || 'klipy')}-${Date.now()}`,
    title: item.title || item.name || 'Klipy GIF',
    provider: 'klipy',
    previewUrl: preview,
    gifUrl,
    pageUrl,
    width,
    height,
    description: item.description || item.title || 'Klipy GIF',
    attribution: item.author || null
  };
}

export function normalizeGifResult(provider, item) {
  if (provider === 'tenor') return normalizeTenorGif(item);
  if (provider === 'klipy') return normalizeKlipyGif(item);
  return { ...item, provider };
}

export function deduplicateGifs(items = []) {
  const seen = new Set();
  return items.filter((gif) => {
    const key = `${gif.provider}-${gif.id}-${gif.gifUrl || gif.pageUrl || gif.previewUrl}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
