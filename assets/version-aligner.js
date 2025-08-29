/* ------------------------------------------------------------------ */
/* 0 —  soft-patch removeChild so React never crashes if a node has   */
/*      been moved elsewhere.  Safe, silent and 100-% reversible.     */
/* ------------------------------------------------------------------ */
(function () {
    const origRemove = Node.prototype.removeChild;
    Node.prototype.removeChild = function (child) {
        if (!this.contains(child)) return child;   // swallow NotFoundError
        return origRemove.call(this, child);
    };
})();

/* ------------------------------------------------------------------ */
/* 1 —  **your "last-working" aligner** with no functional changes.   */
/*      (I only added a class on the wrapper so we can spot it later.)*/
/* ------------------------------------------------------------------ */
(function initVersionAligner() {
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
    const ALIGNER_ROW_CLASS = 'cc-version-aligned-row';
    const PLACEHOLDER_ID = 'version-aligner-placeholder';
    
    // Cache for expensive operations
    let cachedVersionButton = null;
    let cachedForwardButton = null;
    let lastUrl = '';

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
            .filter(el => !el.closest(`.${ALIGNER_ROW_CLASS}`));
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
        
        const versionButtons = menuButtons
            .filter(el => {
                const cleanText = el.textContent.trim().replace(/[\u200E\u200F\u2060\u00A0\s]/g, '');
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

    function findForwardButton() {
        debugLog('[version-aligner] Finding forward button...');
        
        // Return cached result if available and element still exists in DOM
        if (cachedForwardButton && document.contains(cachedForwardButton)) {
            debugLog('[version-aligner] Using cached forward button');
            return cachedForwardButton;
        }
        
        const sidebar = document.getElementById('sidebar-content');
        if (!sidebar) {
            debugLog('[version-aligner] ERROR: sidebar-content not found');
            return null;
        }
        debugLog('[version-aligner] sidebar-content found:', sidebar);
        
        const forwardButton = sidebar.querySelector('.nav-dropdown-trigger');
        if (forwardButton) {
            cachedForwardButton = forwardButton; // Cache the result
            debugLog('[version-aligner] Forward button found:', forwardButton);
            debugLog('[version-aligner] Forward button text content:', forwardButton.textContent.trim());
        } else {
            debugLog('[version-aligner] ERROR: nav-dropdown-trigger not found in sidebar-content');
            debugLog('[version-aligner] Available elements in sidebar:', sidebar.querySelectorAll('button'));
        }
        return forwardButton;
    }

    // Find the technology/framework dropdown button in the navbar (not the Radix version button)
        function findTechButtonInNavbar() {
        debugLog('[version-aligner] Finding technology dropdown in navbar...');
        const navBar = document.getElementById('navbar');
        if (!navBar) {
            debugLog('[version-aligner] navbar not found for tech button');
            return null;
        }
                const tabs = navBar.querySelector('.nav-tabs') || navBar;
                // Prefer explicit class used by technology selector
                let tech = tabs.querySelector('button.nav-dropdown-trigger');
                if (tech && !tech.closest('.' + ALIGNER_ROW_CLASS)) return tech;
                // Fallback: first non-version menu button (text not matching v\d+)
                const isVersionText = (el) => /^v\d+([\.-]\w+)*$/i.test((el.textContent || '').replace(/[\u200E\u200F\u2060\u00A0\s]/g, ''));
                const candidates = [...tabs.querySelectorAll('button[aria-haspopup="menu"]')]
                    .filter(b => b.id !== 'cc-product-dropdown-button')
                    .filter(b => !b.hasAttribute('data-cc-home-product-button'))
                    .filter(b => !isVersionText(b))
                    .filter(b => !b.closest('.' + ALIGNER_ROW_CLASS));
                if (candidates.length) return candidates[0];
                debugLog('[version-aligner] No technology dropdown found in navbar');
                return null;
    }

    function getBasePrefix() {
        try {
            const p = window.location.pathname || '/';
            return p.indexOf('/docs') === 0 ? '/docs' : '';
        } catch (_) { return ''; }
    }
    function stripBase(path) {
        if (!path) return '/';
        try {
            const base = getBasePrefix();
            let p = new URL(path, window.location.origin).pathname;
            if (base && p.indexOf(base) === 0) p = p.slice(base.length) || '/';
            return p;
        } catch (_) {
            const base = getBasePrefix();
            if (base && path.indexOf(base) === 0) return path.slice(base.length) || '/';
            return path;
        }
    }

    function isVersionedPage() {
        debugLog('[version-aligner] Checking if page is versioned...');
        
        const currentPath = window.location.pathname;
        const path = stripBase(currentPath || '/');
        debugLog('[version-aligner] Current path:', currentPath, 'Stripped path:', path);
        
        // Check if the URL indicates this is a versioned section
        const versionedPaths = [
            '/ui-kit/',
            '/sdk/'
        ];
        
        const isVersionedPath = versionedPaths.some(p => path.startsWith(p));
        debugLog('[version-aligner] Path-based versioned check:', isVersionedPath);
        
        if (isVersionedPath) {
            debugLog('[version-aligner] URL indicates versioned page - page IS versioned');
            return true;
        }
        
        // Fallback: Check DOM for version dropdown (but don't rely on it solely)
        debugLog('[version-aligner] URL check inconclusive, checking DOM as fallback...');
        const versionButton = findVersionSelector();
        
        if (versionButton) {
            debugLog('[version-aligner] Found version dropdown button in DOM - page IS versioned');
            debugLog('[version-aligner] Version button text:', versionButton.textContent.trim());
            return true;
        }
        
        debugLog('[version-aligner] No version indicators found - page is NOT versioned');
        return false;
    }
    
    function restoreOriginalLayout() {
        debugLog('[version-aligner] Restoring original layout for small screen...');
        
        const placeholder = document.getElementById(PLACEHOLDER_ID);
        if (!placeholder) {
            debugLog('[version-aligner] No placeholder found, nothing to restore');
            try { document.documentElement.classList.remove('cc-version-aligned'); } catch(_) {}
            // Also remove any duplicate-version markers we may have added in navbar
            try {
                const navBar = document.getElementById('navbar');
                if (navBar) navBar.querySelectorAll('.cc-dup-version').forEach(el => el.classList.remove('cc-dup-version'));
            } catch(_) {}
            return;
        }
        debugLog('[version-aligner] Placeholder found:', placeholder);

                // Find the current aligned version button anywhere in DOM
                let verBtn = document.querySelector('.cc-v-trigger') || document.querySelector('[data-version-aligner-button]') || (function(){
                    const nav = document.getElementById('sidebar-content') || document;
                    const candidates = [...nav.querySelectorAll('button[aria-haspopup="menu"]')];
                    return candidates.find(el => /^v\d+([\.-]\w+)*$/i.test((el.textContent||'').replace(/[\u200E\u200F\u2060\u00A0\s]/g, '')));
                })();
        if (verBtn && placeholder.parentNode) {
            debugLog('[version-aligner] Moving version button back to placeholder location');
            placeholder.parentNode.insertBefore(verBtn, placeholder);
            verBtn.style.display = '';
            verBtn.style.flex = '';
            verBtn.classList.remove('cc-v-trigger');
            // Remove inline overrides we added during alignment
            try {
                verBtn.style.removeProperty('background-color');
                verBtn.style.removeProperty('color');
                verBtn.style.removeProperty('justify-content');
            } catch(_) {}
            // Remove the React dropdown classes that were added
            const reactClasses = [
                'group','bg-background-light','dark:bg-background-dark','disabled:pointer-events-none','overflow-hidden','outline-none','text-sm','text-gray-950/50','dark:text-white/50','group-hover:text-gray-950/70','dark:group-hover:text-white/70','z-10','flex','items-center','pl-2','pr-3.5','py-1.5','rounded-[0.85rem]','border','border-gray-200/70','dark:border-white/[0.07]','hover:bg-gray-600/5','dark:hover:bg-gray-200/5','gap-1'
            ];
            try { verBtn.classList.remove(...reactClasses); } catch(_) {}
            try { delete verBtn.dataset.versionAlignerButton; } catch(_) {}
        }

        debugLog('[version-aligner] Removing placeholder');
        placeholder.remove();
        try { document.documentElement.classList.remove('cc-version-aligned'); } catch(_) {}
        // Clean any duplicate marks after full restore
        try {
            const navBar = document.getElementById('navbar');
            if (navBar) navBar.querySelectorAll('.cc-dup-version').forEach(el => {
                el.classList.remove('cc-dup-version');
                el.style.removeProperty('background-color');
                el.style.removeProperty('color');
                el.style.removeProperty('justify-content');
            });
        } catch(_) {}
        debugLog('[version-aligner] Original layout restored');
    }

    // Mark version-like menu buttons in the NAVBAR as duplicates so CSS can hide only those
    function markDuplicateVersionButtons() {
        try {
            const navBar = document.getElementById('navbar');
            if (!navBar) return;
            const buttons = [...navBar.querySelectorAll('button[aria-haspopup="menu"]')];
            const isVersionText = (el) => /^v\d+([\.-]\w+)*$/i.test((el.textContent || '').replace(/[\u200E\u200F\u2060\u00A0\s]/g, ''));
            buttons.forEach(b => {
                // Do not consider any button we've moved or wrapped elsewhere
                if (b.classList.contains('cc-v-trigger')) return;
                if (isVersionText(b)) {
                    b.classList.add('cc-dup-version');
                    // Enforce only color inline; width will be default
                    b.style.setProperty('background-color', '#dc2626', 'important');
                    b.style.setProperty('color', '#fff', 'important');
                    b.style.setProperty('justify-content', 'center', 'important');
                } else {
                    b.classList.remove('cc-dup-version');
                    b.style.removeProperty('background-color');
                    b.style.removeProperty('color');
                    b.style.removeProperty('justify-content');
                }
            });
        } catch (_) { /* noop */ }
    }

    function _realign() {
        debugLog('[version-aligner] Starting _realign function...');
        
        // Check if dropdown is open
        if (document.querySelector('[role="menu"], [data-radix-popper-content-wrapper]')) {
            debugLog('[version-aligner] Dropdown is open, skipping alignment');
            return;
        }

        debugLog('[version-aligner] Checking screen width...');
        if (window.innerWidth < 1024) {
            debugLog('[version-aligner] Screen width < 1024px, restoring original layout');
            restoreOriginalLayout();
            return;
        }
        debugLog('[version-aligner] Screen width >= 1024px, proceeding with alignment');

    // Clean up previous alignment
        // Clean up previous alignment using placeholder if present
        const placeholderPrev = document.getElementById(PLACEHOLDER_ID);
        const currentPageIsVersioned = isVersionedPage();
        if (placeholderPrev) {
            debugLog('[version-aligner] Cleaning up previous alignment using placeholder');
            const verBtnPrev = document.querySelector('.cc-v-trigger') || document.querySelector('[data-version-aligner-button]');
            if (verBtnPrev && placeholderPrev.parentElement) {
                placeholderPrev.parentElement.insertBefore(verBtnPrev, placeholderPrev);
                verBtnPrev.style.display = '';
                verBtnPrev.style.flex = '';
                verBtnPrev.classList.remove('cc-v-trigger');
                const reactClasses = [
                    'group','bg-background-light','dark:bg-background-dark','disabled:pointer-events-none','overflow-hidden','outline-none','text-sm','text-gray-950/50','dark:text-white/50','group-hover:text-gray-950/70','dark:group-hover:text-white/70','z-10','flex','items-center','pl-2','pr-3.5','py-1.5','rounded-[0.85rem]','border','border-gray-200/70','dark:border-white/[0.07]','hover:bg-gray-600/5','dark:hover:bg-gray-200/5','gap-1'
                ];
                try { verBtnPrev.classList.remove(...reactClasses); } catch(_) {}
                try { delete verBtnPrev.dataset.versionAlignerButton; } catch(_) {}
            }
            try { placeholderPrev.remove(); } catch(_) {}
            try { document.documentElement.classList.remove('cc-version-aligned'); } catch(_) {}
            if (!currentPageIsVersioned) {
                debugLog('[version-aligner] Current page is not versioned, cleanup complete');
                return;
            }
        } else if (!currentPageIsVersioned) {
            // No placeholder and not a versioned page — nothing to do
            debugLog('[version-aligner] Not a versioned page and no placeholder; skipping alignment');
            try { document.documentElement.classList.remove('cc-version-aligned'); } catch(_) {}
            return;
        }

        // Page versioning was already checked during cleanup - we only reach here if page is versioned

    debugLog('[version-aligner] Finding version selector and technology dropdown (sidebar)...');
    const verBtn = findVersionSelector();
    const techBtn = findForwardButton();

        if (!verBtn) {
            debugLog('[version-aligner] ERROR: Version button not found, cannot align');
            return;
        }
        debugLog('[version-aligner] Version button found successfully');

        if (!techBtn) {
            debugLog('[version-aligner] ERROR: Technology dropdown (sidebar .nav-dropdown-trigger) not found, cannot align');
            return;
        }
        debugLog('[version-aligner] Technology dropdown found successfully');

        debugLog('[version-aligner] Creating placeholder for version button...');
        const placeholder = document.createElement('div');
        placeholder.id = PLACEHOLDER_ID;
        placeholder.style.display = 'none';
        verBtn.parentNode.insertBefore(placeholder, verBtn);

        debugLog('[version-aligner] Setting up version button...');
        verBtn.dataset.versionAlignerButton = 'true';
    verBtn.classList.add('cc-v-trigger');
        verBtn.style.flex = '0 0 auto';
        
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
        
    // Apply custom styling - remove border and set custom padding plus enforced visual styles
    verBtn.style.border = '0';
    verBtn.style.padding = '13px 7px';
    verBtn.style.setProperty('background-color', '#dc2626', 'important');
    verBtn.style.setProperty('color', '#fff', 'important');
    verBtn.style.setProperty('justify-content', 'center', 'important');
    // leave width to default
        
        debugLog('[version-aligner] Version button styled to match React dropdown with custom modifications');

                        debugLog('[version-aligner] Inserting version button after technology dropdown wrapper in sidebar...');
                        const sidebar = document.getElementById('sidebar-content');
                        const navigationItems = sidebar && sidebar.querySelector('#navigation-items');
                        if (!navigationItems) {
                            debugLog('[version-aligner] ERROR: #navigation-items not found in sidebar');
                            return;
                        }
                        const techWrapper = techBtn.closest('.pl-2') || techBtn;
                        try {
                            techWrapper.parentNode.insertBefore(verBtn, techWrapper.nextSibling);
                            try { document.documentElement.classList.add('cc-version-aligned'); } catch(_) {}
                        } catch (e) {
                            debugLog('[version-aligner] ERROR: Failed to insert version button after tech wrapper', e);
                        }

    // Tag any leftover navbar version buttons as duplicates so only they get hidden via CSS
    markDuplicateVersionButtons();

    debugLog('[version-aligner] Alignment completed successfully!');
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
                // keep duplicate markers fresh between realignments
                markDuplicateVersionButtons();
                triggerRealign();
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

    // Listen for SPA navigation changes
    debugLog('[version-aligner] Setting up SPA navigation listeners...');
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

    window.addEventListener('popstate', () => {
        debugLog('[version-aligner] popstate event detected');
        triggerRealign();
    });

    // Listen for screen size changes
    window.addEventListener('resize', () => {
        debugLog('[version-aligner] resize event detected, new width:', window.innerWidth);
        triggerRealign();
    });

    // Start observing DOM changes
    startObserver();
    
    // Intentionally avoid syncing Radix popper width; let defaults apply

    // Track last interacted version trigger
    let lastVersionTriggerEl = null;
    function handleVersionTriggerInteraction(e) {
        const el = e.target && e.target.closest && e.target.closest('.cc-v-trigger, #navbar .cc-dup-version');
        if (!el) return;
        lastVersionTriggerEl = el;
        // No width adjustments; styling only
    }
    document.addEventListener('click', handleVersionTriggerInteraction, true);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') handleVersionTriggerInteraction(e);
    }, true);
    
    debugLog('[version-aligner] ===== SCRIPT INITIALIZATION COMPLETE =====');
})();
