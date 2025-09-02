// CometChat Docs — small runtime utilities shared by nav scripts
(function () {
  if (window.ccUtils) return; // singleton

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

  function withBase(href) {
    var base = getBasePrefix();
    if (!base) return href;
    return href.indexOf(base + '/') === 0 || href === base ? href : (base + href);
  }

  function isHome(pathname) {
    var p = stripBase(pathname || location.pathname || '/');
    return p === '/' || p === '/index' || p === '/index.html';
  }

  // Call cb once nav is revealed; if already revealed, schedule next tick
  function onNavReady(cb) {
    try {
      if (document.documentElement.classList.contains('cc-nav-ready')) {
        setTimeout(cb, 0); return function(){};
      }
    } catch(_) {}
    function handler(){ try{ cb(); } finally { off(); } }
    function off(){ try{ window.removeEventListener('cc:nav-revealed', handler, true);}catch(_){}}
    try { window.addEventListener('cc:nav-revealed', handler, true); } catch(_) {}
    return off;
  }

  // Debounce helper
  function debounce(fn, wait){ var t; return function(){ clearTimeout(t); var a=arguments; t=setTimeout(function(){ fn.apply(null,a); }, wait||50); } }

  // History patch guard
  function patchHistoryOnce(flag){
    try {
      if (window[flag]) return;
      var push = history.pushState;
      var rep = history.replaceState;
      history.pushState = function(){ var r = push.apply(this, arguments); try{ window.dispatchEvent(new Event('popstate')); }catch(_){ } return r; };
      history.replaceState = function(){ var r = rep.apply(this, arguments); try{ window.dispatchEvent(new Event('popstate')); }catch(_){ } return r; };
      window[flag] = true;
    } catch(_) {}
  }

  window.ccUtils = {
    getBasePrefix: getBasePrefix,
    stripBase: stripBase,
    withBase: withBase,
    isHome: isHome,
    onNavReady: onNavReady,
    debounce: debounce,
    patchHistoryOnce: patchHistoryOnce
  };
})();

