# Plugin API E2E Tests

Reference guide for writing new plugin API tests. The camera tests are the reference implementation — follow the same pattern for every new API.

---

## Architecture

One shared project and one zip upload per test run. Each API suite adds and removes its own widget.

```
plugin-api-setup (_setup.ts)  — runs once
  → GraphQL: create project + scene
  → UI: upload reearth-api-test.zip
  → writes .auth/plugin-project.json { projectId, sceneId, pluginId }

plugin-api project (all [^_]*.spec.ts files)  — depends on setup
  camera.semantic.spec.ts:
    beforeAll → addWidget("camera-test") → navigate to map → waitForIframeReady
    tests → camera API assertions
    afterAll → removeWidget(widgetId)

  layer.semantic.spec.ts (future, same pattern):
    beforeAll → addWidget("layers-test") → ...
    afterAll → removeWidget(widgetId)

plugin-api-teardown (_teardown.ts)  — auto-runs after plugin-api
  → GraphQL: delete shared project
  → removes .auth/plugin-project.json
```

The `afterAll` widget removal ensures the scene has at most one widget active at a time, keeping the `.zushi-ui-surface-container iframe` selector unambiguous.

---

## Running tests

```bash
cd e2e

# Full plugin-api run (setup → tests → teardown)
npx playwright test --project=plugin-api

# Headed for debugging
npx playwright test --project=plugin-api --headed

# Single spec
npx playwright test tests/plugin-api/camera.semantic.spec.ts --project=plugin-api
```

> `--project=plugin-api` automatically triggers `plugin-api-setup` (and `plugin-api-teardown` after). No need to specify them manually.

---

## How to add a new API test

### Step 1 — Extend the plugin

Edit `e2e/fixtures/plugins/reearth-api-test/reearth.yml` and add an extension:

```yaml
extensions:
  - id: camera-test          # existing
    type: widget
    name: Camera Test Widget
    description: E2E fixture widget for Camera API testing
  - id: layers-test          # new
    type: widget
    name: Layers Test Widget
    description: E2E fixture widget for Layers API testing
```

### Step 2 — Add the JavaScript file

Create `e2e/fixtures/plugins/reearth-api-test/layers-test.js`:

```javascript
reearth.ui.show(`
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
`);

reearth.extension.on("message", function(msg) {
  if (msg.action === "add-layer") {
    reearth.layers.add({ /* ... */ });
  } else if (msg.action === "remove-layer") {
    reearth.layers.remove(msg.layerId);
  }
});
```

> **Always use `reearth.extension.on("message", ...)` — not `reearth.ui.on()`.**
> `reearth.ui.on` only supports `"update"` and `"close"` events.

### Step 3 — Rebuild the zip

```bash
cd e2e/fixtures/plugins/reearth-api-test
zip -j ../reearth-api-test.zip reearth.yml *.js
git add ../reearth-api-test.zip
```

### Step 4 — Write the test file

Create `e2e/tests/plugin-api/layers.semantic.spec.ts`. Copy the structure from `camera.semantic.spec.ts` and change:

- `extensionId` in `addWidget()`: `"layers-test"`
- `waitForIframeReady()` argument: first button text in your widget HTML (e.g. `"Add Layer"`)
- Test IDs: `PLUGIN-LAY-001`, `PLUGIN-LAY-002`, ...
- Assertions: use `page.evaluate(() => window.reearth.layers.findById(id)?.visible)` etc.

**Template beforeAll / afterAll:**

