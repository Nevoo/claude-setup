#!/bin/bash
# SessionStart hook: audits project dependencies and surfaces warnings as context.
# Silent when no recognized dependency manifests are present.

INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd // "."')
cd "$CWD" 2>/dev/null || exit 0

# Skip silently if no manifest in the project root.
if [ ! -f "package.json" ] && [ ! -f "requirements.txt" ] && [ ! -f "pyproject.toml" ] && [ ! -f "pubspec.yaml" ]; then
  exit 0
fi

OUTPUT=""

if [ -f "package.json" ] && command -v npm >/dev/null 2>&1; then
  AUDIT=$(npm audit --json 2>/dev/null)
  VULN_COUNT=$(echo "$AUDIT" | jq -r '[.metadata.vulnerabilities // {} | to_entries[].value] | add // 0' 2>/dev/null)
  if [ -n "$VULN_COUNT" ] && [ "$VULN_COUNT" -gt 0 ]; then
    BREAKDOWN=$(echo "$AUDIT" | jq -r '.metadata.vulnerabilities // {} | to_entries | map(select(.value > 0)) | map("\(.value) \(.key)") | join(", ")' 2>/dev/null)
    OUTPUT="${OUTPUT}WARNING: $VULN_COUNT npm vulnerabilities ($BREAKDOWN). Run 'npm audit' for details."$'\n'
  fi

  OUTDATED_COUNT=$(npm outdated --json 2>/dev/null | jq -r 'length // 0' 2>/dev/null)
  if [ -n "$OUTDATED_COUNT" ] && [ "$OUTDATED_COUNT" -gt 5 ]; then
    OUTPUT="${OUTPUT}INFO: $OUTDATED_COUNT outdated npm packages. Run 'npm outdated' to review."$'\n'
  fi
fi

if { [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; } && command -v pip-audit >/dev/null 2>&1; then
  PIP_VULN=$(pip-audit --format json 2>/dev/null | jq -r '[.dependencies // [] | .[] | select(.vulns | length > 0)] | length // 0' 2>/dev/null)
  if [ -n "$PIP_VULN" ] && [ "$PIP_VULN" -gt 0 ]; then
    OUTPUT="${OUTPUT}WARNING: $PIP_VULN Python dependency vulnerabilities found. Run 'pip-audit' for details."$'\n'
  fi
fi

if [ -f "pubspec.yaml" ]; then
  PUB_CMD=""
  if command -v flutter >/dev/null 2>&1 && grep -q "flutter:" pubspec.yaml 2>/dev/null; then
    PUB_CMD="flutter pub outdated --json"
  elif command -v dart >/dev/null 2>&1; then
    PUB_CMD="dart pub outdated --json"
  fi
  if [ -n "$PUB_CMD" ]; then
    OUTDATED_PUB=$($PUB_CMD 2>/dev/null | jq -r '[.packages[]? | select(.current.version != null and .current.version != .latest.version)] | length // 0' 2>/dev/null)
    if [ -n "$OUTDATED_PUB" ] && [ "$OUTDATED_PUB" -gt 5 ]; then
      OUTPUT="${OUTPUT}INFO: $OUTDATED_PUB outdated pub packages. Run 'flutter pub outdated' to review."$'\n'
    fi
  fi
fi

if [ -n "$OUTPUT" ]; then
  printf '%s' "$OUTPUT" >&2
fi

exit 0
