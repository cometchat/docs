#!/usr/bin/env python3
"""Cross-platform docs parity comparator.

Compares the pages changed in a PR (or your working tree) against the SAME feature's pages
as merged on origin/main, across every other platform.

Two content sources only: the working tree / PR checkout, and `git show origin/main:<path>`.
Never reads an unmerged branch or another PR.

Targets Python 3.9 (system python3 on macOS). Stdlib only.
"""

import argparse
import os
import re
import subprocess
import sys
from collections import OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))
BASELINE = os.path.join(HERE, "parity-baseline.yml")

# ---------------------------------------------------------------- baseline reader

def load_baseline(path):
    """Restricted reader for the fixed, shallow shape of parity-baseline.yml.

    Avoids a PyYAML dependency so the script runs with zero setup. Handles exactly:
    two-space-indented nested maps, `key: value`, quoted or bare scalars, comments.
    """
    features = OrderedDict()
    feature = section = None
    with open(path, "r") as fh:
        for raw in fh:
            line = raw.rstrip("\n")
            if not line.strip() or line.lstrip().startswith("#"):
                continue
            indent = len(line) - len(line.lstrip())
            text = line.strip()
            if indent == 0:
                if text == "features:":
                    continue
                feature = section = None
            elif indent == 2 and text.endswith(":"):
                feature = text[:-1].strip()
                features[feature] = {"pages": {}, "sections": {}, "accepted-gaps": {}}
                section = None
            elif indent == 4 and text.endswith(":"):
                section = text[:-1].strip()
            elif indent == 6 and feature and section and ":" in text:
                key, _, val = text.partition(":")
                val = val.strip().strip('"').strip("'")
                features[feature].setdefault(section, {})[key.strip()] = val
    return features


# ---------------------------------------------------------------- content loading

def git_show(ref_path):
    try:
        out = subprocess.run(["git", "show", ref_path], stdout=subprocess.PIPE,
                             stderr=subprocess.DEVNULL, check=False)
        return out.stdout.decode("utf-8", "replace") if out.returncode == 0 else None
    except OSError:
        return None


def read_local(path):
    if not os.path.exists(path):
        return None
    with open(path, "r", errors="replace") as fh:
        return fh.read()


def changed_files(pr):
    """Files changed by the PR, or the working tree's modified files."""
    if pr:
        base = subprocess.run(["git", "merge-base", "origin/main", "HEAD"],
                              stdout=subprocess.PIPE, check=False).stdout.decode().strip()
        rng = base + "...HEAD" if base else "origin/main...HEAD"
        cmd = ["git", "diff", "--name-only", rng]
    else:
        cmd = ["git", "status", "--porcelain"]
    out = subprocess.run(cmd, stdout=subprocess.PIPE, check=False).stdout.decode()
    files = []
    for line in out.splitlines():
        files.append(line[3:].strip() if not pr else line.strip())
    return [f for f in files if f]


# ---------------------------------------------------------------- MDX extraction

FENCE = re.compile(r"^```")
CODE_SPAN = re.compile(r"`([A-Za-z_][A-Za-z0-9_]{2,})`")
IDENTIFIER = re.compile(r"^[a-z][A-Za-z0-9]*$")
HEADING = re.compile(r"^(#{2,4})\s+(.*)$")
IMG_SRC = re.compile(r'src=["\']([^"\']+)["\']')
VERSION = re.compile(r"\b(\d+\.\d+\.\d+(?:-[A-Za-z0-9.]+)?)\b")

# Language literals and keywords. Never a documented API.
LITERALS = frozenset("""
true false nil null none undefined var let this self return void int bool string
""".split())

# Visual-style surface. These differ between platforms by design — iOS names a colour
# one way, React another — so comparing them produces noise, not findings. The API axis
# is for behavioural surface: props that gate features, callbacks, methods, events.
STYLE_SUFFIX = ("Color", "Font", "Style", "Tint", "Background", "Radius",
                "Padding", "Margin", "Spacing", "Width", "Height", "Size")


def is_api_symbol(tok):
    """Behavioural API surface only — excludes literals and visual-style properties."""
    if tok in LITERALS or not IDENTIFIER.match(tok):
        return False
    return not tok.endswith(STYLE_SUFFIX)


SYMBOL_CAP = 8


