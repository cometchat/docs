#!/usr/bin/env node
/**
 * check-mcp-bundles.mjs: keeps the Docs MCP implementation bundles (mcp-bundles/*.md) current.
 *
 *   node .github/scripts/check-mcp-bundles.mjs            # all checks (needs the network)
 *   node .github/scripts/check-mcp-bundles.mjs --offline  # format, removed APIs, age only
 *
 * The Docs MCP server (mcp.cometchat.com) serves these files to AI coding agents from its
 * search index, which follows this repo's main branch. They went stale once: pinned to old
 * kit majors and using removed components, for months, because nothing checked them. A
 * bundle fails here when:
 *   - its frontmatter is incomplete (title, framework, prerequisites, last_verified, packages)
 *   - a package it declares is behind the latest release in the same major
 *   - a version written in the body for a declared package differs from the declared one,
 *     or the body pins a CometChat package it does not declare
 *   - its code uses an API listed in mcp-bundles/removed-apis.json
 *   - last_verified is older than MAX_AGE_DAYS (re-verify on the latest kit, then bump it)
 *   - a cometchat.com/docs link in it does not resolve
 * A newer MAJOR is a warning: moving a bundle to a new major is a rewrite, done on purpose.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = join(ROOT, "mcp-bundles");
const OFFLINE = process.argv.includes("--offline");
const MAX_AGE_DAYS = 90;
const MAX_BYTES = 60 * 1024; // the server skips a bundle bigger than this
const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REGISTRIES = new Set(["npm", "pub", "maven", "github"]);

const problems = [];
const warnings = [];
const fail = (file, msg) => problems.push(`${file}: ${msg}`);

// ── frontmatter ───────────────────────────────────────────────────────────────
// A deliberately small YAML reader for the one shape bundles use: scalars, lists of
// strings, and lists of flat maps. Anything else is an error, so a typo cannot pass.
function unquote(v) {
  const t = v.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1);
  return t;
}
function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error("no YAML frontmatter (--- … ---) at the top");
  const data = {};
  let key = null;
  let item = null;
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    let r;
    if ((r = line.match(/^([a-z_]+):\s*(.*)$/))) {
      key = r[1];
      item = null;
      const v = r[2].replace(/\s+#.*$/, "");
      data[key] = v === "" ? [] : v.trim() === "[]" ? [] : unquote(v);
    } else if ((r = line.match(/^ {2}- ([a-z_]+):\s*(.+)$/)) && Array.isArray(data[key])) {
      item = { [r[1]]: unquote(r[2].replace(/\s+#.*$/, "")) };
      data[key].push(item);
    } else if ((r = line.match(/^ {2}- (.+)$/)) && Array.isArray(data[key])) {
      item = null;
      data[key].push(unquote(r[1]));
    } else if ((r = line.match(/^ {4}([a-z_]+):\s*(.+)$/)) && item) {
      item[r[1]] = unquote(r[2].replace(/\s+#.*$/, ""));
    } else {
      throw new Error(`frontmatter line not understood: ${JSON.stringify(line)}`);
    }
  }
  return { data, body: m[2] };
}

// ── registries ────────────────────────────────────────────────────────────────
const semver = (v) => String(v).replace(/^v/, "").split(/[.-]/).slice(0, 3).map((n) => parseInt(n, 10) || 0);
const cmp = (a, b) => {
  const x = semver(a), y = semver(b);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
};
const stable = (v) => /^v?\d+\.\d+\.\d+$/.test(v);

async function get(url, json = true) {
  const headers = { "user-agent": "cometchat-docs-mcp-bundles-check" };
  if (json) headers.accept = "application/json";
  if (url.startsWith("https://api.github.com/") && process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return json ? res.json() : res.text();
}
const cache = new Map();
function published({ registry, name }) {
  const key = `${registry}:${name}`;
  if (!cache.has(key)) cache.set(key, (async () => {
    if (registry === "npm") return Object.keys((await get(`https://registry.npmjs.org/${name}`)).versions);
    if (registry === "pub") return (await get(`https://pub.dev/api/packages/${name}`)).versions.map((v) => v.version);
    if (registry === "maven") {
      const [g, a] = name.split(":");
      const xml = await get(`https://dl.cloudsmith.io/public/cometchat/cometchat/maven/${g.replace(/\./g, "/")}/${a}/maven-metadata.xml`, false);
      return [...xml.matchAll(/<version>([^<]+)<\/version>/g)].map((m) => m[1]);
    }
    return (await get(`https://api.github.com/repos/${name}/tags?per_page=100`)).map((t) => t.name);
  })());
  return cache.get(key);
}

// ── body checks ───────────────────────────────────────────────────────────────
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Every version written right after a package's name: `pkg@1.2.3`, `pkg: ^1.2.3`,
// `group:artifact:1.2.3`, `.package(url: ".../repo", from: "1.2.3")`.
function versionsInBody(body, pkg) {
  const id = pkg.registry === "maven" ? pkg.name : pkg.registry === "github" ? `github.com/${pkg.name}` : pkg.name;
  const re = new RegExp(`${esc(id)}(?![\\w-])(?:\\.git)?["']?(?:@|:\\s*["']?[\\^~]?|,\\s*(?:from|exact):\\s*["'])(\\d+\\.\\d+\\.\\d+)`, "g");
  return [...body.matchAll(re)].map((m) => m[1]);
}
// CometChat packages pinned in the body: they must be declared so their versions are checked.
const PINNED = [
  /(@cometchat\/[a-z0-9-]+)@\d+\.\d+\.\d+/g,
  /^\s*(cometchat_[a-z_]+):\s*["']?[\^~]?\d+\.\d+\.\d+/gm,
  /(com\.cometchat:[a-z0-9-]+):\d+\.\d+\.\d+/g,
];

async function checkLink(file, url) {
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(20000), headers: { "user-agent": "cometchat-docs-mcp-bundles-check" } });
    if (!res.ok) return fail(file, `link ${url} → HTTP ${res.status}`);
    // The docs site answers a missing page by redirecting to its home page.
    const home = (u) => u.split("#")[0].replace(/\/+$/, "") === "https://www.cometchat.com/docs";
    if (home(res.url) && !home(url)) fail(file, `link ${url} → page not found (redirects to the docs home page)`);
  } catch (e) {
    fail(file, `link ${url} → ${e.message}`);
  }
}

// ── main ──────────────────────────────────────────────────────────────────────
const removed = JSON.parse(readFileSync(join(DIR, "removed-apis.json"), "utf8")).removed;
const files = readdirSync(DIR).filter((f) => f.endsWith(".md") && f !== "README.md").sort();
if (files.length === 0) fail("mcp-bundles/", "no bundles found");
const today = Date.now();
const jobs = [];

for (const file of files) {
  const name = file.replace(/\.md$/, "");
  const raw = readFileSync(join(DIR, file), "utf8");
  if (!NAME_RE.test(name)) fail(file, "file name must be lowercase kebab-case");
  if (Buffer.byteLength(raw) > MAX_BYTES) fail(file, `bigger than ${MAX_BYTES} bytes; the server would skip it`);
  let fm, body;
  try {
    ({ data: fm, body } = parseFrontmatter(raw));
  } catch (e) {
    fail(file, e.message);
    continue;
  }
  for (const k of ["title", "framework", "last_verified"]) if (typeof fm[k] !== "string" || !fm[k]) fail(file, `frontmatter '${k}' missing`);
  if (!Array.isArray(fm.prerequisites) || fm.prerequisites.some((p) => typeof p !== "string")) fail(file, "frontmatter 'prerequisites' must be a list of strings");
  if (!Array.isArray(fm.packages)) fail(file, "frontmatter 'packages' missing (use `packages: []` when the bundle installs nothing versioned)");
  const packages = Array.isArray(fm.packages) ? fm.packages : [];

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.last_verified || "") || Number.isNaN(Date.parse(fm.last_verified))) {
    fail(file, "last_verified must be a YYYY-MM-DD date");
  } else {
    const age = Math.floor((today - Date.parse(fm.last_verified)) / 86400000);
    if (age > MAX_AGE_DAYS) fail(file, `last_verified ${fm.last_verified} is ${age} days old (limit ${MAX_AGE_DAYS}): re-check it on the latest kit, then update the date`);
    if (age < -1) fail(file, `last_verified ${fm.last_verified} is in the future`);
  }

  // Code only: a pitfall may name a removed API to warn against it.
  const code = [...body.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((m) => m[1]).join("\n");
  for (const r of removed) {
    if (r.frameworks && !r.frameworks.includes(fm.framework)) continue;
    if (new RegExp(r.pattern).test(code)) fail(file, `code uses ${r.pattern.replace(/\\/g, "")}: ${r.reason}`);
  }

  const declared = new Set();
  for (const p of packages) {
    if (typeof p !== "object" || !REGISTRIES.has(p.registry) || !p.name || !/^\d+\.\d+\.\d+$/.test(p.version || "")) {
      fail(file, `package entry needs registry (${[...REGISTRIES].join("|")}), name and an x.y.z version: ${JSON.stringify(p)}`);
      continue;
    }
    declared.add(p.name);
    for (const v of versionsInBody(body, p)) {
      if (v !== p.version) fail(file, `body pins ${p.name} ${v} but frontmatter declares ${p.version}`);
    }
    if (!OFFLINE) jobs.push((async () => {
      let all;
      try {
        all = (await published(p)).filter(stable).sort((a, b) => cmp(b, a));
      } catch (e) {
        return fail(file, `could not read ${p.registry} ${p.name}: ${e.message}`);
      }
      if (all.length === 0) return fail(file, `${p.registry} ${p.name} has no stable releases`);
      const sameMajor = all.find((v) => semver(v)[0] === semver(p.version)[0]);
      if (!all.some((v) => cmp(v, p.version) === 0)) fail(file, `${p.name} ${p.version} is not a published version`);
      else if (sameMajor && cmp(p.version, sameMajor) < 0) fail(file, `${p.name} ${p.version} is behind the latest ${sameMajor}: update the bundle and re-verify it`);
      if (cmp(all[0], p.version) > 0 && semver(all[0])[0] > semver(p.version)[0]) warnings.push(`${file}: ${p.name} has a new major ${all[0]} (bundle is on ${p.version}); plan the migration`);
    })());
  }
  for (const re of PINNED) {
    for (const m of body.matchAll(re)) if (!declared.has(m[1])) fail(file, `body pins ${m[1]} but 'packages' does not declare it`);
  }

  if (!OFFLINE) {
    const links = new Set([...raw.matchAll(/https:\/\/www\.cometchat\.com\/docs[^\s)>"'`\]]*/g)].map((m) => m[0].replace(/[.,;:]+$/, "")));
    for (const url of links) jobs.push(checkLink(file, url));
  }
}

await Promise.all(jobs);
for (const w of warnings) console.log(`⚠️  ${w}`);
if (problems.length) {
  console.error(`❌ ${problems.length} problem(s) in mcp-bundles/:`);
  for (const p of problems) console.error(`  - ${p}`);
  console.error("\nSee mcp-bundles/README.md for how to update a bundle.");
  process.exit(1);
}
console.log(`✅ ${files.length} MCP bundles current${OFFLINE ? " (offline: registries and links not checked)" : ""}`);
