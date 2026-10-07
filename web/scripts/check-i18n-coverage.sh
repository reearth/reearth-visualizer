#!/bin/bash

# Check Japanese translation coverage to prevent accidental deletion of translations
# This script ensures that Japanese translations maintain at least 90% coverage

set -e

EN_FILE="src/services/i18n/translations/en.yml"
JA_FILE="src/services/i18n/translations/ja.yml"

# Count total keys in English file
EN_TOTAL=$(grep -E "^[^#][^:]+:" "$EN_FILE" | wc -l | tr -d ' ')

# Count Japanese translations with actual values (exclude empty strings)
JA_WITH_VALUES=$(grep -E "^[^#][^:]+:" "$JA_FILE" | \
  grep -v -E ": *$" | \
  grep -v -E ": *['\"]?['\"]? *$" | \
  wc -l | tr -d ' ')

# Calculate coverage percentage
COVERAGE=$(awk "BEGIN {printf \"%.1f\", ($JA_WITH_VALUES / $EN_TOTAL) * 100}")
MIN_COVERAGE=90.0

echo "📊 Japanese translation coverage: $COVERAGE% ($JA_WITH_VALUES/$EN_TOTAL)"

# Check if coverage is below minimum
if (( $(echo "$COVERAGE < $MIN_COVERAGE" | bc -l) )); then
  echo ""
  echo "❌ Error: Japanese translation coverage ($COVERAGE%) is below minimum ($MIN_COVERAGE%)"
  echo ""
  echo "This usually indicates that translations were accidentally deleted."
  echo "Please check the following:"
  echo "  1. Did you run 'yarn i18n' and see any errors?"
  echo "  2. Are there any YAML syntax errors in ja.yml?"
  echo "  3. Did you accidentally delete translation values?"
  echo ""
  echo "To fix this:"
  echo "  - Restore translations from git history"
  echo "  - Fix any YAML syntax errors"
  echo "  - Ensure translation keys don't contain special characters like colons"
  echo ""
  exit 1
fi

echo "✅ Translation coverage check passed"
