# E2E Test Suite — AI Management Rules

This file governs how AI (Claude) should read, write, and reason about the E2E test suite under `e2e/`. Read it in full before making any changes to tests, pages, or utilities.

---

## 1. Project Overview

This is a **Playwright E2E test suite** for Re:Earth Visualizer. Tests run against a live staging environment with real auth and real GraphQL API calls.

**Key facts:**
- Runtime: **WebKit headless** (`Desktop Safari`) — the only browser in CI
- Execution: **serial mode**, 2 workers, retries: 2 (CI) / 1 (local)
- Timeouts: default 120s per test, action/navigation 35s, expect 35s
- Auth: Auth0 storage state pre-loaded via `global-setup.ts`
- Config: `playwright.config.ts` — **do not modify** (managed separately)
- `global-setup.ts` — **do not modify** (managed via separate PR)

---

## 2. Directory Structure

```
e2e/
├── tests/              # All spec files (*.spec.ts)
├── pages/              # Page Object Model classes
├── utils/              # Shared helpers (auth, cleanup, constants)
├── api/                # GraphQL API test suite (separate project)
├── global-setup.ts     # Auth setup — DO NOT EDIT
├── global-teardown.ts  # Post-run cleanup
└── playwright.config.ts
```

**Spec files:**

| File | Feature Area | Notes |
|------|-------------|-------|
| `dashboard.spec.ts` | Dashboard, Recycle Bin | Full lifecycle |
| `dashboardFeatures.spec.ts` | Project Features | Search, sort, view, rename, export |
| `projectSettings.spec.ts` | Project Settings | All tabs (General/README/License/Story/Public/Assets) |
| `projects.spec.ts` | Editor | Layer creation, map interaction |
| `accountWorkspaceSettings.spec.ts` | Account & Workspace | **Entire suite skipped** — EE Config |
| `members.spec.ts` | Members Management | Conditionally skipped — Feature Flag |
| `layerDeletionReorder.spec.ts` | Layer Management | **Entire suite skipped** — WebKit DnD |
| `multipleStyles.spec.ts` | Layer Styles | Fully automated |
| `externalLayers.spec.ts` | External Layers | Mixed — some CI-skipped |
| `photoOverlay.spec.ts` | Photo Overlay | Mixed — some CI-skipped |
| `page-refresh-on-mutation.spec.ts` | Editor Mutations | **Entire suite skipped** — Canvas API |

---

## 3. User Story Database

All stories are tracked in the internal project management tool (see team wiki for the link).

- **Story ID format:** `US-{AREA}-{seq}` — e.g. `US-DASH-001`, `US-EDIT-003`
- **Feature Areas:** DASH · RBIN · PFEAT · PSET · EDIT · LAYER · STYLE · EXTL · PHOTO · MEM · ACCT · AUTH · STORY · PUB · PLUG

### Key fields

| Field | Purpose |
|-------|---------|
| `Story ID` | Stable reference. Use this in AI prompts and Allure annotations. |
| `Automation Status` | `Automated` / `Partial` / `Manual Only` / `Skipped (CI)` / `TODO` |
| `Skip Reason` | Root cause when skipped: `WebKit DnD` / `EE Config` / `Feature Flag` / `Canvas API` / `Not Yet Implemented` |
| `Spec File` | e.g. `tests/dashboard.spec.ts` |
| `Test Names` | Exact `test("...")` strings, one per line — used to link CI failures back to stories |
| `Acceptance Criteria` | Given/When/Then bullets. Each bullet = one `expect()` assertion. |
| `Manual Test Protocol` | Step-by-step instructions for `Manual Only` or `Skipped (CI)` stories |

### Automation Status lifecycle

```
TODO  ──(tests written)──►  Automated
                             │
              (suite skipped)▼
                         Skipped (CI)
                             │
              (flag enabled) ▼
                          Automated
```

---

## 4. How to Use Stories Day-to-Day

### Connecting test code to stories

Every test should carry its Story ID as an Allure annotation so that CI failures link directly to the story:

```typescript
test("Verify dashboard is loaded", async ({ page }) => {
  test.info().annotations.push({ type: "story", description: "US-DASH-001" });
  // ...
});
```

