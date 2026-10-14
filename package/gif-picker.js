import { searchGifs, fetchTrendingGifs } from './src/providers/providerManager.js';

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsEl = document.getElementById('results');
const tpl = document.getElementById('resultTpl');
const closeBtn = document.getElementById('closeBtn');

function getSelectedProviders() {
  const checked = [...document.querySelectorAll('input[name="provider"]:checked')].map((i) => i.value);
  if (checked.length === 0) return 'none';
  if (checked.length === 2) return 'all';
  return checked[0];
}

function renderGifs(items = []) {
  resultsEl.innerHTML = '';
  if (!items || items.length === 0) {
    resultsEl.textContent = 'No GIFs found.';
    return;
  }

  for (const gif of items) {
    const frag = tpl.content.cloneNode(true);
    const card = frag.querySelector('.gif-card');
    const img = frag.querySelector('.gif-thumb');
    img.src = gif.previewUrl || gif.gifUrl || '';
    img.alt = gif.title || '';
    card.addEventListener('click', () => selectGif(gif));
    resultsEl.appendChild(frag);
  }
}

function selectGif(gif) {
  // Send selected GIF to parent page
  try {
    parent.postMessage({ type: 'gif-selected', gif }, '*');
  } catch (e) {
    console.error('Could not post selection to parent:', e);
  }
}

async function doSearch() {
  const q = searchInput.value.trim();
  const providers = getSelectedProviders();
  resultsEl.textContent = 'Loading…';
  try {
    if (!q) {
      const gifs = await fetchTrendingGifs({ provider: providers, limit: 18 });
      renderGifs(gifs);
    } else {
      const gifs = await searchGifs({ query: q, provider: providers, limit: 18 });
      renderGifs(gifs);
    }
  } catch (err) {
    console.error(err);
    resultsEl.textContent = 'Failed to load GIFs. Check API keys in extension options or use a proxy.';
  }
}

searchBtn.addEventListener('click', doSearch);
searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doSearch(); } });
closeBtn.addEventListener('click', () => { try { parent.postMessage({ type: 'close-picker' }, '*'); } catch (e) {} });

// Load trending on open
doSearch();
