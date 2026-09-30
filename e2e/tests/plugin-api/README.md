# Plugin API E2E Testing

> End-to-end tests for the Re:Earth Plugin JavaScript API.
> This document covers the full architecture, how to run existing tests, and the
> complete step-by-step process for adding a new API test suite.

---

## Overview

The Plugin API E2E suite verifies that plugin widgets can call `reearth.*` APIs
and that those calls produce observable changes in the Cesium engine. The
infrastructure is designed so:

- **One plugin upload per run** — the unified zip is uploaded once at startup
- **One widget on the scene** — installed once, shared by all suites
- **Zero widget management per suite** — test files only navigate and assert
- **Scale by adding a fragment** — new APIs require a new JS fragment file and
  a new spec file; nothing else changes

---

## Architecture

```
e2e/fixtures/plugins/reearth-api-test/
  camera-test.js          ← fragment: Camera API buttons + handlers
  layers-test.js          ← fragment: Layers API buttons + handlers (future)
  build-plugin.js         ← build script: combines all fragments
  reearth-api-test.js     ← GENERATED — do not edit directly
  reearth.yml             ← single extension: reearth-api-test

e2e/fixtures/plugins/
  reearth-api-test.zip    ← committed zip: reearth.yml + reearth-api-test.js

e2e/tests/plugin-api/
  _setup.ts               ← Playwright setup: create project, upload zip, add widget
  _teardown.ts            ← Playwright teardown: delete shared project
  camera.semantic.spec.ts ← Camera API semantic tests
  camera.visual.spec.ts   ← Camera API visual snapshot tests (future GPU runner)
  README.md               ← this file

e2e/pages/
  pluginFixturePage.ts    ← PluginFixturePage class + createPluginClient helper
  cameraAssertions.ts     ← Camera-specific assertion helpers
  cesiumVisualAssertions.ts ← Canvas snapshot assertion helpers
```

### Full Run Flow

```
Playwright runs --project=plugin-api
│
├── [plugin-api-setup] _setup.ts
│     1. GraphQL: CREATE_PROJECT → projectId
│     2. GraphQL: CREATE_SCENE   → sceneId
│     3. UI: upload reearth-api-test.zip → installs "ReEarth API Test" plugin
│     4. UI: add "ReEarth API Test Widget" → widget on scene (permanent)
│     5. Write { projectId, sceneId } → .auth/plugin-project.json
│
├── [plugin-api] camera.semantic.spec.ts
│     beforeAll:
│       readSharedState()    → { sceneId }
│       navigateToEditor()   → /scene/{sceneId}/map
│       waitForGlobeReady()
│       waitForIframeReady() → wait for "Set Tokyo" button
│       resetToBaseline()
│
│     tests:
│       click iframe button → reearth.camera.setView/flyTo/zoomIn → assert coords
│
│     afterAll:
│       context.close()      ← widget stays; project stays
│
├── [plugin-api] layers.semantic.spec.ts  (future)
│     beforeAll: readSharedState() → navigate → wait for iframe
│     tests: click layer buttons → assert layer state
│     afterAll: context.close()
│
└── [plugin-api-teardown] _teardown.ts
      GraphQL: soft-delete + hard-delete project
      Delete .auth/plugin-project.json
```

Key points:
- Each test suite gets its **own browser context** — Cesium state is fresh per suite
- The widget is installed once and never removed between suites
- State isolation is at the browser-context level, not the widget level

---

## Semantic vs Visual Tests

Each API has two spec files. They test different things and run in different environments.

| | `*.semantic.spec.ts` | `*.visual.spec.ts` |
|-|----------------------|--------------------|
| **What it checks** | The API call produced the correct data value (e.g. camera coordinates) | The Cesium canvas looks correct — pixel comparison against a stored baseline PNG |
| **How it asserts** | `page.evaluate(() => reearth.camera.getGlobeIntersection(...))` — reads lat/lng numbers | `expect(canvas).toMatchSnapshot("name.png")` — compares rendered pixels |
| **Browser** | WebKit (headless) | Chromium with GPU (`--use-gl=egl`, non-headless) |
| **When it runs** | Every CI run — fast, no GPU needed | Only on a dedicated GPU runner — not yet configured |
| **What it catches** | Wrong coordinates, API not responding, message routing broken | Correct coordinates but globe renders with glitch, wrong tile, visual artifact |
| **Playwright project** | `plugin-api` | `chromium-visual` (future) |

