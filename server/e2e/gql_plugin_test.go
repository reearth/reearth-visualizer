package e2e

import (
	"archive/zip"
	"bytes"
	"fmt"
	"os"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/text/language"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestPluginUploadAndQuery ./e2e/...

func TestPluginUploadAndQuery(t *testing.T) {
	e := Server(t, baseSeeder)
	_, sceneId, _ := createProjectSet(e)

	// Step 1: Upload a plugin
	pluginZipPath := buildTestPluginZip(t, "testplugin", "1.0.0")
	res := uploadPluginMutation(e, sceneId, pluginZipPath)

	pluginData := res.Path("$.data.uploadPlugin.plugin").Object()
	pluginId := pluginData.Value("id").String().Raw()
	assert.NotEmpty(t, pluginId)
	pluginData.HasValue("name", "Test Plugin")
	pluginData.HasValue("version", "1.0.0")
	res.Path("$.data.uploadPlugin.scene.id").IsEqual(sceneId)
	res.Path("$.data.uploadPlugin.scenePlugin.pluginId").IsEqual(pluginId)

	// Step 2: Verify plugin extensions
	extensions := pluginData.Value("extensions").Array()
	extensions.Length().IsEqual(2)

	extIds := make([]string, 0)
	for _, ext := range extensions.Iter() {
		extIds = append(extIds, ext.Object().Value("extensionId").String().Raw())
	}
	assert.Contains(t, extIds, "test-widget")
	assert.Contains(t, extIds, "test-story-block")

	// Step 3: Query single plugin by ID
	qRes := queryPlugin(e, pluginId)
	qPlugin := qRes.Path("$.data.plugin").Object()
	qPlugin.HasValue("id", pluginId)
	qPlugin.HasValue("name", "Test Plugin")
	qPlugin.HasValue("version", "1.0.0")
	qPlugin.Value("extensions").Array().Length().IsEqual(2)

	// Step 4: Query multiple plugins by IDs (uploaded + builtin)
	qsRes := queryPlugins(e, []string{pluginId, "reearth"})
	qsRes.Path("$.data.plugins").Array().Length().IsEqual(2)
}

// go test -v -run TestPluginQueryBuiltin ./e2e/...

func TestPluginQueryBuiltin(t *testing.T) {
	e := Server(t, baseSeeder)
	_, _, _ = createProjectSet(e)

	// Query builtin "reearth" plugin
	res := queryPlugin(e, "reearth")
	plugin := res.Path("$.data.plugin").Object()
	plugin.HasValue("id", "reearth")
	plugin.Value("name").String().NotEmpty()
	plugin.Value("extensions").Array().NotEmpty()
}

// go test -v -run TestPluginUploadVerifyInScene ./e2e/...

func TestPluginUploadVerifyInScene(t *testing.T) {
	e := Server(t, baseSeeder)
	_, sceneId, _ := createProjectSet(e)

	// Upload plugin
	pluginZipPath := buildTestPluginZip(t, "testplugin", "1.0.0")
	res := uploadPluginMutation(e, sceneId, pluginZipPath)
	pluginId := res.Path("$.data.uploadPlugin.plugin.id").String().Raw()

	// Verify plugin appears in scene's plugins list
	sceneRes := getScene(e, sceneId, language.Und.String())
	plugins := sceneRes.Object().Value("plugins").Array()

	found := false
	for _, p := range plugins.Iter() {
		pid := p.Object().Value("plugin").Object().Value("id").String().Raw()
		if pid == pluginId {
			found = true
			break
		}
	}
	assert.True(t, found, "uploaded plugin should appear in scene plugins")
}

// go test -v -run TestPluginUninstall ./e2e/...

func TestPluginUninstall(t *testing.T) {
	e := Server(t, baseSeeder)
	_, sceneId, _ := createProjectSet(e)

	// Upload plugin
	pluginZipPath := buildTestPluginZip(t, "testplugin", "1.0.0")
	res := uploadPluginMutation(e, sceneId, pluginZipPath)
	pluginId := res.Path("$.data.uploadPlugin.plugin.id").String().Raw()

	// Verify it's in the scene
	sceneRes := getScene(e, sceneId, language.Und.String())
	assertPluginInScene(t, sceneRes, pluginId, true)

	// Uninstall plugin
	uRes := uninstallPluginMutation(e, sceneId, pluginId)
	uRes.Path("$.data.uninstallPlugin.pluginId").IsEqual(pluginId)
	uRes.Path("$.data.uninstallPlugin.scene.id").IsEqual(sceneId)

	// Verify it's no longer in the scene
	sceneRes = getScene(e, sceneId, language.Und.String())
	assertPluginInScene(t, sceneRes, pluginId, false)
}

// go test -v -run TestPluginUploadNewVersion ./e2e/...

func TestPluginUploadNewVersion(t *testing.T) {
	e := Server(t, baseSeeder)
	_, sceneId, _ := createProjectSet(e)

	// Upload v1.0.0
	zipV1 := buildTestPluginZip(t, "testplugin", "1.0.0")
	resV1 := uploadPluginMutation(e, sceneId, zipV1)
	pluginIdV1 := resV1.Path("$.data.uploadPlugin.plugin.id").String().Raw()
	resV1.Path("$.data.uploadPlugin.plugin.version").IsEqual("1.0.0")

	// Upload v1.0.1 (same plugin name, new version) - should auto-upgrade
	zipV2 := buildTestPluginZip(t, "testplugin", "1.0.1")
	resV2 := uploadPluginMutation(e, sceneId, zipV2)
	pluginIdV2 := resV2.Path("$.data.uploadPlugin.plugin.id").String().Raw()
	resV2.Path("$.data.uploadPlugin.plugin.version").IsEqual("1.0.1")

	// Plugin IDs should differ (different versions)
	assert.NotEqual(t, pluginIdV1, pluginIdV2)

	// Scene should have v1.0.1 but not v1.0.0
	sceneRes := getScene(e, sceneId, language.Und.String())
	assertPluginInScene(t, sceneRes, pluginIdV2, true)
	assertPluginInScene(t, sceneRes, pluginIdV1, false)
}

// go test -v -run TestPluginUploadSameVersion ./e2e/...

func TestPluginUploadSameVersion(t *testing.T) {
	e := Server(t, baseSeeder)
	_, sceneId, _ := createProjectSet(e)

	// Upload v1.0.0
	zip1 := buildTestPluginZip(t, "testplugin", "1.0.0")
	res1 := uploadPluginMutation(e, sceneId, zip1)
	pluginId1 := res1.Path("$.data.uploadPlugin.plugin.id").String().Raw()
	res1.Path("$.data.uploadPlugin.plugin.version").IsEqual("1.0.0")

	// Upload v1.0.0 again (same version = replace)
	zip2 := buildTestPluginZip(t, "testplugin", "1.0.0")
	res2 := uploadPluginMutation(e, sceneId, zip2)
	pluginId2 := res2.Path("$.data.uploadPlugin.plugin.id").String().Raw()
	res2.Path("$.data.uploadPlugin.plugin.version").IsEqual("1.0.0")

	// Plugin ID should be the same (same version was replaced)
	assert.Equal(t, pluginId1, pluginId2)

	// Plugin should still be in scene
	sceneRes := getScene(e, sceneId, language.Und.String())
	assertPluginInScene(t, sceneRes, pluginId1, true)
}

// go test -v -run TestPluginUninstallSystemPluginError ./e2e/...

func TestPluginUninstallSystemPluginError(t *testing.T) {
	e := Server(t, baseSeeder)
	_, sceneId, _ := createProjectSet(e)

	// Try to uninstall the builtin "reearth" plugin - should fail
	res := uninstallPluginMutation(e, sceneId, "reearth")
	res.Path("$.errors[0].message").String().NotEmpty()
}

// go test -v -run TestPluginInstallNonExistentError ./e2e/...

func TestPluginInstallNonExistentError(t *testing.T) {
	e := Server(t, baseSeeder)
	_, sceneId, _ := createProjectSet(e)

	// Try to install a non-existent plugin
	res := installPluginMutation(e, sceneId, "nonexistent~1.0.0")
	res.Path("$.errors[0].message").String().NotEmpty()
}

// go test -v -run TestPluginInstallAlreadyInstalledError ./e2e/...

func TestPluginInstallAlreadyInstalledError(t *testing.T) {
	e := Server(t, baseSeeder)
	_, sceneId, _ := createProjectSet(e)

	// The builtin "reearth" plugin is already installed by createScene
	// Try to install it again - should fail
	res := installPluginMutation(e, sceneId, "reearth")
	res.Path("$.errors[0].message").String().NotEmpty()
}

// go test -v -run TestPluginUploadWithAllExtensionTypes ./e2e/...

func TestPluginUploadWithAllExtensionTypes(t *testing.T) {
	e := Server(t, baseSeeder)
	_, sceneId, _ := createProjectSet(e)

	// Build a plugin with multiple extension types (similar to PluginPlayground's "My Plugin")
	manifest := `id: myplugin
name: My Plugin
version: 1.0.0
extensions:
  - id: demo-widget
    type: widget
    name: Demo Widget
    description: A demo widget
    widgetLayout:
      defaultLocation:
        zone: outer
        section: left
        area: top
  - id: demo-infobox-block
    type: infoboxBlock
    name: Demo Infobox Block
  - id: demo-story-block
    type: storyBlock
    name: Demo Story Block
`
	files := map[string]string{
		"demo-widget.js":        `reearth.ui.show("<h1>Widget</h1>");`,
		"demo-infobox-block.js": `reearth.ui.show("<p>Infobox</p>");`,
		"demo-story-block.js":   `reearth.ui.show("<p>Story</p>");`,
	}
	zipPath := buildPluginZipWithFiles(t, manifest, files)

	res := uploadPluginMutation(e, sceneId, zipPath)
	pluginData := res.Path("$.data.uploadPlugin.plugin").Object()
	pluginData.HasValue("name", "My Plugin")

	extensions := pluginData.Value("extensions").Array()
	extensions.Length().IsEqual(3)

	extTypes := make(map[string]string)
	for _, ext := range extensions.Iter() {
		obj := ext.Object()
		eid := obj.Value("extensionId").String().Raw()
		etype := obj.Value("type").String().Raw()
		extTypes[eid] = etype
	}
	assert.Equal(t, "WIDGET", extTypes["demo-widget"])
	assert.Equal(t, "InfoboxBlock", extTypes["demo-infobox-block"])
	assert.Equal(t, "StoryBlock", extTypes["demo-story-block"])
}

// go test -v -run TestPluginLifecycle ./e2e/...

func TestPluginLifecycle(t *testing.T) {
	e := Server(t, baseSeeder)
	_, sceneId, _ := createProjectSet(e)

	// 1. Upload plugin v1.0.0
	zipV1 := buildTestPluginZip(t, "lifecycle-plugin", "1.0.0")
	resUpload := uploadPluginMutation(e, sceneId, zipV1)
	pluginIdV1 := resUpload.Path("$.data.uploadPlugin.plugin.id").String().Raw()
	require.NotEmpty(t, pluginIdV1)

	// 2. Verify via plugin query
	qRes := queryPlugin(e, pluginIdV1)
	qRes.Path("$.data.plugin.version").IsEqual("1.0.0")

	// 3. Verify via plugins query (batch)
	qsRes := queryPlugins(e, []string{pluginIdV1})
	qsRes.Path("$.data.plugins").Array().Length().IsEqual(1)

	// 4. Verify in scene
	sceneRes := getScene(e, sceneId, language.Und.String())
	assertPluginInScene(t, sceneRes, pluginIdV1, true)

	// 5. Upgrade to v1.0.1 via upload
	zipV2 := buildTestPluginZip(t, "lifecycle-plugin", "1.0.1")
	resUpgraded := uploadPluginMutation(e, sceneId, zipV2)
	pluginIdV2 := resUpgraded.Path("$.data.uploadPlugin.plugin.id").String().Raw()
	resUpgraded.Path("$.data.uploadPlugin.plugin.version").IsEqual("1.0.1")
	assert.NotEqual(t, pluginIdV1, pluginIdV2)

	// 6. Verify scene has only v1.0.1
	sceneRes = getScene(e, sceneId, language.Und.String())
	assertPluginInScene(t, sceneRes, pluginIdV2, true)
	assertPluginInScene(t, sceneRes, pluginIdV1, false)

	// 7. Uninstall
	uRes := uninstallPluginMutation(e, sceneId, pluginIdV2)
	uRes.Path("$.data.uninstallPlugin.pluginId").IsEqual(pluginIdV2)

	// 8. Verify removal
	sceneRes = getScene(e, sceneId, language.Und.String())
	assertPluginInScene(t, sceneRes, pluginIdV2, false)

	// 9. Plugin query should return null after uninstall (private plugin is deleted)
	qRes = queryPlugin(e, pluginIdV2)
	qRes.Path("$.data.plugin").IsNull()
}

// --- GraphQL Queries and Mutations ---

const UploadPluginMutation = `mutation UploadPlugin($sceneId: ID!, $file: Upload) {
  uploadPlugin(input: {sceneId: $sceneId, file: $file}) {
    plugin {
      id
      name
      version
      description
      author
      repositoryUrl
      extensions {
        extensionId
        pluginId
        type
        name
        description
      }
    }
    scene {
      id
    }
    scenePlugin {
      pluginId
      propertyId
    }
  }
}`

const PluginQuery = `query GetPlugin($id: ID!) {
  plugin(id: $id) {
    id
    name
    version
    description
    author
    repositoryUrl
    extensions {
      extensionId
      pluginId
      type
      name
    }
  }
}`

const PluginsQuery = `query GetPlugins($ids: [ID!]!) {
  plugins(id: $ids) {
    id
    name
    version
  }
}`

const InstallPluginMutation = `mutation InstallPlugin($sceneId: ID!, $pluginId: ID!) {
  installPlugin(input: {sceneId: $sceneId, pluginId: $pluginId}) {
    scene {
      id
    }
    scenePlugin {
      pluginId
      propertyId
    }
  }
}`

const UninstallPluginMutation = `mutation UninstallPlugin($sceneId: ID!, $pluginId: ID!) {
  uninstallPlugin(input: {sceneId: $sceneId, pluginId: $pluginId}) {
    pluginId
    scene {
      id
    }
  }
}`

// --- Helpers ---

func buildTestPluginZip(t *testing.T, pluginID, version string) string {
	t.Helper()

	manifest := fmt.Sprintf(`id: %s
name: Test Plugin
version: %s
extensions:
  - id: test-widget
    type: widget
    name: Test Widget
    widgetLayout:
      defaultLocation:
        zone: outer
        section: left
        area: top
  - id: test-story-block
    type: storyBlock
    name: Test Story Block
`, pluginID, version)

	files := map[string]string{
		"test-widget.js":      `reearth.ui.show("<h1>Test Widget</h1>");`,
		"test-story-block.js": `reearth.ui.show("<p>Test Story Block</p>");`,
	}

	return buildPluginZipWithFiles(t, manifest, files)
}

func buildPluginZipWithFiles(t *testing.T, manifest string, jsFiles map[string]string) string {
	t.Helper()

	buf := &bytes.Buffer{}
	zw := zip.NewWriter(buf)

	w, err := zw.Create("reearth.yml")
	require.NoError(t, err)
	_, err = w.Write([]byte(manifest))
	require.NoError(t, err)

	for name, content := range jsFiles {
		w, err = zw.Create(name)
		require.NoError(t, err)
		_, err = w.Write([]byte(content))
		require.NoError(t, err)
	}

	require.NoError(t, zw.Close())

	f, err := os.CreateTemp(t.TempDir(), "plugin-*.zip")
	require.NoError(t, err)
	_, err = f.Write(buf.Bytes())
	require.NoError(t, err)
	require.NoError(t, f.Close())

	return f.Name()
}

func uploadPluginMutation(e *httpexpect.Expect, sceneId, filePath string) *httpexpect.Value {
	requestBody := map[string]interface{}{
		"operationName": "UploadPlugin",
		"variables": map[string]interface{}{
			"sceneId": sceneId,
			"file":    nil,
		},
		"query": UploadPluginMutation,
	}
	return RequestWithMultipart(e, uID.String(), requestBody, filePath)
}

func queryPlugin(e *httpexpect.Expect, pluginId string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "GetPlugin",
		Query:         PluginQuery,
		Variables: map[string]any{
			"id": pluginId,
		},
	}
	return Request(e, uID.String(), requestBody)
}

