/*
  Product Selector Dropdown Injector (Mintlify-friendly)
  - Adds a small dropdown to the navbar listing products:
    Chat & Calling, AI Agents, AI Moderation, Notification, Insights
  - Clicking an item navigates to the respective product section
  - Matches the UI Kits navbar pill style (rounded, small text, chevron)
  - No edits to generated HTML; safe to load via a container (e.g., GTM Custom HTML tag)
  - SPA-safe (pushState/replaceState/popstate) and resilient to hydration (MutationObserver)
*/
(function () {
  try {
    var DROPDOWN_ID = 'cc-product-dropdown';
    var BTN_ID = 'cc-product-dropdown-button';
    var WRAP_ID = 'cc-product-dropdown-wrap';

    // Target products and destinations
    var PRODUCTS = [
      { key: 'chat-call', label: 'Chat & Calling', href: '/chat-call' },
      { key: 'ai-agents', label: 'AI Agents', href: '/ai-agents' },
      { key: 'moderation', label: 'AI Moderation', href: '/moderation/overview' },
      { key: 'notifications', label: 'Notification', href: '/notifications/overview' },
      { key: 'insights', label: 'Insights', href: '/insights' }
    ];

    function normalizePath(p) {
      if (!p) return '/';
      // Remove trailing slashes (except root)
      p = p.replace(/\/+$/, '');
      return p || '/';
    }

    function getBasePrefix() {
      try {
        var p = location.pathname || '/';
        return p.indexOf('/docs') === 0 ? '/docs' : '';
      } catch (_) { return ''; }
    }
    function stripBase(pathname) {
      var base = getBasePrefix();
      if (!pathname) return '/';
      var p = pathname;
      try { p = new URL(pathname, location.origin).pathname; } catch (_) {}
      if (base && p.indexOf(base) === 0) p = p.slice(base.length) || '/';
      p = p.replace(/\/+$/, '') || '/';
      return p;
    }

    function getRouteKey(path) {
      if (!path) return null;
      path = stripBase(path);
      if (path.indexOf('/chat-call') === 0) return 'chat-call';
      if (path.indexOf('/ai-agents') === 0) return 'ai-agents';
      if (path.indexOf('/moderation') === 0) return 'moderation';
      if (path.indexOf('/notifications') === 0) return 'notifications';
      if (path.indexOf('/insights') === 0) return 'insights';
      return null;
    }

    function shouldDisplay(path) {
      // Show within the five product sections only
      return !!getRouteKey(path);
    }

    function getNavbarRoot() {
      return document.getElementById('navbar');
    }

    function findLogoAnchor(navbar) {
      if (!navbar) return null;
      // The logo image uses class "nav-logo". Find its anchor container.
      var img = navbar.querySelector('img.nav-logo');
      return img ? img.closest('a') : null;
    }

    function ensureContainerAfter(anchor) {
      if (!anchor) return null;
      // Look for existing wrapper to avoid duplicates
      var existing = document.getElementById(WRAP_ID);
      if (existing) return existing;

      // Create a sibling container to host the button (desktop only like UI Kits)
      var wrap = document.createElement('div');
      wrap.id = WRAP_ID;
      wrap.className = 'hidden lg:flex items-center gap-x-2';
      if (anchor.parentNode) {
        anchor.parentNode.insertBefore(wrap, anchor.nextSibling);
      }
      return wrap;
    }

    function buildDropdown(currentKey) {
      var current = PRODUCTS.find(function (p) { return p.key === currentKey; });
      var btnLabel = current ? current.label : 'Products';

      // Button (small rounded pill with chevron)
      var btn = document.createElement('button');
      btn.id = BTN_ID;
      btn.type = 'button';
      btn.setAttribute('aria-haspopup', 'menu');
      btn.setAttribute('aria-expanded', 'false');
      btn.className = [
        'group bg-background-light dark:bg-background-dark disabled:pointer-events-none',
        '[&>span]:line-clamp-1 overflow-hidden outline-none',
        'group-hover:text-gray-950/70 dark:group-hover:text-white/70',
        'text-sm gap-2 text-gray-600 dark:text-gray-300 leading-5 font-medium',
        'border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700',
        'rounded-full py-1.5 px-3.5 flex items-center space-x-2 whitespace-nowrap shadow-sm'
      ].join(' ');
      var span = document.createElement('span');
      span.textContent = btnLabel;
      btn.appendChild(span);
      var chev = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      chev.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      chev.setAttribute('width', '12');
      chev.setAttribute('height', '12');
      chev.setAttribute('viewBox', '0 0 24 24');
      chev.setAttribute('fill', 'none');
      chev.setAttribute('stroke', 'currentColor');
      chev.setAttribute('stroke-width', '2.5');
      chev.setAttribute('stroke-linecap', 'round');
      chev.setAttribute('stroke-linejoin', 'round');
      chev.setAttribute('class', 'lucide lucide-chevron-down');
      var svgp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      svgp.setAttribute('d', 'm6 9 6 6 6-6');
      chev.appendChild(svgp);
      btn.appendChild(chev);

      // Menu
      var menu = document.createElement('div');
      menu.id = DROPDOWN_ID;
      menu.setAttribute('role', 'menu');
      menu.style.display = 'none';
      menu.style.zIndex = '2147483647'; // ensure on top
      menu.className = [
        'absolute mt-2 right-0',
        'bg-background-light dark:bg-background-dark',
        'border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden',
        'py-2 min-w-[12rem]'
      ].join(' ');

      PRODUCTS.forEach(function (prod) {
        var a = document.createElement('a');
        a.href = prod.href;
        a.className = 'block px-3.5 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-950/5 dark:hover:bg-white/5';
        a.textContent = prod.label;
        if (prod.key === currentKey) {
          a.className += ' cursor-default text-primary dark:text-primary-light';
        }
        a.addEventListener('click', function (e) {
          // Emit a product change event for the nav filter to react immediately
          try {
            var evt = new CustomEvent('cc:product-change', { detail: { key: prod.key, href: prod.href } });
            window.dispatchEvent(evt);
          } catch (_) {}
        }, true);
        menu.appendChild(a);
      });

      // Wrapper to anchor absolute menu positioning to the button area
      var relativeWrap = document.createElement('div');
      relativeWrap.style.position = 'relative';
      relativeWrap.appendChild(btn);
      relativeWrap.appendChild(menu);

      // Toggle logic
      function close() {
        btn.setAttribute('aria-expanded', 'false');
        menu.style.display = 'none';
        document.removeEventListener('click', onDocClick, true);
        document.removeEventListener('keydown', onKeydown, true);
      }
      function open() {
        btn.setAttribute('aria-expanded', 'true');
        menu.style.display = 'block';
        setTimeout(function(){
          document.addEventListener('click', onDocClick, true);
          document.addEventListener('keydown', onKeydown, true);
        }, 0);
      }
      function onDocClick(e) {
        if (!relativeWrap.contains(e.target)) close();
      }
      function onKeydown(e) {
        if (e.key === 'Escape') close();
      }
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var isOpen = btn.getAttribute('aria-expanded') === 'true';
        if (isOpen) close(); else open();
      });

      // Close on route change implicitly handled by refresher outside
      return relativeWrap;
    }

    function removeIfAny() {
      var existingWrap = document.getElementById(WRAP_ID);
      if (existingWrap && existingWrap.parentNode) {
        existingWrap.parentNode.removeChild(existingWrap);
      }
    }

    function apply() {
      var raw = location.pathname || '';
  var path = normalizePath(raw);
      if (!shouldDisplay(path)) {
        removeIfAny();
        return false;
      }
      var navbar = getNavbarRoot();
      if (!navbar) return false;
      var logoA = findLogoAnchor(navbar);
      var host = ensureContainerAfter(logoA);
      if (!host) return false;

      // If we already injected for this page, skip
      if (host.querySelector('#' + BTN_ID)) return true;

      var currentKey = getRouteKey(path);
      host.appendChild(buildDropdown(currentKey));
      return true;
    }

    function debounce(fn, wait) {
      var t; return function () { clearTimeout(t); var a = arguments; t = setTimeout(function () { fn.apply(null, a); }, wait); };
    }

    var refresh = debounce(function () {
      if (!apply()) {
        // Re-try shortly in case navbar/hydration not ready
        setTimeout(apply, 75);
      }
    }, 50);

    // Initial
    refresh();

    // Observe navbar/hydration changes
    var observerTarget = document.getElementById('navbar') || document.body;
    var mo = new MutationObserver(function () { refresh(); });
    mo.observe(observerTarget, { childList: true, subtree: true });

    // SPA route changes
    function hookHistory(method) {
      var orig = history[method];
      if (typeof orig !== 'function') return;
      history[method] = function () { var ret = orig.apply(this, arguments); refresh(); return ret; };
    }
    try { hookHistory('pushState'); hookHistory('replaceState'); } catch (_) {}
    window.addEventListener('popstate', refresh, true);
    window.addEventListener('hashchange', refresh, true);
    document.addEventListener('visibilitychange', function(){ if (!document.hidden) refresh(); }, true);
  } catch (_) { /* noop */ }
})();
