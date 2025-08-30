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

  // Nothing is always hidden now
  var ALWAYS_HIDE_LABELS = [];

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
      // Explicitly map shared sections to their owning product
      if (path.startsWith('/chat-builder')) return 'chat-call';
      if (path.startsWith('/widget/ai-agents')) return 'ai-agents';
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
        // Show the AI Agents Chat Builder (widget) tab when in AI Agents context
        '/widget/ai-agents'
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
        'AI Agents', 'AI Agents Builder'
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

    function getTabId(el) {
      if (!el) return null;
      try { return el.getAttribute('tab-id') || (el.dataset && el.dataset.tabId) || null; } catch(_) { return null; }
    }

    function isBlockedHref(routeKey, pathOnly) {
      try { pathOnly = stripBase(pathOnly || '/'); } catch (_) {}
      if (routeKey === 'chat-call') {
        // Hide AI Agents Chat Builder tab in Chat & Calling context
        if (pathOnly.indexOf('/widget/ai-agents') === 0) return true;
      }
      if (routeKey === 'ai-agents') {
        // Hide Framework Chat Builder tab in AI Agents context
        if (pathOnly.indexOf('/chat-builder') === 0) return true;
      }
      return false;
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
        if (isBlockedHref(routeKey, p)) return false;
        return allowedByRoute[routeKey].some(function (slug) { return p.indexOf(slug) === 0; });
      } catch (_) {
        var q = stripBase(href);
        if (isBlockedHref(routeKey, q)) return false;
        return allowedByRoute[routeKey].some(function (slug) { return q.indexOf(slug) === 0; });
      }
    }

    function isAllowedLabel(routeKey, labelEl) {
      if (!routeKey || !labelEl) return false;
      var lbl = normalizeLabel(labelEl);
      // Special-case: both top-level tabs share the label "Chat Builder".
      if (lbl === 'chat builder') {
        var id = getTabId(labelEl);
        // If a tab-id is present, honor it strictly
        if (id === 'chat-builder') return routeKey === 'chat-call';
        if (id === 'ai-agent-chat-builder') return routeKey === 'ai-agents';
        // Fallback to href heuristics when tab-id isn't present
        var href = (labelEl.getAttribute && labelEl.getAttribute('href')) || '';
        var p = href;
        try { if (/^https?:\/\//i.test(href)) p = new URL(href, location.origin).pathname; } catch (_) {}
        p = stripBase(p || '/');
        if (routeKey === 'chat-call') return p.indexOf('/chat-builder') === 0;
        if (routeKey === 'ai-agents') return p.indexOf('/widget/ai-agents') === 0;
        return false;
      }
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

    // Transient hide to prevent flicker while we toggle items
    var transientHidden = false;
    function beginTransientHide() {
      var root = getTabsContainer();
      if (!root || transientHidden) return;
      try { root.style.visibility = 'hidden'; transientHidden = true; } catch (_) {}
    }
    function endTransientHide() {
      var root = getTabsContainer();
      if (!root || !transientHidden) return;
      try { root.style.visibility = ''; transientHidden = false; } catch (_) {}
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
      var lbl = normalizeLabel(el);
      return ALWAYS_HIDE_LABELS.indexOf(lbl) !== -1;
    }

    function isHomeItem(el) {
      if (!el) return false;
      var href = (el.getAttribute && el.getAttribute('href')) || '';
      var p = href;
      try { if (/^https?:\/\//i.test(href)) p = new URL(href, location.origin).pathname; } catch (_) {}
      p = stripBase(p || '/');
      if (p === '/' || p === '/index' || p === '/index.html') return true;
      var lbl = normalizeLabel(el);
      return lbl === 'home';
    }

    function applyFilterFor(routeKey) {
      if (!routeKey) { resetFilter(); return false; }
      var ctrls = getTabControls();
      if (!ctrls.length) return false;
      ctrls.forEach(function (el) {
  if (isAlwaysHide(el)) { hide(el); return; }
  // Always keep Home visible on non-home pages
  if (isHomeItem(el)) { show(el); return; }
        var href = (el.getAttribute('href') || '').trim();
        var keep = isAllowedHref(routeKey, href) || isAllowedLabel(routeKey, el);
        // Additional guard for duplicate-labeled Chat Builder tabs when both exist
        if (keep && normalizeLabel(el) === 'chat builder') {
          var id = getTabId(el);
          if (routeKey === 'chat-call' && id === 'ai-agent-chat-builder') keep = false;
          if (routeKey === 'ai-agents' && id === 'chat-builder') keep = false;
        }
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
      beginTransientHide();
      var raw = location.pathname || '';
      var path = stripBase(raw);
      var rk = getRouteKey(path);
      // If on homepage, show only: Home, Chat & Calling, AI Agents, AI Moderation, Notifications, Insights
      if (normalizePathForHome(path)) {
        var allowedHome = ['home','chat & calling','ai agents','ai moderation','notifications','insights'];
        getTabControls().forEach(function(el){
          var lbl = normalizeLabel(el);
          var href = (el.getAttribute && el.getAttribute('href')) || '';
          var p = href;
          try { if (/^https?:\/\//i.test(href)) p = new URL(href, location.origin).pathname; } catch (_) {}
          p = stripBase(p || '/');
          var isHomeLink = (p === '/' || p === '/index' || p === '/index.html');
          if (isHomeLink || allowedHome.indexOf(lbl) !== -1) show(el); else hide(el);
        });
        lastAppliedFor = 'home';
        removeInitialStyle();
        try { window.dispatchEvent(new CustomEvent('cc:nav-ready', { detail: { routeKey: 'home' } })); } catch (_) {}
        endTransientHide();
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
        endTransientHide();
        return;
      }
      // Always re-apply on route or structure changes
      applyFilterFor(rk);
      endTransientHide();
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
