# AI Review Log

## Overview

This log tracks code-correctness reviews and fixes performed with AI assistance (bug hunts, logic review, "make this more professional" passes) — as opposed to [Design Docs](design-doc/), which are written *before* implementation to propose a change.

The goal is that anyone reviewing a diff or a commit later can jump here, find the matching entry, and see **what was actually wrong, why it mattered, and what changed** — without having to reverse-engineer intent from the diff alone.

## When to add an entry

Add an entry whenever an AI-assisted session finds and fixes real bugs/logic issues (not pure style/formatting) in this repo — whether or not tests were added. Skip it for trivial one-line typo fixes.

## Format

Append a new dated section per review session (don't create separate files). Use:

```markdown
## YYYY-MM-DD — Short scope description (files touched)

### Findings & Fixes
1. **Short bug title** (file.tsx)
   - Bug: what was actually wrong, and the concrete scenario where it bites
   - Fix: what changed to address it

### Tests added
- file.test.tsx (N tests) — or "None this round" if skipped
```

Newest entries go at the bottom, so the file reads chronologically like a changelog.

---

## 2026-08-16 — Dashboard Projects feature (web/src/app/features/Dashboard/ContentsContainer/Projects/**)

Reviewed the Projects dashboard: create/import/remove modals, the dashboard-level and per-project hooks, and the grid/list view items.

### Key fixes

- **Async ordering bugs around project create/remove**: the create modal could close on a failed create (losing the user's input), and remove could archive a project to the Recycle Bin before it was actually unpublished. Both flows now await their mutations and propagate success/failure up before closing modals or touching the Apollo cache.
- **Stale/incorrect UI state**: alias validation could show a stale result for fast typers (added a request-id guard), an unavailable alias with no server message showed no error styling, and renaming a project to a blank name left the card blank instead of reverting.
- **Missing double-submit guard**: nothing stopped repeated clicks on Remove while the unpublish-then-archive flow was in flight; added an in-progress guard.
- **Small correctness/cleanup items**: a leaked blob URL/DOM node on error-log download, an ambiguous polling response resetting import progress, a tautological condition that always deselected the project, invalid `<ul>`-in-`<p>` HTML, a dropped `data-testid` prop, and a few dead code paths (unreachable fallback, stale comment).

### Tests added

~30 tests across `ProjectCreatorModal`, `Project/hooks`, `useProjectImport`, `ProjectImportErrorModal`, `ProjectRemoveModal`, and the dashboard `hooks.ts`, covering the fixes above.
