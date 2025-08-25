/*
  Product nav filter for Mintlify (via GTM Custom HTML tag)
  - Shows only allowed top-level tabs when a given product route is active
  - Works with Mintlify hydration by waiting for the nav to render
  - Now resilient to SPA route changes (pushState/replaceState/popstate)
*/
(function () {
  try {
    var lastAppliedFor = null;

    var ALWAYS_KEEP_LABELS = ['home'];
    var ALWAYS_KEEP_HREFS = ['/', '/index'];

    function getRouteKey(path) {
      if (!path) return null;
      if (path.startsWith('/chat-call')) return 'chat-call';
      if (path.startsWith('/ai-agents')) return 'ai-agents';
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
        var u = href;
        if (/^https?:\/\//i.test(href)) {
          u = new URL(href, location.origin).pathname;
        }
        return allowedByRoute[routeKey].some(function (slug) { return u.indexOf(slug) === 0; });
      } catch (_) {
        return allowedByRoute[routeKey].some(function (slug) { return href.indexOf(slug) === 0; });
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
      // Include anchors and buttons, but only immediate nav-level controls
      var ctrls = Array.prototype.slice.call(root.querySelectorAll('a,button'));
      // Filter out items that are inside dropdown menus/popovers if they are not part of the top bar
      ctrls = ctrls.filter(function (el) {
        // Heuristic: top bar controls are visible and part of the first-level nav container
        return el.offsetParent !== null && root.contains(el);
      });
      return ctrls;
    }

    function hide(el) { el.style.display = 'none'; }
    function show(el) { el.style.display = ''; }

    function resetFilter() {
      getTabControls().forEach(show);
      lastAppliedFor = null;
    }

    function isAlwaysKeep(el) {
      var href = (el.getAttribute && el.getAttribute('href')) || '';
      if (ALWAYS_KEEP_HREFS.indexOf(href) !== -1) return true;
      var lbl = normalizeLabel(el);
      return ALWAYS_KEEP_LABELS.indexOf(lbl) !== -1;
    }

    function applyFilterFor(routeKey) {
      if (!routeKey) { resetFilter(); return false; }
      var ctrls = getTabControls();
      if (!ctrls.length) return false;
      ctrls.forEach(function (el) {
        if (isAlwaysKeep(el)) { show(el); return; }
        var href = (el.getAttribute('href') || '').trim();
        var keep = isAllowedHref(routeKey, href) || isAllowedLabel(routeKey, el);
        if (keep) show(el); else hide(el);
      });
      lastAppliedFor = routeKey;
      return true;
    }

    function debounce(fn, wait) {
      var t; return function () { clearTimeout(t); var a = arguments; t = setTimeout(function () { fn.apply(null, a); }, wait); };
    }

    var refresh = debounce(function () {
      var path = location.pathname || '';
      var rk = getRouteKey(path);
      // Always re-apply on route or structure changes
      if (rk !== lastAppliedFor || !getTabControls().length) {
        if (!applyFilterFor(rk)) {
          setTimeout(function () { applyFilterFor(getRouteKey(location.pathname || '')); }, 75);
        }
      } else {
        // Re-affirm after hydration updates
        applyFilterFor(rk);
      }
    }, 50);

    // Initial run and observers/hooks remain the same
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
  } catch (_) { /* noop */ }
})();
