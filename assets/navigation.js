// Custom Navigation System
// This script removes the existing navigation and adds a custom navigation with dropdown support

(function() {
    'use strict';
    
    // Debug control - can be toggled from browser console with: window.CustomNavDebug = true/false
    let debugEnabled = false;
    
    // Guards to prevent infinite loops
    let isReplacingNavigation = false;
    let dialogWatcherSetup = false;
    let urlChangeListenerSetup = false;
    let lastReplacementTime = 0;
    let mobileButtonListenersSetup = false;
    
    // Debounce function to prevent rapid successive calls
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Debug logging function
    function debugLog(...args) {
        if (debugEnabled) {
            console.log(...args);
        }
    }
    
    // Expose debug control to window for easy access from browser console
    window.CustomNavDebug = {
        get enabled() { return debugEnabled; },
        set enabled(value) { 
            debugEnabled = !!value; 
            debugLog('🐛 Debug logging', debugEnabled ? 'ENABLED' : 'DISABLED');
        },
        enable() { this.enabled = true; },
        disable() { this.enabled = false; }
    };
    
    debugLog('🎯 Custom Navigation Script Loaded');



    // Navigation configuration
    const navConfig = {
        items: [
            {
                type: 'link',
                label: 'Home',
                href: '/docs'
            },
            {
                type: 'dropdown',
                label: 'Chat & Messaging',
                items: [
                    {
                        label: 'Platform',
                        description: 'Overview of Chat & Messaging',
                        href: '/docs/fundamentals',
                        icon: 'message-circle'
                    },
                    {
                        label: 'UI Kits',
                        description: 'Integrate chat using our UI components',
                        href: '/docs/ui-kit',
                        icon: 'layers'
                    },
                    {
                        label: 'SDKs',
                        description: 'Integrate chat using SDKs',
                        href: '/docs/sdk',
                        icon: 'code',
                        external: false
                    },
                    {
                        label: 'Widgets',
                        description: 'Integrate chat on no-code sites',
                        href: '/docs/widget',
                        icon: 'puzzle',
                        external: false
                    },
                    {
                        label: 'APIs',
                        description: 'Sync users and more using our APIs',
                        href: '/reference/chat-apis',
                        icon: 'database'
                    }
                ]
            },
           
            {
                type: 'dropdown',
                label: 'AI Agents',
                items: [
                    {
                        label: 'Platform',
                        description: 'Overview of AI Agents',
                        href: '/docs/ai-chatbots',
                        icon: 'bot'
                    },
                    {
                        label: 'Integration',
                        description: 'Integrate AI Agents in minutes',
                        href: '/docs/ai-chatbots/bots',
                        icon: 'zap'
                    }
                ]
            },
            {
                type: 'dropdown',
                label: 'Voice & Video Calling',
                items: [
                    {
                        label: 'Platform',
                        description: 'Overview of Voice & Video Calling',
                        href: '/docs/fundamentals',
                        icon: 'video'
                    },
                    {
                        label: 'Integration',
                        description: 'Integrate Voice & Video Calling in minutes',
                        href: '/docs/ui-kit',
                        icon: 'phone-call'
                    }
                ]
            },
            {
                type: 'dropdown',
                label: 'AI Moderation',
                items: [
                    {
                        label: 'Platform',
                        description: 'Overview of AI Moderation',
                        href: '/docs/moderation',
                        icon: 'shield'
                    },
                    {
                        label: 'Integration',
                        description: 'Integrate AI Moderation in minutes',
                        href: '/docs/moderation/rules-management',
                        icon: 'shield-check'
                    }
                ]
            },
            {
                type: 'link',
                label: 'Notifications',
                href: '/docs/notifications'
            },
            {
                type: 'link',
                label: 'Insights',
                href: '/docs/insights'
            },
        ]
    };





    // Create desktop navigation HTML
    function createNavigation() {
        const nav = document.createElement('div');
        nav.className = 'custom-nav';

        navConfig.items.forEach(item => {
            if (item.type === 'link') {
                const link = document.createElement('a');
                link.className = 'custom-nav-item';
                link.href = item.href;
                
                // Add text content and bottom border div (matches original structure)
                const textSpan = document.createTextNode(item.label);
                link.appendChild(textSpan);
                
                const bottomBorder = document.createElement('div');
                bottomBorder.className = 'custom-nav-bottom-border';
                link.appendChild(bottomBorder);
                
                nav.appendChild(link);
            } else if (item.type === 'dropdown') {
                const dropdownContainer = document.createElement('div');
                dropdownContainer.style.position = 'relative';

                const trigger = document.createElement('div');
                trigger.className = 'custom-nav-item dropdown';
                
                // Add text content with dropdown arrow and bottom border div
                const labelText = document.createTextNode(item.label);
                trigger.appendChild(labelText);
                
                const arrow = document.createElement('span');
                arrow.className = 'dropdown-arrow';
                arrow.textContent = '▾';
                trigger.appendChild(arrow);
                
                const bottomBorder = document.createElement('div');
                bottomBorder.className = 'custom-nav-bottom-border';
                trigger.appendChild(bottomBorder);

                const dropdown = document.createElement('div');
                dropdown.className = 'custom-dropdown';

                item.items.forEach(dropdownItem => {
                    const dropdownLink = document.createElement('a');
                    dropdownLink.className = 'custom-dropdown-item';
                    dropdownLink.href = dropdownItem.href;
                    if (dropdownItem.external) {
                        dropdownLink.target = '_blank';
                        dropdownLink.rel = 'noopener noreferrer';
                    }

                    const iconContainer = document.createElement('div');
                    iconContainer.className = 'custom-dropdown-icon';
                    
                    // Create icon using direct CDN SVG URLs
                    const iconImg = document.createElement('img');
                    iconImg.src = `https://mintlify.b-cdn.net/v6.6.0/lucide/${dropdownItem.icon}.svg`;
                    iconImg.alt = dropdownItem.label;
                    iconImg.style.width = '16px';
                    iconImg.style.height = '16px';
                    iconContainer.appendChild(iconImg);

                    const content = document.createElement('div');
                    content.className = 'custom-dropdown-content';

                    const title = document.createElement('div');
                    title.className = 'custom-dropdown-title';
                    title.textContent = dropdownItem.label;
                    
                    if (dropdownItem.external) {
                        const externalIcon = document.createElement('svg');
                        externalIcon.className = 'external-link-icon';
                        externalIcon.innerHTML = `<path d="M7 7h10v10"></path><path d="M7 17 17 7"></path>`;
                        externalIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                        externalIcon.setAttribute('width', '24');
                        externalIcon.setAttribute('height', '24');
                        externalIcon.setAttribute('viewBox', '0 0 24 24');
                        externalIcon.setAttribute('fill', 'none');
                        externalIcon.setAttribute('stroke', 'currentColor');
                        externalIcon.setAttribute('stroke-width', '2');
                        externalIcon.setAttribute('stroke-linecap', 'round');
                        externalIcon.setAttribute('stroke-linejoin', 'round');
                        title.appendChild(externalIcon);
                    }

                    const description = document.createElement('div');
                    description.className = 'custom-dropdown-description';
                    description.textContent = dropdownItem.description;

                    content.appendChild(title);
                    content.appendChild(description);

                    dropdownLink.appendChild(iconContainer);
                    dropdownLink.appendChild(content);

                    dropdown.appendChild(dropdownLink);
                });

                // Dropdown toggle functionality
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    const isCurrentlyOpen = dropdown.classList.contains('open');
                    
                    // Close all dropdowns first
                    document.querySelectorAll('.custom-dropdown.open').forEach(otherDropdown => {
                        otherDropdown.classList.remove('open');
                        otherDropdown.previousElementSibling.classList.remove('open');
                    });
                    
                    // If this dropdown was closed, open it
                    if (!isCurrentlyOpen) {
                        trigger.classList.add('open');
                        dropdown.classList.add('open');
                    }
                });

                dropdownContainer.appendChild(trigger);
                dropdownContainer.appendChild(dropdown);
                nav.appendChild(dropdownContainer);
            }
        });

        return nav;
    }

    // Create mobile navigation HTML
    function createMobileNavigation() {
        debugLog('🏗️ createMobileNavigation() called');
        debugLog('📋 Nav config items:', navConfig.items);
        
        const mobileNav = document.createElement('div');
        mobileNav.className = 'custom-mobile-nav';

        const ul = document.createElement('ul');

        navConfig.items.forEach((item, index) => {
            debugLog(`🔧 Processing item ${index}:`, item);
            const li = document.createElement('li');

            if (item.type === 'link') {
                const link = document.createElement('a');
                link.className = 'custom-mobile-nav-item';
                link.href = item.href;

                // Label only (no icon for main nav items)
                const labelSpan = document.createElement('span');
                labelSpan.textContent = item.label;

                link.appendChild(labelSpan);
                li.appendChild(link);
            } else if (item.type === 'dropdown') {
                const trigger = document.createElement('div');
                trigger.className = 'custom-mobile-nav-item dropdown';

                // Label only (no icon for main nav items)
                const labelSpan = document.createElement('span');
                labelSpan.textContent = item.label;

                // Arrow
                const arrow = document.createElement('svg');
                arrow.className = 'custom-mobile-nav-arrow';
                arrow.setAttribute('width', '8');
                arrow.setAttribute('height', '24');
                arrow.setAttribute('viewBox', '0 -9 3 24');
                arrow.innerHTML = `<path d="M0 0L3 3L0 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>`;

                trigger.appendChild(labelSpan);
                trigger.appendChild(arrow);

                // Sub items container
                const subItemsContainer = document.createElement('div');
                subItemsContainer.className = 'custom-mobile-nav-subitems';

                item.items.forEach(subItem => {
                    const subLink = document.createElement('a');
                    subLink.className = 'custom-mobile-nav-subitem';
                    subLink.href = subItem.href;
                    if (subItem.external) {
                        subLink.target = '_blank';
                        subLink.rel = 'noopener noreferrer';
                    }

                    // Sub item icon
                    const subIconContainer = document.createElement('div');
                    subIconContainer.className = 'custom-mobile-nav-subitem-icon';
                    const subIconImg = document.createElement('img');
                    subIconImg.src = `https://mintlify.b-cdn.net/v6.6.0/lucide/${subItem.icon}.svg`;
                    subIconImg.alt = subItem.label;
                    subIconContainer.appendChild(subIconImg);

                    // Sub item label
                    const subLabelSpan = document.createElement('span');
                    subLabelSpan.textContent = subItem.label;

                    subLink.appendChild(subIconContainer);
                    subLink.appendChild(subLabelSpan);
                    subItemsContainer.appendChild(subLink);
                });

                // Toggle functionality for mobile dropdown
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const isExpanded = trigger.classList.contains('expanded');
                    
                    // Close all other expanded dropdowns
                    document.querySelectorAll('.custom-mobile-nav-item.dropdown.expanded').forEach(otherTrigger => {
                        if (otherTrigger !== trigger) {
                            otherTrigger.classList.remove('expanded');
                            otherTrigger.nextElementSibling.classList.remove('expanded');
                        }
                    });

                    // Toggle this dropdown
                    if (isExpanded) {
                        trigger.classList.remove('expanded');
                        subItemsContainer.classList.remove('expanded');
                    } else {
                        trigger.classList.add('expanded');
                        subItemsContainer.classList.add('expanded');
                    }
                });

                li.appendChild(trigger);
                li.appendChild(subItemsContainer);
            }

            ul.appendChild(li);
        });

        mobileNav.appendChild(ul);
        debugLog('✅ Mobile navigation created successfully:', mobileNav);
        debugLog('📊 Mobile nav has', ul.children.length, 'items');
        return mobileNav;
    }

    // Replace existing navigation
    function replaceNavigation() {
        if (isReplacingNavigation) {
            debugLog('⚠️ Navigation replacement already in progress, skipping');
            return;
        }
        
        const now = Date.now();
        if (now - lastReplacementTime < 1000) {
            debugLog('⚠️ Navigation replacement called too recently, skipping');
            return;
        }
        lastReplacementTime = now;
        
        isReplacingNavigation = true;
        debugLog('🔄 replaceNavigation() called');
        
        try {
            // Debug: Show all possible navigation containers
            const allNavigationItems = document.querySelectorAll('#navigation-items');
            debugLog('🔍 Found', allNavigationItems.length, 'elements with ID navigation-items');
        
            allNavigationItems.forEach((container, index) => {
                debugLog(`📍 Container ${index}:`, container);
                debugLog(`  - Parent:`, container.parentElement);
                debugLog(`  - Parent classes:`, container.parentElement?.className);
                debugLog(`  - Visible:`, container.offsetParent !== null);
                debugLog(`  - Display:`, getComputedStyle(container).display);
                debugLog(`  - innerHTML preview:`, container.innerHTML.substring(0, 100) + '...');
            });
            
            debugLog('🖥️ All elements with navigation-related IDs/classes:');
            debugLog('  .nav-tabs:', document.querySelector('.nav-tabs'));
            debugLog('  #navigation:', document.querySelector('#navigation'));
            debugLog('  [class*="nav"]:', document.querySelectorAll('[class*="nav"]'));
            
            const existingNavContainer = document.querySelector('.nav-tabs');
            debugLog('🖥️ Desktop nav container:', existingNavContainer);
            
            if (existingNavContainer && existingNavContainer.parentElement) {
                // Remove any existing custom navigation first
                const existingCustomNav = existingNavContainer.parentElement.querySelector('.custom-nav');
                if (existingCustomNav) {
                    existingCustomNav.remove();
                }
                
                // Create desktop navigation
                const customNav = createNavigation();
                existingNavContainer.parentElement.appendChild(customNav);
                debugLog('✅ Desktop navigation created and added');
            } else {
                debugLog('❌ Desktop nav container not found or no parent');
            }

            // Handle mobile navigation - target both desktop sidebar and mobile dialog
            let mobileNavReplaced = false;
            
            allNavigationItems.forEach((mobileNavContainer, index) => {
                debugLog(`📱 Processing mobile nav container ${index}:`, mobileNavContainer);
                
                // Check if this container is visible and likely the active one
                const isVisible = mobileNavContainer.offsetParent !== null;
                const hasContent = mobileNavContainer.innerHTML.trim().length > 0;
                const parentClasses = mobileNavContainer.parentElement?.className || '';
                const isDesktopSidebar = parentClasses.includes('lg:flex') && parentClasses.includes('hidden');
                
                debugLog(`  - Is visible: ${isVisible}`);
                debugLog(`  - Has content: ${hasContent}`);
                debugLog(`  - Is desktop sidebar: ${isDesktopSidebar}`);
                debugLog(`  - Parent classes: ${parentClasses}`);
                
                if (hasContent && !isDesktopSidebar) {
                    debugLog(`🎯 Using mobile nav container ${index} (mobile dialog)`);
                    
                    // Find the specific ul element that contains the main navigation
                    const mainNavUL = mobileNavContainer.querySelector('ul.mb-12');
                    debugLog('🎯 Found main navigation UL in container', index, ':', mainNavUL);
                    
                    if (mainNavUL) {
                        debugLog('📋 Main nav UL innerHTML before replace:', mainNavUL.innerHTML.substring(0, 200) + '...');
                        
                        // Create our custom navigation
                        const customMobileNav = createMobileNavigation();
                        debugLog('🏗️ Created mobile navigation:', customMobileNav);
                        
                        // Add a distinguishing attribute to help identify our navigation
                        customMobileNav.setAttribute('data-custom-nav', 'true');
                        customMobileNav.setAttribute('data-container-type', isDesktopSidebar ? 'desktop-sidebar' : 'mobile-dialog');
                        customMobileNav.style.position = 'relative';
                        customMobileNav.style.zIndex = '1000';
                        
                        // Replace the UL element instead of clearing entire container
                        mainNavUL.parentElement.replaceChild(customMobileNav, mainNavUL);
                        debugLog('✅ Mobile navigation UL replaced in container', index);
                        
                        mobileNavReplaced = true;
                    } else {
                        debugLog('❌ Could not find main navigation UL (ul.mb-12) in container', index);
                        
                        // Fallback: look for any ul element with navigation links
                        const fallbackUL = mobileNavContainer.querySelector('ul');
                        if (fallbackUL) {
                            debugLog('🎯 Found fallback UL element in container', index, ':', fallbackUL);
                            
                            const customMobileNav = createMobileNavigation();
                            customMobileNav.setAttribute('data-custom-nav', 'true');
                            customMobileNav.setAttribute('data-container-type', isDesktopSidebar ? 'desktop-sidebar' : 'mobile-dialog');
                            customMobileNav.style.position = 'relative';
                            customMobileNav.style.zIndex = '1000';
                            
                            fallbackUL.parentElement.replaceChild(customMobileNav, fallbackUL);
                            debugLog('✅ Fallback UL replaced in container', index);
                            
                            mobileNavReplaced = true;
                        } else {
                            debugLog('❌ No suitable UL element found in container', index);
                        }
                    }
                    
                    // Verify the navigation was actually added
                    // setTimeout(() => {
                    //     const verifyNav = mobileNavContainer.querySelector('.custom-mobile-nav');
                    //     const stillHasOriginalUL = mobileNavContainer.querySelector('ul.mb-12');
                    //     debugLog('🔍 Verification - Custom nav exists:', !!verifyNav);
                    //     debugLog('🔍 Verification - Original UL still exists:', !!stillHasOriginalUL);
                    //     if (verifyNav && !stillHasOriginalUL) {
                    //         debugLog('✅ Custom navigation replaced original UL successfully');
                    //     } else if (verifyNav && stillHasOriginalUL) {
                    //         debugLog('⚠️ Both custom nav and original UL exist - might be duplicate');
                    //     } else {
                    //         debugLog('❌ Custom navigation was removed or replacement failed');
                    //     }
                    // }, 1000);
                } else {
                    if (isDesktopSidebar) {
                        debugLog(`⏭️ Skipping mobile nav container ${index} (desktop sidebar - handled separately)`);
                    } else {
                        debugLog(`⏭️ Skipping mobile nav container ${index} (no content)`);
                    }
                }
            });
            
            // Also watch for mobile dialog navigation
            setupMobileDialogWatcher();
            
            if (!mobileNavReplaced) {
                debugLog('❌ No suitable mobile nav container found');
                
                // Fallback: try to find any navigation container
                const fallbackContainers = document.querySelectorAll('[class*="navigation"], [id*="navigation"]');
                debugLog('🔍 Fallback: Found', fallbackContainers.length, 'navigation-related elements');
                
                fallbackContainers.forEach((container, index) => {
                    debugLog(`📍 Fallback container ${index}:`, container);
                    debugLog(`  - Tag:`, container.tagName);
                    debugLog(`  - ID:`, container.id);
                    debugLog(`  - Classes:`, container.className);
                    debugLog(`  - Visible:`, container.offsetParent !== null);
                });
            }
        } finally {
            isReplacingNavigation = false;
        }
    }

    // Watch for mobile dialog navigation appearing
    function setupMobileDialogWatcher() {
        if (dialogWatcherSetup) {
            debugLog('⚠️ Mobile dialog watcher already setup, skipping');
            return;
        }
        dialogWatcherSetup = true;

        debugLog('👀 Setting up mobile dialog watcher');
        
        const dialogObserver = new MutationObserver((mutations) => {
            if (isReplacingNavigation) {
                debugLog('⚠️ Skipping dialog observer action - replacement in progress');
                return;
            }
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Look for HeadlessUI dialog panels or mobile navigation containers
                            if (node.id && node.id.includes('headlessui-dialog-panel') ||
                                node.querySelector && node.querySelector('[id*="headlessui-dialog-panel"]')) {
                                debugLog('🚨 Mobile dialog detected:', node);
                                
                                // Check immediately for navigation items
                                const dialogNavItems = node.querySelector ? node.querySelector('#navigation-items') : null;
                                if (dialogNavItems && !dialogNavItems.querySelector('.custom-mobile-nav')) {
                                    debugLog('📱 Found navigation-items in mobile dialog:', dialogNavItems);
                                    replaceMobileDialogNavigation(dialogNavItems);
                                }
                            }
                            
                            // Also check if this node itself has navigation-items
                            if (node.id === 'navigation-items' && !node.querySelector('.custom-mobile-nav')) {
                                debugLog('📱 New navigation-items container appeared:', node);
                                const parentClasses = node.parentElement?.className || '';
                                const isDesktopSidebar = parentClasses.includes('lg:flex') && parentClasses.includes('hidden');
                                
                                if (!isDesktopSidebar) {
                                    debugLog('🎯 This appears to be a mobile dialog navigation');
                                    if (!node.querySelector('.custom-mobile-nav')) {
                                        replaceMobileDialogNavigation(node);
                                    }
                                }
                            }
                        }
                    });
                }
            });
        });
        
        // Start observing
        dialogObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        debugLog('✅ Mobile dialog watcher active');
    }

    // Replace navigation in mobile dialog
    function replaceMobileDialogNavigation(container) {
        if (isReplacingNavigation) {
            debugLog('⚠️ Dialog navigation replacement skipped - already in progress');
            return;
        }
        
        debugLog('🔄 replaceMobileDialogNavigation() called for:', container);
        
        if (container && !container.querySelector('.custom-mobile-nav')) {
            // Find the specific ul element that contains the main navigation
            const mainNavUL = container.querySelector('ul.mb-12');
            debugLog('🎯 Found main navigation UL:', mainNavUL);
            
            if (mainNavUL) {
                debugLog('📋 Main nav UL innerHTML before replace:', mainNavUL.innerHTML.substring(0, 200) + '...');
                
                // Create our custom navigation
                const customMobileNav = createMobileNavigation();
                customMobileNav.setAttribute('data-custom-nav', 'true');
                customMobileNav.setAttribute('data-container-type', 'mobile-dialog');
                customMobileNav.style.position = 'relative';
                customMobileNav.style.zIndex = '1000';
                
                // Replace the UL element instead of clearing entire container
                mainNavUL.parentElement.replaceChild(customMobileNav, mainNavUL);
                debugLog('✅ Mobile dialog navigation UL replaced');
            } else {
                debugLog('❌ Could not find main navigation UL (ul.mb-12) in container');
                
                // Fallback: look for any ul element with navigation links
                const fallbackUL = container.querySelector('ul');
                if (fallbackUL) {
                    debugLog('🎯 Found fallback UL element:', fallbackUL);
                    debugLog('📋 Fallback UL innerHTML:', fallbackUL.innerHTML.substring(0, 200) + '...');
                    
                    const customMobileNav = createMobileNavigation();
                    customMobileNav.setAttribute('data-custom-nav', 'true');
                    customMobileNav.setAttribute('data-container-type', 'mobile-dialog');
                    customMobileNav.style.position = 'relative';
                    customMobileNav.style.zIndex = '1000';
                    
                    fallbackUL.parentElement.replaceChild(customMobileNav, fallbackUL);
                    debugLog('✅ Fallback UL replaced');
                } else {
                    debugLog('❌ No suitable UL element found for replacement');
                }
            }
        } else if (container && container.querySelector('.custom-mobile-nav')) {
            debugLog('ℹ️ Mobile dialog already has custom navigation');
        }
    }

    // Global click handler to close dropdowns when clicking outside
    function setupGlobalClickHandler() {
        document.addEventListener('click', (e) => {
            // If click is not on a dropdown trigger or inside a dropdown, close all dropdowns
            if (!e.target.closest('.custom-nav-item.dropdown') && !e.target.closest('.custom-dropdown')) {
                document.querySelectorAll('.custom-dropdown.open').forEach(dropdown => {
                    dropdown.classList.remove('open');
                    dropdown.previousElementSibling.classList.remove('open');
                });
            }
        });
    }

    // Setup viewport change listener to handle mobile/desktop switching
    function setupViewportChangeListener() {
        let isDesktop = window.innerWidth >= 1024;
        
        window.addEventListener('resize', debounce(() => {
            const wasDesktop = isDesktop;
            isDesktop = window.innerWidth >= 1024;
            
            // If switching from mobile to desktop, force refresh navigation
            if (!wasDesktop && isDesktop) {
                debugLog('🔄 Switched from mobile to desktop, forcing navigation refresh');
                replaceNavigation();
            }
        }, 100));
    }

    // Initialize when DOM is ready
    function initialize() {
        debugLog('🚀 initialize() called');
        debugLog('📄 Document ready state:', document.readyState);
        
        if (document.readyState === 'loading') {
            debugLog('⏳ Waiting for DOMContentLoaded...');
            document.addEventListener('DOMContentLoaded', () => {
                debugLog('✅ DOMContentLoaded fired');
                replaceNavigation();
                setupURLChangeListener();
                setupGlobalClickHandler();
                setupViewportChangeListener();
                // Set up mobile menu button listener
                if (window.CustomNav && window.CustomNav.setupMobileMenuButtonListener) {
                    window.CustomNav.setupMobileMenuButtonListener();
                }
            });
        } else {
            debugLog('✅ DOM already ready, proceeding immediately');
            replaceNavigation();
            setupURLChangeListener();
            setupGlobalClickHandler();
            setupViewportChangeListener();
            // Set up mobile menu button listener
            if (window.CustomNav && window.CustomNav.setupMobileMenuButtonListener) {
                window.CustomNav.setupMobileMenuButtonListener();
            }
        }
    }

    // Recreate or update navigation
    function recreateNavigation() {
        if (isReplacingNavigation) {
            debugLog('⚠️ Recreation skipped - replacement already in progress');
            return;
        }
        
        isReplacingNavigation = true;
        debugLog('🔄 recreateNavigation() called');
        
        try {
            // Handle desktop navigation
            const existingCustomNav = document.querySelector('.custom-nav');
            const navContainer = document.querySelector('.nav-tabs');
            debugLog('🖥️ Existing desktop nav:', existingCustomNav);
            debugLog('🖥️ Desktop nav container:', navContainer);
            
            if (existingCustomNav) {
                // Update existing desktop navigation
                const newNav = createNavigation();
                existingCustomNav.parentElement.replaceChild(newNav, existingCustomNav);
                debugLog('✅ Desktop navigation updated');
            } else if (navContainer && navContainer.parentElement) {
                // Desktop navigation was removed, recreate it
                const customNav = createNavigation();
                navContainer.parentElement.appendChild(customNav);
                debugLog('✅ Desktop navigation recreated');
            }

            // Handle mobile navigation - check all navigation-items containers
            const allNavigationItems = document.querySelectorAll('#navigation-items');
            debugLog('🔍 Found', allNavigationItems.length, 'navigation-items containers for recreation');
            
            let mobileNavRecreated = false;
            
            allNavigationItems.forEach((mobileNavContainer, index) => {
                debugLog(`📱 Processing mobile nav container ${index} for recreation:`, mobileNavContainer);
                
                const existingMobileNav = mobileNavContainer.querySelector('.custom-mobile-nav');
                const isVisible = mobileNavContainer.offsetParent !== null;
                const hasContent = mobileNavContainer.innerHTML.trim().length > 0;
                const parentClasses = mobileNavContainer.parentElement?.className || '';
                const isDesktopSidebar = parentClasses.includes('lg:flex') && parentClasses.includes('hidden');
                
                debugLog(`  - Has existing custom nav: ${!!existingMobileNav}`);
                debugLog(`  - Is visible: ${isVisible}`);
                debugLog(`  - Has content: ${hasContent}`);
                debugLog(`  - Is desktop sidebar: ${isDesktopSidebar}`);
                
                if (isVisible && (existingMobileNav || hasContent) && !isDesktopSidebar) {
                    debugLog(`🎯 Recreating mobile nav in container ${index}`);
                    
                    // Find the specific ul element or existing custom nav to replace
                    let targetElement = existingMobileNav || mobileNavContainer.querySelector('ul.mb-12') || mobileNavContainer.querySelector('ul');
                    
                    if (targetElement) {
                        debugLog('🎯 Found target element to replace:', targetElement);
                        
                        const customMobileNav = createMobileNavigation();
                        customMobileNav.setAttribute('data-custom-nav', 'true');
                        customMobileNav.style.position = 'relative';
                        customMobileNav.style.zIndex = '1000';
                        
                        targetElement.parentElement.replaceChild(customMobileNav, targetElement);
                        debugLog('✅ Mobile navigation recreated in container', index);
                        
                        mobileNavRecreated = true;
                    } else {
                        debugLog('❌ No suitable target element found for recreation in container', index);
                    }
                    
                    // Verify the recreation
                    // setTimeout(() => {
                    //     const verifyNav = mobileNavContainer.querySelector('.custom-mobile-nav');
                    //     debugLog('🔍 Recreation verification - Custom nav exists:', !!verifyNav);
                    // }, 500);
                } else {
                    if (isDesktopSidebar) {
                        debugLog(`⏭️ Skipping mobile nav container ${index} during recreation (desktop sidebar - handled separately)`);
                    } else {
                        debugLog(`⏭️ Skipping mobile nav container ${index} during recreation (not visible, no content, or no custom nav)`);
                    }
                }
            });
            
            if (!mobileNavRecreated) {
                debugLog('❌ No mobile navigation was recreated');
            }
        } finally {
            isReplacingNavigation = false;
        }
    }

    // Debounced version of recreateNavigation
    const debouncedRecreateNavigation = debounce(recreateNavigation, 0);

    // Listen for URL changes to update active state
    function setupURLChangeListener() {
        if (urlChangeListenerSetup) {
            debugLog('⚠️ URL change listener already setup, skipping');
            return;
        }
        urlChangeListenerSetup = true;
        
        // Note: Removed navigation recreation on URL changes to prevent visual flicker
        // The navigation is static and doesn't need to be recreated on every page change

        // Watch for DOM changes that might remove our navigation
        const observer = new MutationObserver((mutations) => {
            if (isReplacingNavigation) {
                debugLog('⚠️ Skipping MutationObserver action - replacement in progress');
                return;
            }
            
            let navigationRemoved = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Check if any removed nodes contained our navigation
                    mutation.removedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.classList?.contains('custom-nav') || 
                                node.querySelector?.('.custom-nav') ||
                                node.classList?.contains('custom-mobile-nav') || 
                                node.querySelector?.('.custom-mobile-nav')) {
                                navigationRemoved = true;
                            }
                        }
                    });
                }
            });
            
            if (navigationRemoved && (!document.querySelector('.custom-nav') || !document.querySelector('.custom-mobile-nav'))) {
                debugLog('🔄 Navigation removed, recreating...');
                debouncedRecreateNavigation();
            }
        });

        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Public API for customization
    window.CustomNav = {
        // Update navigation configuration
        updateConfig: function(newConfig) {
            Object.assign(navConfig, newConfig);
            const existingCustomNav = document.querySelector('.custom-nav');
            if (existingCustomNav) {
                const newNav = createNavigation();
                existingCustomNav.parentElement.replaceChild(newNav, existingCustomNav);
            }
        },

        // Add a new navigation item
        addItem: function(item) {
            navConfig.items.push(item);
            this.updateConfig(navConfig);
        },

        // Remove a navigation item by label
        removeItem: function(label) {
            navConfig.items = navConfig.items.filter(item => item.label !== label);
            this.updateConfig(navConfig);
        },

        // Refresh navigation
        refresh: function() {
            this.updateConfig(navConfig);
        },

        // Force complete refresh - useful for debugging
        forceRefresh: function() {
            debugLog('🔄 Force refresh triggered');
            replaceNavigation();
        },

        // Manually trigger mobile dialog detection and replacement
        triggerMobileDialogDetection: function() {
            debugLog('📱 Manual mobile dialog detection triggered');
            
            // Look for any HeadlessUI dialog panels
            const dialogPanels = document.querySelectorAll('[id*="headlessui-dialog-panel"]');
            debugLog('🔍 Found', dialogPanels.length, 'dialog panels');
            
            dialogPanels.forEach((panel, index) => {
                debugLog(`📋 Dialog panel ${index}:`, panel);
                const navItems = panel.querySelector('#navigation-items');
                if (navItems) {
                    debugLog('🎯 Found navigation-items in dialog panel', index);
                    replaceMobileDialogNavigation(navItems);
                } else {
                    debugLog('❌ No navigation-items in dialog panel', index);
                }
            });
            
            // Also look for any navigation-items that might be in mobile dialogs
            const allNavItems = document.querySelectorAll('#navigation-items');
            allNavItems.forEach((container, index) => {
                const parentClasses = container.parentElement?.className || '';
                const isDesktopSidebar = parentClasses.includes('lg:flex') && parentClasses.includes('hidden');
                const hasExistingCustomNav = container.querySelector('.custom-mobile-nav');
                const hasMainNavUL = container.querySelector('ul.mb-12');
                
                if (!isDesktopSidebar && !hasExistingCustomNav && hasMainNavUL) {
                    debugLog(`🎯 Processing non-desktop navigation-items ${index} with main nav UL`);
                    replaceMobileDialogNavigation(container);
                } else {
                    if (isDesktopSidebar) {
                        debugLog(`⏭️ Skipping navigation-items ${index} (desktop sidebar - handled separately)`);
                    } else {
                        debugLog(`⏭️ Skipping navigation-items ${index} (hasCustom: ${hasExistingCustomNav}, hasUL: ${hasMainNavUL})`);
                    }
                }
            });
        },

        // Check for mobile menu button and add click listener
        setupMobileMenuButtonListener: function() {
            if (mobileButtonListenersSetup) {
                debugLog('⚠️ Mobile menu button listener already setup, skipping');
                return;
            }
            mobileButtonListenersSetup = true;

            debugLog('📱 Setting up mobile menu button listener');
            
            // Common selectors for mobile menu buttons
            const possibleSelectors = [
                '[aria-label*="menu"]',
                '[aria-label*="navigation"]',
                '[aria-label*="sidebar"]',
                'button[class*="menu"]',
                'button[class*="nav"]',
                '[data-headlessui-state]'
            ];
            
            possibleSelectors.forEach(selector => {
                const buttons = document.querySelectorAll(selector);
                debugLog(`🔍 Found ${buttons.length} elements for selector: ${selector}`);
                
                buttons.forEach((button, index) => {
                    debugLog(`📍 Button ${index}:`, button);
                    debugLog(`  - Text:`, button.textContent?.trim());
                    debugLog(`  - Aria label:`, button.getAttribute('aria-label'));
                    debugLog(`  - Classes:`, button.className);
                    
                    // Add click listener with debouncing
                    const debouncedTrigger = debounce(() => {
                        debugLog('🚨 Mobile menu button clicked, checking for dialog');
                        this.triggerMobileDialogDetection();
                    }, 300);
                    
                    button.addEventListener('click', debouncedTrigger);
                });
            });
        },

        // Debug function to analyze current navigation state
        debug: function() {
            debugLog('🐛 Navigation Debug Info:');
            debugLog('📊 Total navigation-items containers:', document.querySelectorAll('#navigation-items').length);
            
            document.querySelectorAll('#navigation-items').forEach((container, index) => {
                debugLog(`📍 Container ${index}:`);
                debugLog(`  - Element:`, container);
                debugLog(`  - Visible:`, container.offsetParent !== null);
                debugLog(`  - Display style:`, getComputedStyle(container).display);
                debugLog(`  - Has custom nav:`, !!container.querySelector('.custom-mobile-nav'));
                debugLog(`  - Has main nav UL (ul.mb-12):`, !!container.querySelector('ul.mb-12'));
                debugLog(`  - Has any UL:`, !!container.querySelector('ul'));
                debugLog(`  - Content preview:`, container.innerHTML.substring(0, 150) + '...');
            });
            
            debugLog('🖥️ Desktop nav containers:');
            debugLog(`  - .nav-tabs:`, document.querySelector('.nav-tabs'));
            debugLog(`  - .custom-nav:`, document.querySelector('.custom-nav'));
            
            return {
                mobileContainers: document.querySelectorAll('#navigation-items').length,
                customMobileNavs: document.querySelectorAll('.custom-mobile-nav').length,
                desktopNavContainer: !!document.querySelector('.nav-tabs'),
                customDesktopNav: !!document.querySelector('.custom-nav')
            };
        },

        // Get current config
        getConfig: function() {
            return navConfig;
        },

        // Reset guards (emergency function if system gets stuck)
        resetGuards: function() {
            isReplacingNavigation = false;
            dialogWatcherSetup = false;
            urlChangeListenerSetup = false;
            mobileButtonListenersSetup = false;
            lastReplacementTime = 0;
            debugLog('🔄 All guards reset');
        },

        // Check guard status
        getGuardStatus: function() {
            return {
                isReplacingNavigation,
                dialogWatcherSetup,
                urlChangeListenerSetup,
                mobileButtonListenersSetup,
                lastReplacementTime
            };
        }
    };

    // Start the custom navigation system
    debugLog('🏁 Starting custom navigation system...');
    initialize();

    // Auto-debug after a delay to see what happened
    // setTimeout(() => {
    //     debugLog('🔍 Auto-debug after 2 seconds:');
    //     if (window.CustomNav && window.CustomNav.debug) {
    //         window.CustomNav.debug();
    //     }
    // }, 2000);

})();
