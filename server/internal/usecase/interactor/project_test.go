package interactor

import (
	"context"
	"net/url"
	"strings"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/gcs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth/server/internal/testutil/factory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmemory"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmongo"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func init() {
	mongotest.Env = "REEARTH_DB"
}

func createNewProjectUC(client *mongox.Client) *Project {
	gw, _ := gcs.NewFile(true, "test-bucket", "/assets", "public, max-age=3600")
	return &Project{
		assetRepo:          mongo.NewAsset(client),
		projectRepo:        mongo.NewProject(client),
		storytellingRepo:   mongo.NewStorytelling(client),
		userRepo:           accountmongo.NewUser(client),
		workspaceRepo:      accountmongo.NewWorkspace(client),
		sceneRepo:          mongo.NewScene(client),
		propertyRepo:       mongo.NewProperty(client),
		propertySchemaRepo: mongo.NewPropertySchema(client),
		transaction:        client.Transaction(),
		policyRepo:         mongo.NewPolicy(client),
		nlsLayerRepo:       mongo.NewNLSLayer(client),
		layerStyles:        mongo.NewStyle(client),
		pluginRepo:         mongo.NewPlugin(client),
		file:               gw,
	}
}
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

	// normal
	got, err := uc.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID: ws.ID(),
		Visualizer:  visualizer.VisualizerCesium,
		Name:        lo.ToPtr("aaa"),
		Description: lo.ToPtr("bbb"),
	}, &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			WritableWorkspaces: workspace.IDList{ws.ID()},
		},
	})
	assert.NoError(t, err)
	want := project.New().
		ID(got.ID()).
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
	assert.Equal(t, want, lo.Must(uc.projectRepo.FindByID(ctx, got.ID())))

	// Experimental
	got, err = uc.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID: ws.ID(),
		Visualizer:  visualizer.VisualizerCesium,
		Name:        lo.ToPtr("aaa"),
		Description: lo.ToPtr("bbb"),
	}, &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			WritableWorkspaces: workspace.IDList{ws.ID()},
		},
	})
	assert.NoError(t, err)
	want = project.New().
		ID(got.ID()).
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
	assert.Equal(t, want, lo.Must(uc.projectRepo.FindByID(ctx, got.ID())))

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

// func TestProject_CheckAlias1(t *testing.T) {
// 	ctx := context.Background()
// 	db := mongotest.Connect(t)(t)
// 	client := mongox.NewClient(db.Name(), db.Client())
// 	uc := createNewProjectUC(client)

// }

func TestProject_CheckAlias(t *testing.T) {
	ctx := context.Background()

	db := mongotest.Connect(t)(t)
	client := mongox.NewClient(db.Name(), db.Client())
	uc := createNewProjectUC(client)

	// setup for test
	us := factory.NewUser()
	_ = uc.userRepo.Save(ctx, us)

	ws := factory.NewWorkspace(func(w *workspace.Builder) {
		w.Members(map[accountdomain.UserID]workspace.Member{
			accountdomain.NewUserID(): {
				Role:      workspace.RoleOwner,
				Disabled:  false,
				InvitedBy: workspace.UserID(us.ID()),
				Host:      "",
			},
		})
	})
	_ = uc.workspaceRepo.Save(ctx, ws)

	testAlias := "alias"
	pj := factory.NewProject(func(p *project.Builder) {
		p.Workspace(ws.ID()).
			Alias(testAlias)
	})
	_ = uc.projectRepo.Save(ctx, pj)

	// test
	t.Run("when alias is valid", func(t *testing.T) {
		t.Run("when alias length is valid max length", func(t *testing.T) {
			ok, err := uc.checkAlias(ctx, pj.ID(), strings.Repeat("a", 32))
			assert.NoError(t, err)
			assert.True(t, ok)
		})
		t.Run("when alias length is valid min length", func(t *testing.T) {
			ok, err := uc.checkAlias(ctx, pj.ID(), strings.Repeat("a", 5))
			assert.NoError(t, err)
			assert.True(t, ok)
		})
	})

	t.Run("when alias update to same alias", func(t *testing.T) {
		ok, err := uc.checkAlias(ctx, pj.ID(), testAlias)
		assert.NoError(t, err)
		assert.True(t, ok)
	})

	t.Run("when alias is invalid", func(t *testing.T) {
		t.Run("when alias is already used by other project", func(t *testing.T) {
			ok, err := uc.checkAlias(ctx, id.NewProjectID(), testAlias)
			assert.EqualError(t, err, interfaces.ErrProjectAliasAlreadyUsed.Error())
			assert.False(t, ok)
		})
		t.Run("when alias include not allowed characters", func(t *testing.T) {
			for _, c := range []string{"!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "+", "=", "|", "~", "`", ".", ",", ":", ";", "'", "\"", "/", "\\", "?"} {
				ok, err := uc.checkAlias(ctx, pj.ID(), "alias2"+c)
				assert.EqualError(t, err, project.ErrInvalidProjectAlias.Error())
				assert.False(t, ok)
			}
		})
		t.Run("when alias is too short", func(t *testing.T) {
			ok, err := uc.checkAlias(ctx, pj.ID(), "aaaa")
			assert.EqualError(t, err, project.ErrInvalidProjectAlias.Error())
			assert.False(t, ok)
		})
		t.Run("when alias is too long", func(t *testing.T) {
			ok, err := uc.checkAlias(ctx, pj.ID(), strings.Repeat("a", 33))
			assert.EqualError(t, err, project.ErrInvalidProjectAlias.Error())
			assert.False(t, ok)
		})
	})
}
