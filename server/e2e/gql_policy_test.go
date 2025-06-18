package e2e

import (
	"fmt"
	"os"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestPolicy ./e2e/...

func TestPolicy_EnforceMemberCount(t *testing.T) {
	e, ctx, r, _ := ServerWithPolicy(t, policy.Option{
		ID:   policyID,
		Name: policyID.String(),

		MemberCount: lo.ToPtr(2), // seeder +1
	})

	query := fmt.Sprintf(`mutation { addMemberToTeam(input: {teamId: "%s", userId: "%s", role: READER}){ team{ id } }}`, wID, uID2)
	request := GraphQLRequest{
		Query: query,
	}
	res := Request(e, uID.String(), request)

	res.Object().Path("$.data.addMemberToTeam.team.id").IsString()

	uID4 := user.NewID()
	wID4 := accountdomain.NewWorkspaceID()
	uEmail4 := "e5e@e5e.com"
	uName4 := "e5e"

	_, u4, err := createUserAndWorkspace(ctx, r, language.English, nil,
		WorkspaceUserOption{
			wID:    wID4,
			uID:    uID4,
			uName:  uName4,
			uEmail: uEmail4,
		},
	)
	assert.Nil(t, err)

	query = fmt.Sprintf(`mutation { addMemberToTeam(input: {teamId: "%s", userId: "%s", role: READER}){ team{ id } }}`, wId1, u4.ID())
	request = GraphQLRequest{
		Query: query,
	}
	res = Request(e, uID.String(), request)
	res.Object().Path("$.errors[0].extensions.system_error").IsEqual("input: addMemberToTeam operation denied")
}

func TestPolicy_EnforceProjectCount(t *testing.T) {

	e, _, _, _ := ServerWithPolicy(t, policy.Option{
		ID:   policyID,
		Name: policyID.String(),

		ProjectCount:   lo.ToPtr(2), // seeder +1
		PrivateProject: lo.ToPtr(true),
	})

	// ProjectCount 2 => OK
	res := createProject3(e, uID, map[string]any{
		"name":        "public project",
		"description": "abc",
		"teamId":      wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
		"visibility":  "public",
	})
	res.Object().Path("$.data.createProject.project.name").IsEqual("public project")

	// ProjectCount 3 => NG
	res = createProject3(e, uID, map[string]any{
		"name":        "public project",
		"description": "abc",
		"teamId":      wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
		"visibility":  "public",
	})
	res.Object().Path("$.errors[0].extensions.system_error").IsEqual("input: createProject policy violation")
}

func TestPolicy_EnforcePrivateProject(t *testing.T) {

	e, _, _, _ := ServerWithPolicy(t, policy.Option{
		ID:   policyID,
		Name: policyID.String(),

		ProjectCount:   lo.ToPtr(10),
		PrivateProject: lo.ToPtr(false),
	})

	// ProjectCount public => OK
	res := createProject3(e, uID, map[string]any{
		"name":        "public project",
		"description": "abc",
		"teamId":      wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
		"visibility":  "public",
	})
	res.Object().Path("$.data.createProject.project.name").IsEqual("public project")

	// PrivateProject private => NG
	res = createProject3(e, uID, map[string]any{
		"name":        "private project",
		"description": "abc",
		"teamId":      wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
		"visibility":  "private",
	})
	res.Object().Path("$.errors[0].extensions.system_error").IsEqual("input: createProject policy violation")

}

func TestPolicy_PublishmentPolicy(t *testing.T) {

	e, _, _, _ := ServerWithPolicy(t, policy.Option{
		ID:   policyID,
		Name: policyID.String(),

		ProjectCount:   lo.ToPtr(10),
		PrivateProject: lo.ToPtr(true),

		CustomDomainCount: lo.ToPtr(1),
		PublishableCount:  lo.ToPtr(2),
	})

	projectId1, sceneId1, _ := createProjectSet(e)
	projectId2, sceneId2, _ := createProjectSet(e)
	projectId3, sceneId3, _ := createProjectSet(e)

	// PublishableCount 1 => OK
	res := publishProject2(e, uID, map[string]any{
		"projectId": projectId1,
		"alias":     sceneId1,
		"status":    "LIMITED",
	})
	res.Object().Path("$.data.publishProject.project.publishmentStatus").IsEqual("LIMITED")

	// PublishableCount 2 => OK
	res = publishProject2(e, uID, map[string]any{
		"projectId": projectId2,
		"alias":     sceneId2,
		"status":    "LIMITED",
	})
	res.Object().Path("$.data.publishProject.project.publishmentStatus").IsEqual("LIMITED")

	// PublishableCount 3 => NG
	res = publishProject2(e, uID, map[string]any{
		"projectId": projectId3,
		"alias":     sceneId3,
		"status":    "LIMITED",
	})
	res.Object().Path("$.errors[0].extensions.system_error").IsEqual("input: publishProject policy violation")

	// CustomDomainCount 1 => OK
	res = publishProject2(e, uID, map[string]any{
		"projectId": projectId1,
		"alias":     "xxxxxx",
		"status":    "LIMITED",
	})
	res.Object().Path("$.data.publishProject.project.publishmentStatus").IsEqual("LIMITED")

	// CustomDomainCount 2 => NG
	res = publishProject2(e, uID, map[string]any{
		"projectId": projectId2,
		"alias":     "yyyyyy",
		"status":    "LIMITED",
	})
	res.Object().Path("$.errors[0].extensions.system_error").IsEqual("input: publishProject policy violation")

}

func TestPolicy_AssetPolicy(t *testing.T) {

	e, _, _, _ := ServerWithPolicy(t, policy.Option{
		ID:   policyID,
		Name: policyID.String(),

		ProjectCount:   lo.ToPtr(2), // seeder +1
		PrivateProject: lo.ToPtr(true),

		MaximumSizePerAsset: lo.ToPtr(int64(250)),
		AssetStorageSize:    lo.ToPtr(int64(30700)), // seeder +30438
	})

	pid := createProject(e, uID, map[string]any{
		"name":        "project",
		"description": "abc",
		"teamId":      wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})

	// test.png => 30438 byte NG (Max size 250 byte)
	res := createAsset(t, e, "test.png", true, wID.String(), &pid)
	res.Object().Path("$.errors[0].extensions.system_error").IsEqual("input: createAsset policy violation")

	// test.csv => 231 byte OK
	res = createAsset(t, e, "test.csv", true, wID.String(), &pid)
	res.Object().Path("$.data.createAsset.asset.name").IsEqual("test.csv")

	// test.csv => 231 byte NG (Total size)
	res = createAsset(t, e, "test.csv", true, wID.String(), &pid)
	res.Object().Path("$.errors[0].extensions.system_error").IsEqual("input: createAsset policy violation")

}

func TestPolicy_EnforceMaximumProjectExportSize(t *testing.T) {

	e, _, _, _ := ServerWithPolicy(t, policy.Option{
		ID:   policyID,
		Name: policyID.String(),

		ProjectCount:   lo.ToPtr(2),
		PrivateProject: lo.ToPtr(true),

		MaximumProjectExportSize: lo.ToPtr(int64(1300)), // 1300 byte
	})

	projectId, sceneId, _ := createProjectSet(e)

	res := exportProject(e, projectId) // 1027 byte => OK
	res.Object().Path("$.data.exportProject.projectDataPath").IsString()

	// add
	res = addTestNLSLayerSimple2(e, sceneId)
	res.Object().Path("$.data.addNLSLayerSimple.layers.id").IsString()

	res = exportProject(e, projectId) // 1300 byte over => NG
	res.Object().
		Path("$.errors[0].extensions.system_error").
		String().
		HasPrefix("input: exportProject Fail UploadExportProjectZip")

}

func TestPolicy_EnforceInstallPluginCount(t *testing.T) {

	e, _, _, _ := ServerWithPolicy(t, policy.Option{
		ID:   policyID,
		Name: policyID.String(),

		ProjectCount:   lo.ToPtr(2),
		PrivateProject: lo.ToPtr(true),

		InstallPluginCount: lo.ToPtr(2), // count 2
	})

	_, sceneId, _ := createProjectSet(e)
	res := uploadPlugin(t, e, sceneId, "file/plugin1-1.0.0.zip")
	res.Object().Path("$.data.uploadPlugin.plugin.name").IsEqual("plugin1")
	res = uploadPlugin(t, e, sceneId, "file/plugin2-1.0.0.zip")
	res.Object().Path("$.data.uploadPlugin.plugin.name").IsEqual("plugin2")
	res = uploadPlugin(t, e, sceneId, "file/plugin3-1.0.0.zip")
	res.Object().Path("$.errors[0].extensions.system_error").IsEqual("input: uploadPlugin policy violation")
}

func TestPolicy_EnforceNLSLayersCount(t *testing.T) {

	e, _, _, _ := ServerWithPolicy(t, policy.Option{
		ID:   policyID,
		Name: policyID.String(),

		ProjectCount:   lo.ToPtr(2),
		PrivateProject: lo.ToPtr(true),

		NLSLayersCount: lo.ToPtr(2), // count 2
	})

	_, sceneId, _ := createProjectSet(e)
	res := addTestNLSLayerSimple2(e, sceneId)
	res.Object().Path("$.data.addNLSLayerSimple.layers.id").IsString()
	res = addTestNLSLayerSimple2(e, sceneId)
	res.Object().Path("$.data.addNLSLayerSimple.layers.id").IsString()
	res = addTestNLSLayerSimple2(e, sceneId)
	res.Object().Path("$.errors[0].extensions.system_error").IsEqual("input: addNLSLayerSimple policy violation")
}

const UploadPluginMutation = `mutation UploadPlugin($sceneId: ID!, $file: Upload, $url: URL) {
  uploadPlugin(input: {sceneId: $sceneId, file: $file, url: $url}) {
    plugin {
      id
      name
      version
      description
      author
      __typename
    }
    scenePlugin {
      pluginId
      propertyId
      __typename
    }
    __typename
  }
}`

func uploadPlugin(t *testing.T, e *httpexpect.Expect, sceneId string, filePath string) *httpexpect.Value {
	file, err := os.Open(filePath)
	if err != nil {
		t.Fatalf("failed to open file: %v", err)
	}
	defer func() {
		if cerr := file.Close(); cerr != nil && err == nil {
			err = cerr
		}
	}()
	requestBody := map[string]interface{}{
		"query":         UploadPluginMutation,
		"operationName": "UploadPlugin",
		"variables": map[string]interface{}{
			"sceneId": sceneId,
			"file":    nil,
		},
	}
	assert.Nil(t, err)
	return RequestWithMultipart(e, uID.String(), requestBody, filePath)
}

func exportProject(e *httpexpect.Expect, projectId string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "ExportProject",
		Query:         ExportProjectMutation,
		Variables: map[string]any{
			"projectId": projectId,
		},
	}
	return Request(e, uID.String(), requestBody)
}