When CI fails, the Allure report shows the Story ID. Go to Notion, search that ID → open the story → read Acceptance Criteria to understand exactly what broke.

**Example — CI failure to story in three steps:**

```
FAIL  tests/dashboard.spec.ts
  ✗ Verify dashboard is loaded          ← test name
    Expected sidebar-tab-projects-link visible
    Received: timeout 35000ms
```

1. Allure report shows annotation `US-DASH-001`
2. Open Notion → search `US-DASH-001`
3. Acceptance Criteria reads: *"Given logged in, When visiting Dashboard URL, Then Projects nav entry is visible"* — now you know the failure scope is auth/navigation, not maps or data

Or ask AI directly:
> "US-DASH-001 failed in CI with `sidebar-tab-projects-link timeout`. Help me debug."

AI will look up the story's Acceptance Criteria, Spec File, and recent context without needing further explanation.

### Writing a new test from a story

1. Find a story with `Automation Status = TODO`
2. Read its `Acceptance Criteria` — each bullet becomes one `expect()` call
3. Write the test; add the Story ID annotation
4. Update the story: set `Automation Status → Automated`, fill in `Spec File` and `Test Names`

### Adding a story for a new feature (manual trigger)

When a new feature lands — via PR or code change — ask AI to generate the story:

> "Scan the PR / scan `src/app/features/newFeature/` and generate a new user story for this feature."

AI will:
- Read the feature code or PR diff
- Draft a story with Story ID, User Story, Acceptance Criteria, and `Automation Status = TODO`
- Create it in the Notion V5 database

Review the draft and adjust before writing tests.

### Asking AI to implement a story

> "Implement US-PFEAT-009 — write the Playwright test."

AI will:
1. Look up the story in Notion
2. Map each Acceptance Criteria bullet to a `expect()` assertion
3. Use the correct POM class from `pages/`
4. Add the Allure annotation with the Story ID
5. Propose the Spec File to add it to

---

## 5. Known CI Limitations — Skip Patterns

These are structural constraints, **not bugs**. Do not attempt to "fix" them without understanding the root cause.

### 5a. WebKit DnD — `layerDeletionReorder.spec.ts`
- **Root cause:** SortableJS uses HTML5 `DragEvent` API, incompatible with headless WebKit
- **Scope:** Entire `test.describe.skip`
- **Resolution path:** Requires Chromium runner or a custom drag simulation utility

### 5b. EE Config — `accountWorkspaceSettings.spec.ts`
- **Root cause:** EE build redirects settings UI to an external URL via `externalAccountManagementUrl` feature flag
- **Scope:** Entire suite `test.skip`

### 5c. Feature Flag — `members.spec.ts`
- **Root cause:** `membersManagementOnDashboard` flag controls Members tab visibility
- **Pattern:** `test.skip(!membersTabVisible, "Members tab not visible in this environment")`
- **Do not** remove the conditional skip — it protects non-EE deployments

### 5d. Canvas API — `page-refresh-on-mutation.spec.ts`
- **Root cause:** Cesium canvas rendering assertions are unreliable in headless WebKit

### 5e. External Network / Not Yet Implemented
- Sketch tools, GeoJSON URL sources, 3D Tiles URL — skip with `test.skip(true, "...")`

---

## 6. Page Object Model (POM)

All UI interactions should go through POM classes in `pages/`. Avoid writing raw `page.locator()` calls directly in spec files; if an existing spec already uses one, do not introduce more — add the selector to the relevant POM class instead.

| Class | File | Covers |
|-------|------|--------|
| `DashBoardPage` | `dashBoardPage.ts` | Sidebar, workspace nav |
| `ProjectsPage` | `projectsPage.ts` | Project grid, create/menu |
| `ProjectSettingsPage` | `projectSettingsPage.ts` | All settings tabs |
| `RecycleBinPage` | `recycleBinPage.ts` | Recycle bin UI |
| `MembersPage` | `membersPage.ts` | Members tab |
| `AccountSettingsPage` | `accountSettingsPage.ts` | Account settings |
| `WorkspaceSettingsPage` | `workspaceSettingsPage.ts` | Workspace settings |
| `ProjectScreenPage` | `projectScreenPage.ts` | Editor/canvas |
| `CesiumViewerPage` | `cesiumViewerPage.ts` | Map viewer |
| `DataSourceManagerPage` | `dataSourceManagerPage.ts` | External layers |
| `LayerStylePanelPage` | `layerStylePanelPage.ts` | Style panel |
| `PhotoOverlayPage` | `photoOverlayPage.ts` | Photo overlay |
| `LoginPage` | `loginPage.ts` | Login flow |

