#!/bin/bash
# Stop hook: auto-commits and pushes uncommitted vault changes.
# Silent when cwd is outside the vault or there's nothing to commit.

INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd // "."')
VAULT="/Users/rouven/Documents/Obsidian/idearlou"

case "$CWD" in
  "$VAULT"|"$VAULT"/*) ;;
  *) exit 0 ;;
esac

cd "$VAULT" || exit 0

if [ -z "$(git status --porcelain)" ]; then
  exit 0
fi

FILES=$(git status --porcelain | awk '{print $NF}' | head -5 | tr '\n' ',' | sed 's/,$//; s/,/, /g')
COUNT=$(git status --porcelain | wc -l | tr -d ' ')
if [ "$COUNT" -gt 5 ]; then
  MSG="vault: auto-commit $COUNT files ($FILES, …)"
else
  MSG="vault: auto-commit ($FILES)"
fi

git add -A >/dev/null 2>&1
if git commit -m "$MSG" >/dev/null 2>&1; then
  if ! git push origin main >/dev/null 2>&1; then
    echo "auto-commit: committed locally, push failed (check network)" >&2
  else
    echo "auto-commit: $MSG (pushed)" >&2
  fi
fi

exit 0