def fmt_symbols(syms, lines):
    """Render a symbol list, naming the overflow count rather than silently truncating.

    Truncating alphabetically hides findings: a symbol late in the alphabet would vanish
    with no indication anything was dropped. Always say how many more there are.
    """
    shown = syms[:SYMBOL_CAP]
    parts = []
    for s in shown:
        if lines and s in lines:
            parts.append("`%s` (L%d)" % (s, lines[s]))
        else:
            parts.append("`%s`" % s)
    out = ", ".join(parts)
    extra = len(syms) - len(shown)
    if extra:
        out += " and %d more" % extra
    return out


def strip_frontmatter(text):
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            return text[end + 4:]
    return text


def parse(text):
    """Extract the comparable surface of one MDX page."""
    text = strip_frontmatter(text)
    lines = text.split("\n")
    headings, symbols, images, versions = [], OrderedDict(), [], set()
    in_fence = False
    for i, line in enumerate(lines, 1):
        if FENCE.match(line.strip()):
            in_fence = not in_fence
            continue
        m = HEADING.match(line)
        if m and not in_fence:
            headings.append(m.group(2).strip())
        for src in IMG_SRC.findall(line):
            if not src.startswith("http"):
                images.append(src)
        if not in_fence:
            for tok in CODE_SPAN.findall(line):
                if is_api_symbol(tok) and tok not in symbols:
                    symbols[tok] = i
            for v in VERSION.findall(line):
                versions.add(v)
    return {"headings": headings, "symbols": symbols,
            "images": images, "versions": versions}


def section_of(text, anchor):
    """Slice the part of a page under the heading matching `anchor`."""
    want = anchor.replace("-", " ").lower()
    lines = strip_frontmatter(text).split("\n")
    start = None
    for i, line in enumerate(lines):
        m = HEADING.match(line)
        if m and m.group(2).strip().lower().startswith(want):
            start, level = i, len(m.group(1))
            break
    if start is None:
        return None
    for j in range(start + 1, len(lines)):
        m = HEADING.match(lines[j])
        if m and len(m.group(1)) <= level:
            return "\n".join(lines[start:j])
    return "\n".join(lines[start:])


# ---------------------------------------------------------------- comparison

def load_platform(feature, platform, spec, use_main, repo_root):
    """Return parsed content for one platform, or None if it has no page."""
    path = spec.get("pages", {}).get(platform)
    anchor = None
    if not path:
        sec = spec.get("sections", {}).get(platform)
        if not sec:
            return None
        path, _, anchor = sec.partition("#")
    text = git_show("origin/main:" + path) if use_main \
        else read_local(os.path.join(repo_root, path))
    if text is None:
        return None
    if anchor:
        text = section_of(text, anchor)
        if text is None:
            return None
    return {"path": path, "parsed": parse(text)}


