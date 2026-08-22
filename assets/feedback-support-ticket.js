/* ------------------------------------------------------------------ */
/* Support-ticket option in the page feedback toolbar                 */
/*                                                                    */
/* Adds a third option — "Create a support ticket" — next to          */
/* Mintlify's built-in "Suggest edits" and "Raise issue" buttons.     */
/*                                                                    */
/* Both built-in buttons are hard-wired to the GitHub repo and are    */
/* not configurable (docs.json has no feedback settings; the toggles  */
/* live in the Mintlify dashboard), so readers without a GitHub       */
/* account have no way to report a docs problem. This adds that path  */
/* client-side. Mintlify loads every .js file in the content          */
/* directory on every page:                                           */
/* https://www.mintlify.com/docs/customize/custom-scripts             */
/* ------------------------------------------------------------------ */
(function initFeedbackSupportLink() {
    try {
        if (window.__ccFeedbackSupportLinkInitialized__) return;
        window.__ccFeedbackSupportLinkInitialized__ = true;
    } catch (_) {}

    const SUPPORT_URL = 'https://help.cometchat.com/hc/en-us/requests/new';
    const LINK_ID = 'feedback-support-ticket';
    const LABEL = 'Create a support ticket';

    // Matches the 18x18 outline icons Mintlify uses for the sibling buttons.
    const ICON = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"',
        ' fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"',
        ' stroke-linejoin="round" aria-hidden="true" class="size-3.5 block shrink-0 text-current">',
        '<path d="M9 16.25A7.25 7.25 0 1 0 9 1.75a7.25 7.25 0 0 0 0 14.5Z"></path>',
        '<path d="M7.25 6.9a1.75 1.75 0 1 1 2.55 1.556c-.49.253-.8.75-.8 1.3v.394"></path>',
        '<path d="M9 13.5a.85.85 0 1 0 0-1.7.85.85 0 0 0 0 1.7Z" fill="currentColor" stroke="none"></path>',
        '</svg>'
    ].join('');

    function buildLink(styleSource) {
        const link = document.createElement('a');
        link.id = LINK_ID;
        // Inherit the sibling's classes so the button keeps matching the
        // theme (including dark mode) even if Mintlify restyles the toolbar.
        if (styleSource) {
            link.className = styleSource.className;
        }
        link.href = SUPPORT_URL;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.innerHTML = ICON + '<small class="text-sm leading-4">' + LABEL + '</small>';
        return link;
    }

    function inject() {
        const toolbar = document.querySelector('.feedback-toolbar');
        if (!toolbar || toolbar.querySelector('#' + LINK_ID)) return;

        const githubLinks = toolbar.querySelectorAll('a[href*="github.com"]');
        const lastGithubLink = githubLinks[githubLinks.length - 1];

        if (lastGithubLink && lastGithubLink.parentElement) {
            lastGithubLink.parentElement.appendChild(buildLink(lastGithubLink));
            return;
        }

        // Fallback: "Suggest edits" and "Raise issue" are switched off in the
        // Mintlify dashboard, so there is no link row to append to. Build one
        // alongside the thumbs buttons.
        const thumbsDown = toolbar.querySelector('#feedback-thumbs-down');
        if (!thumbsDown || !thumbsDown.parentElement || !thumbsDown.parentElement.parentElement) return;

        const row = document.createElement('div');
        row.className = 'flex gap-3';
        row.appendChild(buildLink(thumbsDown));
        thumbsDown.parentElement.parentElement.appendChild(row);
    }

    let pending = false;
    function schedule() {
        if (pending) return;
        pending = true;
        setTimeout(function () {
            pending = false;
            try { inject(); } catch (_) {}
        }, 100);
    }

    schedule();

    // The docs are a single-page app: the toolbar is re-rendered on every
    // client-side navigation, so re-inject whenever the DOM changes.
    if (document.body) {
        new MutationObserver(schedule).observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();
