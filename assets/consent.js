/* ------------------------------------------------------------------ */
/* Consent gating for analytics                                       */
/*                                                                    */
/* Strict mode: zero requests to any analytics provider until the     */
/* user clicks Accept All on the cookie banner. GTM (and everything   */
/* it loads — GA4 G-M5KZ2NFCYL, HubSpot tracking, etc.) is NOT loaded */
/* on page load; it is loaded inline only after an explicit Accept.   */
/*                                                                    */
/* Pairs with the removal of `integrations.gtm` from docs.json so     */
/* this file is the sole loader of GTM-59ZJRV2 on docs.cometchat.com. */
/* ------------------------------------------------------------------ */
(function initConsentGate() {
    try {
        if (window.__ccConsentGateInitialized__) return;
        window.__ccConsentGateInitialized__ = true;
    } catch (_) { return; }

    var GTM_ID = 'GTM-59ZJRV2';
    var STORAGE_KEY = 'cc_consent';
    var PRIVACY_URL = 'https://www.cometchat.com/privacy-policy';

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }

    // 1) Default-deny. Sets Google Consent Mode v2 defaults so that
    //    any downstream Google tag respects the user's not-yet-given
    //    consent. This is belt-and-suspenders — GTM is also not loaded
    //    at all until Accept, so in practice no Google script ever sees
    //    a denied state, it simply never runs.
    gtag('consent', 'default', {
        ad_storage:         'denied',
        ad_user_data:       'denied',
        ad_personalization: 'denied',
        analytics_storage:  'denied',
        wait_for_update:    500
    });

    function applyConsent(granted) {
        var v = granted ? 'granted' : 'denied';
        gtag('consent', 'update', {
            ad_storage:         v,
            ad_user_data:       v,
            ad_personalization: v,
            analytics_storage:  v
        });
        try { window.localStorage.setItem(STORAGE_KEY, v); } catch (_) {}
        try { document.documentElement.setAttribute('data-cc-consent', v); } catch (_) {}
    }

    var gtmLoaded = false;
    function loadGTM() {
        if (gtmLoaded) return;
        gtmLoaded = true;
        (function (w, d, s, l, i) {
            w[l] = w[l] || [];
            w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
            var f = d.getElementsByTagName(s)[0];
            var j = d.createElement(s);
            var dl = l !== 'dataLayer' ? '&l=' + l : '';
            j.async = true;
            j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
            if (f && f.parentNode) {
                f.parentNode.insertBefore(j, f);
            } else {
                (d.head || d.documentElement).appendChild(j);
            }
        })(window, document, 'script', 'dataLayer', GTM_ID);
    }

    function injectStyles() {
        if (document.getElementById('cc-consent-styles')) return;
        var style = document.createElement('style');
        style.id = 'cc-consent-styles';
        // Once the user has chosen, suppress HubSpot's own banner so it
        // doesn't appear after GTM loads and HubSpot's tracking initializes.
        style.textContent =
            '#cc-consent-banner{position:fixed;bottom:0;left:0;right:0;z-index:2147483646;' +
            'background:#fff;color:#111827;border-top:1px solid rgba(0,0,0,0.08);' +
            'box-shadow:0 -4px 20px rgba(0,0,0,0.06);' +
            'padding:24px clamp(16px,5vw,64px);' +
            'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;' +
            'font-size:14px;line-height:1.5;display:flex;flex-direction:column;gap:16px}' +
            '@media(min-width:880px){#cc-consent-banner{flex-direction:row;align-items:center;' +
            'justify-content:space-between;gap:32px}}' +
            '#cc-consent-banner__copy{flex:1;min-width:0}' +
            '#cc-consent-banner__copy p{margin:0 0 8px 0;color:inherit}' +
            '#cc-consent-banner__copy p:last-child{margin-bottom:0}' +
            '#cc-consent-banner__copy a{color:inherit;text-decoration:underline}' +
            '#cc-consent-banner__actions{display:flex;gap:8px;flex-shrink:0;' +
            'align-self:stretch;justify-content:flex-end}' +
            '@media(min-width:880px){#cc-consent-banner__actions{align-self:auto}}' +
            '#cc-consent-banner button{font:inherit;cursor:pointer;padding:10px 20px;' +
            'border-radius:8px;border:1px solid transparent;transition:background .15s ease;' +
            'white-space:nowrap}' +
            '#cc-consent-banner__decline{background:#fff;color:#111827;border-color:#d1d5db}' +
            '#cc-consent-banner__decline:hover{background:#f9fafb}' +
            '#cc-consent-banner__accept{background:#111827;color:#fff}' +
            '#cc-consent-banner__accept:hover{background:#1f2937}' +
            '@media(prefers-color-scheme:dark){' +
            '#cc-consent-banner{background:#0b0d10;color:#f3f4f6;' +
            'border-top-color:rgba(255,255,255,0.08)}' +
            '#cc-consent-banner__decline{background:transparent;color:#f3f4f6;' +
            'border-color:rgba(255,255,255,0.18)}' +
            '#cc-consent-banner__decline:hover{background:rgba(255,255,255,0.06)}' +
            '#cc-consent-banner__accept{background:#f3f4f6;color:#0b0d10}' +
            '#cc-consent-banner__accept:hover{background:#e5e7eb}}' +
            'html[data-cc-consent] #hs-banner-parent,' +
            'html[data-cc-consent] [data-hs-banner-host],' +
            'html[data-cc-consent] .hs-banner-wrapper,' +
            'html[data-cc-consent] #hs-eu-cookie-confirmation{display:none!important}';
        (document.head || document.documentElement).appendChild(style);
    }

    function renderBanner() {
        if (document.getElementById('cc-consent-banner')) return;
        if (!document.body) return;

        injectStyles();

        var banner = document.createElement('div');
        banner.id = 'cc-consent-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-live', 'polite');
        banner.setAttribute('aria-label', 'Cookie consent');

        var copy = document.createElement('div');
        copy.id = 'cc-consent-banner__copy';
        var p1 = document.createElement('p');
        p1.appendChild(document.createTextNode(
            'This website stores cookies on your computer. These cookies are used to collect ' +
            'information about how you interact with our website and allow us to remember you. ' +
            'We use this information to improve and customize your browsing experience and for ' +
            'analytics and metrics about our visitors both on this website and other media. ' +
            'To find out more about the cookies we use, see our '
        ));
        var link = document.createElement('a');
        link.href = PRIVACY_URL;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'Privacy Policy';
        p1.appendChild(link);
        p1.appendChild(document.createTextNode('.'));
        var p2 = document.createElement('p');
        p2.textContent =
            'If you decline, your information won’t be tracked when you visit this website. ' +
            'A single cookie will be used in your browser to remember your preference not to be tracked.';
        copy.appendChild(p1);
        copy.appendChild(p2);

        var actions = document.createElement('div');
        actions.id = 'cc-consent-banner__actions';
        var decline = document.createElement('button');
        decline.id = 'cc-consent-banner__decline';
        decline.type = 'button';
        decline.textContent = 'Decline All';
        var accept = document.createElement('button');
        accept.id = 'cc-consent-banner__accept';
        accept.type = 'button';
        accept.textContent = 'Accept All';
        actions.appendChild(decline);
        actions.appendChild(accept);

        banner.appendChild(copy);
        banner.appendChild(actions);
        document.body.appendChild(banner);

        accept.addEventListener('click', function () {
            applyConsent(true);
            loadGTM();
            banner.remove();
        });
        decline.addEventListener('click', function () {
            applyConsent(false);
            banner.remove();
        });
    }

    // 2) Apply saved choice, or show banner.
    var saved = null;
    try { saved = window.localStorage.getItem(STORAGE_KEY); } catch (_) {}

    if (saved === 'granted') {
        applyConsent(true);
        loadGTM();
    } else if (saved === 'denied') {
        applyConsent(false);
    } else if (document.body) {
        renderBanner();
    } else {
        document.addEventListener('DOMContentLoaded', renderBanner);
    }
})();
