#!/usr/bin/env python3
"""
Deterministic structural review for a Mintlify docs PR.

Runs three high-signal, near-zero-false-positive checks:
  2) REDIRECT COVERAGE   - removed/renamed URLs with no redirect (404s) + redirects
                           whose destination this PR deletes (chained 404s)
  3) NAVIGATION INTEGRITY - docs.json pages refs that don't resolve (build break) + orphans
  4) IN-CONTENT LINK ROT  - internal links inside changed pages that don't resolve

Steps 1 (scope), 5 (content integrity) and 6 (structural coherence) are judgment-based and
are performed by the agent reading the SKILL instructions; this script handles the mechanical
parts so they're consistent and fast.

Requires: gh (authenticated), python3, and a local checkout of the PR HEAD branch.

Usage:
  python3 analyze_docs_pr.py --pr 393 --clone /tmp/pr_clone [--repo cometchat/docs]
                             [--scope ui-kit/react/] [--config docs.json]

--scope limits link-rot + orphan scanning to a path prefix (recommended: the PR's product area).
--config is the Mintlify config filename at repo root (default docs.json; some repos use mint.json).
"""
import argparse, json, os, re, subprocess, sys, glob


def sh(args):
    return subprocess.run(args, capture_output=True, text=True, check=True).stdout


def gh_json(path):
    return json.loads(sh(["gh", "api", path]))


def norm(p):
    p = p.split("#")[0]
    return p if p.startswith("/") else "/" + p


def to_url(p):
    """Normalize a nav/page ref to a leading-slash, no-anchor URL (matches `valid` entries)."""
    return norm(p)


def url_of(path):
    if path.endswith(".mdx"):
        return "/" + path[:-4]
    if path.endswith(".md"):
        return "/" + path[:-3]
    return "/" + path


def covered(url, exact_sources, wildcard_prefixes):
    if url in exact_sources:
        return True
    return any(url == pre.rstrip("/") or url.startswith(pre) for pre in wildcard_prefixes)


def collect_nav_pages(nav):
    """Strict Mintlify parse: only strings inside `pages` arrays (recurse through groups)."""
    out = []

    def pages(arr):
        for it in arr:
            if isinstance(it, str):
                out.append(it)
            elif isinstance(it, dict) and "pages" in it:
                pages(it["pages"])

    def walk(o):
        if isinstance(o, dict):
            for k, v in o.items():
                if k == "pages" and isinstance(v, list):
                    pages(v)
                else:
                    walk(v)
        elif isinstance(o, list):
            for x in o:
                walk(x)

    walk(nav)
    return out


