# Re:Earth Visualizer — E2E Test Framework Onboarding Guide

This guide walks a new contributor through the Playwright-based end‑to‑end (E2E) suite that lives in `e2e/`. It is the single starting point for understanding how UI tests, API/GraphQL tests, authentication (including Google IAP), reporting, and CI are wired together.

---

## 1. What's in this suite

There are **two independent test stacks** sharing one Playwright config:

| Stack | Project name (in `playwright.config.ts`) | Test glob | Auth model | Browser |
|---|---|---|---|---|
| UI E2E | `webkit` | `tests/**/*.spec.ts` | Auth0 login via UI → reused `storageState`; optional Google IAP wrapper | WebKit / Desktop Safari, headless, viewport 1920×1080 |
| API E2E | `api-setup` + `api-tests` | `api/global.setup.ts` and `api/tests/*.api.spec.ts` | Direct Auth0 password grant (or mock header), no browser | None — uses Playwright `APIRequestContext` |

They are both run via `npx playwright test`, just with different `--project` flags. See **Section 7 — Running tests**.

---

## 2. Prerequisites

- **Node.js 24** (matches the CI image; see `.github/workflows/playwright_*.yml`).
- **npm** (lockfile is committed).
- **Google Cloud SDK / `gcloud` CLI** — only needed when the target environment is behind Google IAP and you authenticate with Application Default Credentials. Run `gcloud auth application-default login` once.
- The Playwright WebKit browser binary. Install via `npx playwright install webkit` after `npm install` (the CI image ships browsers preinstalled at `mcr.microsoft.com/playwright:v1.58.2-noble`).

⚠ Note: `package.json` does not include a `postinstall` step, so `npm install` does **not** automatically download browser binaries — you must run `npx playwright install webkit` yourself on a fresh checkout.

---

## 3. Setup

```bash
cd e2e
npm install
npx playwright install webkit
cp env.example .env
# then edit .env
```

### 3.1 Minimum `.env` values

From `env.example` and the code that reads it (`global-setup.ts`, `api/config/env.ts`, `api/tests/auth-utils.ts`, `utils/iap-auth.ts`):

```dotenv
# Required. Credentials are stored in 1Password
REEARTH_WEB_E2E_BASEURL=
REEARTH_E2E_EMAIL=
REEARTH_E2E_PASSWORD=
```

### 3.2 IAP (Google Identity-Aware Proxy)

If the target host is behind IAP (anything other than `localhost`/`reearth.io`/`www.reearth.io` is treated as IAP-protected unless you override), set:

```dotenv
USE_IAP_AUTH=true                # or leave unset to auto-detect by hostname
IAP_AUTH_METHOD=adc              # adc | service-account | id-token
IAP_TARGET_AUDIENCE=<oauth-client-id-of-the-iap-resource>
# Required only when IAP_AUTH_METHOD=service-account:
GOOGLE_SERVICE_ACCOUNT_JSON=<inlined service account JSON>
# Required only when IAP_AUTH_METHOD=id-token:
IAP_ID_TOKEN=<pre-fetched id token>
```

Auto-detection rules (`utils/iap-auth.ts` → `createIAPContext`):

- `localhost` / `127.0.0.1` / `::1` → IAP **off**
- `reearth.io` / `www.reearth.io` → IAP **off**
- Anything else → IAP **on** (default `adc`)

### 3.3 Extra `.env` values for the API stack

```dotenv
# Required. Credentials are stored in 1Password
REEARTH_E2E_AUTH_MODE=auth0      # auth0 | mock

# auth0 mode (this is what CI uses)
REEARTH_E2E_AUTH0_DOMAIN=
REEARTH_E2E_AUTH0_AUDIENCE=
REEARTH_E2E_AUTH0_CLIENT_ID=

# mock mode (used by `npm run test:api:local`)
REEARTH_E2E_MOCK_USER_ID=<server-side debug user id>

# Optional second account for workspace/member tests
REEARTH_E2E_SECOND_USER_EMAIL=...

# Required: base URL for the GraphQL/REST API (e.g. http://localhost:8080). No fallback — env.ts throws if unset.
REEARTH_E2E_API_URL=
```

