// youtube-inject.js
// Injects a small GIF button next to YouTube comment/reply editable fields.

(function () {
  const BUTTON_CLASS = 'gif-picker-button-ext';
  const MODAL_ID = 'gif-picker-iframe-ext';

  function createButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = BUTTON_CLASS;
    btn.title = 'Insert GIF (Tenor + Klipy)';
    btn.textContent = 'GIF';
    btn.style.cssText = `
      margin-left: 8px;
      padding: 6px 8px;
      border-radius: 6px;
      background: #7dd3fc;
      color: #092433;
      border: none;
      cursor: pointer;
      font-weight: 700;
      font-size: 12px;
    `;
    return btn;
  }

  function openGifPicker(targetEditable) {
    // If modal already exists, reuse it
    let iframe = document.getElementById(MODAL_ID);
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = MODAL_ID;
      iframe.src = chrome.runtime.getURL('gif-picker.html');
      Object.assign(iframe.style, {
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        width: '560px',
        height: '420px',
        border: '1px solid rgba(0,0,0,0.2)',
        borderRadius: '12px',
        boxShadow: '0 12px 40px rgba(2,6,23,0.6)',
        zIndex: 2147483647,
        background: 'transparent'
      });
      document.documentElement.appendChild(iframe);

      // Listen for selection messages from the picker
      window.addEventListener('message', (event) => {
        // Only handle messages from the iframe we created
        if (!iframe || event.source !== iframe.contentWindow) return;
        const data = event.data || {};
        if (data && data.type === 'gif-selected' && data.gif) {
          insertGifIntoEditable(targetEditable, data.gif);
          closePicker();
        }

        if (data && data.type === 'close-picker') {
          closePicker();
        }
      });
    } else {
      // already exists; bring to front
      iframe.style.display = 'block';
    }
  }

  function closePicker() {
    const iframe = document.getElementById(MODAL_ID);
    if (iframe) iframe.remove();
  }

  function insertGifIntoEditable(editable, gif) {
    const url = gif.pageUrl || gif.gifUrl || gif.previewUrl || '';
    if (!url) return;

    // If it's a textarea/input
    if (editable.tagName === 'INPUT' || editable.tagName === 'TEXTAREA') {
      const start = editable.selectionStart || editable.value.length;
      const before = editable.value.slice(0, start);
      const after = editable.value.slice(start);
      editable.value = `${before} ${url} ${after}`;
      editable.focus();
      editable.setSelectionRange(start + url.length + 1, start + url.length + 1);
      // Dispatch input event so any UI notices change
      editable.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }

    // If contenteditable
    if (editable.isContentEditable) {
      // Try to insert at caret
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const textNode = document.createTextNode(' ' + url + ' ');
        range.insertNode(textNode);
        // Move caret after inserted node
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // Fallback append
        editable.innerText = (editable.innerText || '') + ' ' + url;
      }

      // Fire input events
      editable.dispatchEvent(new Event('input', { bubbles: true }));
      editable.focus();
      return;
    }

    // Fallback: if no editable found, copy to clipboard
    try {
      navigator.clipboard.writeText(url);
      alert('GIF link copied to clipboard: ' + url);
    } catch (e) {
      console.warn('Could not insert GIF. Copied to clipboard instead.');
    }
  }

  // Find potential comment/reply editable elements and add a button nearby
  function attachButtons(root = document) {
    // Common YouTube reply/comment editors: contenteditable divs inside #content, ytd-commentbox, and textareas
    const candidates = [];

    // contenteditable fields
    root.querySelectorAll('[contenteditable="true"]').forEach((el) => candidates.push(el));
    // textareas and inputs
    root.querySelectorAll('textarea, input[type="text"], input[type="search"]').forEach((el) => candidates.push(el));

    for (const el of candidates) {
      if (el._gifButtonInjected) continue;
      // Try to find a toolbar or controls container near the editable to host the button
      let host = null;
      // nearest element with role toolbar or a sibling with id that contains "action" or "buttons"
      host = el.closest('ytd-comment-simplebox-renderer') || el.closest('ytd-commentbox') || el.closest('ytd-comment-thread-renderer');

      // If not, use parent element
      if (!host) host = el.parentElement;
      if (!host) continue;

      // Create container for the button next to the editable
      const btn = createButton();
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openGifPicker(el);
      });

      // Try to append to a visible controls container; otherwise insert after the editable
      try {
        // avoid adding inside toolbars that are hidden
        const controls = host.querySelectorAll('ytd-button-renderer, #action-buttons, #simplebox-buttons, .comment-action-buttons');
        if (controls && controls.length > 0) {
          controls[controls.length - 1].appendChild(btn);
        } else {
          // Insert after editable
          el.parentElement.insertBefore(btn, el.nextSibling);
        }
      } catch (err) {
        try { el.parentElement.insertBefore(btn, el.nextSibling); } catch (e) { /* ignore */ }
      }

      el._gifButtonInjected = true;
    }
  }

  // Observe for dynamic content (YouTube loads comments dynamically)
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.addedNodes && m.addedNodes.length) {
        attachButtons(document);
      }
    }
  });

  observer.observe(document.documentElement || document.body, { childList: true, subtree: true });

  // Initial attach
  try { attachButtons(document); } catch (e) { /* ignore */ }
})();
