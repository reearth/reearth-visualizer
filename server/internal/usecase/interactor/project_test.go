package interactor

import (
	"context"
	"net/url"
	"strings"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/gcs"
	"github.com/reearth/reearth/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth/server/internal/testutil/factory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmongo"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
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
func TestProject_createProject(t *testing.T) {
	ctx := context.Background()

	db := mongotest.Connect(t)(t)
	client := mongox.NewClient(db.Name(), db.Client())
	uc := createNewProjectUC(client)

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

	t.Run("valid input", func(t *testing.T) {
		t.Run("when all fields in createProjectInput are correctly set, the project is created by same values", func(t *testing.T) {
			input := createProjectInput{
				WorkspaceID: ws.ID(),
				Visualizer:  visualizer.VisualizerCesium,
				Name:        lo.ToPtr("aaa"),
				Description: lo.ToPtr("bbb"),
				Alias:       lo.ToPtr("alias"),
				ImageURL:    lo.Must(url.Parse("https://example.com/hoge")),
				CoreSupport: lo.ToPtr(true),
				Archived:    lo.ToPtr(true),
			}
			got, err := uc.createProject(ctx, input, &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					WritableWorkspaces: workspace.IDList{ws.ID()},
				},
			})

			assert.NoError(t, err)
			assert.Equal(t, ws.ID().String(), got.Workspace().String())
			assert.Equal(t, input.Visualizer, got.Visualizer())
			assert.Equal(t, *input.Name, got.Name())
			assert.Equal(t, *input.Description, got.Description())
			assert.Equal(t, *input.Alias, got.Alias())
			assert.Equal(t, input.ImageURL, got.ImageURL())
			assert.Equal(t, *input.CoreSupport, got.CoreSupport())
			assert.Equal(t, *input.Archived, got.IsArchived())
		})

		t.Run("When optional fields are not set (except those allowing nil), default values are assigned and the project is created accordingly", func(t *testing.T) {
			input := createProjectInput{
				WorkspaceID: ws.ID(),
			}
			got, err := uc.createProject(ctx, input, &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					WritableWorkspaces: workspace.IDList{ws.ID()},
				},
			})

			assert.NoError(t, err)
			assert.Equal(t, ws.ID().String(), got.Workspace().String())
			assert.Equal(t, visualizer.Visualizer(""), got.Visualizer())
			assert.Equal(t, "", got.Name())                  // name default value is empty string
			assert.Equal(t, "", got.Description())           // description default value is empty string
			assert.Equal(t, got.ID().String(), got.Alias())  // alias default value is project-{projectID}
			assert.Equal(t, (*url.URL)(nil), got.ImageURL()) // image url default value is nil
			assert.Equal(t, false, got.CoreSupport())        // core support default value is false
			assert.Equal(t, false, got.IsArchived())         // archived default value is false
		})
	})

	t.Run("invalid input", func(t *testing.T) {
		t.Run("when workspace id is not set", func(t *testing.T) {
			input := createProjectInput{
				Visualizer:  visualizer.VisualizerCesium,
				Name:        lo.ToPtr("aaa"),
				Description: lo.ToPtr("bbb"),
				Alias:       lo.ToPtr("alias"),
				ImageURL:    lo.Must(url.Parse("https://example.com/hoge")),
				CoreSupport: lo.ToPtr(true),
				Archived:    lo.ToPtr(true),
			}

			got, err := uc.createProject(ctx, input, &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					WritableWorkspaces: workspace.IDList{ws.ID()},
				},
			})

			assert.EqualError(t, err, interfaces.ErrOperationDenied.Error())
			assert.Nil(t, got)
		})
		t.Run("when workspace id value is invalid", func(t *testing.T) {
			invalidWs := factory.NewWorkspace()
			_ = uc.workspaceRepo.Save(ctx, invalidWs)

			input := createProjectInput{
				WorkspaceID: invalidWs.ID(),
				Visualizer:  visualizer.VisualizerCesium,
				Name:        lo.ToPtr("aaa"),
				Description: lo.ToPtr("bbb"),
				Alias:       lo.ToPtr("alias"),
				ImageURL:    lo.Must(url.Parse("https://example.com/hoge")),
				CoreSupport: lo.ToPtr(true),
				Archived:    lo.ToPtr(true),
			}

			got, err := uc.createProject(ctx, input, &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					WritableWorkspaces: workspace.IDList{ws.ID()},
				},
			})

			assert.EqualError(t, err, interfaces.ErrOperationDenied.Error())
			assert.Nil(t, got)
		})
	})
}

func TestProject_CheckAlias(t *testing.T) {
	ctx := context.Background()

	db := mongotest.Connect(t)(t)
	client := mongox.NewClient(db.Name(), db.Client())
	uc := createNewProjectUC(client)

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