**Rule of thumb**: semantic tests are your primary safety net. Visual tests catch the narrow class of bugs where the data is right but the render is wrong — useful once you have a stable GPU runner.

When adding a new API suite, write the semantic spec first. Add a visual spec only if the API has rendering output that semantic assertions cannot verify.

---

## Running Tests

```bash
cd e2e

# Run all plugin-api tests (setup + semantic tests + teardown)
npx playwright test --project=plugin-api

# Debug mode (headed browser)
npx playwright test --project=plugin-api --headed

# Run only specific spec files (setup and teardown still run automatically)
npx playwright test tests/plugin-api/camera.semantic.spec.ts --project=plugin-api
npx playwright test \
  tests/plugin-api/camera.semantic.spec.ts \
  tests/plugin-api/layers.semantic.spec.ts \
  --project=plugin-api

# Run setup only (useful when iterating on a spec without re-uploading the plugin)
npx playwright test --project=plugin-api-setup
```

> `--project=plugin-api` automatically triggers `plugin-api-setup` and
> `plugin-api-teardown`. You do not need to specify them separately.

The widget contains all API buttons. Each spec only interacts with the buttons
it needs and ignores the rest. Specifying a subset of spec files does not
require rebuilding the zip.

---

## Adding a New Plugin API Test Suite

Follow these four steps. You should not need to modify `_setup.ts`,
`_teardown.ts`, or `playwright.config.ts`.

### Step 1 — Write the fragment file

Create `e2e/fixtures/plugins/reearth-api-test/{api}-test.js`:

```js
// Layers API Test Fragment
// API coverage: reearth.layers — add, remove, show, hide
//
// BUILD FRAGMENT — do not call reearth APIs at module level.
// Run `node build-plugin.js` to combine all fragments into reearth-api-test.js.

exports.html = `
  <button id="add-layer">Add Layer</button>
  <button id="remove-layer">Remove Layer</button>
  <script>
    document.getElementById("add-layer").addEventListener("click", function() {
      parent.postMessage({ action: "add-layer" }, "*");
    });
    document.getElementById("remove-layer").addEventListener("click", function() {
      parent.postMessage({ action: "remove-layer" }, "*");
    });
  </script>
`;

exports.onMessage = function(msg) {
  var action = msg.action;
  if (action === "add-layer") {
    reearth.layers.add({ ... });
  } else if (action === "remove-layer") {
    reearth.layers.delete("layer-id");
  }
};
```

Fragment contract:
- `exports.html` — HTML string. Include all buttons and their `<script>` click
  handlers. Button IDs must be globally unique across all fragments.
- `exports.onMessage` — `function(msg)` that handles the action. May freely
  reference `reearth.*` — it runs in the plugin context, not in Node.

### Step 2 — Build and zip

```bash
cd e2e/fixtures/plugins/reearth-api-test

# Regenerate the combined widget JS
node build-plugin.js

# Rebuild the zip (only reearth.yml + reearth-api-test.js go in the zip)
zip -j ../reearth-api-test.zip reearth.yml reearth-api-test.js

# Stage both generated files
git add reearth-api-test.js ../reearth-api-test.zip
```

### Step 3 — Write the spec file

Create `e2e/tests/plugin-api/layers.semantic.spec.ts`.
Use `camera.semantic.spec.ts` as the reference — copy it and change:

| Field | Change to |
|-------|-----------|
| `waitForIframeReady(...)` | First button text in your fragment (e.g. `"Add Layer"`) |
| `test.describe(...)` | `"Layers Plugin API — semantic (webkit)"` |
| Test IDs | `"PLUGIN-LAY-001"`, `"PLUGIN-LAY-002"`, … |
| Assertions | `reearth.layers.*` checks (see Assertions section) |

Minimal spec template:

