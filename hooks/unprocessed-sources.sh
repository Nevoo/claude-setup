#!/bin/bash
# SessionStart hook: counts unprocessed sources in the idearlou vault.
# Silent when cwd is outside the vault or nothing is pending.

INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd // "."')
VAULT="/Users/rouven/Documents/Obsidian/idearlou"

case "$CWD" in
  "$VAULT"|"$VAULT"/*) ;;
  *) exit 0 ;;
esac

SOURCES_DIR="$VAULT/Sources"
[ -d "$SOURCES_DIR" ] || exit 0

COUNT=$(grep -rl "^processed: false" "$SOURCES_DIR" --include="*.md" 2>/dev/null | wc -l | tr -d ' ')

if [ "$COUNT" -gt 0 ]; then
  echo "INFO: $COUNT unprocessed source(s) in Sources/. Compile when ready." >&2
fi

exit 0
