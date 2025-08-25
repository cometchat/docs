/*
  Product nav filter for Mintlify (via GTM Custom HTML tag)
  - Shows only allowed top-level tabs when a given product route is active
  - Works with Mintlify hydration by waiting for the nav to render
*/
(function () {
  try {
    var path = location.pathname || '';
    // Route detection
    var routeKey = null;
    if (path.startsWith('/chat-call')) routeKey = 'chat-call';
    else if (path.startsWith('/ai-agents')) routeKey = 'ai-agents';
    else if (path.startsWith('/moderation')) routeKey = 'moderation';
    else if (path.startsWith('/notifications')) routeKey = 'notifications';
    else if (path.startsWith('/insights')) routeKey = 'insights';
    if (!routeKey) return;

    var allowedByRoute = {
      'chat-call': [ 
        '/chat-call',            // Chat & Calling root
        '/fundamentals',         // Platform
        '/chat-builder',          // Chat Builder
        '/ui-kit',               // UI Kits
        '/sdk',                  // SDKs
        '/widget',               // No Code - Widgets
        '/rest-api/chat-apis'   // APIs (Chat APIs)
      ],
      'ai-agents': [
        '/ai-agents',            // AI Agents (no trailing slash)
        '/ai-agents/',           // AI Agents (trailing slash safety)
        '/ai-agents/mastra',     // AI Agents Builder
        '/chat-builder'          // Chat Builder
      ],
      'moderation': [
        '/moderation'            // AI Moderation (only this tab)
      ],
      'notifications': [
        '/notifications'         // Notifications only
      ],
      'insights': [
        '/insights'              // Insights only
      ]
    };

    function isAllowedHref(href) {
      if (!href) return false;
      return allowedByRoute[routeKey].some(function (slug) {
        return href.indexOf(slug) === 0; // prefix match
      });
    }

    function applyFilter() {
      var nav = document.querySelector('.nav-tabs');
      if (!nav) return false;
      var links = nav.querySelectorAll('a');
      if (!links || !links.length) return false;
      links.forEach(function (a) {
        var href = a.getAttribute('href') || '';
        a.style.display = isAllowedHref(href) ? '' : 'none';
      });
      return true;
    }

    if (!applyFilter()) {
      var mo = new MutationObserver(function () {
        if (applyFilter()) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () { try { mo.disconnect(); } catch (_) {} }, 5000);
    }
  } catch (_) { /* noop */ }
})();
