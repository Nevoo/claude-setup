#!/bin/bash
# PreToolUse Write|Edit hook: warns on Voice DNA fatal rule violations in .md files.
# Warning only — never blocks. Skips Sources/ and _templates/ (source material / scaffolds).

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // ""')
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

case "$FILE" in
  */Sources/*|*/_templates/*) exit 0 ;;
  *.md) ;;
  *) exit 0 ;;
esac

if [ "$TOOL" = "Write" ]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // ""')
elif [ "$TOOL" = "Edit" ]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.new_string // ""')
else
  exit 0
fi

WARNINGS=""

if printf '%s' "$CONTENT" | grep -q "—"; then
  WARNINGS="${WARNINGS}voice-dna: em dash (—) detected. Replace with comma, period, or rephrase."$'\n'
fi

if printf '%s' "$CONTENT" | grep -qiE "isn'?t [^.]+\. (it'?s|this is|that'?s)"; then
  WARNINGS="${WARNINGS}voice-dna: negation-then-assertion pattern ('This isn't X. This is Y.') detected. Rewrite as a single positive statement."$'\n'
fi

if [ -n "$WARNINGS" ]; then
  printf '%s' "$WARNINGS" >&2
fi

exit 0