def compare_feature(name, spec, changed_platforms, repo_root):
    """Compare each changed platform against every sibling as merged on main."""
    declared = set(spec.get("pages", {})) | set(spec.get("sections", {}))
    loaded = {}
    for p in declared:
        use_main = p not in changed_platforms
        got = load_platform(name, p, spec, use_main, repo_root)
        if got:
            loaded[p] = got

    findings = []
    for me in sorted(changed_platforms):
        if me not in loaded:
            continue
        siblings = {p: d for p, d in loaded.items() if p != me}
        if not siblings:
            return [], True  # nothing merged to compare against -> skip
        mine = loaded[me]["parsed"]

        # 1. API surface
        sib_syms = {}
        for p, d in siblings.items():
            for s in d["parsed"]["symbols"]:
                sib_syms.setdefault(s, []).append(p)
        only_here = sorted(s for s in mine["symbols"] if s not in sib_syms)
        if only_here:
            findings.append(("API", me,
                "%s documented here, on no other platform. Verify each exists in source."
                % fmt_symbols(only_here, mine["symbols"])))
        everywhere = sorted(s for s, ps in sib_syms.items()
                            if len(ps) == len(siblings) and s not in mine["symbols"])
        if everywhere:
            findings.append(("API", me,
                "%s documented on every other platform but not here."
                % fmt_symbols(everywhere, None)))

        # 3. Version claims
        sib_v = set()
        for d in siblings.values():
            sib_v |= d["parsed"]["versions"]
        novel = mine["versions"] - sib_v
        if novel and sib_v:
            findings.append(("Version", me,
                "cites %s; no sibling mentions it (siblings: %s)."
                % (", ".join(sorted(novel)), ", ".join(sorted(sib_v)) or "none")))

        # 4. Structure
        counts = {}
        for d in siblings.values():
            for h in set(d["parsed"]["headings"]):
                counts[h] = counts.get(h, 0) + 1
        majority = len(siblings) / 2.0
        mine_h = set(mine["headings"])
        missing = sorted(h for h, c in counts.items() if c > majority and h not in mine_h)
        if missing:
            findings.append(("Structure", me,
                "sections %s present on most platforms, absent here."
                % ", ".join("`%s`" % h for h in missing[:5])))

        # 5. Images
        if mine["images"]:
            bare = [p for p, d in siblings.items() if not d["parsed"]["images"]]
            if bare:
                findings.append(("Images", me,
                    "has screenshots (%s); %s have none."
                    % (", ".join(os.path.basename(i) for i in mine["images"][:3]),
                       ", ".join(sorted(bare)))))
        else:
            withimg = [p for p, d in siblings.items() if d["parsed"]["images"]]
            if withimg:
                findings.append(("Images", me,
                    "no screenshots here; %s have them." % ", ".join(sorted(withimg))))

        # Image path shared across platforms -> one screenshot, two platforms' chrome
        for img in mine["images"]:
            shared = [p for p, d in siblings.items() if img in d["parsed"]["images"]]
            if shared:
                findings.append(("Images", me,
                    "`%s` is referenced by %s too — one file, two platforms' chrome."
                    % (img, ", ".join(sorted(shared)))))
    return findings, False


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--pr", help="PR number (compares the PR's commits); "
                                 "omit to compare uncommitted working-tree edits")
    ap.add_argument("--sha", default="", help="head sha, for the comment marker")
    ap.add_argument("--markdown", action="store_true", help="emit the PR comment body")
    args = ap.parse_args()

    root = subprocess.run(["git", "rev-parse", "--show-toplevel"],
                          stdout=subprocess.PIPE, check=False).stdout.decode().strip()
    if not root:
        sys.stderr.write("not a git repo\n")
        return 0

    baseline = load_baseline(BASELINE)
    changed = changed_files(args.pr)

    # Map changed files -> {feature: {platforms}}
    affected = OrderedDict()
    for fname, spec in baseline.items():
        paths = dict(spec.get("pages", {}))
        for p, sec in spec.get("sections", {}).items():
            paths[p] = sec.split("#")[0]
        for platform, path in paths.items():
            if path in changed:
                affected.setdefault(fname, set()).add(platform)

    if not affected:
        print("No tracked feature pages changed. Nothing to compare.")
        return 0

    blocks, skipped = [], []
    for fname, platforms in affected.items():
        findings, skip = compare_feature(fname, baseline[fname], platforms, root)
        if skip:
            skipped.append(fname)
        elif findings:
            blocks.append((fname, platforms, findings))

    gaps = set()
    for fname in affected:
        gaps |= set(baseline[fname].get("accepted-gaps", {}))

    total = sum(len(f) for _, _, f in blocks)

    if args.markdown:
        print("<!-- docs-parity: report sha=%s -->" % args.sha)
        print("### Docs Parity — %d observation%s · advisory, not blocking\n"
              % (total, "" if total == 1 else "s"))
        print("Compared against sibling docs **merged on `main`**. Concurrent PRs on other "
              "platforms are not read; if another platform is mid-change, a finding here may "
              "already be resolved there.\n")
        for fname, platforms, findings in blocks:
            print("**%s** — %s changed" % (fname, ", ".join(sorted(platforms))))
            print("| Axis | Observation |")
            print("|---|---|")
            for axis, who, msg in findings:
                print("| %s | %s |" % (axis, msg))
            print("")
        for fname in skipped:
            print("**%s** — no sibling docs merged on `main`; skipped. This PR is the first "
                  "to document it, so later platforms will copy this structure.\n" % fname)
        if gaps:
            print("_Known gaps not reported: %s (see `parity-baseline.yml`)._"
                  % ", ".join(sorted(gaps)))
    else:
        if not blocks and not skipped:
            print("No parity observations.")
        for fname, platforms, findings in blocks:
            print("\n%s  (%s changed)" % (fname, ", ".join(sorted(platforms))))
            for axis, who, msg in findings:
                print("  [%-9s] %s" % (axis, msg))
        for fname in skipped:
            print("\n%s  skipped — no sibling docs merged on main (first to document)" % fname)
        if gaps:
            print("\nKnown gaps not reported: %s" % ", ".join(sorted(gaps)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
