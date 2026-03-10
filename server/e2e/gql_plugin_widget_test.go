package e2e

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"io"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/text/language"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestPluginWidgetLifecycle ./e2e/...

func TestPluginWidgetLifecycle(t *testing.T) {
	e := Server(t, baseSeeder)

	// Step 1: Create project + scene + story
	projectId, sceneId, _ := createProjectSet(e)

	// Get initial widget count (scene may have default widgets)
	res := getScene(e, sceneId, language.Und.String())
	initialWidgetCount := int(res.Object().Value("widgets").Array().Length().Raw())

	// Step 2: Add a widget (builtin "reearth" plugin, "button" extension)
	_, sceneWidget := addWidgetMutation(e, uID, map[string]any{
		"type":        "DESKTOP",
		"sceneId":     sceneId,
		"pluginId":    "reearth",
		"extensionId": "button",
	})

	widgetId := getString(sceneWidget, "id")
	assert.NotEmpty(t, widgetId, "widget ID must not be empty")
	sceneWidget.Object().HasValue("pluginId", "reearth")
	sceneWidget.Object().HasValue("extensionId", "button")

	// Step 3: Verify widget was added to scene
	res = getScene(e, sceneId, language.Und.String())
	widgets := res.Object().Value("widgets").Array()
	widgets.Length().IsEqual(initialWidgetCount + 1)
	assertWidgetExists(t, widgets, widgetId, "reearth", "button")

	// Step 4: Update widget position and enable it
	updateWidgetMutation(e, uID, map[string]any{
		"type":     "DESKTOP",
		"sceneId":  sceneId,
		"widgetId": widgetId,
		"enabled":  true,
		"location": map[string]any{
			"zone":    "INNER",
			"section": "LEFT",
			"area":    "MIDDLE",
		},
		"index": 0,
	})

	// Step 5: Verify widget position in align system
	res = getScene(e, sceneId, language.Und.String())
	desktop := res.Path("$.widgetAlignSystem.desktop")
	desktop.Path("$.inner.left.middle.widgetIds[0]").IsEqual(widgetId)

	// Verify widget is enabled
	found := findWidgetById(res.Object().Value("widgets").Array(), widgetId)
	require.NotNil(t, found, "widget must be found in scene")
	assert.Equal(t, true, (*found)["enabled"])

	// Step 6: Export project and verify widget is included
	projectDataPath := Export(t, e, projectId)
	exportData := fetchAndParseExport(t, e, projectDataPath)

	sceneData, hasScene := exportData["scene"].(map[string]any)
	require.True(t, hasScene, "export must contain scene")

	exportWidgets, hasWidgets := sceneData["widgets"].([]any)
	require.True(t, hasWidgets, "export scene must contain widgets")
	assert.Greater(t, len(exportWidgets), 0, "export must have at least one widget")

	// Verify widgetAlignSystems is present (v2 format)
	_, hasWAS := sceneData["widgetAlignSystems"]
	assert.True(t, hasWAS, "export scene must contain widgetAlignSystems")

	// Verify plugins are exported
	_, hasPlugins := exportData["plugins"]
	assert.True(t, hasPlugins, "export must contain plugins")

	// Step 7: Remove the widget
	removeWidgetMutation(e, uID, map[string]any{
		"type":     "DESKTOP",
		"sceneId":  sceneId,
		"widgetId": widgetId,
	})

	// Step 8: Verify widget is removed from scene
	res = getScene(e, sceneId, language.Und.String())
	res.Object().Value("widgets").Array().Length().IsEqual(initialWidgetCount)
	assertWidgetNotExists(t, res.Object().Value("widgets").Array(), widgetId)
	desktop = res.Path("$.widgetAlignSystem.desktop")
	desktop.Path("$.inner.left.middle.widgetIds").Array().Length().IsEqual(0)
}

// go test -v -run TestPluginWidgetMultiple ./e2e/...