```typescript
test.describe.configure({ mode: "serial" });

test.describe("Layers Plugin API — semantic (webkit)", () => {
  let context: BrowserContext;
  let page: Page;
  let pluginFixture: PluginFixturePage;
  let ids: ProjectIds;
  let widgetId: string;

  test.beforeAll(async ({ browser, request }) => {
    context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL ?? "", {
      storageState: STORAGE_STATE
    });
    page = await context.newPage();

    const client = createPluginClient(request);
    pluginFixture = new PluginFixturePage(page, client);

    ids = PluginFixturePage.readSharedState();
    widgetId = await pluginFixture.addWidget(ids.sceneId, "Layers Test Widget", "layers-test");

    await pluginFixture.navigateToEditor(ids.sceneId);
    await new CesiumViewerPage(page).waitForGlobeReady();
    await pluginFixture.waitForIframeReady("Add Layer");
  });

  test.afterAll(async () => {
    if (widgetId && ids?.sceneId) {
      await pluginFixture.removeWidget(ids.sceneId, widgetId);
    }
    await context.close().catch(() => {});
  });

  // tests go here ...
});
```

> **No changes needed** to `_setup.ts`, `_teardown.ts`, or `playwright.config.ts`.

---

## Selector reference

| Element | Selector | Notes |
|---------|----------|-------|
| Plugins sidebar tab | `[data-testid="project-settings-tab-plugins"]` | |
| Personal sub-tab | `[data-testid="tab-Personal"]` | Default is Marketplace |
| Zip upload trigger | `getByText("Zip file from PC")` | filechooser event |
| Upload confirmation | `getByText("ReEarth API Test", { exact: true })` | Plugin list name |
| Widget manager panel | `[data-testid="widget-manager-wrapper"]` | NOT `widget-manager-panel` — Panel component uses camelCase prop |
| Add Widget button | `[data-testid="add-widget-button"]` | |
| Add Widget popup | `[role="menu"][data-floating-ui-focusable]` | Both popup and sidebar nav have `role="menu"`; the floating-ui attr disambiguates |
| Installed widget list | `getByTestId("installed-widgets-list").getByText(widgetName)` | Container is always in DOM; must scope to text |
| Plugin iframe | `page.frameLocator(".zushi-ui-surface-container iframe")` | No name/title/id on iframe |

---

## Known pitfalls

**Silent upload failure** — the most common cause of flaky setups.

`handleInstallPluginFromFile` has `if (!sceneId) return`. If the page is loaded with `waitUntil: "domcontentloaded"`, Apollo Client's scene query is not yet complete, `sceneId` is null, and the upload is silently dropped.

Fix: always use `waitUntil: "networkidle"` when navigating to the plugins settings page.

---

**Two `role="menu"` elements**

The sidebar nav and the Add Widget floating popup both have `role="menu"`. Using `page.getByRole("menu")` throws a strict-mode violation. Always use:

```typescript
page.locator('[role="menu"][data-floating-ui-focusable]')
```

---

**`installed-widgets-list` is always visible**

The list container exists in the DOM even when empty. Wait for the widget name text inside it:

```typescript
page.getByTestId("installed-widgets-list").getByText("My Widget Name").waitFor(...)
```

---

## Test ID naming

| API | Prefix |
|-----|--------|
| Camera | `PLUGIN-CAM-001` |
| Layers | `PLUGIN-LAY-001` |
| Timeline | `PLUGIN-TIM-001` |
| Scene | `PLUGIN-SCN-001` |
| Viewer | `PLUGIN-VWR-001` |

---

## Assertion patterns

| API | Semantic assertion |
|-----|-------------------|
| Camera | `page.evaluate(() => window.reearth.camera.getGlobeIntersection({ calcViewSize: false })?.center?.lat)` — requires pitch = `-Math.PI/2` |
| Layers | `page.evaluate(() => window.reearth.layers.findById(id)?.visible)` |
| Timeline | Read `window.reearth.timeline.*` properties |
| All | Canvas screenshot comparison (visual tests, `chromium-visual` project) |

API types: `src/app/features/Visualizer/Crust/Plugins/pluginAPI/types/`

---

## Auth notes

- `createPluginClient()` reads `.auth/api-token.json` (resource-owner password grant, written by `api-setup`). This token is required; PKCE tokens from `user.json` are rejected by the API server.
- Token lifetime: ~23h. If expired: `npx playwright test --project=api-setup`