```typescript
import { PluginFixturePage, ProjectIds } from "@pages/pluginFixturePage";
import { test, BrowserContext, Page } from "@playwright/test";
import { createIAPContext } from "@utils/iap-auth";
import { STORAGE_STATE } from "@/global-setup";

const REEARTH_WEB_E2E_BASEURL = process.env.REEARTH_WEB_E2E_BASEURL;
// ... env guards ...

test.describe.configure({ mode: "serial" });

test.describe("Layers Plugin API — semantic (webkit)", () => {
  let context: BrowserContext;
  let page: Page;
  let pluginFixture: PluginFixturePage;
  let ids: ProjectIds;

  test.beforeAll(async ({ browser }) => {
    context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL ?? "", {
      storageState: STORAGE_STATE
    });
    page = await context.newPage();

    // No GraphQL client — widget is already installed by plugin-api-setup
    pluginFixture = new PluginFixturePage(page);
    ids = PluginFixturePage.readSharedState();

    await pluginFixture.navigateToEditor(ids.sceneId);
    // await cesiumViewer.waitForGlobeReady(); // if needed
    await pluginFixture.waitForIframeReady("Add Layer");
  });

  test.afterAll(async () => {
    await context.close().catch(() => {});
  });

  test("add-layer button adds a layer", async () => {
    test.info().annotations.push({ type: "story", description: "PLUGIN-LAY-001" });
    await pluginFixture.iframe.getByRole("button", { name: "Add Layer" }).click();
    // assert via page.evaluate(() => window.reearth.layers.findById(...))
  });
});
```

### Step 4 — Done

Run `npx playwright test --project=plugin-api` to verify the new spec passes
alongside the existing camera tests.

---

## Fragment File Format

```
e2e/fixtures/plugins/reearth-api-test/
  camera-test.js    ← fragment (committed, hand-written)
  layers-test.js    ← fragment (committed, hand-written)
  build-plugin.js   ← build script (committed)
  reearth-api-test.js   ← generated output (committed — needed for zip)
  reearth.yml           ← single extension declaration (committed)
```

The **build script** (`build-plugin.js`) reads all `*-test.js` files in
alphabetical order, extracts their `html` strings and `onMessage` function
bodies, and writes a single combined `reearth-api-test.js`.

Rules for fragment files:
- Button IDs must be **globally unique** across all fragments (prefix with the
  API name: `set-tokyo`, `add-layer`, not just `add`)
- Message action strings follow the same convention: `"set-tokyo"`, `"add-layer"`
- Do **not** call `reearth.ui.show()` or `reearth.extension.on()` at module level
  — that is the build script's job
- ESLint will warn about `exports` and `reearth` being undefined — this is expected
  since these files are plugin scripts, not Node.js modules

---

## Key Selectors Reference

| Step | Selector | Notes |
|------|----------|-------|
| Plugin settings tab | `[data-testid="project-settings-tab-plugins"]` | |
| Personal sub-tab | `[data-testid="tab-Personal"]` | Default is Marketplace |
| Zip upload trigger | `page.getByText("Zip file from PC")` | Pair with `waitForEvent("filechooser")` |
| Upload confirmation | `page.getByText("ReEarth API Test", { exact: true })` | Wait for list entry, not toast |
| Widget manager panel | `[data-testid="widget-manager-wrapper"]` | Panel's camelCase prop does not render as data-testid |
| Add Widget button | `[data-testid="add-widget-button"]` | |
| Add Widget popup | `[role="menu"][data-floating-ui-focusable]` | Must scope to floating-ui attr — sidebar nav also has role="menu" |
| Installed widgets list | `getByTestId("installed-widgets-list").getByText(name).first()` | List is always in DOM; wait for text, not the container |
| Plugin iframe | `page.frameLocator(".zushi-ui-surface-container iframe")` | No name/title/id on Zushi iframes |

---

## Assertions Reference

### Camera API

```typescript
// Semantic: getGlobeIntersection proves the camera is looking at the right spot
await page.evaluate(() =>
  (window as any).reearth.camera.getGlobeIntersection({ calcViewSize: false })
    ?.center?.lat
);

// CameraAssertions helpers (from cameraAssertions.ts)
await cameraAssertions.expectViewCenterNear(35.681, 139.767, toleranceDeg);
await cameraAssertions.waitUntilNear(lat, lng, toleranceDeg, timeoutMs);
await cameraAssertions.resetToBaseline(); // top-down view, no specific location
```

> `getGlobeIntersection` only returns a value when `pitch === -Math.PI / 2`
> (looking straight down). `setView` and `flyTo` in the fixture always set
> `pitch: -Math.PI / 2` for this reason.

