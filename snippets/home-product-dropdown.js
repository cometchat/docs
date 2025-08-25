/*
  CometChat Docs - Homepage Product Selector Dropdown (runtime)
  - Injects a UI Kits–style dropdown button next to the logo on the homepage only.
  - Options:
      Chat & Calling -> /chat-call
      AI Agents -> /ai-agents
      AI Moderation -> /moderation/overview
      Notification -> /notifications/overview
      Insights -> /insights
  - SPA/hydration-safe; can be loaded via a container (e.g., GTM) on all pages.
*/
(function () {
  const DOC = document;
  const WIN = window;
  const NAVBAR_ID = 'navbar';

  // Home path detection
  function isHome(pathname) {
    if (!pathname) return false;
    return pathname === '/' || pathname === '/index' || pathname === '/index.html';
  }

  const ITEMS = [
    { label: 'Chat & Calling', href: '/chat-call' },
    { label: 'AI Agents', href: '/ai-agents' },
    { label: 'AI Moderation', href: '/moderation/overview' },
    { label: 'Notification', href: '/notifications/overview' },
    { label: 'Insights', href: '/insights' },
  ];

  function createButton(label) {
    const btn = DOC.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-haspopup', 'menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('data-state', 'closed');
    btn.dataset.ccHomeProductButton = 'true';
    btn.className = [
      'group',
      'bg-background-light', 'dark:bg-background-dark',
      'disabled:pointer-events-none',
      '[&>span]:line-clamp-1',
      'overflow-hidden', 'group', 'outline-none',
      'group-hover:text-gray-950/70', 'dark:group-hover:text-white/70',
      'text-xs', 'gap-1.5', 'text-gray-500', 'dark:text-gray-400', 'leading-5', 'font-semibold',
      'border', 'border-gray-200', 'dark:border-gray-800', 'hover:border-gray-300', 'dark:hover:border-gray-700',
      'rounded-full', 'py-1', 'px-3', 'flex', 'items-center', 'space-x-2', 'whitespace-nowrap'
    ].join(' ');
    const span = DOC.createElement('span');
    span.textContent = label || 'Products';
    const chevron = DOC.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chevron.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    chevron.setAttribute('width', '12');
    chevron.setAttribute('height', '12');
    chevron.setAttribute('viewBox', '0 0 24 24');
    chevron.setAttribute('fill', 'none');
    chevron.setAttribute('stroke', 'currentColor');
    chevron.setAttribute('stroke-width', '2.5');
    chevron.setAttribute('stroke-linecap', 'round');
    chevron.setAttribute('stroke-linejoin', 'round');
    chevron.setAttribute('class', 'lucide lucide-chevron-down');
    const path = DOC.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'm6 9 6 6 6-6');
    chevron.appendChild(path);
    btn.appendChild(span);
    btn.appendChild(chevron);
    return btn;
  }

  function createMenu(items, onSelect) {
    const menu = DOC.createElement('div');
    menu.role = 'menu';
    menu.tabIndex = -1;
    menu.dataset.ccHomeProductMenu = 'true';
    menu.className = [
      'z-50', 'absolute', 'mt-2', 'min-w-[12rem]', 'rounded-xl',
      'bg-white', 'dark:bg-background-dark', 'border', 'border-gray-200', 'dark:border-gray-800',
      'shadow-lg', 'p-1'
    ].join(' ');

    items.forEach(it => {
      const item = DOC.createElement('button');
      item.type = 'button';
      item.className = [
        'w-full', 'text-left', 'px-3', 'py-1.5', 'rounded-lg', 'text-sm',
        'text-gray-700', 'hover:text-gray-900', 'hover:bg-gray-50',
        'dark:text-gray-300', 'dark:hover:text-gray-100', 'dark:hover:bg-white/10'
      ].join(' ');
      item.textContent = it.label || '';
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        if (it && it.href) {
          try {
            if (WIN.location.pathname !== it.href) {
              WIN.history.pushState({}, '', it.href);
              WIN.dispatchEvent(new Event('popstate'));
            }
          } catch (_) {
            WIN.location.assign(it.href);
          }
        }
      });
      menu.appendChild(item);
    });
    return menu;
  }

  function placeMenu(menu, anchor) {
    const rect = anchor.getBoundingClientRect();
    const top = rect.bottom + WIN.scrollY;
    const left = rect.left + WIN.scrollX;
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
  }

  function ensureContainer(navbarRoot) {
    if (!navbarRoot) return null;
    // Try to find the standard container used near the logo
    let container = navbarRoot.querySelector('.hidden.lg\\:flex.items-center.gap-x-2');
    if (container) return container;
    const logo = navbarRoot.querySelector('a[href="/"]');
    if (!logo) return null;
    container = DOC.createElement('div');
    container.className = 'hidden lg:flex items-center gap-x-2';
    try { logo.parentElement.insertBefore(container, logo.nextSibling); } catch (_) {}
    return container;
  }

  function removeExisting(container) {
    container.querySelectorAll('[data-cc-home-product-button]')?.forEach(el => el.remove());
  }

  function inject() {
    if (!isHome(WIN.location.pathname)) return;
    const navbar = DOC.getElementById(NAVBAR_ID);
    const target = ensureContainer(navbar);
    if (!target) return;
    removeExisting(target);

    const btn = createButton('Products');
    btn.setAttribute('data-cc-home-product-button', 'true');
    target.appendChild(btn);

    let openMenu = null;
    function closeMenu() {
      if (openMenu) {
        openMenu.remove();
        openMenu = null;
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('data-state', 'closed');
      }
    }
    function open() {
      if (openMenu) { closeMenu(); return; }
      const menu = createMenu(ITEMS, () => closeMenu());
      DOC.body.appendChild(menu);
      placeMenu(menu, btn);
      requestAnimationFrame(() => placeMenu(menu, btn));
      openMenu = menu;
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('data-state', 'open');
    }
    btn.addEventListener('click', (e) => { e.stopPropagation(); open(); });
    DOC.addEventListener('click', (e) => {
      if (!openMenu) return;
      if (e.target === btn || btn.contains(e.target)) return;
      if (openMenu.contains(e.target)) return;
      closeMenu();
    });
  }

  // Debounce utility
  function debounce(fn, wait = 100) {
    let t = null;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  const apply = debounce(() => {
    inject();
  }, 50);

  if (DOC.readyState === 'loading') {
    DOC.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }

  // SPA/hydration guards
  try {
    const origPush = WIN.history.pushState;
    const origReplace = WIN.history.replaceState;
    WIN.history.pushState = function (...args) { const ret = origPush.apply(this, args); apply(); return ret; };
    WIN.history.replaceState = function (...args) { const ret = origReplace.apply(this, args); apply(); return ret; };
  } catch (_) {}
  WIN.addEventListener('popstate', apply);
  WIN.addEventListener('hashchange', apply);
  DOC.addEventListener('visibilitychange', () => { if (DOC.visibilityState === 'visible') apply(); });

  try {
    const obs = new MutationObserver(debounce(apply, 50));
    obs.observe(DOC.documentElement, { childList: true, subtree: true });
  } catch (_) {}
})();
