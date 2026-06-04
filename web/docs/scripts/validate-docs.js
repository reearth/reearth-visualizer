#!/usr/bin/env node

/**
 * Validate Documentation
 *
 * Checks for:
 * - Missing frontmatter
 * - Broken internal links
 * - Invalid code references
 * - Outdated last_updated dates
 *
 * Usage:
 *   node docs/scripts/validate-docs.js
 *   node docs/scripts/validate-docs.js --fix
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docsRoot = path.join(__dirname, "..");
const srcRoot = path.join(__dirname, "../../src");

let errors = 0;
let warnings = 0;

const args = process.argv.slice(2);
const _shouldFix = args.includes("--fix"); // Reserved for future use

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

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    // Remove quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    frontmatter[key] = value;
  }

  return frontmatter;
}

/**
 * Validate a single markdown file
 */
function validateMarkdownFile(filePath) {
  const relativePath = path.relative(docsRoot, filePath);
  const content = fs.readFileSync(filePath, "utf-8");

  console.log(`\nValidating: ${relativePath}`);

  // Skip templates
  if (filePath.includes("/templates/")) {
    console.log("  ⊘ Skipped (template)");
    return;
  }

  let fileErrors = 0;
  let fileWarnings = 0;

  // Check for frontmatter
  const frontmatter = extractFrontmatter(content);
  if (!frontmatter) {
    console.log("  ❌ Missing frontmatter");
    fileErrors++;
  } else {
    // Validate required frontmatter fields
    const requiredFields = ["title", "last_updated"];

    for (const field of requiredFields) {
      if (!frontmatter[field]) {
        console.log(`  ❌ Missing frontmatter field: ${field}`);
        fileErrors++;
      }
    }

    // Check last_updated date
    if (frontmatter.last_updated) {
      const lastUpdated = new Date(frontmatter.last_updated);
      const fileModified = fs.statSync(filePath).mtime;

      const daysDiff = Math.floor((fileModified - lastUpdated) / (1000 * 60 * 60 * 24));

      if (daysDiff > 30) {
        console.log(`  ⚠️  last_updated may be outdated (${daysDiff} days old)`);
        fileWarnings++;
      }
    }
  }

  // Check for broken internal links
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const linkPath = match[2];

    // Skip external links
    if (linkPath.startsWith("http://") || linkPath.startsWith("https://")) {
      continue;
    }

    // Skip anchors only
    if (linkPath.startsWith("#")) {
      continue;
    }

    // Remove anchor from path
    const pathWithoutAnchor = linkPath.split("#")[0];

    // Resolve relative path
    const absolutePath = path.resolve(path.dirname(filePath), pathWithoutAnchor);

    if (!fs.existsSync(absolutePath)) {
      console.log(`  ❌ Broken link: ${linkPath}`);
      fileErrors++;
    }
  }

  // Check code references
  const codeRefRegex = /`([^`]+\.(ts|tsx|js|jsx))(?::(\d+))?`/g;

  while ((match = codeRefRegex.exec(content)) !== null) {
    const filePart = match[1];

    // Skip if it's just a filename example
    if (filePart.includes("[") || filePart.includes("/path/")) {
      continue;
    }

    // Check if file exists
    const codePath = path.join(srcRoot, filePart);

    if (!fs.existsSync(codePath)) {
      console.log(`  ⚠️  Code reference may be invalid: ${filePart}`);
      fileWarnings++;
    }
  }

  if (fileErrors === 0 && fileWarnings === 0) {
    console.log("  ✅ OK");
  }

  errors += fileErrors;
  warnings += fileWarnings;
}

/**
 * Find all markdown files in docs
 */
function findMarkdownFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (entry.name !== "node_modules" && !entry.name.startsWith(".")) {
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
 * Main validation function
 */
function main() {
  console.log("🔍 Validating documentation...\n");
  console.log(`Documentation root: ${docsRoot}`);

  const markdownFiles = findMarkdownFiles(docsRoot);
  console.log(`Found ${markdownFiles.length} markdown files\n`);

  for (const file of markdownFiles) {
    validateMarkdownFile(file);
  }

  console.log("\n" + "=".repeat(60));
  console.log(`\n📊 Validation Summary:`);
  console.log(`   Files checked: ${markdownFiles.length}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Warnings: ${warnings}`);

  if (errors > 0) {
    console.log("\n❌ Validation failed with errors");
    process.exit(1);
  } else if (warnings > 0) {
    console.log("\n⚠️  Validation passed with warnings");
  } else {
    console.log("\n✅ All documentation valid!");
  }
}

main();
