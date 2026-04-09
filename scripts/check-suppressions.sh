#!/usr/bin/env bash
set -euo pipefail

echo "Checking for lint suppressions..."

PATTERNS=(
  "eslint-disable"
  "eslint-disable-next-line"
  "eslint-disable-line"
  "@ts-ignore"
  "@ts-expect-error"
  "@ts-nocheck"
  "tslint:disable"
  "prettier-ignore"
  "noinspection"
  "nosonar"
  "NOLINT"
)

EXIT_CODE=0

for pattern in "${PATTERNS[@]}"; do
  MATCHES=$(grep -rn "$pattern" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true)
  if [ -n "$MATCHES" ]; then
    echo ""
    echo "FOUND suppression: $pattern"
    echo "$MATCHES"
    EXIT_CODE=1
  fi
done

if [ "$EXIT_CODE" -eq 0 ]; then
  echo "No suppressions found."
else
  echo ""
  echo "FAILED: Lint suppressions are not allowed. Fix the underlying issues instead."
fi

exit "$EXIT_CODE"
