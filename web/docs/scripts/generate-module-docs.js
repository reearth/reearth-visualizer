#!/usr/bin/env node

/**
 * Generate Module Documentation Skeleton
 *
 * Usage:
 *   node docs/scripts/generate-module-docs.js --module services/config
 *   node docs/scripts/generate-module-docs.js --feature editor
 *   node docs/scripts/generate-module-docs.js --concept authentication
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const argMap = {};
for (let i = 0; i < args.length; i += 2) {
  if (args[i].startsWith("--")) {
    argMap[args[i].substring(2)] = args[i + 1];
  }
}

const { module: modulePath, feature, concept } = argMap;

if (!modulePath && !feature && !concept) {
  console.error("Error: Must specify --module, --feature, or --concept");
  console.log("\nUsage:");
  console.log(
    "  node docs/scripts/generate-module-docs.js --module services/config"
  );
  console.log("  node docs/scripts/generate-module-docs.js --feature editor");
  console.log(
    "  node docs/scripts/generate-module-docs.js --concept authentication"
  );
  process.exit(1);
}

const docsRoot = path.join(__dirname, "..");
const today = new Date().toISOString().split("T")[0];

/**
 * Generate module documentation
 */
function generateModuleDoc(modulePath) {
  const templatePath = path.join(docsRoot, "templates/module-guide.md");
  const template = fs.readFileSync(templatePath, "utf-8");

  const moduleName = modulePath
    .split("/")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const outputDir = path.join(docsRoot, "modules", modulePath.split("/")[0]);
  const outputFile = path.join(outputDir, `${modulePath.split("/").pop()}.md`);

  // Replace template placeholders
  let content = template
    .replace(/\[Module Name\]/g, moduleName)
    .replace(/\[path\/to\/module\]/g, modulePath)
    .replace(/YYYY-MM-DD/g, today);

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Check if file already exists
  if (fs.existsSync(outputFile)) {
    console.error(`Error: Documentation already exists at ${outputFile}`);
    console.log("Delete the existing file first or edit it directly.");
    process.exit(1);
  }

  // Write documentation file
  fs.writeFileSync(outputFile, content, "utf-8");

  console.log(`✅ Generated module documentation:`);
  console.log(`   ${outputFile}`);
  console.log(`\nNext steps:`);
  console.log(`1. Edit ${outputFile} to fill in the details`);
  console.log(`2. Add code references to your module`);
  console.log(`3. Add examples and usage patterns`);
  console.log(`4. Run: yarn docs:update-index`);
}

/**
 * Generate feature documentation
 */
function generateFeatureDoc(featureName) {
  const templatePath = path.join(docsRoot, "templates/feature-guide.md");
  const template = fs.readFileSync(templatePath, "utf-8");

  const featureTitle =
    featureName.charAt(0).toUpperCase() + featureName.slice(1);

  const outputDir = path.join(docsRoot, "modules/features");
  const outputFile = path.join(outputDir, `${featureName}.md`);

  // Replace template placeholders
  let content = template
    .replace(/\[Feature Name\]/g, featureTitle)
    .replace(/\[feature-identifier\]/g, featureName)
    .replace(/\[feature\]/g, featureName)
    .replace(/YYYY-MM-DD/g, today);

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Check if file already exists
  if (fs.existsSync(outputFile)) {
    console.error(`Error: Documentation already exists at ${outputFile}`);
    console.log("Delete the existing file first or edit it directly.");
    process.exit(1);
  }

  // Write documentation file
  fs.writeFileSync(outputFile, content, "utf-8");

  console.log(`✅ Generated feature documentation:`);
  console.log(`   ${outputFile}`);
  console.log(`\nNext steps:`);
  console.log(`1. Edit ${outputFile} to describe the feature`);
  console.log(`2. Add user journey and workflows`);
  console.log(`3. Document GraphQL queries and mutations`);
  console.log(`4. Run: yarn docs:update-index`);
}

/**
 * Generate concept documentation
 */
function generateConceptDoc(conceptName) {
  const templatePath = path.join(docsRoot, "templates/concept-guide.md");
  const template = fs.readFileSync(templatePath, "utf-8");

  const conceptTitle = conceptName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const outputDir = path.join(docsRoot, "concepts");
  const outputFile = path.join(outputDir, `${conceptName}.md`);

  // Replace template placeholders
  let content = template
    .replace(/\[Concept Name\]/g, conceptTitle)
    .replace(/YYYY-MM-DD/g, today);

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Check if file already exists
  if (fs.existsSync(outputFile)) {
    console.error(`Error: Documentation already exists at ${outputFile}`);
    console.log("Delete the existing file first or edit it directly.");
    process.exit(1);
  }

  // Write documentation file
  fs.writeFileSync(outputFile, content, "utf-8");

  console.log(`✅ Generated concept documentation:`);
  console.log(`   ${outputFile}`);
  console.log(`\nNext steps:`);
  console.log(`1. Edit ${outputFile} to explain the concept`);
  console.log(`2. Add implementation examples`);
  console.log(`3. Document best practices and anti-patterns`);
  console.log(`4. Run: yarn docs:update-index`);
}

// Execute appropriate generator
if (modulePath) {
  generateModuleDoc(modulePath);
} else if (feature) {
  generateFeatureDoc(feature);
} else if (concept) {
  generateConceptDoc(concept);
}
