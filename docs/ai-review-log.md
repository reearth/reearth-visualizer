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

## 2026-08-16 — Project creation modal (web/src/app/features/Dashboard/ContentsContainer/Projects/ProjectModals/ProjectCreatorModal.tsx, hooks.ts)

### Findings & Fixes

1. **Race condition in alias validation** (`ProjectCreatorModal.tsx`)
   - Bug: the debounced alias-validation effect had no guard against out-of-order async responses. If a user typed quickly, an older/slower validation request could resolve *after* a newer one and overwrite its result — e.g. showing "available" for an alias the user no longer has typed.
   - Fix: added a monotonically-increasing request-id ref; a response is only applied if it matches the latest request.

2. **Invalid alias silently showed "idle" instead of "error"** (`ProjectCreatorModal.tsx`)
   - Bug: when the alias was unavailable but the server returned no error description, `aliasStatus` fell through to `"idle"` — no red border, no icon — even though the Apply button stayed correctly disabled. The user had no clue why they couldn't proceed.
   - Fix: `"error"` is now the fallback whenever the alias is non-empty, not loading, and not valid — independent of whether a message string exists.

3. **Modal closed regardless of create success/failure** (`ProjectCreatorModal.tsx`, `hooks.ts`)
   - Bug: `onSubmit` called `onClose?.()` unconditionally right after firing `onProjectCreate`. `handleProjectCreate` in `hooks.ts` awaited the mutation but discarded its `{status}` result and returned nothing — so on failure the user got an error toast while the modal silently closed and their typed input was lost.
   - Fix: propagated success/failure through `handleProjectCreate` → `onProjectCreate` → the modal, which now only closes on success. Added an `isSubmitting` guard on the Apply button since the modal now stays open across the async call.

### Tests added

- `ProjectCreatorModal.test.tsx` (8 tests): Apply-button gating, the invalid-alias-no-message case, the stale-response race (via controlled deferred promises forcing out-of-order resolution), Cancel behavior, successful submit, failed submit (stays open, preserves input), visibility/private-project feature-flag branches.

---

## 2026-08-16 — Import-error and remove modals (web/src/app/features/Dashboard/ContentsContainer/Projects/ProjectModals/ProjectImportErrorModal.tsx, ProjectRemoveModal.tsx, Project/hooks.tsx, useProjectImport.ts)

Both modal components themselves are purely presentational (no state, no async logic); the real bugs lived in the hooks driving them.

### Findings & Fixes

1. **Unpublish not awaited before archiving** (`Project/hooks.tsx`)
   - Bug: `handleProjectRemove` fired `handleProjectPublish(projectId)` (unpublish project + stories) without awaiting it, then immediately archived the project to the Recycle Bin. A published project could land in the Recycle Bin while still live, if the unpublish calls hadn't finished yet.
   - Fix: awaited both the unpublish step and the archive call before closing the modal. Verified by temporarily reverting the fix and confirming the new regression tests failed.

2. **Leaked blob URL and DOM node on every download** (`useProjectImport.ts`)
   - Bug: `handleProjectImportErrorDownload` created a blob URL and an anchor element on every click but never called `URL.revokeObjectURL` or removed the anchor — a resource/DOM leak on repeat use.
   - Fix: revoke the URL and remove the anchor after triggering the click.

3. **Ambiguous poll response reset import progress** (`useProjectImport.ts`)
   - Bug: the status-polling `switch` treated any ambiguous/transient poll response (missing project node, e.g. a refetch hiccup) the same as an explicit `None` status, silently resetting import progress and flickering the "importing…" UI.
   - Fix: only reset on a genuine `None`; otherwise keep the last known status.

4. **Invalid HTML: `<ul>` nested inside a `<p>`** (`ProjectImportErrorModal.tsx`)
   - Bug: surfaced via a React warning while writing tests — a `<ul>` (`CausesList`) was a child of `Typography` (which renders as `<p>`), which is invalid HTML and can cause a hydration mismatch/broken DOM in real browsers.
   - Fix: pulled the list out as a sibling instead of a child.

### Tests added

- `Project/hooks.test.tsx` (5 tests) — unpublish-before-archive ordering (project and stories), skip-when-nothing-published, modal closes only after archiving, no-op on empty projectId.
- `useProjectImport.test.ts` (4 tests) — URL/DOM cleanup, status preserved on ambiguous poll ticks, correct reset on explicit `None`, error-close flow.
- `ProjectModals/ProjectImportErrorModal.test.tsx` (3 tests), `ProjectModals/ProjectRemoveModal.test.tsx` (5 tests) — content rendering and button callbacks.

---

## 2026-08-16 — Dashboard-level Projects hook (web/src/app/features/Dashboard/ContentsContainer/Projects/hooks.ts)

### Findings & Fixes

