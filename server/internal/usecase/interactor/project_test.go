package interactor

import (
	"context"
	"encoding/json"
	"net/url"
	"testing"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmemory"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

func TestProject_Create(t *testing.T) {
	ctx := context.Background()

	po := policy.New(policy.Option{
		ID:           policy.ID("policy"),
		ProjectCount: lo.ToPtr(2),
	})

	uc := &Project{
		projectRepo:   memory.NewProject(),
		workspaceRepo: accountmemory.NewWorkspace(),
		transaction:   &usecasex.NopTransaction{},
		policyRepo:    memory.NewPolicyWith(po),
	}

	ws := workspace.New().NewID().Policy(policy.ID("policy").Ref()).MustBuild()
	wsid2 := workspace.NewID()
	_ = uc.workspaceRepo.Save(ctx, ws)
	pId1, pId2 := project.NewID(), project.NewID()
	defer project.MockNewID(pId1)()

	// normal
	got, err := uc.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID: ws.ID(),
		Visualizer:  visualizer.VisualizerCesium,
		Name:        lo.ToPtr("aaa"),
		Description: lo.ToPtr("bbb"),
		ImageURL:    lo.Must(url.Parse("https://example.com/hoge.gif")),
		Alias:       lo.ToPtr("aliasalias"),
		Archived:    lo.ToPtr(false),
	}, &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			WritableWorkspaces: workspace.IDList{ws.ID()},
		},
	})
	assert.NoError(t, err)
	want := project.New().
		ID(pId1).
		Workspace(ws.ID()).
		Name("aaa").
		Description("bbb").
		ImageURL(lo.Must(url.Parse("https://example.com/hoge.gif"))).
		Alias("aliasalias").
		Visualizer(visualizer.VisualizerCesium).
		UpdatedAt(got.UpdatedAt()).
		CoreSupport(false).
		MustBuild()
	assert.Equal(t, want, got)
	assert.Equal(t, want, lo.Must(uc.projectRepo.FindByID(ctx, pId1)))

	// Experimental
	defer project.MockNewID(pId2)()
	got, err = uc.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID: ws.ID(),
		Visualizer:  visualizer.VisualizerCesium,
		Name:        lo.ToPtr("aaa"),
		Description: lo.ToPtr("bbb"),
		ImageURL:    lo.Must(url.Parse("https://example.com/hoge.gif")),
		Alias:       lo.ToPtr("aliasalias"),
		Archived:    lo.ToPtr(false),
		CoreSupport: lo.ToPtr(true),
	}, &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			WritableWorkspaces: workspace.IDList{ws.ID()},
		},
	})
	assert.NoError(t, err)
	want = project.New().
		ID(pId2).
		Workspace(ws.ID()).
		Name("aaa").
		Description("bbb").
		ImageURL(lo.Must(url.Parse("https://example.com/hoge.gif"))).
		Alias("aliasalias").
		Visualizer(visualizer.VisualizerCesium).
		UpdatedAt(got.UpdatedAt()).
		CoreSupport(true).
		MustBuild()
	assert.Equal(t, want, got)
	assert.Equal(t, want, lo.Must(uc.projectRepo.FindByID(ctx, pId2)))

	// nonexistent workspace
	got, err = uc.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID: wsid2,
		Visualizer:  visualizer.VisualizerCesium,
	}, &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			WritableWorkspaces: workspace.IDList{wsid2},
		},
	})
	assert.Same(t, rerror.ErrNotFound, err)
	assert.Nil(t, got)

	// operation denied
	got, err = uc.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID: ws.ID(),
		Visualizer:  visualizer.VisualizerCesium,
	}, &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			ReadableWorkspaces: workspace.IDList{ws.ID()},
		},
	})
	assert.Same(t, interfaces.ErrOperationDenied, err)
	assert.Nil(t, got)

	// policy
	got, err = uc.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID: ws.ID(),
		Visualizer:  visualizer.VisualizerCesium,
	}, &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			WritableWorkspaces: workspace.IDList{ws.ID()},
		},
	})
	assert.Same(t, policy.ErrPolicyViolation, err)
	assert.Nil(t, got)
}

func TestImportProject(t *testing.T) {

	ctx := context.Background()

	db := memory.New()
	ifp := NewProject(db, &gateway.Container{
		File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
	})

	var projectData map[string]interface{}
	err := json.Unmarshal([]byte(`{
    "id": "01j7g9ddttkpnt3esk8h4w7xhv",
    "isArchived": false,
    "isBasicAuthActive": false,
    "basicAuthUsername": "",
    "basicAuthPassword": "",
    "createdAt": "2024-09-11T19:17:39.418+09:00",
    "updatedAt": "2024-09-11T10:22:09.581Z",
    "name": "ProjectName1",
    "description": "ProjectOverview1",
    "alias": "",
    "publicTitle": "",
    "publicDescription": "",
    "publicImage": "",
    "publicNoIndex": false,
    "imageUrl": {
      "Scheme": "http",
      "Opaque": "",
      "User": null,
      "Host": "localhost:8080",
      "Path": "/assets/01j7g9d988ct8hajjxfsb6e1n6.jpeg",
      "RawPath": "",
      "OmitHost": false,
      "ForceQuery": false,
      "RawQuery": "",
      "Fragment": "",
      "RawFragment": ""
    },
    "teamId": "01j7g99pb1q1vf684af39bajw5",
    "visualizer": "cesium",
    "publishmentStatus": "PRIVATE",
    "coreSupport": true,
    "enableGa": false,
    "trackingId": "",
    "starred": false
  }`), &projectData)
	assert.NoError(t, err)

	// invoke the target function
	result, _, err := ifp.ImportProject(ctx, projectData)
	assert.NoError(t, err)
	assert.NotNil(t, result)

	// actual
	temp := gqlmodel.ToProject(result)
	resultByte, err := json.Marshal(temp)
	assert.NoError(t, err)
	var resultMap map[string]interface{}
	err = json.Unmarshal(resultByte, &resultMap)
	assert.NoError(t, err)

	// Exclude items that are updated upon creation.
	delete(resultMap, "updatedAt")
	delete(resultMap, "createdAt")

	actualByte, err := json.Marshal(resultMap)
	assert.NoError(t, err)
	actual := string(actualByte)

	// expected
	var expectedMap map[string]interface{}
	err = json.Unmarshal([]byte(`{
    "id": "01j7g9ddttkpnt3esk8h4w7xhv",
    "isArchived": false,
    "isBasicAuthActive": false,
    "basicAuthUsername": "",
    "basicAuthPassword": "",
    "name": "ProjectName1",
    "description": "ProjectOverview1",
    "alias": "",
    "publicTitle": "",
    "publicDescription": "",
    "publicImage": "",
    "publicNoIndex": false,
    "imageUrl": {
      "Scheme": "http",
      "Opaque": "",
      "User": null,
      "Host": "localhost:8080",
      "Path": "/assets/01j7g9d988ct8hajjxfsb6e1n6.jpeg",
      "RawPath": "",
      "OmitHost": false,
      "ForceQuery": false,
      "RawQuery": "",
      "Fragment": "",
      "RawFragment": ""
    },
    "teamId": "01j7g99pb1q1vf684af39bajw5",
    "visualizer": "cesium",
    "publishmentStatus": "PRIVATE",
    "coreSupport": true,
    "enableGa": false,
    "trackingId": "",
    "starred": false
  }`), &expectedMap)

	assert.NoError(t, err)
	expectedJSON, err := json.Marshal(expectedMap)
	assert.NoError(t, err)
	expected := string(expectedJSON)

	// comparison check
	assert.JSONEq(t, expected, actual)

}
