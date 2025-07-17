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
    let observer;
    const ALIGNER_ROW_CLASS = 'version-aligner-row';
    const PLACEHOLDER_ID = 'version-aligner-placeholder';

    function findVersionSelector() {
        console.log('[version-aligner] Finding version selector...');
        const navBar = document.getElementById('navbar');
        if (!navBar) {
            console.log('[version-aligner] ERROR: navbar not found');
            return null;
        }
        console.log('[version-aligner] navbar found:', navBar);
        
        const allButtons = [...navBar.querySelectorAll('button')];
        console.log('[version-aligner] All buttons in navbar:', allButtons.length, allButtons);
        
        const filteredButtons = allButtons
            .filter(el => !el.closest(`.${ALIGNER_ROW_CLASS}`));
        console.log('[version-aligner] Buttons not in aligner row:', filteredButtons.length, filteredButtons);
        
        const menuButtons = filteredButtons
            .filter(el => el.getAttribute('aria-haspopup') === 'menu');
        console.log('[version-aligner] Buttons with aria-haspopup=menu:', menuButtons.length, menuButtons);
        
        // Log the text content of each menu button for debugging
        menuButtons.forEach((btn, index) => {
            const rawText = btn.textContent.trim();
            const cleanText = rawText.replace(/[\u200E\u200F\u2060\u00A0\s]/g, ''); // Remove LTR/RTL marks, word joiners, non-breaking spaces
            console.log(`[version-aligner] Menu button ${index + 1} raw text:`, `"${rawText}"`);
            console.log(`[version-aligner] Menu button ${index + 1} clean text:`, `"${cleanText}"`);
            console.log(`[version-aligner] Menu button ${index + 1} matches version regex:`, /^v\d+([\.-]\w+)*$/i.test(cleanText));
        });
        
        const versionButtons = menuButtons
            .filter(el => {
                const cleanText = el.textContent.trim().replace(/[\u200E\u200F\u2060\u00A0\s]/g, '');
                return /^v\d+([\.-]\w+)*$/i.test(cleanText);
            });
        console.log('[version-aligner] Version buttons found:', versionButtons.length, versionButtons);
        
        if (versionButtons.length > 0) {
            console.log('[version-aligner] Selected version button:', versionButtons[0]);
            console.log('[version-aligner] Version button text:', versionButtons[0].textContent.trim());
            return versionButtons[0];
        }
        
        console.log('[version-aligner] No version button found');
        return null;
    }

    function findForwardButton() {
        console.log('[version-aligner] Finding forward button...');
        const sidebar = document.getElementById('sidebar-content');
        if (!sidebar) {
            console.log('[version-aligner] ERROR: sidebar-content not found');
            return null;
        }
        console.log('[version-aligner] sidebar-content found:', sidebar);
        
        const forwardButton = sidebar.querySelector('.nav-dropdown-trigger');
        if (forwardButton) {
            console.log('[version-aligner] Forward button found:', forwardButton);
            console.log('[version-aligner] Forward button text content:', forwardButton.textContent.trim());
        } else {
            console.log('[version-aligner] ERROR: nav-dropdown-trigger not found in sidebar-content');
            console.log('[version-aligner] Available elements in sidebar:', sidebar.querySelectorAll('button'));
        }
        return forwardButton;
    }

    function isVersionedPage() {
        console.log('[version-aligner] Checking if page is versioned...');
        
        const currentPath = window.location.pathname;
        console.log('[version-aligner] Current path:', currentPath);
        
        // Check if the URL indicates this is a versioned section
        const versionedPaths = [
            '/docs/ui-kit/react/',
            '/docs/ui-kit/react-native/',
            '/docs/ui-kit/ios/',
            '/docs/ui-kit/android/',
            '/docs/ui-kit/flutter/',
            '/docs/ui-kit/vue/',
            '/docs/sdk/'
        ];
        
        const isVersionedPath = versionedPaths.some(path => currentPath.startsWith(path));
        console.log('[version-aligner] Path-based versioned check:', isVersionedPath);
        
        if (isVersionedPath) {
            console.log('[version-aligner] URL indicates versioned page - page IS versioned');
            return true;
        }
        
        // Fallback: Check DOM for version dropdown (but don't rely on it solely)
        console.log('[version-aligner] URL check inconclusive, checking DOM as fallback...');
        const versionButton = findVersionSelector();
        
        if (versionButton) {
            console.log('[version-aligner] Found version dropdown button in DOM - page IS versioned');
            console.log('[version-aligner] Version button text:', versionButton.textContent.trim());
            return true;
        }
        
        console.log('[version-aligner] No version indicators found - page is NOT versioned');
        return false;
    }
    
    function restoreOriginalLayout() {
        console.log('[version-aligner] Restoring original layout for small screen...');
        
        const placeholder = document.getElementById(PLACEHOLDER_ID);
        if (!placeholder) {
            console.log('[version-aligner] No placeholder found, nothing to restore');
            return;
        }
        console.log('[version-aligner] Placeholder found:', placeholder);

        const previousRow = document.querySelector(`.${ALIGNER_ROW_CLASS}`);
        if (!previousRow) {
            console.log('[version-aligner] No aligner row found, removing placeholder');
            placeholder.remove();
            return;
        }
        console.log('[version-aligner] Aligner row found:', previousRow);

        const verBtn = previousRow.querySelector('[data-version-aligner-button]');
        const fwBtn = previousRow.querySelector('.nav-dropdown-trigger');
        
        console.log('[version-aligner] Version button in row:', verBtn);
        console.log('[version-aligner] Forward button in row:', fwBtn);

        if (verBtn) {
            console.log('[version-aligner] Moving version button back to placeholder location');
            placeholder.parentNode.insertBefore(verBtn, placeholder);
            verBtn.style.display = '';
            delete verBtn.dataset.versionAlignerButton;
        }

        if (fwBtn) {
            console.log('[version-aligner] Moving forward button back to sidebar');
            const sidebar = document.getElementById('sidebar-content');
            if (sidebar) {
                const navigationItems = sidebar.querySelector('#navigation-items');
                if (navigationItems) {
                    navigationItems.insertBefore(fwBtn, navigationItems.firstChild);
                    fwBtn.style.flex = '';
                    fwBtn.style.margin = '';
                    fwBtn.classList.add('w-full');
                } else {
                    console.log('[version-aligner] ERROR: navigation-items not found in sidebar-content');
                }
            } else {
                console.log('[version-aligner] ERROR: sidebar-content not found for forward button restoration');
            }
        }

        console.log('[version-aligner] Removing placeholder and aligner row');
        placeholder.remove();
        previousRow.remove();
        console.log('[version-aligner] Original layout restored');
    }

    function _realign() {
        console.log('[version-aligner] Starting _realign function...');
        
        // Check if dropdown is open
        if (document.querySelector('[role="menu"], [data-radix-popper-content-wrapper]')) {
            console.log('[version-aligner] Dropdown is open, skipping alignment');
            return;
        }

        console.log('[version-aligner] Checking screen width...');
        if (window.innerWidth < 1024) {
            console.log('[version-aligner] Screen width < 1024px, restoring original layout');
            restoreOriginalLayout();
            return;
        }
        console.log('[version-aligner] Screen width >= 1024px, proceeding with alignment');

        // Clean up previous alignment
        const previousRow = document.querySelector(`.${ALIGNER_ROW_CLASS}`);
        if (previousRow) {
            console.log('[version-aligner] Cleaning up previous alignment row');
            const fwBtn = previousRow.querySelector('.nav-dropdown-trigger');
            const verBtn = previousRow.querySelector('[data-version-aligner-button]');
            
            // Check if current page is versioned to determine cleanup strategy
            const currentPageIsVersioned = isVersionedPage();
            console.log('[version-aligner] Current page versioned status for cleanup:', currentPageIsVersioned);
            
            if (currentPageIsVersioned && fwBtn && previousRow.parentElement) {
                // If we're moving to another versioned page, restore forward button normally
                console.log('[version-aligner] Restoring forward button to original position for re-alignment');
                previousRow.parentElement.insertBefore(fwBtn, previousRow);
                fwBtn.style.flex = '';
                fwBtn.style.margin = '';
                fwBtn.classList.add('w-full');
            } else if (!currentPageIsVersioned && fwBtn) {
                // If we're moving to a non-versioned page, forward button should stay where it naturally belongs
                console.log('[version-aligner] Moving to non-versioned page, keeping forward button in natural location');
                // Don't restore fwBtn to sidebar - let it disappear naturally since page doesn't need it
            }
            
            if (verBtn) {
                console.log('[version-aligner] Restoring version button to original position');
                const placeholder = document.getElementById(PLACEHOLDER_ID);
                if (placeholder && placeholder.parentElement) {
                    // Move version button back to its original location
                    placeholder.parentElement.insertBefore(verBtn, placeholder);
                    verBtn.style.display = '';
                    verBtn.style.flex = '';
                    
                    // Remove the React dropdown classes that were added
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
                    verBtn.classList.remove(...reactClasses);
                    
                    delete verBtn.dataset.versionAlignerButton;
                    placeholder.remove();
                    console.log('[version-aligner] Version button restored and placeholder removed');
                } else {
                    console.log('[version-aligner] Could not find placeholder - version button will be removed');
                    verBtn.remove();
                }
            }
            console.log('[version-aligner] Removing previous row');
            previousRow.remove();
            
            // Exit early if current page is not versioned - no need to proceed with alignment
            if (!currentPageIsVersioned) {
                console.log('[version-aligner] Current page is not versioned, cleanup complete');
                return;
            }
        }

        // Page versioning was already checked during cleanup - we only reach here if page is versioned

        console.log('[version-aligner] Finding version selector and forward button...');
        const verBtn = findVersionSelector();
        const fwBtn = findForwardButton();

        if (!verBtn) {
            console.log('[version-aligner] ERROR: Version button not found, cannot align');
            return;
        }
        console.log('[version-aligner] Version button found successfully');

        if (!fwBtn) {
            console.log('[version-aligner] ERROR: Forward button not found, cannot align');
            return;
        }
        console.log('[version-aligner] Forward button found successfully');

        console.log('[version-aligner] Creating placeholder for version button...');
        const placeholder = document.createElement('div');
        placeholder.id = PLACEHOLDER_ID;
        placeholder.style.display = 'none';
        verBtn.parentNode.insertBefore(placeholder, verBtn);

        console.log('[version-aligner] Creating alignment row...');
        const row = document.createElement('div');
        row.className = `${ALIGNER_ROW_CLASS} flex items-center gap-2`;
        row.style.flex = '1 1 auto';

        console.log('[version-aligner] Setting up version button...');
        verBtn.dataset.versionAlignerButton = 'true';
        verBtn.style.flex = '0 0 auto';
        
        // Remove the arrow (chevron) from the version button
        const arrow = verBtn.querySelector('svg');
        if (arrow) {
            arrow.remove();
            console.log('[version-aligner] Removed arrow from version button');
        }
        
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
        
        console.log('[version-aligner] Version button styled to match React dropdown with custom modifications');

        console.log('[version-aligner] Setting up forward button...');
        fwBtn.style.flex = '1 1 auto';
        fwBtn.style.margin = '0px';
        fwBtn.classList.remove('w-full');

        console.log('[version-aligner] Assembling alignment row...');
        // Change order: React dropdown first, then version dropdown
        row.appendChild(fwBtn);
        row.appendChild(verBtn);

        console.log('[version-aligner] Inserting alignment row into sidebar...');
        const sidebar = document.getElementById('sidebar-content');
        const navigationItems = sidebar.querySelector('#navigation-items');
        navigationItems.insertBefore(row, navigationItems.firstChild);

        console.log('[version-aligner] Alignment completed successfully!');
    }

    function realign() {
        console.log('[version-aligner] ===== REALIGN TRIGGERED =====');
        console.log('[version-aligner] Current URL:', window.location.href);
        console.log('[version-aligner] Screen width:', window.innerWidth);
        
        if (observer) observer.disconnect();
        try {
            _realign();
        } finally {
            observer.observe(document.body, { childList: true, subtree: true });
            console.log('[version-aligner] Observer reconnected');
        }
        console.log('[version-aligner] ===== REALIGN COMPLETE =====');
    }

    let realignTimeoutId;
    function triggerRealign() {
        console.log('[version-aligner] triggerRealign called, setting timeout...');
        clearTimeout(realignTimeoutId);
        realignTimeoutId = setTimeout(() => {
            console.log('[version-aligner] Timeout expired, executing realign...');
            realign();
        }, 150);
    }

    function startObserver() {
        console.log('[version-aligner] Starting MutationObserver...');
        if (observer) {
            observer.disconnect();
            console.log('[version-aligner] Disconnected existing observer');
        }

        observer = new MutationObserver(() => {
            console.log('[version-aligner] DOM mutation detected, triggering realign...');
            triggerRealign();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        console.log('[version-aligner] MutationObserver started and observing document.body');
    }

    // Initial run
    console.log('[version-aligner] ===== SCRIPT INITIALIZATION =====');
    console.log('[version-aligner] Starting initial alignment...');
    triggerRealign();

    // Listen for SPA navigation changes
    console.log('[version-aligner] Setting up SPA navigation listeners...');
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
        console.log('[version-aligner] history.pushState intercepted:', args[2]);
        originalPushState.apply(this, args);
        triggerRealign();
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function(...args) {
        console.log('[version-aligner] history.replaceState intercepted:', args[2]);
        originalReplaceState.apply(this, args);
        triggerRealign();
    };

    window.addEventListener('popstate', () => {
        console.log('[version-aligner] popstate event detected');
        triggerRealign();
    });

    // Listen for screen size changes
    window.addEventListener('resize', () => {
        console.log('[version-aligner] resize event detected, new width:', window.innerWidth);
        triggerRealign();
    });

    // Start observing DOM changes
    startObserver();
    
    console.log('[version-aligner] ===== SCRIPT INITIALIZATION COMPLETE =====');
})();
