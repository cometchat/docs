// Custom Navigation System
// This script removes the existing navigation and adds a custom navigation with dropdown support

(function() {
    'use strict';



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
                        external: true
                    },
                    {
                        label: 'Widgets',
                        description: 'Integrate chat on no-code sites',
                        href: '/docs/widget',
                        icon: 'puzzle',
                        external: true
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



    // Determine which navigation item should be active based on current URL
    function getActiveItem() {
        const currentPath = window.location.pathname;
        
        // Check each navigation item to see if it matches the current path
        for (const item of navConfig.items) {
            if (item.type === 'link' && currentPath.startsWith(item.href)) {
                return item.label;
            } else if (item.type === 'dropdown' && item.items) {
                // Check if any dropdown item matches
                for (const dropdownItem of item.items) {
                    if (currentPath.startsWith(dropdownItem.href)) {
                        return item.label;
                    }
                }
            }
        }
        
        return null; // No active item
    }

    // Create navigation HTML
    function createNavigation() {
        const nav = document.createElement('div');
        nav.className = 'custom-nav';
        const activeItem = getActiveItem();

        navConfig.items.forEach(item => {
            if (item.type === 'link') {
                const link = document.createElement('a');
                link.className = `custom-nav-item ${activeItem === item.label ? 'active' : ''}`;
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
                trigger.className = `custom-nav-item dropdown ${activeItem === item.label ? 'active' : ''}`;
                
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

    // Replace existing navigation
    function replaceNavigation() {
        const existingNavContainer = document.querySelector('.nav-tabs');
        if (existingNavContainer && existingNavContainer.parentElement) {
            const customNav = createNavigation();
            existingNavContainer.parentElement.appendChild(customNav);
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

    // Initialize when DOM is ready
    function initialize() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                replaceNavigation();
                setupURLChangeListener();
                setupGlobalClickHandler();
            });
        } else {
            replaceNavigation();
            setupURLChangeListener();
            setupGlobalClickHandler();
        }
    }

    // Listen for URL changes to update active state
    function setupURLChangeListener() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            setTimeout(() => {
                const existingCustomNav = document.querySelector('.custom-nav');
                if (existingCustomNav) {
                    const newNav = createNavigation();
                    existingCustomNav.parentElement.replaceChild(newNav, existingCustomNav);
                }
            }, 100);
        });

        // Handle programmatic navigation (for SPAs)
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function() {
            originalPushState.apply(history, arguments);
            setTimeout(() => {
                const existingCustomNav = document.querySelector('.custom-nav');
                if (existingCustomNav) {
                    const newNav = createNavigation();
                    existingCustomNav.parentElement.replaceChild(newNav, existingCustomNav);
                }
            }, 100);
        };

        history.replaceState = function() {
            originalReplaceState.apply(history, arguments);
            setTimeout(() => {
                const existingCustomNav = document.querySelector('.custom-nav');
                if (existingCustomNav) {
                    const newNav = createNavigation();
                    existingCustomNav.parentElement.replaceChild(newNav, existingCustomNav);
                }
            }, 100);
        };
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

        // Refresh navigation (recalculates active state based on current URL)
        refresh: function() {
            this.updateConfig(navConfig);
        }
    };

    // Start the custom navigation system
    initialize();

})();
