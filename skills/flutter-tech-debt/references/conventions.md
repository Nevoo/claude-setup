# Flutter tech-debt conventions & triage

Rules for classifying scanner output and for preventing new debt in any Flutter/Dart project.
This skill is state-mgmt-agnostic (provider, riverpod, bloc, cubit, getx, mobx) and
architecture-agnostic (clean, layer-first, feature-first). It checks **universal** Dart/Flutter
smells plus **one** universal layering rule. Project-specific patterns (custom layering, naming,
known-accepted debt) need your judgment when interpreting findings.

## Contents
1. What's universal vs what isn't
2. File size & complexity thresholds
3. Layering: the one universal rule
4. Markers, deprecations, suppressions, commented code
5. Dependency debt
6. Severity rubric
7. Prevention checklist
8. Reading flagged files (the script can't measure these)

---

## 1. What's universal vs what isn't

**Universal (what the scanner checks):**
- Dart file size and naming-pattern classification.
- TODO/FIXME/HACK/XXX markers; `@Deprecated` declarations; `// ignore:` / `// ignore_for_file:`
  suppressions; high-precision commented-out-code detection.
- Generated-file exclusion (`*.g.dart`, `*.freezed.dart`, `*.config.dart`, `*.gr.dart`,
  `*.mocks.dart`, `lib/gen/`, `lib/generated/`).
- The "non-UI code shouldn't import `package:flutter/material|widgets|cupertino`" layering rule.
- `flutter pub outdated` (`--deps`), `flutter analyze` (`--analyze`).

**Not universal — apply project knowledge:**
- State-management patterns (provider/riverpod/bloc/cubit/getx) and how they should be used.
- DI choice (get_it/injectable/riverpod-providers/none).
- Directory layout (`lib/features/`, `lib/data/+lib/ui/+lib/logic/`, `lib/src/`).
- Inter-module/inter-feature import rules — the scanner can't infer feature boundaries.
- Naming conventions for state files; identifier-language rules (English-only vs localized).
- Project-specific known-accepted debt (the previous "baseline" concept).

When the project has its own conventions, mention them in your triage write-up and apply them
manually — don't pretend the scanner enforced them.

## 2. File size & complexity thresholds

The scanner classifies each file by path/name pattern:

| Class    | How detected                                                          | NOTE  | WARN  |
|----------|-----------------------------------------------------------------------|-------|-------|
| state    | filename ends `_provider/notifier/bloc/cubit/state/controller.dart`   | —     | > 400 |
| UI       | path under `/ui/`, `/views/`, `/widgets/`, `/pages/`, `/screens/`, `/presentation/` | > 300 | > 400 |
| other    | anything else (models, services, repos, utils, domain)                | > 300 | > 500 |

Line count alone is a smell, not a verdict — **open the file and judge real complexity**.

## 3. Layering: the one universal rule

**Non-UI Dart code must not import `package:flutter/material|widgets|cupertino`.**

These are the Flutter UI packages. Importing them in models, services, repositories, business
logic, or DTOs couples logic to the UI framework, breaks unit testability (you lose pure Dart-VM
runs), and signals UI concepts leaking downward.

Allowed in non-UI code:
- `package:flutter/foundation.dart` (e.g. `ChangeNotifier`, `ValueListenable`, `kDebugMode`).
- `package:flutter/services.dart` (platform channels, when actually needed).
- State-mgmt library types (`riverpod`, `bloc`, etc.) — those are runtime, not UI widgets.

For project-specific layering (feature isolation, "data can't import ui", "domain can't import
data") — the scanner can't enforce it. Note any violations during file review and call them out
explicitly as project-specific findings.

## 4. Markers, deprecations, suppressions, commented code

- **TODO/FIXME/HACK/XXX** without an owner + a condition for removal → debt. Convert to an issue
  or fix; don't leave indefinite markers in the tree.
- **Commented-out code** → delete. Git history is the archive. Heuristic may include candidates
  worth verifying; if it's prose with code-like punctuation, ignore.
- **`// ignore:` / `// ignore_for_file:`** → each one hides a lint warning. Verify the lint is
  genuinely wrong for that line rather than masking a fixable issue. A suppression without a
  one-line rationale comment above it is debt.
- **`@Deprecated('...')`** declared internally → schedule removal. **Calls to deprecated members
  elsewhere** (yours or third-party) won't be in the script output — run `--analyze` to find
  them via `flutter analyze`.

## 5. Dependency debt

- **Git-sourced dependencies with a pinned ref** are fragile: the ref can disappear, drift from
  the rest of the dep graph, or block upgrades elsewhere. Prefer pub.dev versions or git tags
  over commit refs; track them for upgrade opportunities.
- **`flutter pub outdated`** (`--deps`) surfaces version drift. Majors behind = real risk.
  Flutter-SDK-pinned packages mean a Flutter upgrade unlocks others — plan them together.
- Lockfile (`pubspec.lock`) should be committed for apps; treat large unexplained churn as a
  review signal.

## 6. Severity rubric

- **High** — will bite soon or blocks change: non-UI file importing Flutter UI packages; a state
  file far past threshold (>600+); deprecated API still called in active code paths; a stale
  generated model (`*.g.dart`/`*.freezed.dart` out of sync); a critical dependency multiple
  majors behind.
- **Medium** — real but contained: UI/widget file over 400 lines; deeply nested `build()`; a
  lint suppression masking a real issue; an internally-`@Deprecated` member still referenced;
  notable code duplication.
- **Low** — note, don't block: 300–400 line files; a `TODO` with clear owner + condition; minor
  naming drift; small dep updates.

Separate **new** findings (introduced on a branch — use `--changed`) from **pre-existing** ones.
New debt is the priority. If the project has documented accepted debt, list those once at the
top of the report and don't re-flag them.

## 7. Prevention checklist (apply while writing or reviewing code)

- [ ] No `package:flutter/material|widgets|cupertino` imports in non-UI Dart code.
- [ ] New UI file extracts sub-widgets before crossing ~400 lines; new state file
      (provider/notifier/bloc/cubit) stays focused — push business logic to a domain/service layer.
- [ ] Method bodies stay under ~40 lines; `build()` nesting under ~5 levels.
- [ ] No new `TODO`/`HACK` without an owner + removal condition. No commented-out code left
      behind. No `// ignore:` without a one-line rationale above it.
- [ ] Not calling a `@Deprecated` API. After changing a `@freezed` or `json_serializable` model,
      regenerated `*.g.dart` / `*.freezed.dart` and committed them.
- [ ] Pinned git deps reviewed — prefer tags over commit refs; track upgrade path.
- [ ] State-mgmt patterns kept consistent — don't mix `setState` and your state library for the
      same state in one widget.

## 8. Reading flagged files (the script can't measure these)

After the scan, open the top flagged files and look for:

- **Method length** — methods > ~40 lines usually want extraction.
- **`build()` depth** — nesting > ~5 levels = extract sub-widgets or `_buildX()` helpers.
- **Duplication** — repeated widget trees or near-identical methods → extract a shared widget /
  helper. Three copies = always extract.
- **Mixed concerns** — a state file doing validation + persistence + analytics + transformation
  → split. A widget file doing data fetching → move to a state file.
- **State-mgmt mixing** — `setState` + provider/riverpod/bloc writing the same state from both
  sides is a footgun.
- **Project-specific layering** — features importing each other, or directional rules the
  project documents (the scanner can't enforce these — apply manually).
