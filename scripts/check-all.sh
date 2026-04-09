#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
BOLD='\033[1m'
RESET='\033[0m'

FAILED=0

step() {
  echo ""
  echo -e "${BOLD}[$1/$TOTAL] $2${RESET}"
}

pass() {
  echo -e "${GREEN}  PASS${RESET}"
}

fail() {
  echo -e "${RED}  FAIL${RESET}"
  FAILED=1
}

TOTAL=5

step 1 "TypeScript type check"
if npm run typecheck 2>&1; then
  pass
else
  fail
fi

step 2 "Lint suppression check"
if bash scripts/check-suppressions.sh 2>&1; then
  pass
else
  fail
fi

step 3 "ESLint"
if npm run lint 2>&1; then
  pass
else
  fail
fi

step 4 "Prettier format check"
if npm run format 2>&1; then
  pass
else
  fail
fi

step 5 "TypeScript strict config audit"
TSCONFIG="tsconfig.json"
REQUIRED_FLAGS=(
  '"strict": true'
  '"noUncheckedIndexedAccess": true'
  '"noPropertyAccessFromIndexSignature": true'
  '"exactOptionalPropertyTypes": true'
  '"noFallthroughCasesInSwitch": true'
  '"forceConsistentCasingInFileNames": true'
  '"noUnusedLocals": true'
  '"noUnusedParameters": true'
  '"noImplicitReturns": true'
  '"noImplicitOverride": true'
  '"verbatimModuleSyntax": true'
  '"isolatedModules": true'
)
TS_AUDIT_PASS=true
for flag in "${REQUIRED_FLAGS[@]}"; do
  if ! grep -q "$flag" "$TSCONFIG"; then
    echo "  Missing in tsconfig.json: $flag"
    TS_AUDIT_PASS=false
  fi
done
if $TS_AUDIT_PASS; then
  pass
else
  fail
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}All checks passed.${RESET}"
else
  echo -e "${RED}${BOLD}Some checks failed. Fix issues above.${RESET}"
  exit 1
fi