LINK_PATTS = [re.compile(r"\]\((/[^)\s#]+)(?:#[^)]*)?\)"),
              re.compile(r'href=["\'](/[^"\'#]+)(?:#[^"\']*)?["\']')]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pr", required=True)
    ap.add_argument("--repo", default="cometchat/docs")
    ap.add_argument("--clone", required=True, help="path to a checkout of the PR HEAD branch")
    ap.add_argument("--scope", default="", help="path prefix to limit link/orphan scan, e.g. ui-kit/react/")
    ap.add_argument("--config", default="docs.json")
    args = ap.parse_args()

    clone = args.clone.rstrip("/")
    cfg_path = os.path.join(clone, args.config)
    if not os.path.exists(cfg_path):
        sys.exit(f"ERROR: {cfg_path} not found. Did you clone the PR HEAD branch?")
    head_cfg = json.load(open(cfg_path))

    pr = gh_json(f"repos/{args.repo}/pulls/{args.pr}")
    base_ref = pr["base"]["ref"]

    # PR file statuses (paged)
    files = []
    page = 1
    while True:
        batch = gh_json(f"repos/{args.repo}/pulls/{args.pr}/files?per_page=100&page={page}")
        if not batch:
            break
        files.extend(batch)
        page += 1
        if len(batch) < 100:
            break

    removed = [f["filename"] for f in files if f["status"] == "removed"]
    renamed = [(f.get("previous_filename"), f["filename"]) for f in files if f["status"] == "renamed"]
    old_urls = [url_of(p) for p in removed] + [url_of(o) for o, _ in renamed if o]
    removed_urls = set(url_of(p) for p in removed)

    # Valid pages from the clone filesystem (repo-wide)
    valid = set()
    for ext in ("mdx", "md"):
        for f in glob.glob(os.path.join(clone, f"**/*.{ext}"), recursive=True):
            rel = os.path.relpath(f, clone)
            valid.add("/" + rel[: -(len(ext) + 1)])

    redirects = head_cfg.get("redirects", [])
    exact_src = set()
    wild_pre = []
    for r in redirects:
        s = norm(r["source"])
        if ":slug*" in s or s.endswith("*"):
            wild_pre.append(s.split(":slug*")[0].rstrip("*"))
        else:
            exact_src.add(s)

    # base config redirect count for delta
    try:
        base_cfg = json.loads(sh(["gh", "api",
                                  f"repos/{args.repo}/contents/{args.config}?ref={base_ref}",
                                  "--jq", ".content"]).encode().decode())
    except Exception:
        base_cfg = None
    base_redirect_n = None
    if base_cfg is None:
        import base64
        raw = gh_json(f"repos/{args.repo}/contents/{args.config}?ref={base_ref}")["content"]
        base_redirect_n = len(json.loads(base64.b64decode(raw)).get("redirects", []))

    print("=" * 78)
    print(f"DOCS PR STRUCTURAL ANALYSIS — {args.repo} #{args.pr}  (base: {base_ref})")
    print(f"changed files: {len(files)}  | removed: {len(removed)}  renamed: {len(renamed)}")
    if base_redirect_n is not None:
        print(f"redirects: base={base_redirect_n}  head={len(redirects)}  "
              f"(delta {len(redirects) - base_redirect_n:+d})")
    print("=" * 78)

    # --- 2) REDIRECT COVERAGE ---
    no_redirect = [u for u in sorted(set(old_urls)) if not covered(u, exact_src, wild_pre)]
    print(f"\n[2a] REMOVED/RENAMED URLs with NO redirect (404s): "
          f"{len(no_redirect)} of {len(set(old_urls))}")
    for u in no_redirect:
        print("   404 ", u)

    chained = []
    for r in redirects:
        d = norm(r["destination"])
        if r["destination"].startswith("http") or "*" in d:
            continue
        if d in removed_urls:
            chained.append((r["source"], r["destination"]))
    print(f"\n[2b] Existing redirects whose destination THIS PR deletes (chained 404s): {len(chained)}")
    for s, d in chained:
        print(f"   {s}  ->  {d}")

    # --- 3) NAVIGATION INTEGRITY ---
    nav_pages = collect_nav_pages(head_cfg.get("navigation", {}))
    internal = [p for p in nav_pages if not (p.startswith("http") or p.startswith("#"))]
    missing = sorted(set(p for p in internal if to_url(p) not in valid))
    print(f"\n[3a] Navigation refs that DON'T resolve (BUILD BREAK): {len(missing)}")
    for m in missing:
        print("   MISSING ", m)

    ref = set(to_url(p) for p in nav_pages)
    legacy = re.compile(r"/v\d+/")
    scope_url = "/" + args.scope.lstrip("/") if args.scope else ""
    scoped = [f for f in valid
              if (not scope_url or f.startswith(scope_url)) and not legacy.search(f)]
    orphans = sorted(f for f in scoped if f not in ref)
    print(f"\n[3b] In-scope current-version files NOT in navigation (orphans): {len(orphans)}")
    for o in orphans:
        print("   ORPHAN  ", o)

    # --- 4) IN-CONTENT LINK ROT ---
    scan_glob = os.path.join(clone, args.scope, "**/*.mdx") if args.scope \
        else os.path.join(clone, "**/*.mdx")
    broken = {}
    nfiles = 0
    for f in glob.glob(scan_glob, recursive=True):
        rel = os.path.relpath(f, clone)
        if legacy.search("/" + rel):
            continue
        nfiles += 1
        txt = open(f, encoding="utf-8", errors="ignore").read()
        links = set()
        for pat in LINK_PATTS:
            links.update(pat.findall(txt))
        for ln in links:
            if args.scope and not ln.startswith("/" + args.scope.rstrip("/")):
                continue
            if not args.scope and not ln.startswith("/"):
                continue
            if ln in valid:
                continue
            # only flag links whose prefix area we can validate (avoid external-ish noise)
            if ln.lstrip("/").split("/")[0] in {p.split("/")[0] for p in (s.lstrip("/") for s in valid)}:
                broken.setdefault(ln, []).append(rel)
    print(f"\n[4] Broken internal links in {nfiles} scanned files: "
          f"{len(broken)} targets / {sum(len(v) for v in broken.values())} occurrences")
    for tgt in sorted(broken, key=lambda t: -len(broken[t])):
        print(f"   {len(broken[tgt]):2d}x  {tgt}")
        for s in sorted(set(broken[tgt]))[:4]:
            print(f"         <- {s}")

    print("\n" + "=" * 78)
    print("Deterministic checks done. Now do steps 1/5/6 by reading the content "
          "(scope, content integrity, structural coherence).")
    print("=" * 78)


if __name__ == "__main__":
    main()