func TestPluginWidgetMultiple(t *testing.T) {
	e := Server(t, baseSeeder)

	_, sceneId, _ := createProjectSet(e)

	// Get initial widget count
	res := getScene(e, sceneId, language.Und.String())
	initialWidgetCount := int(res.Object().Value("widgets").Array().Length().Raw())

	// Add two widgets: button and dataAttribution
	_, sw1 := addWidgetMutation(e, uID, map[string]any{
		"type":        "DESKTOP",
		"sceneId":     sceneId,
		"pluginId":    "reearth",
		"extensionId": "button",
	})
	widgetId1 := getString(sw1, "id")

	_, sw2 := addWidgetMutation(e, uID, map[string]any{
		"type":        "DESKTOP",
		"sceneId":     sceneId,
		"pluginId":    "reearth",
		"extensionId": "dataAttribution",
	})
	widgetId2 := getString(sw2, "id")

	assert.NotEqual(t, widgetId1, widgetId2, "widget IDs must be different")

	// Verify both widgets were added
	res = getScene(e, sceneId, language.Und.String())
	widgets := res.Object().Value("widgets").Array()
	widgets.Length().IsEqual(initialWidgetCount + 2)
	assertWidgetExists(t, widgets, widgetId1, "reearth", "button")
	assertWidgetExists(t, widgets, widgetId2, "reearth", "dataAttribution")

	// Place widgets in different positions
	updateWidgetMutation(e, uID, map[string]any{
		"type":     "DESKTOP",
		"sceneId":  sceneId,
		"widgetId": widgetId1,
		"enabled":  true,
		"location": map[string]any{
			"zone":    "INNER",
			"section": "LEFT",
			"area":    "TOP",
		},
		"index": 0,
	})

	updateWidgetMutation(e, uID, map[string]any{
		"type":     "DESKTOP",
		"sceneId":  sceneId,
		"widgetId": widgetId2,
		"enabled":  true,
		"location": map[string]any{
			"zone":    "INNER",
			"section": "RIGHT",
			"area":    "BOTTOM",
		},
		"index": 0,
	})

	// Verify positions
	res = getScene(e, sceneId, language.Und.String())
	desktop := res.Path("$.widgetAlignSystem.desktop")
	desktop.Path("$.inner.left.top.widgetIds[0]").IsEqual(widgetId1)
	desktop.Path("$.inner.right.bottom.widgetIds[0]").IsEqual(widgetId2)

	// Remove first widget, second should remain
	removeWidgetMutation(e, uID, map[string]any{
		"type":     "DESKTOP",
		"sceneId":  sceneId,
		"widgetId": widgetId1,
	})

	res = getScene(e, sceneId, language.Und.String())
	res.Object().Value("widgets").Array().Length().IsEqual(initialWidgetCount + 1)
	assertWidgetExists(t, res.Object().Value("widgets").Array(), widgetId2, "reearth", "dataAttribution")
	assertWidgetNotExists(t, res.Object().Value("widgets").Array(), widgetId1)

	// Remove second widget
	removeWidgetMutation(e, uID, map[string]any{
		"type":     "DESKTOP",
		"sceneId":  sceneId,
		"widgetId": widgetId2,
	})

	res = getScene(e, sceneId, language.Und.String())
	res.Object().Value("widgets").Array().Length().IsEqual(initialWidgetCount)
}

// go test -v -run TestPluginWidgetExport ./e2e/...

