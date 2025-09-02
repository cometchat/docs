/* CometChat Docs navigation runtime
 * - Adds html.cc-home on homepage
 * - Adds html.cc-nav-ready after nav is filtered/ready (non-home)
 * - Listens to SPA route changes and DOM mutations
 */
(function () {
  var d = document;
  var w = window;

  function isHome(pathname) {
    if (!pathname) pathname = location.pathname;
    return pathname === '/' || pathname === '/docs' || pathname === '/docs/' || pathname === '/index' || pathname === '/index.html';
  }

  function setHtmlFlags() {
    var html = d.documentElement;
    var home = isHome();
    if (home) {
      html.classList.add('cc-home');
      // cc-nav-ready will be re-added after nav-filter finishes homepage filter
      html.classList.remove('cc-nav-ready');
    } else {
      html.classList.remove('cc-home');
      // Remove cc-nav-ready before filtering to avoid flicker
      html.classList.remove('cc-nav-ready');
    }
  }

  function markReady() {
    d.documentElement.classList.add('cc-nav-ready');
  }

  function dispatchRouteEvent(name) {
    try {
      var detail = { path: location.pathname, url: location.href };
      var ev = new CustomEvent(name, { detail: detail });
      w.dispatchEvent(ev);
    } catch (_) {}
  }

  function onRoute() {
    // Clear any stale alignment state early
    try { d.documentElement.classList.remove('cc-version-aligned'); } catch(_) {}
    setHtmlFlags();
    // Let other scripts (aligners, analytics, etc.) react to route changes
    dispatchRouteEvent('cc:route-change');
    // Re-arm safety reveal in case nav-filter doesn't run on this page
    scheduleFallback();
    // Fire an after hook on next tick for DOM that renders async
    try { setTimeout(function(){ dispatchRouteEvent('cc:route-after'); }, 0); } catch(_) {}
  }

  // Initial
  setHtmlFlags();
  // Do not reveal here; wait for cc:nav-ready from nav-filter. Add a fallback in case filter is absent.
  var fallbackTimer = null;
  function scheduleFallback() {
    if (fallbackTimer || isHome()) return;
    fallbackTimer = setTimeout(function(){
      // Reveal to avoid nav staying hidden if filter failed to load
      markReady();
    }, 1200);
  }
  scheduleFallback();
  // Let listeners know initial route is ready-ish
  try { setTimeout(function(){ dispatchRouteEvent('cc:route-initial'); }, 0); } catch(_) {}

  // SPA hooks
  try {
    var push = history.pushState;
    var rep = history.replaceState;
    history.pushState = function () {
      push.apply(this, arguments);
      onRoute();
    };
    history.replaceState = function () {
      rep.apply(this, arguments);
      onRoute();
    };
  } catch (e) {}
  w.addEventListener('popstate', onRoute);
  w.addEventListener('hashchange', onRoute);

  // Mutation observer to catch navbar render
  var mo = new MutationObserver(function () {
    // No-op: reveal is controlled by cc:nav-ready or fallback
  });
  mo.observe(d.documentElement, { childList: true, subtree: true });

  // Listen for nav-filter readiness
  try {
    w.addEventListener('cc:nav-ready', function(){
      if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
      markReady();
    // Signal that navigation is now revealed and stable
    dispatchRouteEvent('cc:nav-revealed');
    });
  } catch (_) {}

  // Expose a manual ping for any script to re-run route handlers
  try { w.ccRoutePing = onRoute; } catch(_) {}
})();
