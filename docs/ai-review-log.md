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

## 2026-09-15 — Signup through the accounts API (server/internal/app/public.go, e2e/api/tests/rest-signup.api.spec.ts)

Started from a `/check-viz-errors` pass over the dev Cloud Run logs, which showed `POST /api/signup` returning 500 twice on every CI run. Tracing it turned up a client bug that had been live since at least November 2025 and an e2e test written loosely enough to hide it.

### Findings & Fixes

1. **Every non-mock signup returned 500** (server/internal/app/public.go)
   - Bug: the accounts gqlclient derives its GraphQL variable *declarations* from the variables map, but `signupMutation`'s struct tag always references `$id` and `$workspaceID` while `repo.go` only adds them to the map when the caller supplies both. A signup without ids sent a document using two undeclared variables, so the accounts API rejected it with 422 in ~300µs, before any resolver ran. `public.go` mapped that to a 500. The path had never worked outside mock auth; local dev never caught it because `UseMockAuth()` short-circuits to `signupMockUser` first.
   - Fix: route to `SignupNoID` (the document that omits both fields, letting the server mint the ids) when either id is empty. The `||` also covers a supplied user id with an empty workspace id, which fails identically — an edge that reearth-flow's otherwise-correct version of this branch still has.

2. **The e2e test asserted whatever happened** (e2e/api/tests/rest-signup.api.spec.ts)
   - Bug: `if (res.status() === 200) { ...assert body... } else { expect([400, 500]).toContain(res.status()) }`. With no outcome that could fail, a permanently broken endpoint stayed green from the test's first commit (2026-03-24) onward. Dev logs show the paired 500s on every run through log retention.
   - Fix: removed the branching; the test now asserts 200 and the returned id/name/email.

3. **Randomly flaky password** (e2e/api/tests/rest-signup.api.spec.ts)
   - Bug: `faker.string.alphanumeric(16)` met the accounts policy (upper + lower + digit) only by chance, so once signup actually worked the test failed intermittently with `password should have numbers`. Surfaced on the first verification run.
   - Fix: append the three required character classes explicitly.

### Notes

- The empty-body case still asserts only `>= 400`. With the fix it reaches a real resolver error (`invalid email`), but `public.go` maps every accounts error to 500 and `ReturnAccountsError` only special-cases 401, so tightening it means string-matching messages. Left for the `pkg/apperr` classifier (VIZ-DEV-81).
- `REEARTH_ACCOUNTS_SIGNUP_SECRET` is unset on dev, so `verifySignupSecret` is a no-op there and signup is ungated once this lands. Raised and consciously accepted.
- No mail is sent by any accounts deployment: `internal/app/repo.go` builds the mailer with an empty config, which falls through to the logger implementation (`mailer: logger is used` in dev logs). So e2e signups cannot bounce today, though that becomes a real constraint if a mailer is ever configured.
- Other callers checked: reearth-flow branches correctly to `SignupNoID`; reearth-dashboard has its own copy of the same mismatch but escapes it because its id fields are value types that stringify non-empty; LINKS-Veda uses a TypeScript REST client and is structurally unaffected; cms, cloud, marketplace and classic have no signup path.

### Tests added

None this round — the existing e2e test was repaired rather than extended. Verified by running the suite 5× with `--retries=0` against a non-mock server wired to the local accounts API (5/5 green), plus `go build`, `go vet`, and the full `go test ./...` (0 failures).