func TestPluginWidgetExport(t *testing.T) {
	e := Server(t, baseSeeder)

	projectId, sceneId, _ := createProjectSet(e)

	// Add widget and place it
	_, sw := addWidgetMutation(e, uID, map[string]any{
		"type":        "DESKTOP",
		"sceneId":     sceneId,
		"pluginId":    "reearth",
		"extensionId": "button",
	})
	widgetId := getString(sw, "id")

	updateWidgetMutation(e, uID, map[string]any{
		"type":     "DESKTOP",
		"sceneId":  sceneId,
		"widgetId": widgetId,
		"enabled":  true,
		"location": map[string]any{
			"zone":    "OUTER",
			"section": "CENTER",
			"area":    "TOP",
		},
		"index": 0,
	})

	// Also configure align system settings
	updateWidgetAlignSystemMutation(e, uID, map[string]any{
		"type":    "DESKTOP",
		"sceneId": sceneId,
		"location": map[string]any{
			"zone":    "OUTER",
			"section": "CENTER",
			"area":    "TOP",
		},
		"align":    "CENTERED",
		"centered": true,
		"gap":      10,
	})

	// Export and verify full content
	projectDataPath := Export(t, e, projectId)
	exportData := fetchAndParseExport(t, e, projectDataPath)

	// Verify project
	_, hasProject := exportData["project"]
	require.True(t, hasProject, "export must contain project")

	// Verify scene with widgets
	sceneData, hasScene := exportData["scene"].(map[string]any)
	require.True(t, hasScene, "export must contain scene")

	exportWidgets, hasWidgets := sceneData["widgets"].([]any)
	require.True(t, hasWidgets, "export scene must contain widgets")
	assert.Greater(t, len(exportWidgets), 0, "export must have at least one widget")

	// Find our button widget in the export data
	found := findWidgetInExport(exportWidgets, "button")
	require.NotNil(t, found, "button widget must be in export")
	assert.Equal(t, "reearth", (*found)["pluginId"])
	assert.Equal(t, true, (*found)["enabled"])

	// Verify widgetAlignSystems
	_, hasWAS := sceneData["widgetAlignSystems"]
	require.True(t, hasWAS, "export scene must contain widgetAlignSystems")

	// Verify plugins key exists (builtin "reearth" plugin may not be exported as it's a system plugin)
	_, hasPlugins := exportData["plugins"]
	assert.True(t, hasPlugins, "export must contain plugins key")

	// Verify schemas
	_, hasSchemas := exportData["schemas"]
	assert.True(t, hasSchemas, "export must contain schemas")

	// Verify exportedInfo
	exportedInfo, hasInfo := exportData["exportedInfo"].(map[string]any)
	require.True(t, hasInfo, "export must contain exportedInfo")
	_, hasVersion := exportedInfo["exportDataVersion"]
	assert.True(t, hasVersion, "exportedInfo must contain exportDataVersion")
}

// --- helpers ---

// fetchAndParseExport downloads the export ZIP and extracts project.json
func fetchAndParseExport(t *testing.T, e *httpexpect.Expect, projectDataPath string) map[string]any {
	t.Helper()

	resp := e.GET(projectDataPath).
		Expect().
		Status(200)

	resp.Header("Content-Type").Contains("application/zip")

	b := []byte(resp.Body().Raw())
	require.NotEmpty(t, b, "response body must not be empty")
	require.True(t, bytes.HasPrefix(b, []byte("PK\x03\x04")), "response must be a zip file")

	zr, err := zip.NewReader(bytes.NewReader(b), int64(len(b)))
	require.NoError(t, err)

	var projRaw []byte
	for _, f := range zr.File {
		if f.Name == "project.json" {
			rc, err := f.Open()
			require.NoError(t, err)
			projRaw, err = io.ReadAll(rc)
			rc.Close()
			require.NoError(t, err)
			break
		}
	}
	require.NotEmpty(t, projRaw, "project.json must exist and not be empty in the zip")

	var data map[string]any
	require.NoError(t, json.Unmarshal(projRaw, &data), "project.json must be valid JSON")
	return data
}

// assertWidgetExists checks that a widget with the given ID, pluginId, and extensionId exists in the array
func assertWidgetExists(t *testing.T, widgets *httpexpect.Array, widgetId, pluginId, extensionId string) {
	t.Helper()
	for _, w := range widgets.Iter() {
		obj := w.Object()
		if obj.Value("id").Raw() == widgetId {
			obj.HasValue("pluginId", pluginId)
			obj.HasValue("extensionId", extensionId)
			return
		}
	}
	t.Errorf("widget %s (plugin=%s, ext=%s) not found in scene", widgetId, pluginId, extensionId)
}

// assertWidgetNotExists checks that no widget with the given ID exists in the array
func assertWidgetNotExists(t *testing.T, widgets *httpexpect.Array, widgetId string) {
	t.Helper()
	for _, w := range widgets.Iter() {
		if w.Object().Value("id").Raw() == widgetId {
			t.Errorf("widget %s should not exist in scene but was found", widgetId)
			return
		}
	}
}

// findWidgetById returns the widget map with the given ID, or nil if not found
func findWidgetById(widgets *httpexpect.Array, widgetId string) *map[string]any {
	for _, w := range widgets.Iter() {
		raw := w.Object().Raw()
		if raw["id"] == widgetId {
			return &raw
		}
	}
	return nil
}

// findWidgetInExport finds a widget by extensionId in the exported widget data
func findWidgetInExport(widgets []any, extensionId string) *map[string]any {
	for _, w := range widgets {
		if m, ok := w.(map[string]any); ok {
			if m["extensionId"] == extensionId {
				return &m
			}
		}
	}
	return nil
}