### Layers API (future)

```typescript
await page.evaluate(() =>
  (window as any).reearth.layers.findById("layer-id")?.visible
);
```

### Visual (canvas snapshots)

```typescript
// cesiumVisualAssertions.ts helpers
await cesiumVisual.stabilizeScene();        // freeze timeline + disable sky
await cesiumVisual.waitForCanvasStable(ms); // wait until canvas stops changing
await cesiumVisual.expectCanvasMatchesSnapshot("name.png", testInfo);
```

Visual tests require the `chromium-visual` Playwright project with a GPU runner
— see `camera.visual.spec.ts` for the project config template.

---

## Known Pitfalls

### 1. Plugin upload silently fails without `networkidle`

The upload hook in the app checks `if (!sceneId) return`. If the page is
navigated with `waitUntil: "domcontentloaded"`, Apollo has not yet resolved the
scene query, so `sceneId` is null and the upload is silently skipped.

**Always navigate to the plugins settings page with `waitUntil: "networkidle"`.**

### 2. Two selectors match `role="menu"`

The sidebar nav and the Add Widget popup both have `role="menu"`. Using
`page.getByRole("menu")` causes a strict mode violation.

```typescript
// ✅ Correct
page.locator('[role="menu"][data-floating-ui-focusable]')
// ❌ Wrong — strict mode violation
page.getByRole("menu")
```

### 3. Widget manager's `data-testid` is not in the DOM

The `Panel` component uses a camelCase `dataTestid` prop that React does not
render as an HTML attribute.

```typescript
// ✅ Correct — inner Wrapper styled-div has this testid
page.getByTestId("widget-manager-wrapper")
// ❌ Wrong — never in DOM
page.getByTestId("editor-widgets-widget-manager-panel")
```

### 4. Installed-widgets-list is always in the DOM (even when empty)

Waiting for the list container to be visible passes immediately even when no
widgets are installed. Wait for the widget **name text** instead.

```typescript
// ✅ Correct
page.getByTestId("installed-widgets-list")
  .getByText("ReEarth API Test Widget").first()
  .waitFor({ state: "visible" })
// ❌ Wrong — container is visible even when empty
page.getByTestId("installed-widgets-list").waitFor({ state: "visible" })
```

### 5. Plugin JS must use `reearth.extension.on`, not `reearth.ui.on`

`reearth.ui.on` only supports `"update"` and `"close"` events. Iframe-to-plugin
messages must go through `reearth.extension.on("message", handler)`.

### 6. Button IDs must be globally unique across all fragments

All fragments are combined into a single widget HTML. If two fragments both have
`<button id="add">`, only the first handler will fire. Prefix IDs with the API
name: `camera-set-tokyo`, `layers-add`, etc. (or use the action string as the ID).

### 7. Auth token for GraphQL calls

`createPluginClient` reads `.auth/api-token.json` (written by `api-setup`).
The token expires after ~23 hours. If GraphQL calls fail with 401, re-run:

```bash
npx playwright test --project=api-setup
```

---

## Test ID Naming Convention

```
PLUGIN-{API}-{sequence}
PLUGIN-{API}-VIS-{sequence}   (visual snapshots)
```

| API | Prefix | Example |
|-----|--------|---------|
| Camera | `PLUGIN-CAM` | `PLUGIN-CAM-001` |
| Layers | `PLUGIN-LAY` | `PLUGIN-LAY-001` |
| Scene | `PLUGIN-SCN` | `PLUGIN-SCN-001` |
| Timeline | `PLUGIN-TIM` | `PLUGIN-TIM-001` |
| Viewer | `PLUGIN-VWR` | `PLUGIN-VWR-001` |

Sequence `000` is reserved for the iframe mount smoke test. Start API-specific
tests at `001`.

---

## CI Notes

- Semantic tests (`*.semantic.spec.ts`) — run under the `plugin-api` Playwright
  project (webkit, headless). These are the primary CI tests.
- Visual snapshot tests (`*.visual.spec.ts`) — require a `chromium-visual`
  project with a dedicated GPU runner. Not yet configured; tests are committed
  and will be enabled once the runner is available.
- The `webkit` project in `playwright.config.ts` has `testIgnore:
  /tests\/plugin-api\/.*/` to prevent double-running these tests.
