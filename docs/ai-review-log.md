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

---

## 2026-08-19 — Dashboard Recycle Bin and Members (web/src/app/features/Dashboard/ContentsContainer/{RecycleBin,Members}/**, services/api/project/useProjectQueries.ts)

Reviewed both remaining dashboard tabs: the Recycle Bin container hook, grid item and delete-confirmation modal, and the Members list with its add / update-role / remove modals.

### Key fixes

- **Failed mutations were treated as successes.** A failed permanent delete still evicted the project from the Apollo cache, so it vanished from the Recycle Bin while it still existed on the server (`deleteProject` resolves with an error status instead of throwing, so the surrounding `try/catch` never fired). The same pattern ran through Members: remove-member closed its modal before the removal was even awaited, update-role closed regardless of outcome, and add-member reported success on a partial failure and would re-add already-added users on retry. All of these now check the mutation result and only close or touch the cache on success — the same rule applied to the Projects tab on 2026-08-16.
- **The Members tab crashed in development.** Sorting the member list mutated `workspace.members` in place, and Apollo deep-freezes cache results in development — so any workspace with two or more members threw. In production it silently reordered the cache-owned array instead.
- **The last owner of a workspace could be removed or demoted.** The "last owner" rule was implemented as "the visible list has exactly one row", which was wrong in both directions: an owner alongside other members wasn't protected at all, and narrowing the list with the search box made whoever matched unremovable. It now counts actual owners across the full member list.
- **Stale UI state.** The Members search silently reset itself after any member mutation (the filtered list was mirrored in state and re-seeded on every workspace refetch, while the search box still showed the query) — it is now derived rather than mirrored. In the Recycle Bin, a `refetch()` on mount bypassed the query's own `skip` and fired a request with an empty workspace id; the query now uses `cache-and-network`, which keeps the list fresh without that.
- **Missing double-submit guards** on Recycle Bin recover/delete and on all three Members modals, plus a delete confirmation that could be accepted without typing anything when a project had an empty name.
- **Small correctness/cleanup items**: another dropped `data-testid` prop, a modal-visibility toggle used for both opening and closing, a `.filter(Boolean)` that didn't narrow and left defensive null checks scattered downstream, a ref written during render backing a stale warning, a modal that could render "removing member **undefined**", a misspelled prop (`deleteMemer…`) that had propagated across files, and a couple of dead checks.

One item was reclassified rather than fixed as a bug: `UpdateRoleModal` bound its role select to the member's stored role while writing to separate state. A revert-test showed this was not user-visible (the select keeps its own internal state), so it was corrected as a two-sources-of-truth cleanup, not a bug fix.

### Tests added

33 tests across `RecycleBin/hooks` (extended from 4 to 15), `RecycleBin/ProjectDeleteModal`, `Members/index`, `Members/UpdateRoleModal` and `Members/DeleteMemberWarningModal`, covering the fixes above. The cache-eviction, in-place-sort and last-owner fixes were each verified by reverting them and confirming the targeted tests failed.
