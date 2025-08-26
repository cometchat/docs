/*
  Product nav filter for Mintlify (via GTM Custom HTML tag)
  - Shows only allowed top-level tabs when a given product route is active
  - Works with Mintlify hydration by waiting for the nav to render
  - Now resilient to SPA route changes (pushState/replaceState/popstate)
*/
(function () {
  try {
  var lastAppliedFor = null;
  var INITIAL_STYLE_ID = 'cc-hide-all-nav-tabs';
  var initialStyleRemoved = false;
  var STORAGE_KEY = 'cc:last-product-key';

  // Routes that are shared across multiple products; keep previous product context on these
  // Add more shared roots as needed.
  var SHARED_PREFIXES = [
    '/chat-builder',
    '/ui-kit',
    '/sdk',
    '/widget',
    '/rest-api',
    '/fundamentals'
  ];

  // Always hide Home everywhere
  var ALWAYS_HIDE_LABELS = ['home'];

  // Detect docs base path (e.g., '/docs') and strip it for routing logic
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

    function isSharedPath(path) {
      if (!path) return false;
      try { path = stripBase(path); } catch (_) {}
      return SHARED_PREFIXES.some(function (pre) { return path.indexOf(pre) === 0; });
    }

    function getRouteKey(path) {
      if (!path) return null;
      path = stripBase(path);
      if (path.startsWith('/chat-call')) return 'chat-call';
      if (path.startsWith('/ai-agents')) return 'ai-agents';
      if (path.startsWith('/ai-agents/mastra')) return 'ai-agents';
      if (path.startsWith('/moderation')) return 'moderation';
      if (path.startsWith('/notifications')) return 'notifications';
      if (path.startsWith('/insights')) return 'insights';
      return null; // unmanaged route
    }

    var allowedByRoute = {
      'chat-call': [
        '/chat-call',
        '/fundamentals',
        '/ui-kit',
        '/sdk',
        '/widget',
        '/rest-api/chat-apis',
        '/chat-builder'
      ],
      'ai-agents': [
        '/ai-agents',
        '/ai-agents/',
        '/ai-agents/mastra',
        '/chat-builder'
      ],
      'moderation': [
        '/moderation'
      ],
      'notifications': [
        '/notifications'
      ],
      'insights': [
        '/insights'
      ]
    };

    // Fallback to tab labels for dropdown-only tabs (from docs.json top-level tabs)
    var allowedLabelsByRoute = {
      'chat-call': [
        'Chat & Calling', 'Platform', 'UI Kits', 'SDKs', 'No Code - Widgets', 'APIs', 'Chat Builder'
      ],
      'ai-agents': [
        'AI Agents', 'AI Agents Builder', 'Chat Builder'
      ],
      'moderation': [
        'AI Moderation'
      ],
      'notifications': [
        'Notifications'
      ],
      'insights': [
        'Insights'
      ]
    };

    function normalizeLabel(el) {
      var t = (el && (el.innerText || el.textContent) || '').replace(/\s+/g, ' ').trim().toLowerCase();
      // Some nav buttons might wrap label in spans; this normalization should suffice
      return t;
    }

    function isAllowedHref(routeKey, href) {
      if (!routeKey || !href) return false;
      try {
        // Only compare path part for absolute URLs
        var p = href;
        if (/^https?:\/\//i.test(href)) {
          p = new URL(href, location.origin).pathname;
        }
        p = stripBase(p);
        return allowedByRoute[routeKey].some(function (slug) { return p.indexOf(slug) === 0; });
      } catch (_) {
        var q = stripBase(href);
        return allowedByRoute[routeKey].some(function (slug) { return q.indexOf(slug) === 0; });
      }
    }

    function isAllowedLabel(routeKey, labelEl) {
      if (!routeKey || !labelEl) return false;
      var lbl = normalizeLabel(labelEl);
      var allowed = allowedLabelsByRoute[routeKey] || [];
      return allowed.some(function (x) { return lbl === x.toLowerCase(); });
    }

    function getTabsContainer() {
      return document.querySelector('.nav-tabs');
    }

    function getTabControls() {
      var root = getTabsContainer();
      if (!root) return [];
      // Include anchors and buttons under nav tabs
      return Array.prototype.slice.call(root.querySelectorAll('a,button'));
    }

    function hide(el) { el.style.display = 'none'; }
    function show(el) { el.style.display = ''; }

    function resetFilter() {
      // Show all except Home (which stays hidden everywhere)
      getTabControls().forEach(function (el) {
        if (isAlwaysHide(el)) hide(el); else show(el);
      });
      lastAppliedFor = null;
      removeInitialStyle();
    }

    function isAlwaysHide(el) {
      var href = (el.getAttribute && el.getAttribute('href')) || '';
      // Normalize and strip base to detect Home links consistently
      var p = href;
      try { if (/^https?:\/\//i.test(href)) p = new URL(href, location.origin).pathname; } catch (_) {}
      p = stripBase(p || '/');
      if (p === '/' || p === '/index' || p === '/index.html') return true;
      var lbl = normalizeLabel(el);
      return ALWAYS_HIDE_LABELS.indexOf(lbl) !== -1;
    }

    function applyFilterFor(routeKey) {
      if (!routeKey) { resetFilter(); return false; }
      var ctrls = getTabControls();
      if (!ctrls.length) return false;
      ctrls.forEach(function (el) {
        if (isAlwaysHide(el)) { hide(el); return; }
        var href = (el.getAttribute('href') || '').trim();
        var keep = isAllowedHref(routeKey, href) || isAllowedLabel(routeKey, el);
        if (keep) show(el); else hide(el);
      });
      lastAppliedFor = routeKey;
  try { sessionStorage.setItem(STORAGE_KEY, routeKey); } catch (_) {}
      removeInitialStyle();
      // Signal to theme runtime that nav is filtered and safe to reveal
      try { window.dispatchEvent(new CustomEvent('cc:nav-ready', { detail: { routeKey: routeKey } })); } catch (_) {}
      return true;
    }

    function debounce(fn, wait) {
      var t; return function () { clearTimeout(t); var a = arguments; t = setTimeout(function () { fn.apply(null, a); }, wait); };
    }

  var refresh = debounce(function () {
      var raw = location.pathname || '';
      var path = stripBase(raw);
      var rk = getRouteKey(path);
      // If on homepage, hide all nav items (Home stays hidden globally anyway)
      if (normalizePathForHome(path)) {
  getTabControls().forEach(hide);
        lastAppliedFor = 'home';
        removeInitialStyle();
  try { window.dispatchEvent(new CustomEvent('cc:nav-ready', { detail: { routeKey: 'home' } })); } catch (_) {}
        return;
      }
      // If route does not map to a single product but is a shared page, keep previous/persisted product context
      if (!rk && isSharedPath(path)) {
        var persisted = null;
        try { persisted = sessionStorage.getItem(STORAGE_KEY) || null; } catch (_) {}
        var useKey = lastAppliedFor && lastAppliedFor !== 'home' ? lastAppliedFor : persisted;
        if (!useKey) {
          // Default to Chat & Calling if no context exists to avoid a reset/flash
          useKey = 'chat-call';
        }
        applyFilterFor(useKey);
        return;
      }
      // Always re-apply on route or structure changes
      applyFilterFor(rk);
    }, 10);

    // Inject an initial style to hide all nav items to avoid flicker; will be removed after first apply/reset
    function injectInitialStyle() {
      if (document.getElementById(INITIAL_STYLE_ID)) return;
      var style = document.createElement('style');
      style.id = INITIAL_STYLE_ID;
      style.textContent = '#navbar .nav-tabs, #navbar .nav-tabs * { display: none !important; }';
      document.head.appendChild(style);
    }
    function removeInitialStyle() {
      if (initialStyleRemoved) return;
      var style = document.getElementById(INITIAL_STYLE_ID);
      if (style && style.parentNode) {
        style.parentNode.removeChild(style);
      }
      initialStyleRemoved = true;
    }

    function normalizePathForHome(p){
      if (!p) return true;
      try { p = stripBase(p); } catch (_) {}
      p = (p || '/').replace(/\/+$/, '') || '/';
      return p === '/' || p === '/index' || p === '/index.html';
    }

  injectInitialStyle();
    refresh();

    var observerTarget = document.getElementById('navbar') || document.body;
    var mo = new MutationObserver(function (mutations) {
      var touched = mutations.some(function (m) {
        if (!m) return false;
        if (m.target && m.target.classList && m.target.classList.contains('nav-tabs')) return true;
        return Array.prototype.some.call(m.addedNodes || [], function (n) {
          return n && n.nodeType === 1 && n.classList && n.classList.contains('nav-tabs');
        });
      });
      if (touched) refresh();
    });
    mo.observe(observerTarget, { childList: true, subtree: true });

    function hookHistory(method) {
      var orig = history[method];
      if (typeof orig !== 'function') return;
      history[method] = function () { var ret = orig.apply(this, arguments); refresh(); return ret; };
    }
    try { hookHistory('pushState'); hookHistory('replaceState'); } catch (_) {}
    window.addEventListener('popstate', refresh, true);
    window.addEventListener('hashchange', refresh, true);
    document.addEventListener('visibilitychange', function(){ if (!document.hidden) refresh(); }, true);

    // React to explicit product dropdown changes without relying solely on route
    try {
      window.addEventListener('cc:product-change', function (e) {
        var key = e && e.detail && e.detail.key;
        if (!key) return;
  try { sessionStorage.setItem(STORAGE_KEY, key); } catch (_) {}
        // If on homepage, keep hidden (navigation.js controls reveal); otherwise apply immediately
        var p = location.pathname || '/';
        if (normalizePathForHome(p)) {
          getTabControls().forEach(hide);
          lastAppliedFor = 'home';
          removeInitialStyle();
          return;
        }
        applyFilterFor(key);
      });
    } catch (_) {}
  } catch (_) { /* noop */ }
})();