func queryPlugins(e *httpexpect.Expect, pluginIds []string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "GetPlugins",
		Query:         PluginsQuery,
		Variables: map[string]any{
			"ids": pluginIds,
		},
	}
	return Request(e, uID.String(), requestBody)
}

func installPluginMutation(e *httpexpect.Expect, sceneId, pluginId string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "InstallPlugin",
		Query:         InstallPluginMutation,
		Variables: map[string]any{
			"sceneId":  sceneId,
			"pluginId": pluginId,
		},
	}
	return Request(e, uID.String(), requestBody)
}

func uninstallPluginMutation(e *httpexpect.Expect, sceneId, pluginId string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "UninstallPlugin",
		Query:         UninstallPluginMutation,
		Variables: map[string]any{
			"sceneId":  sceneId,
			"pluginId": pluginId,
		},
	}
	return Request(e, uID.String(), requestBody)
}

func assertPluginInScene(t *testing.T, sceneRes *httpexpect.Value, pluginId string, shouldExist bool) {
	t.Helper()
	plugins := sceneRes.Object().Value("plugins").Array()
	found := false
	for _, p := range plugins.Iter() {
		pid := p.Object().Value("plugin").Object().Value("id").String().Raw()
		if pid == pluginId {
			found = true
			break
		}
	}
	if shouldExist {
		assert.True(t, found, "plugin %s should be in scene", pluginId)
	} else {
		assert.False(t, found, "plugin %s should not be in scene", pluginId)
	}
}
