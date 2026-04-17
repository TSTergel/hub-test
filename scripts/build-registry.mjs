#!/usr/bin/env node
/**
 * Builds registry.json from all blocks/{id}/ folders.
 *
 * Usage:
 *   node scripts/build-registry.mjs            # validate + write registry.json
 *   node scripts/build-registry.mjs --dry-run  # validate only, no write
 *
 * Exit codes:
 *   0 — success
 *   1 — validation failure
 *   2 — unexpected error
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const BLOCKS_DIR = path.join(REPO_ROOT, "blocks");
const MANIFEST_SCHEMA_PATH = path.join(REPO_ROOT, "schema", "manifest.schema.json");
const OUTPUT_PATH = path.join(REPO_ROOT, "registry.json");

const isDryRun = process.argv.includes("--dry-run");

// ---------- helpers ----------

function assetBaseUrl(folderName) {
  // In CI we pin asset URLs to the commit SHA that produced this registry, not
  // the moving `main` branch, so a bad merge doesn't instantly propagate to
  // every client. jsDelivr has a real CDN, proper content-types, and working
  // CORS — raw.githubusercontent.com has none of that.
  const repo = process.env.GITHUB_REPOSITORY; // "owner/repo"
  const sha = process.env.GITHUB_SHA;
  if (repo && sha) {
    return `https://cdn.jsdelivr.net/gh/${repo}@${sha}/blocks/${folderName}`;
  }
  // Local dev: relative paths still resolve when a browser opens registry.json.
  return `./blocks/${folderName}`;
}

async function readJson(filePath) {
  let raw;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch (err) {
    throw new Error(`${path.relative(REPO_ROOT, filePath)}: cannot read — ${err.message}`);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`${path.relative(REPO_ROOT, filePath)}: invalid JSON — ${err.message}`);
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// ---------- main ----------

async function main() {
  const errors = [];
  const registryEntries = [];

  // 1. Compile schema.
  const manifestSchema = await readJson(MANIFEST_SCHEMA_PATH);
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validateManifest = ajv.compile(manifestSchema);

  // 2. Enumerate block folders.
  let entries;
  try {
    entries = await fs.readdir(BLOCKS_DIR, { withFileTypes: true });
  } catch (err) {
    console.error(`✗ Cannot read ${path.relative(REPO_ROOT, BLOCKS_DIR)}: ${err.message}`);
    process.exit(2);
  }

  const folders = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  if (folders.length === 0) {
    console.error("✗ No modules found in blocks/");
    process.exit(1);
  }

  // Duplicate-id detection — case-insensitive, to catch macOS case-fold collisions.
  const folderLowerSeen = new Map();
  for (const folder of folders) {
    const lower = folder.toLowerCase();
    if (folderLowerSeen.has(lower)) {
      errors.push(
        `blocks/${folder}: collides with blocks/${folderLowerSeen.get(lower)} (case-insensitive duplicate)`
      );
    } else {
      folderLowerSeen.set(lower, folder);
    }
  }

  // 3. Validate each module.
  for (const folder of folders) {
    const ctx = `blocks/${folder}`;
    const modulePath = path.join(BLOCKS_DIR, folder);
    const manifestPath = path.join(modulePath, "manifest.json");

    // Parse manifest.
    let manifest;
    try {
      manifest = await readJson(manifestPath);
    } catch (err) {
      errors.push(err.message);
      continue;
    }

    // Schema validation.
    if (!validateManifest(manifest)) {
      for (const e of validateManifest.errors ?? []) {
        const loc = e.instancePath || "/";
        errors.push(`${ctx}/manifest.json: ${loc} ${e.message}`);
      }
      continue;
    }

    // id must match folder name.
    if (manifest.id !== folder) {
      errors.push(
        `${ctx}/manifest.json: id "${manifest.id}" does not match folder name "${folder}"`
      );
    }

    // Icon file must exist.
    const iconPath = path.join(modulePath, manifest.icon);
    if (!(await fileExists(iconPath))) {
      errors.push(`${ctx}: icon file "${manifest.icon}" not found`);
    }

    // Build registry entry (omit empty optional fields to keep payload small).
    const base = assetBaseUrl(folder);
    const entry = {
      id: manifest.id,
      name: manifest.name,
      description: manifest.description,
      version: manifest.version,
      category: manifest.category,
      tags: manifest.tags ?? [],
      icon_url: `${base}/${manifest.icon}`,
      author: manifest.author,
      endpoint: manifest.endpoint,
      supported_contexts: manifest.supported_contexts,
      privacy_url: manifest.privacy_url,
    };
    if (manifest.support_url) entry.support_url = manifest.support_url;
    if (manifest.homepage) entry.homepage = manifest.homepage;

    registryEntries.push(entry);
  }

  // 4. Fail on any errors.
  if (errors.length > 0) {
    console.error("✗ Validation failed:\n");
    for (const e of errors) console.error(`  • ${e}`);
    console.error(`\n${errors.length} error(s).`);
    process.exit(1);
  }

  console.log(`✓ Validated ${registryEntries.length} module(s).`);

  // 5. Build registry payload.
  const registry = {
    generated_at: new Date().toISOString(),
    commit_sha: process.env.GITHUB_SHA ?? null,
    count: registryEntries.length,
    modules: registryEntries.sort((a, b) => a.id.localeCompare(b.id)),
  };

  if (isDryRun) {
    console.log("✓ Dry run — registry.json not written.");
    return;
  }

  await fs.writeFile(
    OUTPUT_PATH,
    JSON.stringify(registry, null, 2) + "\n",
    "utf8"
  );
  console.log(`✓ Wrote ${path.relative(REPO_ROOT, OUTPUT_PATH)}`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(2);
});
