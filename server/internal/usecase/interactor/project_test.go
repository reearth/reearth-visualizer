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
	"github.com/reearth/reearth/server/pkg/alias"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
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
		assetRepo:           mongo.NewAsset(client),
		projectRepo:         mongo.NewProject(client),
		projectMetadataRepo: mongo.NewProjectMetadata(client),
		storytellingRepo:    mongo.NewStorytelling(client),
		userRepo:            accountmongo.NewUser(client),
		workspaceRepo:       accountmongo.NewWorkspace(client),
		sceneRepo:           mongo.NewScene(client),
		propertyRepo:        mongo.NewProperty(client),
		propertySchemaRepo:  mongo.NewPropertySchema(client),
		transaction:         client.Transaction(),
		policyRepo:          mongo.NewPolicy(client),
		nlsLayerRepo:        mongo.NewNLSLayer(client),
		layerStyles:         mongo.NewStyle(client),
		pluginRepo:          mongo.NewPlugin(client),
		file:                gw,
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
	pid := pj.ID()

	sid := id.NewSceneID()
	schema := builtin.GetPropertySchemaByVisualizer(visualizer.VisualizerCesiumBeta)
	prop, err := property.New().NewID().Schema(schema.ID()).Scene(sid).Build()
	if err != nil {
		panic(err)
	}
	ps := scene.NewPlugins([]*scene.Plugin{
		scene.NewPlugin(id.OfficialPluginID, nil),
	})
	sc := factory.NewScene(func(p *scene.Builder) {
		p.ID(sid)
		p.Project(pid)
		p.Workspace(pj.Workspace())
		p.Property(prop.ID())
		p.Plugins(ps)
	})

	err = uc.sceneRepo.Save(ctx, sc)
	assert.NoError(t, err)
	t.Run("when alias is valid", func(t *testing.T) {

		t.Run("when alias length is valid max length", func(t *testing.T) {
			ok, err := uc.CheckSceneAlias(ctx, strings.Repeat("a", 32), &pid)
			assert.NoError(t, err)
			assert.True(t, ok)
		})
		t.Run("when alias length is valid min length", func(t *testing.T) {
			ok, err := uc.CheckSceneAlias(ctx, strings.Repeat("a", 5), &pid)
			assert.NoError(t, err)
			assert.True(t, ok)
		})
	})

	t.Run("when alias update to same alias", func(t *testing.T) {
		ok, err := uc.CheckSceneAlias(ctx, testAlias, &pid)
		assert.NoError(t, err)
		assert.True(t, ok)
	})

	t.Run("when alias is invalid", func(t *testing.T) {
		t.Run("when alias include not allowed characters", func(t *testing.T) {
			for _, c := range []string{"!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "+", "=", "|", "~", "`", ".", ",", ":", ";", "'", "\"", "/", "\\", "?"} {
				ok, err := uc.CheckSceneAlias(ctx, "alias2"+c, &pid)
				assert.EqualError(t, err, alias.ErrInvalidProjectAlias.Error())
				assert.False(t, ok)
			}
		})
		t.Run("when alias is too short", func(t *testing.T) {
			ok, err := uc.CheckSceneAlias(ctx, "aaaa", &pid)
			assert.EqualError(t, err, alias.ErrInvalidProjectAlias.Error())
			assert.False(t, ok)
		})
		t.Run("when alias is too long", func(t *testing.T) {
			ok, err := uc.CheckSceneAlias(ctx, strings.Repeat("a", 33), &pid)
			assert.EqualError(t, err, alias.ErrInvalidProjectAlias.Error())
			assert.False(t, ok)
		})
	})
}

func TestProject_FindActiveById(t *testing.T) {
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

	pj := factory.NewProject(func(p *project.Builder) {
		p.Workspace(ws.ID()).
			Visibility(project.VisibilityPublic)
	})
	_ = uc.projectRepo.Save(ctx, pj)

	meta := factory.NewProjectMeta(func(m *project.MetadataBuilder) {
		m.Project(pj.ID())
		m.Workspace(ws.ID())
	})
	_ = uc.projectMetadataRepo.Save(ctx, meta)

	t.Run("when project is public", func(t *testing.T) {
		result, err := uc.FindActiveById(ctx, pj.ID(), &usecase.Operator{
			AcOperator: &accountusecase.Operator{
				WritableWorkspaces: workspace.IDList{ws.ID()},
			},
		})
		assert.NoError(t, err)
		assert.Equal(t, pj.ID(), result.ID())
	})

	t.Run("when project is private", func(t *testing.T) {
		err := pj.UpdateVisibility(string(project.VisibilityPrivate))
		assert.NoError(t, err)
		_ = uc.projectRepo.Save(ctx, pj)
		result, err := uc.FindActiveById(ctx, pj.ID(), &usecase.Operator{
			AcOperator: &accountusecase.Operator{
				WritableWorkspaces: workspace.IDList{ws.ID()},
			},
		})
		assert.NoError(t, err)
		assert.Equal(t, pj.ID(), result.ID())
	})

	t.Run("when project is private and no operator", func(t *testing.T) {
		result, err := uc.FindActiveById(ctx, pj.ID(), nil)
		assert.Error(t, err)
		assert.Nil(t, result)
		assert.Equal(t, "project is private", err.Error())
	})
}

func TestProject_FindVisibilityByUser_OffsetPagination(t *testing.T) {
	ctx := context.Background()

	db := mongotest.Connect(t)(t)
	client := mongox.NewClient(db.Name(), db.Client())
	uc := createNewProjectUC(client)

	us := factory.NewUser()
	_ = uc.userRepo.Save(ctx, us)

	ws := factory.NewWorkspace(func(w *workspace.Builder) {
		w.Members(map[accountdomain.UserID]workspace.Member{
			us.ID(): {
				Role:      workspace.RoleOwner,
				Disabled:  false,
				InvitedBy: workspace.UserID(us.ID()),
				Host:      "",
			},
		})
	})
	_ = uc.workspaceRepo.Save(ctx, ws)

	// Create 15 test projects
	projects := make([]*project.Project, 15)
	for i := 0; i < 15; i++ {
		pj := factory.NewProject(func(p *project.Builder) {
			p.Workspace(ws.ID()).
				Visibility(project.VisibilityPublic)
		})
		_ = uc.projectRepo.Save(ctx, pj)
		projects[i] = pj

		meta := factory.NewProjectMeta(func(m *project.MetadataBuilder) {
			m.Project(pj.ID())
			m.Workspace(ws.ID())
		})
		_ = uc.projectMetadataRepo.Save(ctx, meta)
	}

	operator := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			WritableWorkspaces: workspace.IDList{ws.ID()},
		},
	}

	t.Run("First page with offset pagination", func(t *testing.T) {
		param := &interfaces.ProjectListParam{
			Offset: lo.ToPtr(int64(0)),
			Limit:  lo.ToPtr(int64(5)),
		}

		result, pageInfo, err := uc.FindVisibilityByUser(ctx, us, true, operator, nil, nil, nil, param)

		assert.NoError(t, err)
		assert.Equal(t, 5, len(result))
		assert.Equal(t, int64(15), pageInfo.TotalCount)
		assert.True(t, pageInfo.HasNextPage)
		assert.False(t, pageInfo.HasPreviousPage)
	})

	t.Run("Middle page with offset pagination", func(t *testing.T) {
		param := &interfaces.ProjectListParam{
			Offset: lo.ToPtr(int64(5)),
			Limit:  lo.ToPtr(int64(5)),
		}

		result, pageInfo, err := uc.FindVisibilityByUser(ctx, us, true, operator, nil, nil, nil, param)

		assert.NoError(t, err)
		assert.Equal(t, 5, len(result))
		assert.Equal(t, int64(15), pageInfo.TotalCount)
		assert.True(t, pageInfo.HasNextPage)
		assert.True(t, pageInfo.HasPreviousPage)
	})

	t.Run("Last page with offset pagination", func(t *testing.T) {
		param := &interfaces.ProjectListParam{
			Offset: lo.ToPtr(int64(10)),
			Limit:  lo.ToPtr(int64(5)),
		}

		result, pageInfo, err := uc.FindVisibilityByUser(ctx, us, true, operator, nil, nil, nil, param)

		assert.NoError(t, err)
		assert.Equal(t, 5, len(result))
		assert.Equal(t, int64(15), pageInfo.TotalCount)
		assert.False(t, pageInfo.HasNextPage)
		assert.True(t, pageInfo.HasPreviousPage)
	})

	t.Run("Offset beyond total count", func(t *testing.T) {
		param := &interfaces.ProjectListParam{
			Offset: lo.ToPtr(int64(20)),
			Limit:  lo.ToPtr(int64(5)),
		}

		result, pageInfo, err := uc.FindVisibilityByUser(ctx, us, true, operator, nil, nil, nil, param)

		assert.NoError(t, err)
		assert.Equal(t, 0, len(result))
		assert.Equal(t, int64(15), pageInfo.TotalCount)
		assert.False(t, pageInfo.HasNextPage)
		assert.True(t, pageInfo.HasPreviousPage)
	})
}
