package e2e

import (
	"fmt"
	"testing"

	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

// export REEARTH_DB=mongodb://localhost

// go test -v -run TestPolicy_EnforceMemberCount ./e2e/...

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

// go test -v -run TestPolicy_AssetPolicy ./e2e/...

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

	// e := ServerWithPolicy(t, policy.Option{
	// 	ID:   policyID,
	// 	Name: policyID.String(),

	// 	// MemberCount: lo.ToPtr(2),

	// 	ProjectCount:   lo.ToPtr(3),
	// 	PrivateProject: lo.ToPtr(false),

	// 	// CustomDomainCount: lo.ToPtr(5),
	// 	// PublishableCount:  lo.ToPtr(10),

	// 	// AssetStorageSize:    lo.ToPtr(int64(100)),
	// 	// MaximumSizePerAsset: lo.ToPtr(int64(1000000000)),

	// 	// ProjectImportingTimeout:  lo.ToPtr(300),
	// 	// MaximumProjectExportSize: lo.ToPtr(int64(100)),

	// 	// InstallPluginCount: lo.ToPtr(10),
	// 	// NLSLayersCount:     lo.ToPtr(20),
	// })

	// // ValueDump(res)

	// // 	id = createProject2(e, uID, map[string]any{
	// // 	"name":        "test3-2",
	// // 	"description": "abc",
	// // 	"teamId":      wID.String(),
	// // 	"visualizer":  "CESIUM",
	// // 	"coreSupport": false,
	// // 	"visibility":  "private",
	// // }).Object().
	// // 	HasValue("name", "test3-2").
	// // 	HasValue("coreSupport", false).
	// // 	HasValue("visibility", "private").

	// // pid = createProject(e, uID, map[string]any{
	// // 	"name":        "project2",
	// // 	"description": "abc",
	// // 	"teamId":      wID.String(),
	// // 	"visualizer":  "CESIUM",
	// // 	"coreSupport": true,
	// // })

	// // pid = createProject(e, uID, map[string]any{
	// // 	"name":        "project2",
	// // 	"description": "abc",
	// // 	"teamId":      wID.String(),
	// // 	"visualizer":  "CESIUM",
	// // 	"coreSupport": true,
	// // })

	// // test.png => 30438 byte
	// // res := createAsset(t, e, "test.png", true, wID.String(), &pid)
	// // ValueDump(res)
}

func TestPolicy_EnforceInstallPluginCount(t *testing.T) {

}

func TestPolicy_EnforceNLSLayersCount(t *testing.T) {

}
