/* ------------------------------------------------------------------ */
/* Version dropdown aligner — DISABLED (2026-09-09)                    */
/* ------------------------------------------------------------------ */
/*
 * WHY THIS IS DISABLED
 *
 * This script relocated Mintlify's version dropdown (a React/Radix-managed
 * node) out of the navbar and into the sidebar via native insertBefore, on
 * desktop only (it bailed early below 1024px). Moving a node that React owns
 * to a different parent breaks React's reconciler: on the next render (e.g.
 * opening the Radix menu) React fails with
 *
 *     NotFoundError: Failed to execute 'insertBefore' on 'Node':
 *     The node before which the new node is to be inserted is not a child of this node.
 *
 * …which Mintlify's error boundary renders as the full-page "Error loading
 * page" crash. This is exactly the desktop-only version-selector crash
 * reported for months (works on mobile because this script never relocates
 * the node below 1024px). Confirmed by A/B test: with this script disabled,
 * the native navbar version dropdown opens and switches versions with zero
 * crashes; with it enabled, clicking the relocated trigger crashes every time.
 *
 * INTERIM FIX: leave the native dropdown in its default navbar position (no
 * DOM relocation). Cosmetic-only change — the version selector renders in the
 * navbar instead of aligned into the sidebar, and it works.
 *
 * TO RESTORE SIDEBAR PLACEMENT SAFELY: do not move React's node. Instead
 * inject an independent (non-React) switcher element into the sidebar that
 * links directly to each version URL, and hide the native trigger via CSS.
 *
 * The previous implementation is preserved in git history.
 */
(function () { /* intentionally a no-op */ })();
