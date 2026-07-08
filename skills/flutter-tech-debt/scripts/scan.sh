#!/usr/bin/env bash
# Technical-debt scanner for Flutter/Dart projects.
# Emits raw, categorized signals to stdout. Severity triage and the final
# report are produced by Claude using references/conventions.md — this script
# only gathers facts.
#
# Usage:
#   bash scan.sh                 # full scan of lib/ (fast, no network)
#   bash scan.sh --changed       # scope scans to files changed vs main
#   bash scan.sh --changed BASE  # ...changed vs BASE (branch/ref)
#   bash scan.sh --deps          # also run `flutter pub outdated` (slow, network)
#   bash scan.sh --analyze       # also run `flutter analyze` (catches deprecated-API use)
#
# Portable to macOS bash 3.2 / zsh and BSD grep. No bash-4-only features.
set -uo pipefail

# Resolve the Flutter project root from the current working directory.
# Override with FLUTTER_PROJECT_ROOT=/abs/path when invoking from elsewhere.
ROOT="${FLUTTER_PROJECT_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
LIB="$ROOT/lib"
if [ ! -f "$ROOT/pubspec.yaml" ] || ! grep -qE '(^[[:space:]]*flutter:[[:space:]]*$|sdk:[[:space:]]*flutter)' "$ROOT/pubspec.yaml" 2>/dev/null; then
  echo "error: cwd is not a Flutter project (no pubspec.yaml with a flutter sdk reference). cd into a Flutter project, or set FLUTTER_PROJECT_ROOT=/path/to/project." >&2
  exit 1
fi
if [ ! -d "$LIB" ]; then echo "error: $LIB/ not found." >&2; exit 1; fi

CHANGED=0; BASE="main"; DO_DEPS=0; DO_ANALYZE=0
while [ $# -gt 0 ]; do
  case "$1" in
    --changed) CHANGED=1; if [ $# -gt 1 ] && [ "${2#-}" = "$2" ]; then BASE="$2"; shift; fi ;;
    --deps) DO_DEPS=1 ;;
    --analyze) DO_ANALYZE=1 ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
  shift
done

# Common grep excludes (generated code is never debt).
EXC=(--include='*.dart' --exclude='*.g.dart' --exclude='*.freezed.dart' --exclude='*.config.dart' --exclude='*.gr.dart' --exclude='*.mocks.dart' --exclude-dir=gen --exclude-dir=generated)
# Path patterns we treat as "UI surface" — used both for the layering rule and size classification.
UI_PATH_RE='/(ui|views|widgets|pages|screens|presentation)/'
GEN_FILE_RE='\.g\.dart$|\.freezed\.dart$|\.config\.dart$|\.gr\.dart$|\.mocks\.dart$|/gen/|/generated/'

FILELIST="$(mktemp)"; trap 'rm -f "$FILELIST"' EXIT
if [ "$CHANGED" -eq 1 ]; then
  { git -C "$ROOT" diff --name-only --diff-filter=ACMR "$BASE"...HEAD 2>/dev/null
    git -C "$ROOT" diff --name-only --diff-filter=ACMR 2>/dev/null
    git -C "$ROOT" diff --name-only --diff-filter=ACMR --cached 2>/dev/null
    git -C "$ROOT" ls-files --others --exclude-standard 2>/dev/null
  } | sort -u \
    | grep -E '^lib/.*\.dart$' \
    | grep -Ev "$GEN_FILE_RE" \
    | sed "s#^#$ROOT/#" > "$FILELIST"
else
  find "$LIB" -name '*.dart' -type f \
    | grep -Ev "$GEN_FILE_RE" \
    | sort > "$FILELIST"
fi

filter_changed() { if [ "$CHANGED" -eq 1 ]; then grep -F -f "$FILELIST" 2>/dev/null || true; else cat; fi; }
emit() { out="$(cat)"; if [ -n "$out" ]; then printf '%s\n' "$out" | sed "s#$ROOT/##" | sed 's/^/  /'; else echo "  (none)"; fi; }
section() { printf '\n========== %s ==========\n' "$1"; }

printf 'Flutter tech-debt scan — %s\n' "$(date '+%Y-%m-%d %H:%M')"
printf 'Project: %s\n' "$ROOT"
if [ "$CHANGED" -eq 1 ]; then
  printf 'Mode: CHANGED vs %s — %s hand-written dart file(s)\n' "$BASE" "$(wc -l < "$FILELIST" | tr -d ' ')"
else
  printf 'Mode: FULL — %s hand-written dart file(s) in lib/\n' "$(wc -l < "$FILELIST" | tr -d ' ')"
fi

# ---------------------------------------------------------------------------
section "FILE SIZE (lines)"
echo "  state file (*_provider|notifier|bloc|cubit|state|controller.dart): >400 WARN"
echo "  UI file (under ui/views/widgets/pages/screens/presentation):       >400 WARN, >300 NOTE"
echo "  other (models, services, repos, utils):                            >500 WARN, >300 NOTE"
while IFS= read -r f; do
  [ -f "$f" ] || continue
  n=$(wc -l < "$f" | tr -d ' ')
  printf '%s\t%s\n' "$n" "${f#$ROOT/}"