**Rules:**
- Add new selectors to the relevant POM, not inline in tests
- Prefer `data-testid` attributes; fall back to `role` → `text` → CSS
- New features need a corresponding POM before writing spec tests

---

## 7. Test Data & Cleanup

- All test-created projects must be prefixed `e2e-`: `const projectName = "e2e-" + faker.lorem.words(2)`
- `global-teardown.ts` deletes all `e2e-*` projects after the run
- `cleanupStaleE2eProjects()` runs in global setup to clear leftovers from crashed runs
- Recycle bin auto-cleared when count ≥ 16 (prevents recycle bin test failures)
- Always use `faker` for unique project names/aliases — never hardcode
- Every test that creates data must clean up in `afterAll`

---

## 8. Auth & Context

- Storage state at `.auth/user.json` (written by `global-setup.ts`)
- IAP environments: use `utils/iap-auth.ts` → `createIAPContext(browser, baseUrl, { storageState })`
- **Never** commit `.auth/` or `.env` files

---

## 9. Writing New Tests

```typescript
test.describe.configure({ mode: "serial" });

test.describe("FEATURE — Scenario Group", () => {
  test.beforeAll(async ({ browser }) => { /* setup context + POMs */ });
  test.afterAll(async () => { await context.close(); });

  test("Setup: create prerequisites", async () => { /* ... */ });

  test("Core: feature behavior", async () => {
    test.info().annotations.push({ type: "story", description: "US-XXXX-000" });
    // assertions map 1:1 to Acceptance Criteria bullets
  });

  test("Cleanup: remove test data", async () => { /* ... */ });
});
```

**Valid skip reasons:**
- `WebKit DnD` — SortableJS / HTML5 drag events
- `External Network` — test requires external URL
- `Feature Flag` — feature disabled in CI
- `EE Config` — behavior differs in Enterprise Edition
- `Canvas API` — Cesium canvas unreliable in headless WebKit
- `Not Yet Implemented` — UI feature not yet available in test env

---

## 10. Common Pitfalls

| Pitfall | Correct approach |
|---------|-----------------|
| `page.waitForTimeout(ms)` everywhere | Use `waitFor({ state })` or `toBeVisible()` instead |
| Raw selectors in spec files | Move to POM; use `data-testid` |
| Tests depend on prior test state | Use `beforeAll` setup; each describe block self-contained |
| Missing cleanup | Every test that creates a project must clean up in `afterAll` |
| Modifying `global-setup.ts` | Managed via separate PR — do not touch |
| Writing raw GraphQL in spec files | Use `utils/project-cleanup.ts` or `api/graphql/client.ts` |
| No Story ID annotation on test | Add `test.info().annotations.push(...)` so CI failures link to stories |

---

## 11. PR Guidelines

- Scope each PR narrowly — one feature or one bug fix
- Do not bundle spec changes with POM refactors
- Run `npx playwright test --project=webkit <spec-file>` locally before submitting
- Tag PRs that add `test.skip` with the skip reason documented in the skip message
- After merging a PR that adds new tests: update the corresponding story's `Automation Status`, `Spec File`, and `Test Names` in Notion

---

## 12. Environment Variables

| Variable | Purpose |
|----------|---------|
| `REEARTH_WEB_E2E_BASEURL` | Target application URL |
| `REEARTH_E2E_USER_EMAIL` | Test user email |
| `REEARTH_E2E_USER_PASSWORD` | Test user password |
| `SKIP_STORAGE_STATE` | Set to `true` to skip auth setup (debugging) |

Never commit `.env`. Use `env.example` as template.