⚠ Note: `auth0` mode uses Resource Owner Password Credentials (`grant_type=password`) — your Auth0 tenant and client must permit this grant, and the test user must not require MFA.

---

## 4. Folder structure

```
e2e/
├── .auth/                   # Generated at runtime — DO NOT commit (in .gitignore)
│   ├── user.json            # Browser storage state from global-setup (Auth0 cookies/localStorage)
│   └── api-token.json       # { token, extraHeaders } for the GraphQL/REST API stack
├── .claude/settings.local.json
├── api/
│   ├── config/env.ts        # Reads .env; requires REEARTH_E2E_API_URL, derives GRAPHQL_ENDPOINT, AUTH_MODE
│   ├── fixtures/api-test-fixtures.ts   # Playwright `test` extended with a `gqlClient` fixture
│   ├── global.setup.ts      # api-setup project — produces .auth/api-token.json
│   ├── graphql/
│   │   ├── client.ts        # GraphQLClient: query, mutate, multipart uploadFile
│   │   ├── queries.ts       # GET_ME, GET_PROJECTS, GET_ASSETS, …
│   │   └── mutations.ts     # CREATE_PROJECT, UPDATE_PROJECT, DELETE_PROJECT, …
│   └── tests/               # *.api.spec.ts files (one stack per resource)
│       ├── auth-utils.ts    # getAuthToken — Auth0 password grant or mock header
│       └── test-helpers.ts  # generateFakeId (ULID-shaped), getAuthHeaders for REST tests
├── pages/                   # Page Object Model (POM) — one class per screen
├── tests/                   # UI specs (`*.spec.ts`)
├── test-data/               # Static fixtures (Test_Asset_migration.zip, testimage.jpg)
├── test-results/            # Playwright per-test artifacts (failures, screenshots) — gitignored
├── out/allure-results/      # Raw Allure result JSONs — gitignored
├── videos/                  # WebM recordings — gitignored
├── utils/
│   ├── iap-auth.ts          # Entry point: createIAPContext, getIAPToken, makeIAPRequest
│   ├── iap-auth-common.ts   # Shared context factory + route interception with token refresh
│   ├── iap-auth-adc.ts      # ADC (`gcloud auth application-default login`)
│   ├── iap-auth-service-account.ts  # Service account JWT method
│   ├── iap-auth-id-token.ts # Pre-supplied static token method
│   └── project-cleanup.ts   # deleteProjectByName / deleteProjectsByName (afterAll cleanup)
├── env.example
├── global-setup.ts          # Runs once before the `webkit` project; logs into Auth0
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── .prettierrc
└── README.md                # Older short readme — this ONBOARDING.md supersedes it
```

⚠ Note: `utils.ts` at the root is an **empty file** and unused.
⚠ Note: `tests/login.spec.ts.Skip` is intentionally suffixed with `.Skip` so Playwright will not match it (the matcher is `/.*\.spec\.ts/`).

---

## 5. Page Object Model (`pages/`)

Each file exports one class wrapping a page or feature area. The constructor takes the Playwright `Page`, builds `Locator` fields for every element used in tests, and exposes high-level actions (`createNewProject`, `deleteProject`, `addPolygonOnMap`, …).