done < "$FILELIST" | sort -rn | awk -F'\t' -v ui_re="$UI_PATH_RE" '
{
  n=$1; p=$2; tag="ok"
  is_ui = (p ~ ui_re)
  is_state = (p ~ /_(provider|notifier|bloc|cubit|state|controller)\.dart$/)
  if (is_state) { if (n>400) tag="WARN-state" }
  else if (is_ui) { if (n>400) tag="WARN-ui"; else if (n>300) tag="NOTE-ui" }
  else { if (n>500) tag="WARN"; else if (n>300) tag="NOTE" }
  if (tag!="ok") printf "  [%s] %5d  %s\n", tag, n, p
}
END { if (NR==0) print "  (no files over threshold)" }'
echo "  -- top 5 by size (any threshold):"
while IFS= read -r f; do [ -f "$f" ] || continue; printf '%s\t%s\n' "$(wc -l < "$f" | tr -d ' ')" "${f#$ROOT/}"; done < "$FILELIST" \
  | sort -rn | head -5 | awk -F'\t' '{printf "     %5d  %s\n",$1,$2}'

# ---------------------------------------------------------------------------
section "MARKERS (TODO / FIXME / HACK / XXX)"
grep -rnE '(TODO|FIXME|HACK|XXX)' "$LIB" "${EXC[@]}" 2>/dev/null | filter_changed | emit

# ---------------------------------------------------------------------------
section "COMMENTED-OUT CODE (candidates — verify by reading; heuristic may miss/over-match)"
# Two high-precision signals: (1) comment lines ending in code punctuation
# (=> | ); | ), | {), (2) comment lines led by a Dart statement keyword.
# Prose comments ending in a plain ")" are intentionally NOT matched.
{ grep -rnE '^[[:space:]]*//[^/].*(=>|\);|\),|\{)[[:space:]]*$' "$LIB" "${EXC[@]}" 2>/dev/null
  grep -rnE '^[[:space:]]*//[^/][[:space:]]*(import|return|final|const|var|await|throw)[[:space:](]' "$LIB" "${EXC[@]}" 2>/dev/null
} | sort -u | filter_changed | emit

# ---------------------------------------------------------------------------
section "LINT SUPPRESSIONS (// ignore / ignore_for_file)"
grep -rnE '//[[:space:]]*ignore(_for_file)?:' "$LIB" "${EXC[@]}" 2>/dev/null | filter_changed | emit

# ---------------------------------------------------------------------------
section "DEPRECATIONS (@Deprecated declared in this codebase)"
grep -rnE '@[Dd]eprecated' "$LIB" "${EXC[@]}" 2>/dev/null | filter_changed | emit
echo "  note: deprecated-API *usage* (calling deprecated members elsewhere) is best caught with --analyze."

# ---------------------------------------------------------------------------
section "LAYERING (non-UI code importing Flutter UI packages)"
echo "  rule: code outside ui/views/widgets/pages/screens/presentation must not import"
echo "        package:flutter/material|widgets|cupertino — those couple logic to the UI layer."
echo "        (package:flutter/foundation is fine in non-UI code.)"
find "$LIB" -name '*.dart' -type f \
  ! -name '*.g.dart' ! -name '*.freezed.dart' ! -name '*.config.dart' \
  ! -name '*.gr.dart' ! -name '*.mocks.dart' \
  ! -path '*/gen/*' ! -path '*/generated/*' \
  ! -path '*/ui/*' ! -path '*/views/*' ! -path '*/widgets/*' \
  ! -path '*/pages/*' ! -path '*/screens/*' ! -path '*/presentation/*' \
  -exec grep -HnE "^[[:space:]]*import .*package:flutter/(material|widgets|cupertino)\.dart" {} + 2>/dev/null \
  | filter_changed | emit

# ---------------------------------------------------------------------------
section "DEPENDENCY DEBT"
echo "-- git-sourced / pinned dependencies in pubspec.yaml:"
awk '/^[[:space:]]+git:/{flag=1} flag{print "  "$0} /^[[:space:]]+ref:/{flag=0}' "$ROOT/pubspec.yaml" 2>/dev/null || echo "  (none)"
if [ "$DO_DEPS" -eq 1 ]; then
  echo "-- flutter pub outdated:"
  ( cd "$ROOT" && flutter pub outdated 2>&1 | sed 's/^/  /' ) || echo "  (flutter unavailable)"
else
  echo "  (run with --deps for 'flutter pub outdated')"
fi

# ---------------------------------------------------------------------------
if [ "$DO_ANALYZE" -eq 1 ]; then
  section "FLUTTER ANALYZE"
  ( cd "$ROOT" && flutter analyze 2>&1 | sed 's/^/  /' ) || echo "  (flutter unavailable)"
fi

echo
echo "Scan complete. Triage these signals with references/conventions.md before writing the report."
