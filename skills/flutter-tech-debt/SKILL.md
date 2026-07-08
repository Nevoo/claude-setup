---
name: flutter-tech-debt
description: >-
  Detects and helps prevent technical debt in Flutter/Dart projects. Use when (1) the user asks to
  find, scan, audit, or report technical debt, code smells, or layering violations in a Flutter
  project ("check for tech debt", "any debt in this module", "debt report", "is this getting
  messy"); (2) reviewing a branch or diff before merge to catch newly introduced debt ("will this
  add debt", "review my changes for debt"); or (3) proactively while writing or refactoring
  Dart/Flutter code, to avoid introducing debt. State-management-agnostic (provider, riverpod,
  bloc, cubit, getx) and architecture-agnostic. Covers oversized UI/state/other files, deep
  nesting, TODO/FIXME/HACK markers, commented-out code, lint suppressions, deprecated APIs, the
  universal "non-UI code must not import Flutter widgets" layering rule, and dependency debt.
  Runs scripts/scan.sh against any Flutter project (auto-detects pubspec from cwd), then triages
  with references/conventions.md.
---

# flutter-tech-debt

Find existing technical debt and stop new debt from landing in any Flutter/Dart project. The
scanner auto-detects the project from your current working directory (`pubspec.yaml` with a
flutter sdk reference). Rules live in `references/conventions.md` — universal Dart/Flutter
conventions only; project-specific patterns (state mgmt, directory layout, feature isolation,
naming) need your judgment.

The scanner gathers facts; **you** triage them. Line count and grep hits are smells, not
verdicts — open the flagged code and judge.

## Two modes

- **Detect (audit)** — scan codebase (or a branch's diff) and produce a findings report.
- **Prevent (guardrail)** — apply the prevention checklist while writing/refactoring, and run a
  diff-scoped scan before a branch merges.

## Detect: audit existing code

1. **Run the scanner** from inside the Flutter project (cwd has `pubspec.yaml` with `sdk: flutter`):
   - `bash ~/.claude/skills/flutter-tech-debt/scripts/scan.sh` — full scan of `lib/` (fast, no network).
   - `--changed [BASE]` — scope every check to files changed vs `main` (or `BASE`). Use this for
     "what does this branch add".
   - `--deps` — also run `flutter pub outdated`. `--analyze` — also run `flutter analyze` (the
     reliable way to find calls to deprecated APIs). Both need `flutter` on PATH and are slower.
   - Set `FLUTTER_PROJECT_ROOT=/path/to/project` to override cwd-based detection.
2. **Read `references/conventions.md`** and triage each scanner section against it.
3. **Open the top flagged files** — confirm complexity is real, and check what the script can't
   measure (method length, `build()` nesting, duplication, mixed concerns).
4. **Apply project knowledge** — the universal layering rule is one check; project-specific
   layering (feature isolation, custom directional rules) needs your judgment. State-mgmt and DI
   patterns are project-specific too.
5. **Write the report** (format below).

## Prevent: stop debt before it lands

When writing or refactoring Dart, or reviewing a branch/PR before merge:

- Apply the **Prevention checklist** (conventions §7) to the code you touched.
- For a pre-merge gate, run `bash ~/.claude/skills/flutter-tech-debt/scripts/scan.sh --changed`
  to see only what the branch introduces, then resolve High/Medium findings before finishing.
- Prefer fixing at the source (extract a widget, move logic to a domain/service layer, regenerate
  a model) over leaving a `// TODO`.

## Report format

Produce a one-off markdown report in the reply — **do not** create or maintain a persistent debt
file. Structure:

- **Summary** — one line: counts by severity, and new-vs-pre-existing split.
- **Findings** — grouped High → Medium → Low. Each: `path:line`, what it is, why it's debt (cite
  the convention), and a concrete fix. Keep entries tight.
- **Prevented** (prevent-mode only) — what was caught before it landed.

Use the severity rubric in conventions §5. Don't pad the report with files merely on the NOTE
threshold unless they regressed.

## Notes

- Needs `bash` + `git` + `grep`. Auto-detects the Flutter project from cwd via `pubspec.yaml`
  (must reference the flutter sdk). Override with `FLUTTER_PROJECT_ROOT=/path/to/project`.
- Generated files excluded: `*.g.dart`, `*.freezed.dart`, `*.config.dart`, `*.gr.dart`,
  `*.mocks.dart`, `lib/gen/`, `lib/generated/`.
- `--deps`/`--analyze` need `flutter` on PATH.
- If the user names a module/feature, scan full but report only findings under that path.