| Page object | Wraps | Key actions |
|---|---|---|
| `LoginPage` | Auth0 universal-login **and** Lock widget (auto-detects which form is rendered) | `login(email, password)` and form-specific variants |
| `DashBoardPage` | Top-level sidebar, profile menu, starred projects | `logOut()` |
| `ProjectsPage` | Project list/grid views, search, sort, layout toggle, create/rename/delete/import/export | `createNewProject`, `deleteProject`, `starredProject`, `goToProjectPage`, `importProject` |
| `RecycleBinPage` | Recycle bin item menu and delete-confirmation modal | `recoverProject`, `deleteProject`, `confirmDeleteProject` |
| `ProjectScreenPage` | Project editor: scene panel, layers panel, sketch tools, style menus, Cesium canvas drawing | `createNewLayer`, `addPointsOnMap`, `addPolygonOnMap`, `addNewLayerStyle`, `addPolylineStyle` |
| `CesiumViewerPage` | Resium/Cesium canvas — frame navigation tracking, viewer-remount detection, switch toggles | `waitForGlobeReady`, `stampViewerMarker`, `expectViewerNotRemounted`, `toggleSwitch` |
| `DataSourceManagerPage` | Add-layer modal (GeoJSON / CSV / WMS / Vector Tile / 3D Tiles / CZML / KML tabs) | `addGeoJsonFromUrl`, `addGeoJsonFromValue`, `addThreeDTilesCesiumOsm`, `addThreeDTilesFromUrl` |
| `LayerStylePanelPage` | Style sidebar inside the editor | `addPresetStyle`, `selectStyle`, `renameStyle`, `deleteStyle` |
| `PhotoOverlayPage` | Photo Overlay editor and feature inspector | `selectFeatureAndOpenInspector`, `uploadAsset`, `setTransparency`, `submitPhotoOverlay` |
| `ProjectSettingsPage` | Project settings inner pages (General, Readme, License, Story, Public, Assets, Plugins) | `navigateToTab`, per-tab navigators, `verifySidebarTabsVisible` |
| `AccountSettingsPage` | Account inner page + change-password modal | `verifyPageLoaded`, `openPasswordModal` |
| `WorkspaceSettingsPage` | Workspace inner page + delete-workspace modal | `verifyPageLoaded` |
| `MembersPage` | Members table, invite/role/remove flows | `openInviteModal`, `searchMembers`, `openMemberContextMenu`, `getMemberCount` |

### Locator conventions

- Prefer `data-testid` selectors via `page.getByTestId(...)`. The app exposes stable test IDs in many places (`create-project-btn`, `project-grid-item-<name>`, `editor-map-scene-item`, …).
- Fall back to `getByRole`, `getByText`, `getByPlaceholder` for elements without test IDs.
- ⚠ Known DOM quirks (worth remembering when extending POMs):
  - `styled(Typography)` and some `TextInput` components **do not forward** `data-testid`/`dataTestid` to the DOM. The `ProjectsPage` works around this by locating textboxes inside their parent test-ID'd card (`gridProjectTitleInput`, `listProjectTitleInput`).
  - Time/date columns in the project list use the parent column's `-col-` test ID, not the inner `<p>`.

---

## 6. Tests (`tests/` and `api/tests/`)

### 6.1 UI specs (`tests/*.spec.ts`)

All UI specs follow the same skeleton:

1. `test.describe.configure({ mode: "serial" })` — tests share state across cases in the file (e.g., "create project" → "delete project").
2. `test.beforeAll`:
   - `createIAPContext(browser, BASEURL, { storageState: STORAGE_STATE })` (the `STORAGE_STATE` constant is exported from `global-setup.ts`).
   - `page = await context.newPage()`.
   - Instantiate the POM classes.
   - Navigate to `BASEURL` and wait for `[data-testid="sidebar-tab-projects-link"]`.
3. `test.afterEach` — attaches the WebM video to the Allure result.
4. `test.afterAll` — calls `deleteProjectByName` / `deleteProjectsByName` to clean up via GraphQL, then `context.close()`.

#### Spec inventory

