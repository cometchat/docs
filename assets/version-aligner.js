/* ------------------------------------------------------------------ */
/* 1 —  Version dropdown aligner (no global DOM patches).             */
/* ------------------------------------------------------------------ */
(function initVersionAligner() {
    // Prevent double-initialization if the script is included twice
    try {
        if (window.__ccVersionAlignerInitialized__) return;
        window.__ccVersionAlignerInitialized__ = true;
    } catch (_) {}
    // Debug mode - can be controlled from console via: window.VERSION_ALIGNER_DEBUG = true
    let DEBUG_MODE = false;
    
    // Expose debug control globally
    window.VERSION_ALIGNER_DEBUG = DEBUG_MODE;
    
    // Debug logging function
    function debugLog(...args) {
        if (window.VERSION_ALIGNER_DEBUG) {
            console.log(...args);
        }
    }
    

    
    let observer;
    const ALIGNER_ROW_CLASS = 'version-aligner-row';
    const PLACEHOLDER_ID = 'version-aligner-placeholder';
    
    // Cache for expensive operations
    let cachedVersionButton = null;
    let cachedForwardButton = null;
    let lastUrl = '';

    // Gate alignment on navigation readiness to avoid hydration races
    let NAV_READY = false;
    try { NAV_READY = document.documentElement.classList.contains('cc-nav-ready'); } catch(_) {}
    try {
        window.addEventListener('cc:route-change', function(){ NAV_READY = false; }, true);
        window.addEventListener('cc:nav-revealed', function(){ NAV_READY = true; }, true);
    } catch(_) {}

    function findVersionSelector() {
        debugLog('[version-aligner] Finding version selector...');
        
        // Clear cache if URL changed (indicates page navigation)
        if (window.location.href !== lastUrl) {
            cachedVersionButton = null;
            cachedForwardButton = null;
            lastUrl = window.location.href;
            debugLog('[version-aligner] URL changed, clearing cache');
        }
        
        // Return cached result if available and element still exists in DOM
        if (cachedVersionButton && document.contains(cachedVersionButton)) {
            debugLog('[version-aligner] Using cached version button');
            return cachedVersionButton;
        }
        
        const navBar = document.getElementById('navbar');
        if (!navBar) {
            debugLog('[version-aligner] ERROR: navbar not found');
            return null;
        }
        debugLog('[version-aligner] navbar found:', navBar);
        
        const allButtons = [...navBar.querySelectorAll('button')];
        debugLog('[version-aligner] All buttons in navbar:', allButtons.length, allButtons);
        
        const filteredButtons = allButtons
                .filter(el => !el.closest(`.${ALIGNER_ROW_CLASS}`))
                // Exclude any known product dropdown triggers by id or data markers
                .filter(el => el.id !== 'cc-product-dropdown-button')
                .filter(el => !el.hasAttribute('data-cc-home-product-button'));
        debugLog('[version-aligner] Buttons not in aligner row:', filteredButtons.length, filteredButtons);
        
        const menuButtons = filteredButtons
            .filter(el => el.getAttribute('aria-haspopup') === 'menu');
        debugLog('[version-aligner] Buttons with aria-haspopup=menu:', menuButtons.length, menuButtons);
        
        // Log the text content of each menu button for debugging
        menuButtons.forEach((btn, index) => {
            const rawText = btn.textContent.trim();
            const cleanText = rawText.replace(/[\u200E\u200F\u2060\u00A0\s]/g, ''); // Remove LTR/RTL marks, word joiners, non-breaking spaces
            debugLog(`[version-aligner] Menu button ${index + 1} raw text:`, `"${rawText}"`);
            debugLog(`[version-aligner] Menu button ${index + 1} clean text:`, `"${cleanText}"`);
            debugLog(`[version-aligner] Menu button ${index + 1} matches version regex:`, /^v\d+([\.-]\w+)*$/i.test(cleanText));
        });
        
        const versionButtons = menuButtons.filter(el => {
            // Consider only visible buttons
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return false;
            // Extract text robustly
            const rawText = (el.innerText || el.textContent || '').trim();
            const cleanText = rawText.replace(/[\u200E\u200F\u2060\u00A0\s]/g, '');
            return /^v\d+([\.-]\w+)*$/i.test(cleanText);
        });
        debugLog('[version-aligner] Version buttons found:', versionButtons.length, versionButtons);
        
        if (versionButtons.length > 0) {
            cachedVersionButton = versionButtons[0]; // Cache the result
            debugLog('[version-aligner] Selected version button:', versionButtons[0]);
            debugLog('[version-aligner] Version button text:', versionButtons[0].textContent.trim());
            return cachedVersionButton;
        }
        
        debugLog('[version-aligner] No version button found');
        return null;
    }

    // Route gating: version dropdown should appear only on configured prefixes
    const ALLOWED_VERSION_PREFIXES = (Array.isArray(window.ccVersionRoutes) && window.ccVersionRoutes.length)
        ? window.ccVersionRoutes : ['/ui-kit','/sdk'];
    function isVersionRoute() {
        try {
            let p = window.location.pathname || '/';
            p = stripBase(p);
            return ALLOWED_VERSION_PREFIXES.some(prefix => p === prefix || p.indexOf(prefix + '/') === 0);
        } catch(_) { return false; }
    }

    function isVersionLabelText(txt) {
        if (!txt) return false;
        var clean = String(txt).trim().replace(/[\u200E\u200F\u2060\u00A0\s]/g, '');
        return /^v\d+([\.-]\w+)*$/i.test(clean);
    }

    function getAllVersionButtons() {
        try {
            var all = Array.from(document.querySelectorAll('button[aria-haspopup="menu"]'));
            return all.filter(function(b){ return isVersionLabelText(b.innerText || b.textContent || ''); });
        } catch(_) { return []; }
    }

    function hideAllVersionButtons() {
        try { getAllVersionButtons().forEach(function(b){ b.style.display = 'none'; }); } catch(_) {}
    }
    function showAllVersionButtons() {
        try { getAllVersionButtons().forEach(function(b){ b.style.display = ''; }); } catch(_) {}
    }

    function findForwardButton() {
        debugLog('[version-aligner] Finding forward button...');
        // Return cached result if available and element still exists in DOM
        if (cachedForwardButton && document.contains(cachedForwardButton)) {
            debugLog('[version-aligner] Using cached forward button');
            return cachedForwardButton;
        }
        // Look for any visible non-version dropdown in the sidebar
        try {
            const sidebar = document.getElementById('sidebar-content');
            const nav = sidebar && sidebar.querySelector('#navigation-items');
            if (nav) {
                const candidates = Array.from(nav.querySelectorAll('button[aria-haspopup="menu"]'))
                    .filter(b => b.id !== 'cc-product-dropdown-button')
                    .filter(b => !b.hasAttribute('data-cc-home-product-button'))
                    .filter(b => {
                        const txt = (b.textContent || '').trim().replace(/[\u200E\u200F\u2060\u00A0\s]/g, '');
                        return !/^v\d+([\.-]\w+)*$/i.test(txt);
                    })
                    .filter(b => {
                        const r = b.getBoundingClientRect();
                        return r.width > 0 && r.height > 0;
                    });
                if (candidates.length) {
                    cachedForwardButton = candidates[0];
                    debugLog('[version-aligner] Forward button found:', cachedForwardButton);
                    return cachedForwardButton;
                }
            }
        } catch(_) {}
        debugLog('[version-aligner] No forward button found');
        return null;
    }

    function getBasePrefix() {
        try {
            const p = window.location.pathname || '/';
            return p.indexOf('/docs') === 0 ? '/docs' : '';
        } catch (_) { return ''; }
    }
    function stripBase(pathname) {
        const base = getBasePrefix();
        if (!pathname) return '/';
        let p = pathname;
        try { p = new URL(pathname, window.location.origin).pathname; } catch (_) {}
        if (base && p.indexOf(base) === 0) p = p.slice(base.length) || '/';
        p = p.replace(/\/+$/, '') || '/';
        return p;
    }
    function hasNativeTechDropdown() {
        try {
            const sidebar = document.getElementById('sidebar-content');
            const nav = sidebar && sidebar.querySelector('#navigation-items');
            if (!nav) return false;
            const candidates = Array.from(nav.querySelectorAll('button[aria-haspopup="menu"]'))
                .filter(b => b.id !== 'cc-product-dropdown-button')
                .filter(b => !b.hasAttribute('data-cc-home-product-button'))
                .filter(b => {
                    const txt = (b.textContent || '').trim().replace(/[\u200E\u200F\u2060\u00A0\s]/g, '');
                    return !/^v\d+([\.-]\w+)*$/i.test(txt);
                })
                .filter(b => {
                    const r = b.getBoundingClientRect();
                    return r.width > 0 && r.height > 0;
                });
            return candidates.length > 0;
        } catch (_) { return false; }
    }

    function isVersionedPage() {
        let currentPath = window.location.pathname;
        currentPath = stripBase(currentPath);
        const dropdownPaths = ['/chat-builder', '/ui-kit', '/sdk', '/widget', '/ai-agents'];
        const inSection = dropdownPaths.some(prefix => currentPath === prefix || currentPath.startsWith(prefix + '/'));
        const native = hasNativeTechDropdown();
        debugLog('[version-aligner] routeHasTech:', inSection, 'hasNativeTech:', native);
        return inSection || native;
    }
    
    function restoreOriginalLayout() {
        debugLog('[version-aligner] Restoring original layout (version only)');
        const placeholder = document.getElementById(PLACEHOLDER_ID);
        const moved = document.querySelectorAll('#sidebar-content [data-version-aligner-button]');
        if (!placeholder) {
            // Fallback: if placeholder is missing (nav re-render), remove any moved instances to avoid duplicates
            if (moved && moved.length) {
                moved.forEach(function(el){ try { el.remove(); } catch(_) {} });
                debugLog('[version-aligner] Removed moved version buttons due to missing placeholder');
            }
        } else {
            try {
                const verBtn = moved && moved[0];
                if (verBtn && placeholder.parentNode) {
                    placeholder.parentNode.insertBefore(verBtn, placeholder);
                    verBtn.style.display = '';
                    try { delete verBtn.dataset.versionAlignerButton; } catch(_) {}
                    debugLog('[version-aligner] Version button moved back to original position');
                }
            } catch(_) {}
            try { placeholder.remove(); } catch(_) {}
        }
        try {
            document.documentElement.classList.remove('cc-version-aligned');
            document.querySelectorAll('#navbar .cc-dup-version').forEach(el => el.classList.remove('cc-dup-version'));
        } catch(_) {}

        // Remove any inline margin adjustments applied to the technology trigger
        try { const fw = findForwardButton(); if (fw) fw.style.removeProperty('margin-bottom'); } catch(_) {}
    }

    function markDuplicateVersionButtons() {
        try {
            const navbar = document.getElementById('navbar');
            if (!navbar) return;
            const buttons = [...navbar.querySelectorAll('button[aria-haspopup="menu"]')]
                .filter(el => el.id !== 'cc-product-dropdown-button')
                .filter(el => !el.hasAttribute('data-cc-home-product-button'));
            buttons.forEach(btn => {
                const clean = (btn.textContent || '').trim().replace(/[\u200E\u200F\u2060\u00A0\s]/g, '');
                if (/^v\d+([\.-]\w+)*$/i.test(clean)) {
                    btn.classList.add('cc-dup-version');
                }
            });
        } catch(_) {}
    }

    function setAlignedFlag(on) {
        try {
            const html = document.documentElement;
            if (!html) return;
            if (on) html.classList.add('cc-version-aligned');
            else html.classList.remove('cc-version-aligned');
        } catch(_) {}
    }

    // Utility: determine if an element looks like the version trigger (e.g., "v6")
    function isVersionTrigger(el) {
        try {
            if (!el) return false;
            const raw = (el.innerText || el.textContent || '').trim();
            const clean = raw.replace(/[\u200E\u200F\u2060\u00A0\s]/g, '');
            return /^v\d+([\.-]\w+)*$/i.test(clean);
        } catch(_) { return false; }
    }

    // Enforce a fixed width for the open Radix menu belonging to the version trigger
    function enforceVersionMenuWidth(px) {
        try {
            const openMenus = Array.from(document.querySelectorAll('[data-radix-menu-content][data-state="open"]'));
            if (!openMenus.length) return;
            openMenus.forEach((menu) => {
                // Identify the trigger element via aria-labelledby
                let trigger = null;
                const labelId = menu.getAttribute('aria-labelledby');
                if (labelId) trigger = document.getElementById(labelId) || null;
                if (!trigger) {
                    // Fallback: consider the currently focused element if it's a menu trigger
                    const active = document.activeElement;
                    if (active && active.getAttribute && active.getAttribute('aria-haspopup') === 'menu') {
                        trigger = active;
                    }
                }
                if (isVersionTrigger(trigger)) {
                    const w = String(px) + 'px';
                    menu.style.width = w;
                    menu.style.minWidth = w;
                    menu.style.maxWidth = w;
                    const wrap = menu.closest('[data-radix-popper-content-wrapper]');
                    if (wrap) {
                        wrap.style.width = w;
                        wrap.style.minWidth = w;
                        wrap.style.maxWidth = w;
                    }
                }
            });
        } catch(_) { /* no-op */ }
    }

    function _realign() {
        debugLog('[version-aligner] Starting _realign function...');
        
        // Check if any dropdown is actually open (visible)
        try {
            const maybeMenus = Array.from(document.querySelectorAll('[role="menu"], [data-radix-popper-content-wrapper]'));
            const visibleMenus = maybeMenus.filter(el => {
                // Fast path: hidden via display:none or zero box
                const style = window.getComputedStyle ? getComputedStyle(el) : null;
                if (style && (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0')) return false;
                const box = el.getBoundingClientRect();
                return box.width > 0 && box.height > 0;
            });
            if (visibleMenus.length) {
                debugLog('[version-aligner] A dropdown is visible, skipping alignment');
                // Still enforce width for version menu while open
                enforceVersionMenuWidth(65);
                return;
            }
        } catch(_) {}

        debugLog('[version-aligner] Checking screen width...');
        if (window.innerWidth < 1024) {
            debugLog('[version-aligner] Screen width < 1024px');
            // On mobile: don't align; just toggle version visibility by route
            if (isVersionRoute()) showAllVersionButtons(); else hideAllVersionButtons();
            restoreOriginalLayout();
            setAlignedFlag(false);
            return;
        }
        debugLog('[version-aligner] Screen width >= 1024px, proceeding with alignment');
        // Wait for nav reveal to avoid racing hydration
        if (!NAV_READY) {
            debugLog('[version-aligner] Nav not ready; skipping alignment');
            return;
        }
        // Gate: only show/align version on allowed routes
        if (!isVersionRoute()) {
            hideAllVersionButtons();
            restoreOriginalLayout();
            setAlignedFlag(false);
            return;
        } else {
            showAllVersionButtons();
        }

        // Ensure version button is restored before re-aligning and remove any duplicates
        restoreOriginalLayout();
        try {
            const movedDupes = document.querySelectorAll('#sidebar-content [data-version-aligner-button]');
            if (movedDupes.length > 1) {
                for (let i = 1; i < movedDupes.length; i++) {
                    movedDupes[i].remove();
                }
                debugLog('[version-aligner] Removed duplicate moved version buttons');
            }
        } catch (_) {}

        // Page versioning was already checked during cleanup - we only reach here if page is versioned

        debugLog('[version-aligner] Finding version selector and forward button...');
        const verBtn = findVersionSelector();
        const fwBtn = findForwardButton();

        // Only align if both buttons are present. Otherwise, skip without altering sidebar.
        if (!verBtn || !fwBtn) {
            debugLog('[version-aligner] Missing one or both dropdowns; skipping alignment');
            setAlignedFlag(false);
            return;
        }
        debugLog('[version-aligner] Forward button found successfully');

        // If already aligned (a moved version exists adjacent to tech), skip reinsertion
        try {
            const already = fwBtn && fwBtn.parentNode && fwBtn.parentNode.querySelector('[data-version-aligner-button]');
            if (already) {
                // Ensure the forward/technology button has no bottom margin when aligned in-row
                try { if (fwBtn) fwBtn.style.marginBottom = '0px'; } catch(_) {}
                debugLog('[version-aligner] Version already aligned next to technology; skipping move');
                setAlignedFlag(true);
                return;
            }
        } catch(_) {}

        debugLog('[version-aligner] Creating placeholder for version button...');
        const placeholder = document.createElement('div');
        placeholder.id = PLACEHOLDER_ID;
        placeholder.style.display = 'none';
        try { verBtn.parentNode.insertBefore(placeholder, verBtn); } catch(_) {}

        debugLog('[version-aligner] Setting up version button...');
        verBtn.dataset.versionAlignerButton = 'true';
        verBtn.classList.add('cc-v-trigger');
        
        // Remove any existing inline styles that might conflict
        verBtn.style.removeProperty('height');
        verBtn.style.removeProperty('paddingTop');
        verBtn.style.removeProperty('paddingBottom');
        verBtn.style.removeProperty('borderRadius');
        verBtn.style.removeProperty('lineHeight');
        verBtn.style.removeProperty('fontSize');
        verBtn.style.removeProperty('border');
        verBtn.style.removeProperty('padding');
        verBtn.style.removeProperty('backgroundColor');
        verBtn.style.removeProperty('color');
        
        // Add the exact same classes as the React dropdown
        const reactClasses = [
            'group', 'bg-background-light', 'dark:bg-background-dark', 
            'disabled:pointer-events-none', 'overflow-hidden', 'outline-none', 
            'text-sm', 'text-gray-950/50', 'dark:text-white/50', 
            'group-hover:text-gray-950/70', 'dark:group-hover:text-white/70',
            'z-10', 'flex', 'items-center', 'pl-2', 'pr-3.5', 'py-1.5', 
            'rounded-[0.85rem]', 'border', 'border-gray-200/70', 
            'dark:border-white/[0.07]', 'hover:bg-gray-600/5', 
            'dark:hover:bg-gray-200/5', 'gap-1'
        ];
        
        // Remove any conflicting classes first
        verBtn.className = verBtn.className.split(' ').filter(cls => 
            !cls.includes('rounded') && !cls.includes('border') && 
            !cls.includes('bg-') && !cls.includes('text-') &&
            !cls.includes('hover:') && !cls.includes('dark:')
        ).join(' ');
        
    // Add the React dropdown classes
        verBtn.classList.add(...reactClasses);
        
        // Apply custom styling - remove border and set custom padding
        verBtn.style.border = '0';
        verBtn.style.padding = '13px 7px';
        
        debugLog('[version-aligner] Version button styled to match React dropdown with custom modifications');

        debugLog('[version-aligner] Inserting version button after technology dropdown...');
        try {
            fwBtn.parentNode.insertBefore(verBtn, fwBtn.nextSibling);
            // Normalize vertical alignment: remove bottom margin from the technology trigger
            try { if (fwBtn) fwBtn.style.marginBottom = '0px'; } catch(_) {}
            setAlignedFlag(true);
            debugLog('[version-aligner] Version button inserted into sidebar');
        } catch (e) {
            debugLog('[version-aligner] Failed to insert version button into sidebar', e);
            setAlignedFlag(false);
        }
    }

    function realign() {
        debugLog('[version-aligner] ===== REALIGN TRIGGERED =====');
        debugLog('[version-aligner] Current URL:', window.location.href);
        debugLog('[version-aligner] Screen width:', window.innerWidth);
        
        if (observer) observer.disconnect();
        try {
            _realign();
        } finally {
            observer.observe(document.body, { childList: true, subtree: true });
        debugLog('[version-aligner] Observer reconnected');
        }
        debugLog('[version-aligner] ===== REALIGN COMPLETE =====');
    }

    let realignTimeoutId;
    function triggerRealign() {
        debugLog('[version-aligner] triggerRealign called, setting timeout...');
        clearTimeout(realignTimeoutId);
        realignTimeoutId = setTimeout(() => {
            debugLog('[version-aligner] Timeout expired, executing realign...');
            realign();
        }, 150);
    }

    function startObserver() {
        debugLog('[version-aligner] Starting MutationObserver...');
        if (observer) {
            observer.disconnect();
            debugLog('[version-aligner] Disconnected existing observer');
        }

        observer = new MutationObserver((mutations) => {
            // Filter out irrelevant mutations for better performance
            const relevantMutation = mutations.some(mutation => {
                // Only care about mutations in navbar or sidebar areas
                const target = mutation.target;
                return target.id === 'navbar' || 
                       target.id === 'sidebar-content' || 
                       target.closest('#navbar') || 
                       target.closest('#sidebar-content') ||
                       // Also watch for navigation-level changes that affect page structure
                       target.tagName === 'BODY' || target.tagName === 'HTML';
            });
            
            if (relevantMutation) {
                debugLog('[version-aligner] Relevant DOM mutation detected, triggering realign...');
                triggerRealign();
                // In case a Radix dropdown just opened, enforce version menu width
                enforceVersionMenuWidth(65);
            }
        });

        // Observe more selectively - target specific areas instead of entire body
        const navbar = document.getElementById('navbar');
        const sidebar = document.getElementById('sidebar-content');
        
        if (navbar) {
            observer.observe(navbar, { childList: true, subtree: true });
            debugLog('[version-aligner] Observing navbar for changes');
        }
        
        if (sidebar) {
            observer.observe(sidebar, { childList: true, subtree: true });
            debugLog('[version-aligner] Observing sidebar for changes');
        }
        
        // Also observe body for high-level navigation changes, but with less sensitivity
        observer.observe(document.body, { 
            childList: true, 
            subtree: false  // Only direct children, not deep subtree
        });
        
        debugLog('[version-aligner] MutationObserver started with selective targeting');
    }

    // Initial run
    debugLog('[version-aligner] ===== SCRIPT INITIALIZATION =====');
    debugLog('[version-aligner] Starting initial alignment...');
    triggerRealign();

    // Listen for SPA navigation changes (guard against double patching)
    debugLog('[version-aligner] Setting up SPA navigation listeners...');
    try {
        if (!window.__ccVersionAlignerHistoryPatched) {
            const originalPushState = history.pushState;
            history.pushState = function(...args) {
                debugLog('[version-aligner] history.pushState intercepted:', args[2]);
                originalPushState.apply(this, args);
                triggerRealign();
            };

            const originalReplaceState = history.replaceState;
            history.replaceState = function(...args) {
                debugLog('[version-aligner] history.replaceState intercepted:', args[2]);
                originalReplaceState.apply(this, args);
                triggerRealign();
            };
            window.__ccVersionAlignerHistoryPatched = true;
        }
    } catch (_) {}

    window.addEventListener('popstate', () => {
        debugLog('[version-aligner] popstate event detected');
        triggerRealign();
        enforceVersionMenuWidth(65);
    });

    // Listen for screen size changes
    window.addEventListener('resize', () => {
        debugLog('[version-aligner] resize event detected, new width:', window.innerWidth);
        triggerRealign();
        enforceVersionMenuWidth(65);
    });

    // Also react to central route/nav events to align after reveal
    try {
        window.addEventListener('cc:route-change', triggerRealign, true);
        window.addEventListener('cc:route-after', triggerRealign, true);
        window.addEventListener('cc:nav-revealed', triggerRealign, true);
    } catch (_) {}

    // Nudge width enforcement shortly after clicks/keys that typically open menus
    try {
        const nudge = () => setTimeout(() => enforceVersionMenuWidth(65), 0);
        document.addEventListener('click', nudge, true);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') nudge();
        }, true);
    } catch (_) {}

    // Start observing DOM changes
    startObserver();
    
    debugLog('[version-aligner] ===== SCRIPT INITIALIZATION COMPLETE =====');
})();
