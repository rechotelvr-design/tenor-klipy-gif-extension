import { searchGifs, fetchTrendingGifs } from './src/providers/providerManager.js';
import { getErrorMessage } from './src/utils/errors.js';

const searchForm = document.querySelector('#searchForm');
const searchInput = document.querySelector('#searchInput');
const settingsBtn = document.querySelector('#settingsBtn');
const resultsContainer = document.querySelector('#results');
const statusEl = document.querySelector('#status');
const cardTemplate = document.querySelector('#gifCardTemplate');

let currentProviderFilter = 'all';

function setStatus(message, type = 'info') {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

function renderEmptyState(message = 'No GIFs found for this search.') {
  resultsContainer.innerHTML = `
    <div class="empty-state">
      <p>${message}</p>
    </div>
  `;
}

function renderErrorState(error, retryHandler) {
  resultsContainer.innerHTML = `
    <div class="error-state">
      <p>${error}</p>
      <button type="button" class="retry-btn">Retry</button>
    </div>
  `;

  const retryBtn = resultsContainer.querySelector('.retry-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', retryHandler);
  }
}

function createGifCard(gif, retryHandler) {
  const fragment = cardTemplate.content.cloneNode(true);
  const card = fragment.querySelector('.gif-card');
  const preview = fragment.querySelector('.gif-preview');
  const loading = fragment.querySelector('.gif-loading');
  const title = fragment.querySelector('.gif-title');
  const provider = fragment.querySelector('.gif-provider');
  const copyBtn = fragment.querySelector('.copy-btn');
  const openBtn = fragment.querySelector('.open-btn');

  title.textContent = gif.title || 'Untitled GIF';
  provider.textContent = gif.provider;
  preview.src = gif.previewUrl || gif.gifUrl;
  preview.alt = gif.title || 'GIF preview';
  preview.addEventListener('load', () => {
    preview.classList.add('loaded');
    card.classList.add('loaded');
    loading.style.display = 'none';
  });
  preview.addEventListener('error', () => {
    preview.style.display = 'none';
    loading.textContent = 'Preview unavailable';
  });

  openBtn.href = gif.pageUrl || gif.gifUrl;
  copyBtn.addEventListener('click', async () => {
    const url = gif.pageUrl || gif.gifUrl;
    try {
      await navigator.clipboard.writeText(url);
      setStatus('GIF link copied to clipboard.', 'info');
    } catch (error) {
      setStatus(getErrorMessage(error), 'error');
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ type: 'copy', text: url }, () => {
          if (chrome.runtime.lastError) {
            setStatus('Unable to copy. Please copy the link manually.', 'error');
          }
        });
      }
    }
  });

  if (typeof retryHandler === 'function') {
    copyBtn.addEventListener('click', retryHandler, { once: true });
  }

  return fragment;
}

function renderResults(items) {
  if (!items || items.length === 0) {
    renderEmptyState();
    return;
  }

  resultsContainer.innerHTML = '';
  for (const gif of items) {
    const cardFragment = createGifCard(gif);
    resultsContainer.appendChild(cardFragment);
  }
}

async function runSearch(query, provider) {
  if (!query.trim() && provider === 'all') {
    await loadTrending();
    return;
  }

  setStatus('Loading GIF results…', 'info');
  resultsContainer.innerHTML = '';

  try {
    const gifs = await searchGifs({ query, provider, limit: 12 });
    if (!gifs || gifs.length === 0) {
      renderEmptyState('No GIFs matched your search. Try another term or provider.');
      setStatus('No GIFs found.', 'info');
      return;
    }

    renderResults(gifs);
    setStatus(`${gifs.length} GIF${gifs.length === 1 ? '' : 's'} loaded.`, 'info');
  } catch (error) {
    const message = getErrorMessage(error);
    renderErrorState(message, () => runSearch(query, provider));
    setStatus(message, 'error');
  }
}

async function loadTrending() {
  setStatus('Loading trending GIFs…', 'info');
  resultsContainer.innerHTML = '';

  try {
    const gifs = await fetchTrendingGifs({ provider: currentProviderFilter });
    if (!gifs || gifs.length === 0) {
      renderEmptyState('Trending GIFs are not available right now.');
      setStatus('No trending GIFs available.', 'info');
      return;
    }

    renderResults(gifs);
    setStatus('Trending GIFs loaded.', 'info');
  } catch (error) {
    const message = getErrorMessage(error);
    renderErrorState(message, loadTrending);
    setStatus(message, 'error');
  }
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  runSearch(query, currentProviderFilter);
});

settingsBtn.addEventListener('click', () => {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({ type: 'open-options' });
  } else {
    window.open('options.html', '_blank');
  }
});

function updateProviderFilter() {
  const checked = [...document.querySelectorAll('input[name="provider"]:checked')].map((input) => input.value);
  currentProviderFilter = checked.length === 0 ? 'none' : checked.length === 2 ? 'all' : checked[0];

  if (currentProviderFilter === 'none') {
    renderEmptyState('Select at least one provider to see GIFs.');
    return;
  }

  const query = searchInput.value.trim();
  if (query) {
    runSearch(query, currentProviderFilter);
  } else {
    loadTrending();
  }
}

for (const input of document.querySelectorAll('input[name="provider"]')) {
  input.addEventListener('change', updateProviderFilter);
}

loadTrending();
