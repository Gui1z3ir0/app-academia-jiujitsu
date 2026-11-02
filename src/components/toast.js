import { Icons } from './icons.js';

let toastTimeoutMap = new Map();

export function showToast(type = 'info', title = '', message = '', durationMs = 4500) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toastId = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  const toastEl = document.createElement('div');
  toastEl.id = toastId;
  toastEl.className = `toast-card toast-${type}`;

  let iconHtml = '';
  switch (type) {
    case 'success':
      iconHtml = Icons.checkCircle('', 20);
      break;
    case 'warning':
      iconHtml = Icons.clock('', 20);
      break;
    case 'error':
      iconHtml = Icons.xCircle ? Icons.xCircle('', 20) : Icons.trash('', 20);
      break;
    default:
      iconHtml = Icons.bell('', 20);
  }

  toastEl.innerHTML = `
    <div class="toast-icon-wrapper ${type}">
      ${iconHtml}
    </div>
    <div class="toast-content">
      ${title ? `<div class="toast-title">${title}</div>` : ''}
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
    <button class="toast-close-btn" title="Fechar notificação">&times;</button>
    <div class="toast-progress-bar" style="animation-duration: ${durationMs}ms;"></div>
  `;

  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(type === 'error' ? [20, 50, 20] : 12);
    }
  } catch (e) {}

  container.appendChild(toastEl);

  requestAnimationFrame(() => {
    toastEl.classList.add('show');
  });

  const removeToast = () => {
    toastEl.classList.remove('show');
    toastEl.classList.add('hide');
    setTimeout(() => {
      if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
      toastTimeoutMap.delete(toastId);
    }, 300);
  };

  const timer = setTimeout(removeToast, durationMs);
  toastTimeoutMap.set(toastId, timer);

  const closeBtn = toastEl.querySelector('.toast-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      clearTimeout(timer);
      removeToast();
    });
  }

  toastEl.addEventListener('mouseenter', () => {
    clearTimeout(toastTimeoutMap.get(toastId));
    const bar = toastEl.querySelector('.toast-progress-bar');
    if (bar) bar.style.animationPlayState = 'paused';
  });

  toastEl.addEventListener('mouseleave', () => {
    const bar = toastEl.querySelector('.toast-progress-bar');
    if (bar) bar.style.animationPlayState = 'running';
    const remainingTimer = setTimeout(removeToast, 2000);
    toastTimeoutMap.set(toastId, remainingTimer);
  });
}

export function renderToastContainer() {
  return `<div id="toastContainer" class="toast-container" aria-live="polite"></div>`;
}

if (typeof window !== 'undefined') {
  window.showToast = showToast;
}
