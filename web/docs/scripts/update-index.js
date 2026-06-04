#!/usr/bin/env node

/**
 * Update Documentation Index
 *
 * Scans all documentation files and generates index.json
 * with metadata for AI-friendly navigation
 *
 * Usage:
 *   node docs/scripts/update-index.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docsRoot = path.join(__dirname, "..");

/**
 * Extract frontmatter from markdown file
 */
function extractFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return null;
  }

  const frontmatter = {};
  const lines = match[1].split("\n");
  let currentArray = null;

  for (const line of lines) {
    // Handle array items
    if (line.trim().startsWith("- ")) {
      if (currentArray) {
        currentArray.push(line.trim().substring(2));
      }
      continue;
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    // Start array if empty value
    if (value === "") {
      currentArray = [];
      frontmatter[key] = currentArray;
      continue;
    }

    // Reset array tracking
    currentArray = null;

    // Remove quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }

    frontmatter[key] = value;
  }

  return frontmatter;
}

/**
 * Process a single markdown file
 */
function processMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const frontmatter = extractFrontmatter(content);

  if (!frontmatter) {
    return null;
  }

  const relativePath = path.relative(docsRoot, filePath);

  return {
    path: relativePath,
    title: frontmatter.title || path.basename(filePath, ".md"),
    category: frontmatter.category || "uncategorized",
    module: frontmatter.module,
    feature: frontmatter.feature,
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    related: Array.isArray(frontmatter.related) ? frontmatter.related : [],
    lastUpdated: frontmatter.last_updated,
    maintainers: Array.isArray(frontmatter.maintainers)
      ? frontmatter.maintainers
      : []
  };
}

/**
 * Find all markdown files
 */
function findMarkdownFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip certain directories
        if (
          entry.name !== "node_modules" &&
          entry.name !== "scripts" &&
          entry.name !== "templates" &&
          !entry.name.startsWith(".")
        ) {
          traverse(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

/**
 * Generate index structure
 */
function generateIndex() {
  console.log("📑 Generating documentation index...\n");

  const markdownFiles = findMarkdownFiles(docsRoot);
  console.log(`Found ${markdownFiles.length} documentation files`);

  const index = {
    version: "1.0.0",
    generated: new Date().toISOString(),
    totalDocs: 0,
    categories: {},
    modules: {},
    features: {},
    concepts: {},
    guides: {},
    setup: {},
    reference: {},
    tags: {}
  };

  for (const file of markdownFiles) {
    const doc = processMarkdownFile(file);

    if (!doc) {
      console.log(
        `  ⚠️  Skipped (no frontmatter): ${path.relative(docsRoot, file)}`
      );
      continue;
    }

    index.totalDocs++;

    // Add to category
    if (!index.categories[doc.category]) {
      index.categories[doc.category] = [];
    }
    index.categories[doc.category].push(doc.path);

    // Add to modules
    if (doc.module) {
      index.modules[doc.module] = {
        path: doc.path,
        title: doc.title,
        tags: doc.tags,
        related: doc.related,
        lastUpdated: doc.lastUpdated
      };
    }

    // Add to features
    if (doc.feature) {
      index.features[doc.feature] = {
        path: doc.path,
        title: doc.title,
        tags: doc.tags,
        related: doc.related,
        lastUpdated: doc.lastUpdated
      };
    }

    // Add to category-specific indexes
    if (doc.category === "concept") {
      const conceptKey = doc.title.toLowerCase().replace(/\s+/g, "-");
      index.concepts[conceptKey] = {
        path: doc.path,
        title: doc.title,
        tags: doc.tags,
        related: doc.related,
        lastUpdated: doc.lastUpdated
      };
    } else if (doc.category === "guide") {
      const guideKey = path.basename(doc.path, ".md");
      index.guides[guideKey] = {
        path: doc.path,
        title: doc.title,
        tags: doc.tags,
        related: doc.related,
        lastUpdated: doc.lastUpdated
      };
    } else if (doc.category === "setup") {
      const setupKey = path.basename(doc.path, ".md");
      index.setup[setupKey] = {
        path: doc.path,
        title: doc.title,
        tags: doc.tags,
        related: doc.related,
        lastUpdated: doc.lastUpdated
      };
    } else if (doc.category === "reference") {
      const refKey = path.basename(doc.path, ".md");
      index.reference[refKey] = {
        path: doc.path,
        title: doc.title,
        tags: doc.tags,
        related: doc.related,
        lastUpdated: doc.lastUpdated
      };
    }

    // Add to tags index
    for (const tag of doc.tags) {
      if (!index.tags[tag]) {
        index.tags[tag] = [];
      }
      index.tags[tag].push(doc.path);
    }
  }

  return index;
}

/**
 * Main function
 */
function main() {
  const index = generateIndex();

  const indexPath = path.join(docsRoot, "index.json");
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), "utf-8");

  console.log(`\n✅ Documentation index generated successfully!`);
  console.log(`   File: ${indexPath}`);
  console.log(`   Total documents: ${index.totalDocs}`);
  console.log(`   Categories: ${Object.keys(index.categories).length}`);
  console.log(`   Modules: ${Object.keys(index.modules).length}`);
  console.log(`   Features: ${Object.keys(index.features).length}`);
  console.log(`   Concepts: ${Object.keys(index.concepts).length}`);
  console.log(`   Guides: ${Object.keys(index.guides).length}`);
  console.log(`   Tags: ${Object.keys(index.tags).length}`);

  console.log("\n📊 Categories breakdown:");
  for (const [category, docs] of Object.entries(index.categories)) {
    console.log(`   ${category}: ${docs.length} docs`);
  }
}

main();