1. **Cache eviction happened even when archiving failed** (`hooks.ts`)
   - Bug: `handleProjectRemove` called `updateProjectRecycleBin` and then *unconditionally* evicted the project from the Apollo cache and ran GC. Since eviction removes it from the cache `useProjects` reads from, a failed "move to Recycle Bin" mutation still made the project **vanish from the dashboard UI**, even though it was never actually archived on the backend — easy to miss since only a toast told the truth.
   - Fix: cache is now only touched once `updateProjectRecycleBin` reports success; the function returns `false` on any failure.

2. **Unpublish check only covered `"limited"`, not `"published"`** (`hooks.ts`)
   - Bug: `if (project?.status === "limited")` skipped unpublishing for fully published projects. In the normal UI flow this was masked by `Project/hooks.tsx`'s own (now-awaited) unpublish step, but this function is supposed to independently guarantee a project can't be archived while still live.
   - Fix: covers both `"published"` and `"limited"`, and bails out (`return false`) if the unpublish call itself fails.

3. **Propagated success/failure through the whole remove chain** — mirrors the create-project fix: `Project/hooks.tsx`'s `handleProjectRemove` now only closes the Remove modal once archiving actually succeeded (`Project/types.ts`'s `onProjectRemove` now returns `Promise<boolean>`).

### Cleanup

- Removed a dead `?? sortValue` fallback in `handleProjectSortChange` that could never trigger (the early `!value` return already guarantees `value` is truthy).
- Removed pointless `setSearchTerm?.()` optional chaining — it's a plain `useState` setter, never undefined.
- Removed a stale, non-compiling commented-out line in `handleProjectUpdate` (`// if (sortBy) refetch();` — `sortBy` isn't a variable in scope).

### Tests added

- `hooks.test.ts` gained a `"dashboard project remove"` suite (5 tests): archive + evict on success, unpublish for both `"published"` and `"limited"`, and — critically — cache stays untouched when either the unpublish call or the recycle-bin mutation fails. Verified by temporarily reverting the fix and confirming 3/3 targeted tests failed.

---

## 2026-08-16 — Grid/List view items (web/src/app/features/Dashboard/ContentsContainer/Projects/Project/ProjectGridViewItem.tsx, ProjectListViewItem.tsx, hooks.tsx)

### Findings & Fixes

1. **Dead/tautological condition in `handleProjectNameEdit`** (`Project/hooks.tsx`)
   - Bug: `if (selectedProjectId !== project.id || selectedProjectId)` evaluates to `true` in every reachable case (worked through the boolean algebra: whichever combination of match/mismatch/unset, at least one clause is always true). It looked like a guard meant to only deselect when a *different* project was selected, but it always deselected unconditionally.
   - Fix: simplified to what it actually does — always call `onProjectSelect?.(undefined)` — and dropped the now-unused `selectedProjectId` dependency (removed from the hook's `Props` entirely).

2. **Renaming to a blank name** (`Project/hooks.tsx`)
   - Bug: `handleProjectNameBlur` only skipped the update if the new name exactly equaled the old one — clearing the field and blurring submitted an empty name, leaving the card with a blank title until the next refetch.
   - Fix: trims the input and reverts to the original name if it's empty or unchanged after trimming.

3. **No guard against double-submitting Remove** (`Project/hooks.tsx`, both view items)
   - Bug: `ProjectRemoveModal`'s `disabled` prop existed and was wired to the "Remove" button, but neither view item ever passed it a value — nothing stopped repeated clicks while the (now correctly awaited, multi-step) unpublish-then-archive flow was in flight.
   - Fix: added an `isRemovingProject` state in `Project/hooks.tsx`, guarded `handleProjectRemove` against re-entry, and wired `disabled={isRemovingProject}` into both view items.

4. **List view: editing the name could re-select the row** (`ProjectListViewItem.tsx`)
   - Bug: `ListWrapper`'s `onClick` (row selection) wraps the entire row including the rename `TextInput` — clicking inside the input to reposition the cursor bubbled up and re-triggered selection. Grid view didn't have this problem since its click handler only covers the image area — an inconsistency between the two.
   - Fix: wrapped the list view's editing `TextInput` in a div that stops propagation.

5. **Dead `data-testid` prop** (`ProjectRemoveModal.tsx`)
   - Bug: both view items passed `data-testid={...}` to `<ProjectRemoveModal>`, but its `Props` type never declared or forwarded it — TypeScript's special-casing of `data-*` attributes let it compile, but the modal silently dropped it at runtime (never applied to any DOM node).
   - Fix: added the prop to `ProjectRemoveModal`'s `Props` and forwarded it to the underlying `Modal` (as `dataTestid`, matching that component's own prop name).

### Tests added

- None this round (explicitly out of scope for this pass).