| File | What it covers |
|---|---|
| `dashboard.spec.ts` | Dashboard load, project create modal, create/rename/star/delete, recycle bin recover & purge, special-char name. (Import-flow tests are `test.skip`'d — `test_Asset_migration.zip` flow.) |
| `dashboardFeatures.spec.ts` | Search, sort, grid/list views, rename, export |
| `projects.spec.ts` | Full editor entry path: create project → open → add sketch layer → add points/custom properties |
| `projectSettings.spec.ts` | All Project Settings tabs (General/Readme/License/Story/Public/Assets) |
| `accountWorkspaceSettings.spec.ts` | Account settings, workspace settings, change-password modal |
| `members.spec.ts` | Members list, invite flow, role updates, removal |
| `externalLayers.spec.ts` | Data Source Manager — GeoJSON (URL/value), 3D Tiles (Cesium OSM / URL) |
| `layerDeletionReorder.spec.ts` | Layer create/select/delete/rename/reorder |
| `multipleStyles.spec.ts` | Adding multiple preset styles to a layer and switching between them |
| `photoOverlay.spec.ts` | Photo Overlay editor, asset upload, transparency slider, description, delete |
| `page-refresh-on-mutation.spec.ts` | Regression tests that mutations (toggles, sketch creation, etc.) **do not remount the Cesium viewer** — uses `CesiumViewerPage.stampViewerMarker` + frame navigation tracking |
| `login.spec.ts.Skip` | Direct login form tests, currently disabled by filename |

#### Test-data generation

- `faker` (`@faker-js/faker`) is used heavily for project/layer/alias names, ensuring isolation between parallel/sequential runs.
- Static binaries live in `test-data/`: `Test_Asset_migration.zip` (project import) and `testimage.jpg` (photo overlay).

### 6.2 API specs (`api/tests/*.api.spec.ts`)

API tests use a custom Playwright fixture (`api/fixtures/api-test-fixtures.ts`) that hands you a `gqlClient: GraphQLClient`. The client reads its bearer token from `.auth/api-token.json`, written by the `api-setup` project (`api/global.setup.ts`).

`GraphQLClient` exposes:

- `query(op, variables)` / `mutate(op, variables)` — JSON POST to `${GRAPHQL_ENDPOINT}`.
- `execute` — lower-level call that returns raw status + body.
- `uploadFile(mutation, variables, buffer, name, mime, fileVariablePath)` — hand-rolled `multipart/form-data` for GraphQL file uploads (used by asset/icon tests).

Spec inventory includes: `project-lifecycle`, `project-crud-extended`, `asset-management`, `icon-asset`, `geojson-feature`, `layer-infobox`, `move-story`, `plugin`, `property-operations`, `property-schema`, `published-endpoints`, `storytelling`, `style`, `widget`, `workspace-management`, and REST tests (`rest-ping-health`, `rest-signup`, `rest-assets-download`, `rest-export-download`, `rest-split-import`).

`generateFakeId()` in `test-helpers.ts` produces structurally-valid-but-nonexistent ULIDs for negative-path tests (server treats them as not-found rather than malformed).

---

## 7. Running tests

All npm scripts (`package.json`):

| Script | What it does |
|---|---|
| `npm run test:ui` | Removes `./out` and runs the `webkit` UI project (this is what CI runs). |
| `npm run test:local` | Same as above with `REEARTH_WEB_E2E_BASEURL=http://localhost:3000`. |
| `npm run test:api` | Runs `api-setup` + `api-tests` with `SKIP_STORAGE_STATE=true` (skips browser global setup). |
| `npm run test:api:local` | Same as `test:api` but forces `REEARTH_E2E_AUTH_MODE=mock` and `BASEURL=http://localhost:3000` — for running API tests against a local server with debug user header. |
| `npm run allure:generate` | Generates a static Allure HTML report from `./out/allure-results`. |
| `npm run allure:serve` | Serves the report on port 8080. |
| `npm run lint` / `npm run fix` / `npm run format` | ESLint and Prettier. |

### Direct Playwright invocations

```bash
# Run only one UI spec
npx playwright test --project=webkit tests/dashboard.spec.ts

# Run a single test by title
npx playwright test --project=webkit -g "Verify dashboard is loaded"

# Headed/interactive (override the project's headless:true)
npx playwright test --project=webkit --headed

# Run just one API spec
SKIP_STORAGE_STATE=true npx playwright test --project=api-setup --project=api-tests api/tests/project-lifecycle.api.spec.ts
```

⚠ Note: Workers is hard-coded to `5` in `playwright.config.ts` but `fullyParallel` is `false` and every spec sets `mode: "serial"` internally, so tests within one file run sequentially even though multiple files run in parallel.

### Playwright config highlights (`playwright.config.ts`)

- `timeout: 120000` per test, `expect.timeout: 35000`, `actionTimeout: 35000`, `navigationTimeout: 35000`.
- `retries: 1` in CI, `0` locally; `trace: "on-first-retry"`.
- `webkit` project: `slowMo: 200`ms, `screenshot: "only-on-failure"`, 1920×1080.
- Reporter is `allure-playwright` only (results in `./out/allure-results`). There is **no built-in HTML reporter configured** — use `npm run allure:serve` to view results.

---

## 8. Authentication deep dive

### 8.1 UI: browser auth

```
global-setup.ts
  └─ launches webkit
     └─ createIAPContext (wraps newContext with IAP route interception if needed)
        └─ navigate to BASEURL
        └─ if not already on dashboard: LoginPage.login(email, password)
        └─ wait for [data-testid="projects-manager-wrapper"] and [data-testid="profile-wrapper"]
        └─ context.storageState({ path: .auth/user.json })
```

Subsequent test files reuse `.auth/user.json` (the `webkit` project's `use.storageState`), so the Auth0 cookie/localStorage entries are restored and login is skipped.

The `LoginPage` auto-detects two Auth0 form variants (Universal Login vs. Lock Widget) before filling credentials.

### 8.2 UI: IAP wrapper (`utils/iap-auth-common.ts`)

When IAP is enabled, `createIAPBrowserContext` returns a `BrowserContext` that:

- Sets `Proxy-Authorization: Bearer <id-token>` as an extra HTTP header initially.
- Installs `context.route("**", …)` that, for `document/xhr/fetch` requests to the protected host, **re-fetches** the request with a fresh ID token and fulfills the route from that response. Non-protected hosts (`auth0.com`, `googleapis.com`, `accounts.google.com`) are allowed through unmodified.
- Retries once with a forced token refresh on 401/Unauthorized.
- Records video at 1280×720 into `videos/`.

The three token providers all expose `getIdToken()` / `forceRefresh()`:

- **ADC** (`iap-auth-adc.ts`) — uses `google-auth-library` `GoogleAuth.getIdTokenClient(audience)`. Caches token 55 minutes. Requires `gcloud auth application-default login` on dev machines.
- **Service account** (`iap-auth-service-account.ts`) — JWT-signs and calls `fetchIdToken(audience)`.
- **ID token** (`iap-auth-id-token.ts`) — uses `process.env.IAP_ID_TOKEN` verbatim, no refresh.

### 8.3 API: bearer token

`api/global.setup.ts` writes `.auth/api-token.json` like `{ token, extraHeaders }`:

- `AUTH_MODE=auth0` — preferred path: reads the Auth0 `access_token` out of the existing `.auth/user.json` storage state (key starts with `@@auth0spajs@@`). If not found, falls back to a password-grant request to `https://${AUTH0_DOMAIN}/oauth/token`.
- `AUTH_MODE=mock` — produces `{ token: "test", extraHeaders: { "X-Reearth-Debug-User": MOCK_USER_ID } }`. The server must run with debug-user support.

Both `api/fixtures/api-test-fixtures.ts` and the REST helper `test-helpers.ts → getAuthHeaders()` read from this same file.

### 8.4 API: GraphQL endpoint resolution

`api/config/env.ts`:

- `REEARTH_E2E_API_URL` is **required** — `env.ts` throws `Missing REEARTH_E2E_API_URL` at load time if it's unset. There is no fallback derived from `REEARTH_WEB_E2E_BASEURL`.
- `API_BASE_URL` = `REEARTH_E2E_API_URL` with any trailing slash stripped.
- `GRAPHQL_ENDPOINT` = `${API_BASE_URL}/api/graphql`. REST tests use `API_BASE_URL` directly.

---

## 9. Project cleanup

`utils/project-cleanup.ts` is called from each spec's `afterAll`. It:

1. Looks up an auth token from `.auth/api-token.json` **or** from `.auth/user.json` (Auth0 `access_token`), so cleanup works whether the API or UI project ran first.
2. `GET_ME` → workspace ID.
3. Searches both active projects (`GET_PROJECTS`) and the recycle bin (`GET_DELETED_PROJECTS`) for matches by exact name.
4. Soft-deletes (`UPDATE_PROJECT` with `deleted: true`), then permanently deletes (`DELETE_PROJECT`).
5. Logs warnings on failure rather than throwing — cleanup is best-effort and never fails the test run.

When you add a new spec that creates projects, call `deleteProjectByName(page.request, projectName)` (or `deleteProjectsByName(...)` for multiple) in `afterAll`.

---

## 10. Workflows / typical test recipes

### Adding a new UI test for an existing screen

1. Add or update a class under `pages/` if the screen lacks locators you need. Prefer adding test IDs in the app code over brittle CSS selectors.
2. Create a new `tests/<feature>.spec.ts`. Use this skeleton:

   ```ts
   import { faker } from "@faker-js/faker";
   import { test, expect, BrowserContext, Page } from "@playwright/test";
   import { STORAGE_STATE } from "../global-setup";
   import { DashBoardPage } from "../pages/dashBoardPage";
   import { ProjectsPage } from "../pages/projectsPage";
   import { createIAPContext } from "../utils/iap-auth";
   import { deleteProjectByName } from "../utils/project-cleanup";

   const BASEURL = process.env.REEARTH_WEB_E2E_BASEURL!;
   const projectName = faker.string.alpha(15);

   test.describe.configure({ mode: "serial" });
   test.describe("My feature", () => {
     let context: BrowserContext; let page: Page;
     test.beforeAll(async ({ browser }) => {
       context = await createIAPContext(browser, BASEURL, { storageState: STORAGE_STATE });
       page = await context.newPage();
       await page.goto(BASEURL, { waitUntil: "domcontentloaded" });
       await page.waitForSelector('[data-testid="sidebar-tab-projects-link"]', { timeout: 15000 });
     });
     test.afterAll(async () => {
       await deleteProjectByName(page.request, projectName);
       await context.close();
     });
     // ...tests
   });
   ```
3. Validate locally: `npm run test:local` (when the visualizer dev server is on `localhost:3000`) or `npm run test:ui` against dev.

### Adding a new API/GraphQL test

1. Add the query/mutation string to `api/graphql/queries.ts` or `api/graphql/mutations.ts`.
2. Create `api/tests/<resource>.api.spec.ts`:

   ```ts
   import { test, expect } from "../fixtures/api-test-fixtures";
   import { GET_ME } from "../graphql/queries";

   test("auth works", async ({ gqlClient }) => {
     const { status, data } = await gqlClient.query<{ me: { id: string } }>(GET_ME);
     expect(status).toBe(200);
     expect(data.me.id).toBeTruthy();
   });
   ```
3. Run: `npm run test:api`.

---

## 11. Reporting

- **Allure** is the primary reporter. Every test run writes JSON into `./out/allure-results`.
- Locally: `npm run allure:generate` then `npm run allure:serve` (port 8080).
- In CI: the two workflows push the generated HTML report into a GCS bucket (`reearth-oss-visualizer-allure-reports`) keyed by run ID, and maintain a top-level `index.json` listing the last 50 runs.
- Test videos are recorded for **every** test (not only failures) and attached to the Allure result in `afterEach`. They accumulate in `videos/` (gitignored).
- Screenshots: `screenshot: "only-on-failure"` for the `webkit` project; global setup additionally saves `global-setup-error.png` if login fails.

---

## 12. CI / GitHub Actions

Two workflows in `.github/workflows/`:

### `playwright_ui_tests.yml`
- Triggers: `workflow_dispatch` and `workflow_call`. **No automatic trigger** on push or PR — it must be invoked manually or by another workflow.
- Container: `mcr.microsoft.com/playwright:v1.58.2-noble`.
- Runs `npm run test:ui` against `inputs.url || secrets.REEARTH_WEB_E2E_BASEURL`.
- Forces `USE_IAP_AUTH=false` (CI runs against an environment that does not require IAP, or behind a tunnel that handles it).
- Authenticates to GCS via Workload Identity Federation, uploads the Allure report and updates `index.json`.

### `playwright_api_tests.yml`
- Triggers: `workflow_dispatch` and `pull_request` on paths under `server/**`, `e2e/api/**`, `e2e/playwright.config.ts`, `e2e/package*.json`, and the workflow file itself.
- Same container/runner setup as the UI workflow, but runs `npm run test:api` and uploads the report under a `${run_id}-api` key.

⚠ Note: Because UI tests have no PR trigger, they will not run automatically on a code change unless another workflow calls `playwright_ui_tests.yml`. If you want UI coverage on a PR, add a `pull_request:` trigger here.

---

## 13. Debugging tips

| Symptom | Where to look |
|---|---|
| Global setup fails | `test-results/global-setup-error.png` (saved by `global-setup.ts`); also check `.auth/user.json` exists and isn't stale. If you've rotated the test account password, delete `.auth/user.json` to force re-login. |
| API tests fail with 401 | Inspect `.auth/api-token.json`. For `auth0` mode it expires (typically 24h on this tenant). Delete it and re-run `api-setup`. For `mock` mode confirm the server allows `X-Reearth-Debug-User`. |
| IAP 401 in CI | The workflows set `USE_IAP_AUTH=false`. If you need IAP in CI, set Workload Identity and `IAP_TARGET_AUDIENCE` and switch the env. |
| Cesium viewer never appears | `ProjectScreenPage.createNewLayer` and `CesiumViewerPage.waitForGlobeReady` already wait, but WebKit's WebGL renderer is fragile — see the comment in `projectScreenPage.ts:213` about preferring the `Default` preset over cascading style submenus, which crash WebKit in CI. |
| Tests pass locally but flake in CI | Inspect the run-specific Allure report in GCS; videos are attached to each test. Re-run with `retries: 1` to confirm flake vs. real failure. |
| Want a Playwright trace | Run with `--trace on` or `--trace retain-on-failure` from the CLI. The config sets `trace: "on-first-retry"` only. |
| Want to see what selectors exist | `npx playwright codegen <url>` against a local environment is the fastest way to discover test IDs. |

### Interactive debugging

```bash
# Open the Playwright UI inspector
PWDEBUG=1 npx playwright test --project=webkit tests/dashboard.spec.ts

# Step-through with the headed browser
npx playwright test --project=webkit --headed --debug -g "Verify dashboard is loaded"

# Show the last failure's trace
npx playwright show-trace test-results/<run-folder>/trace.zip
```

---

## 14. Conventions & best practices observed in the suite

- **Page Object Model**: never put raw selectors in `*.spec.ts` files — extend the matching page object.
- **Serial mode + shared `page`**: tests in one file mutate state; rely on order. Don't refactor to `mode: "parallel"` without untangling the shared project name.
- **Faker for names**: every spec creates unique resources with `faker.string.alpha`, `faker.lorem.words`, etc., so parallel runs across files don't collide.
- **Cleanup is API-driven**: never depend on the UI delete flow to clean up — call `deleteProjectByName` in `afterAll`. It works even when the UI test left things in a half-broken state.
- **Waits**: lots of `waitForTimeout` calls exist for canvas/Cesium operations. The Cesium viewer is animated and lacks deterministic ready events, so explicit sleeps are used after `canvas.click` and after style mutations. When writing new tests, prefer `waitForSelector`/`expect(...).toBeVisible({ timeout })` for DOM elements and reserve sleeps for canvas interactions.
- **WebKit-specific care**: cascading submenus that trigger Cesium re-renders can crash WebKit. The existing helpers (`addNewLayerStyle` in `projectScreenPage.ts`) intentionally pick simpler menu paths.
- **Avoid hard URLs**: navigate via UI (sidebar/profile-menu) when possible — see the memory note that SPA routes like `/settings/account` return 404 from the server because there's no SPA fallback.
- **Don't commit `.auth/`**: already gitignored. Don't paste tokens into the repo.

---