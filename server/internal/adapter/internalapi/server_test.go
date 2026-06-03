package internalapi

import (
	"context"
	"testing"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsInfra "github.com/reearth/reearth-accounts/server/pkg/infrastructure"
	accountsRole "github.com/reearth/reearth-accounts/server/pkg/role"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	pb "github.com/reearth/reearth-proto/gen/go/visualizer/v1"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/infrastructure/gcs"
	"github.com/reearth/reearth/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth/server/internal/testutil/factory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interactor"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	mgo "go.mongodb.org/mongo-driver/mongo"
)

func init() {
	mongotest.Env = "REEARTH_DB"
}

func createRepoContainer(db *mgo.Database) *repo.Container {
	client := mongox.NewClientWithDatabase(db)
	return &repo.Container{
		Asset:           mongo.NewAsset(client),
		NLSLayer:        mongo.NewNLSLayer(client),
		Style:           mongo.NewStyle(client),
		Plugin:          mongo.NewPlugin(client),
		Project:         mongo.NewProject(client),
		ProjectMetadata: mongo.NewProjectMetadata(client),
		PropertySchema:  mongo.NewPropertySchema(client),
		Property:        mongo.NewProperty(client),
		Scene:           mongo.NewScene(client),
		Workspace:       accountsInfra.NewMongoWorkspace(client),
		User:            accountsInfra.NewMongoUser(client),
		SceneLock:       mongo.NewSceneLock(client),
		Storytelling:    mongo.NewStorytelling(client),
		Transaction:     client.Transaction(),
	}
}

type mockPolicyChecker struct{}

func (m *mockPolicyChecker) CheckPolicy(_ context.Context, _ gateway.PolicyCheckRequest) (*gateway.PolicyCheckResponse, error) {
	return &gateway.PolicyCheckResponse{
		Allowed: true,
	}, nil
}

func createGatewayContainer(t *testing.T) *gateway.Container {
	t.Helper()
	file, err := gcs.NewFile(true, "test-bucket", "", "public, max-age=3600")
	require.NoError(t, err)
	return &gateway.Container{
		File:          file,
		PolicyChecker: &mockPolicyChecker{},
	}
}

func createUsecaseContainer(repos *repo.Container, gateways *gateway.Container) *interfaces.Container {
	return &interfaces.Container{
		Project:         interactor.NewProject(repos, gateways),
		ProjectMetadata: interactor.NewProjectMetadata(repos, gateways),
		Scene:           interactor.NewScene(repos, gateways),
		StoryTelling:    interactor.NewStorytelling(repos, gateways),
	}
}

func setupTestData(t *testing.T, ctx context.Context, repos *repo.Container) (
	*accountsWorkspace.Workspace,
	*usecase.Operator,
) {
	t.Helper()

	us := factory.NewUser()
	err := repos.User.Save(ctx, us)
	assert.NoError(t, err)

	ws := factory.NewWorkspace(func(w *accountsWorkspace.Builder) {
		w.Members(map[accountsID.UserID]accountsWorkspace.Member{
			us.ID(): {
				Role:      accountsRole.RoleOwner,
				Disabled:  false,
				InvitedBy: accountsWorkspace.UserID(us.ID()),
			},
		})
	})
	err = repos.Workspace.Save(ctx, ws)
	assert.NoError(t, err)

	op := &usecase.Operator{
		AcOperator: &accountsWorkspace.Operator{
			User:               lo.ToPtr(us.ID()),
			WritableWorkspaces: accountsID.WorkspaceIDList{ws.ID()},
			OwningWorkspaces:   accountsID.WorkspaceIDList{ws.ID()},
		},
	}

	return ws, op
}

func TestNewServer(t *testing.T) {
	s := NewServer()
	assert.NotNil(t, s)
}

func TestServer_ValidateProjectAlias(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)

	repos := createRepoContainer(db)
	gateways := createGatewayContainer(t)
	uc := createUsecaseContainer(repos, gateways)

	ws, op := setupTestData(t, ctx, repos)

	ctx = adapter.AttachUsecases(ctx, uc)
	ctx = adapter.AttachOperator(ctx, op)
	ctx = adapter.AttachCurrentHost(ctx, "https://example.com")
	ctx = adapter.AttachInternal(ctx, true)

	s := NewServer()

	t.Run("valid alias returns available true", func(t *testing.T) {
		req := &pb.ValidateProjectAliasRequest{
			WorkspaceId: ws.ID().String(),
			Alias:       "valid-alias",
		}

		resp, err := s.ValidateProjectAlias(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, ws.ID().String(), resp.WorkspaceId)
		assert.True(t, resp.Available)
	})

	t.Run("invalid workspace ID returns error", func(t *testing.T) {
		req := &pb.ValidateProjectAliasRequest{
			WorkspaceId: "invalid-id",
			Alias:       "valid-alias",
		}

		_, err := s.ValidateProjectAlias(ctx, req)
		assert.Error(t, err)
	})

	t.Run("existing alias returns not available", func(t *testing.T) {
		// Create a project with an alias first
		pj := factory.NewProject(func(p *project.Builder) {
			p.Workspace(ws.ID()).
				ProjectAlias("existing-alias").
				Visibility(project.VisibilityPublic)
		})
		err := repos.Project.Save(ctx, pj)
		assert.NoError(t, err)

		req := &pb.ValidateProjectAliasRequest{
			WorkspaceId: ws.ID().String(),
			Alias:       "existing-alias",
		}

		resp, err := s.ValidateProjectAlias(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.False(t, resp.Available)
	})
}

func TestServer_ValidateSceneAlias(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	repos := createRepoContainer(db)
	gateways := createGatewayContainer(t)
	uc := createUsecaseContainer(repos, gateways)

	_, op := setupTestData(t, ctx, repos)

	ctx = adapter.AttachUsecases(ctx, uc)
	ctx = adapter.AttachOperator(ctx, op)
	ctx = adapter.AttachCurrentHost(ctx, "https://example.com")
	ctx = adapter.AttachInternal(ctx, true)

	s := NewServer()

	t.Run("valid alias returns available true", func(t *testing.T) {
		req := &pb.ValidateSceneAliasRequest{
			Alias: "valid-scene-alias",
		}

		resp, err := s.ValidateSceneAlias(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.True(t, resp.Available)
	})
}

func TestServer_GetProject(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	repos := createRepoContainer(db)
	gateways := createGatewayContainer(t)
	uc := createUsecaseContainer(repos, gateways)

	us := factory.NewUser()
	require.NoError(t, repos.User.Save(ctx, us))

	ws := factory.NewWorkspace(func(w *accountsWorkspace.Builder) {
		w.Members(map[accountsID.UserID]accountsWorkspace.Member{
			us.ID(): {
				Role:      accountsRole.RoleOwner,
				Disabled:  false,
				InvitedBy: accountsWorkspace.UserID(us.ID()),
			},
		})
	})
	require.NoError(t, repos.Workspace.Save(ctx, ws))

	pj := factory.NewProject(func(p *project.Builder) {
		p.Workspace(ws.ID()).
			Visibility(project.VisibilityPublic)
	})
	require.NoError(t, repos.Project.Save(ctx, pj))

	meta := factory.NewProjectMeta(func(m *project.MetadataBuilder) {
		m.Project(pj.ID())
		m.Workspace(ws.ID())
	})
	require.NoError(t, repos.ProjectMetadata.Save(ctx, meta))

	sc := factory.NewScene(func(sb *scene.Builder) {
		sb.Project(pj.ID())
		sb.Workspace(ws.ID())
	})
	require.NoError(t, repos.Scene.Save(ctx, sc))

	pj.UpdateSceneID(sc.ID())
	require.NoError(t, repos.Project.Save(ctx, pj))

	st := storytelling.NewStory().NewID().Scene(sc.ID()).Property(id.NewPropertyID()).MustBuild()
	require.NoError(t, repos.Storytelling.Save(ctx, *st))

	op := &usecase.Operator{
		AcOperator: &accountsWorkspace.Operator{
			User:               lo.ToPtr(us.ID()),
			WritableWorkspaces: accountsID.WorkspaceIDList{ws.ID()},
			OwningWorkspaces:   accountsID.WorkspaceIDList{ws.ID()},
		},
	}

	ctx = adapter.AttachUsecases(ctx, uc)
	ctx = adapter.AttachOperator(ctx, op)
	ctx = adapter.AttachUser(ctx, us)
	ctx = adapter.AttachCurrentHost(ctx, "https://example.com")
	ctx = adapter.AttachInternal(ctx, true)

	s := NewServer()

	t.Run("get existing project", func(t *testing.T) {
		req := &pb.GetProjectRequest{
			ProjectId: pj.ID().String(),
		}

		resp, err := s.GetProject(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.NotNil(t, resp.Project)
		assert.Equal(t, pj.ID().String(), resp.Project.Id)
		assert.Equal(t, ws.ID().String(), resp.Project.WorkspaceId)
	})

	t.Run("invalid project ID returns error", func(t *testing.T) {
		req := &pb.GetProjectRequest{
			ProjectId: "invalid-id",
		}

		_, err := s.GetProject(ctx, req)
		assert.Error(t, err)
	})

	t.Run("non-existent project ID returns error", func(t *testing.T) {
		req := &pb.GetProjectRequest{
			ProjectId: id.NewProjectID().String(),
		}

		_, err := s.GetProject(ctx, req)
		assert.Error(t, err)
	})
}

func TestServer_CreateProject(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	repos := createRepoContainer(db)
	gateways := createGatewayContainer(t)
	uc := createUsecaseContainer(repos, gateways)

	ws, op := setupTestData(t, ctx, repos)

	ctx = adapter.AttachUsecases(ctx, uc)
	ctx = adapter.AttachOperator(ctx, op)
	ctx = adapter.AttachCurrentHost(ctx, "https://example.com")
	ctx = adapter.AttachInternal(ctx, true)

	s := NewServer()

	t.Run("create project successfully", func(t *testing.T) {
		name := "Test Project"
		description := "Test Description"
		req := &pb.CreateProjectRequest{
			WorkspaceId:  ws.ID().String(),
			Name:         &name,
			Description:  &description,
			Visualizer:   pb.Visualizer_VISUALIZER_CESIUM,
			CoreSupport:  lo.ToPtr(true),
			ProjectAlias: lo.ToPtr("test-project-alias"),
		}

		resp, err := s.CreateProject(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.NotNil(t, resp.Project)
		assert.Equal(t, name, resp.Project.Name)
		assert.Equal(t, description, resp.Project.Description)
		assert.Equal(t, ws.ID().String(), resp.Project.WorkspaceId)
		assert.NotEmpty(t, resp.Project.Id)
		assert.NotEmpty(t, resp.Project.SceneId)
	})

	t.Run("invalid workspace ID returns error", func(t *testing.T) {
		req := &pb.CreateProjectRequest{
			WorkspaceId: "invalid-workspace-id",
		}

		_, err := s.CreateProject(ctx, req)
		assert.Error(t, err)
	})
}

func TestServer_UpdateProject(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	repos := createRepoContainer(db)
	gateways := createGatewayContainer(t)
	uc := createUsecaseContainer(repos, gateways)

	us := factory.NewUser()
	require.NoError(t, repos.User.Save(ctx, us))

	ws := factory.NewWorkspace(func(w *accountsWorkspace.Builder) {
		w.Members(map[accountsID.UserID]accountsWorkspace.Member{
			us.ID(): {
				Role:      accountsRole.RoleOwner,
				Disabled:  false,
				InvitedBy: accountsWorkspace.UserID(us.ID()),
			},
		})
	})
	require.NoError(t, repos.Workspace.Save(ctx, ws))

	pj := factory.NewProject(func(p *project.Builder) {
		p.Workspace(ws.ID()).
			Name("Original Name").
			Visibility(project.VisibilityPublic)
	})
	require.NoError(t, repos.Project.Save(ctx, pj))

	meta := factory.NewProjectMeta(func(m *project.MetadataBuilder) {
		m.Project(pj.ID())
		m.Workspace(ws.ID())
	})
	require.NoError(t, repos.ProjectMetadata.Save(ctx, meta))

	sc := factory.NewScene(func(sb *scene.Builder) {
		sb.Project(pj.ID())
		sb.Workspace(ws.ID())
	})
	require.NoError(t, repos.Scene.Save(ctx, sc))

	pj.UpdateSceneID(sc.ID())
	require.NoError(t, repos.Project.Save(ctx, pj))

	st := storytelling.NewStory().NewID().Scene(sc.ID()).Property(id.NewPropertyID()).MustBuild()
	require.NoError(t, repos.Storytelling.Save(ctx, *st))

	op := &usecase.Operator{
		AcOperator: &accountsWorkspace.Operator{
			User:               lo.ToPtr(us.ID()),
			WritableWorkspaces: accountsID.WorkspaceIDList{ws.ID()},
			OwningWorkspaces:   accountsID.WorkspaceIDList{ws.ID()},
		},
	}

	ctx = adapter.AttachUsecases(ctx, uc)
	ctx = adapter.AttachOperator(ctx, op)
	ctx = adapter.AttachUser(ctx, us)
	ctx = adapter.AttachCurrentHost(ctx, "https://example.com")
	ctx = adapter.AttachInternal(ctx, true)

	s := NewServer()

	t.Run("update project name and description", func(t *testing.T) {
		newName := "Updated Name"
		newDescription := "Updated Description"
		req := &pb.UpdateProjectRequest{
			ProjectId:   pj.ID().String(),
			Name:        &newName,
			Description: &newDescription,
		}

		resp, err := s.UpdateProject(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.NotNil(t, resp.Project)
		assert.Equal(t, newName, resp.Project.Name)
		assert.Equal(t, newDescription, resp.Project.Description)
	})

	t.Run("invalid project ID returns error", func(t *testing.T) {
		req := &pb.UpdateProjectRequest{
			ProjectId: "invalid-id",
		}

		_, err := s.UpdateProject(ctx, req)
		assert.Error(t, err)
	})
}

func TestServer_DeleteProject(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	repos := createRepoContainer(db)
	gateways := createGatewayContainer(t)
	uc := createUsecaseContainer(repos, gateways)

	us := factory.NewUser()
	require.NoError(t, repos.User.Save(ctx, us))

	ws := factory.NewWorkspace(func(w *accountsWorkspace.Builder) {
		w.Members(map[accountsID.UserID]accountsWorkspace.Member{
			us.ID(): {
				Role:      accountsRole.RoleOwner,
				Disabled:  false,
				InvitedBy: accountsWorkspace.UserID(us.ID()),
			},
		})
	})
	require.NoError(t, repos.Workspace.Save(ctx, ws))

	pj := factory.NewProject(func(p *project.Builder) {
		p.Workspace(ws.ID()).
			Visibility(project.VisibilityPublic)
	})
	require.NoError(t, repos.Project.Save(ctx, pj))

	meta := factory.NewProjectMeta(func(m *project.MetadataBuilder) {
		m.Project(pj.ID())
		m.Workspace(ws.ID())
	})
	require.NoError(t, repos.ProjectMetadata.Save(ctx, meta))

	sc := factory.NewScene(func(sb *scene.Builder) {
		sb.Project(pj.ID())
		sb.Workspace(ws.ID())
	})
	require.NoError(t, repos.Scene.Save(ctx, sc))

	pj.UpdateSceneID(sc.ID())
	require.NoError(t, repos.Project.Save(ctx, pj))

	op := &usecase.Operator{
		AcOperator: &accountsWorkspace.Operator{
			User:               lo.ToPtr(us.ID()),
			WritableWorkspaces: accountsID.WorkspaceIDList{ws.ID()},
			OwningWorkspaces:   accountsID.WorkspaceIDList{ws.ID()},
		},
	}

	ctx = adapter.AttachUsecases(ctx, uc)
	ctx = adapter.AttachOperator(ctx, op)
	ctx = adapter.AttachUser(ctx, us)
	ctx = adapter.AttachCurrentHost(ctx, "https://example.com")
	ctx = adapter.AttachInternal(ctx, true)

	s := NewServer()

	t.Run("delete existing project", func(t *testing.T) {
		req := &pb.DeleteProjectRequest{
			ProjectId: pj.ID().String(),
		}

		resp, err := s.DeleteProject(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, pj.ID().String(), resp.ProjectId)
	})

	t.Run("invalid project ID returns error", func(t *testing.T) {
		req := &pb.DeleteProjectRequest{
			ProjectId: "invalid-id",
		}

		_, err := s.DeleteProject(ctx, req)
		assert.Error(t, err)
	})
}

func TestServer_GetAllProjects(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	repos := createRepoContainer(db)
	gateways := createGatewayContainer(t)
	uc := createUsecaseContainer(repos, gateways)

	us := factory.NewUser()
	require.NoError(t, repos.User.Save(ctx, us))

	ws := factory.NewWorkspace(func(w *accountsWorkspace.Builder) {
		w.Members(map[accountsID.UserID]accountsWorkspace.Member{
			us.ID(): {
				Role:      accountsRole.RoleOwner,
				Disabled:  false,
				InvitedBy: accountsWorkspace.UserID(us.ID()),
			},
		})
	})
	require.NoError(t, repos.Workspace.Save(ctx, ws))

	// Create public projects
	for i := 0; i < 3; i++ {
		pj := factory.NewProject(func(p *project.Builder) {
			p.Workspace(ws.ID()).
				Visibility(project.VisibilityPublic)
		})

		starCount := int64(i + 1)
		meta := factory.NewProjectMeta(func(m *project.MetadataBuilder) {
			m.Project(pj.ID())
			m.Workspace(ws.ID())
			m.StarCount(&starCount)
		})

		require.NoError(t, repos.Project.Save(ctx, pj))
		require.NoError(t, repos.ProjectMetadata.Save(ctx, meta))
	}

	// Create private project
	privatePj := factory.NewProject(func(p *project.Builder) {
		p.Workspace(ws.ID()).
			Visibility(project.VisibilityPrivate)
	})
	privateMeta := factory.NewProjectMeta(func(m *project.MetadataBuilder) {
		m.Project(privatePj.ID())
		m.Workspace(ws.ID())
	})
	require.NoError(t, repos.Project.Save(ctx, privatePj))
	require.NoError(t, repos.ProjectMetadata.Save(ctx, privateMeta))

	ctx = adapter.AttachUsecases(ctx, uc)
	ctx = adapter.AttachCurrentHost(ctx, "https://example.com")
	ctx = adapter.AttachInternal(ctx, true)

	s := NewServer()

	t.Run("get all public projects", func(t *testing.T) {
		visibility := pb.ProjectVisibility_PROJECT_VISIBILITY_PUBLIC
		req := &pb.GetAllProjectsRequest{
			Visibility: &visibility,
		}

		resp, err := s.GetAllProjects(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, 3, len(resp.Projects))
	})

	t.Run("get all projects with pagination", func(t *testing.T) {
		limit := int32(2)
		visibility := pb.ProjectVisibility_PROJECT_VISIBILITY_PUBLIC
		req := &pb.GetAllProjectsRequest{
			Visibility: &visibility,
			Pagination: &pb.Pagination{
				First: &limit,
			},
		}

		resp, err := s.GetAllProjects(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, 2, len(resp.Projects))
		assert.True(t, resp.PageInfo.HasNextPage)
	})
}

func TestServer_UpdateProjectMetadata(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	repos := createRepoContainer(db)
	gateways := createGatewayContainer(t)
	uc := createUsecaseContainer(repos, gateways)

	us := factory.NewUser()
	require.NoError(t, repos.User.Save(ctx, us))

	ws := factory.NewWorkspace(func(w *accountsWorkspace.Builder) {
		w.Members(map[accountsID.UserID]accountsWorkspace.Member{
			us.ID(): {
				Role:      accountsRole.RoleOwner,
				Disabled:  false,
				InvitedBy: accountsWorkspace.UserID(us.ID()),
			},
		})
	})
	require.NoError(t, repos.Workspace.Save(ctx, ws))

	pj := factory.NewProject(func(p *project.Builder) {
		p.Workspace(ws.ID()).
			Visibility(project.VisibilityPublic)
	})
	require.NoError(t, repos.Project.Save(ctx, pj))

	meta := factory.NewProjectMeta(func(m *project.MetadataBuilder) {
		m.Project(pj.ID())
		m.Workspace(ws.ID())
	})
	require.NoError(t, repos.ProjectMetadata.Save(ctx, meta))

	op := &usecase.Operator{
		AcOperator: &accountsWorkspace.Operator{
			User:               lo.ToPtr(us.ID()),
			WritableWorkspaces: accountsID.WorkspaceIDList{ws.ID()},
			OwningWorkspaces:   accountsID.WorkspaceIDList{ws.ID()},
		},
	}

	ctx = adapter.AttachUsecases(ctx, uc)
	ctx = adapter.AttachOperator(ctx, op)
	ctx = adapter.AttachUser(ctx, us)
	ctx = adapter.AttachCurrentHost(ctx, "https://example.com")
	ctx = adapter.AttachInternal(ctx, true)

	s := NewServer()

	t.Run("update project metadata", func(t *testing.T) {
		newReadme := "Updated readme"
		newLicense := "MIT"
		req := &pb.UpdateProjectMetadataRequest{
			ProjectId: pj.ID().String(),
			Readme:    &newReadme,
			License:   &newLicense,
			Topics: &pb.Topics{
				Values: []string{"topic1", "topic2"},
			},
		}

		resp, err := s.UpdateProjectMetadata(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.NotNil(t, resp.Metadata)
	})

	t.Run("invalid project ID returns error", func(t *testing.T) {
		req := &pb.UpdateProjectMetadataRequest{
			ProjectId: "invalid-id",
		}

		_, err := s.UpdateProjectMetadata(ctx, req)
		assert.Error(t, err)
	})
}

func TestServer_PatchStarCount(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	repos := createRepoContainer(db)
	gateways := createGatewayContainer(t)
	uc := createUsecaseContainer(repos, gateways)

	us := factory.NewUser()
	require.NoError(t, repos.User.Save(ctx, us))

	ws := factory.NewWorkspace(func(w *accountsWorkspace.Builder) {
		w.Members(map[accountsID.UserID]accountsWorkspace.Member{
			us.ID(): {
				Role:      accountsRole.RoleOwner,
				Disabled:  false,
				InvitedBy: accountsWorkspace.UserID(us.ID()),
			},
		})
	})
	require.NoError(t, repos.Workspace.Save(ctx, ws))

	projectAlias := "star-test-project"
	pj := factory.NewProject(func(p *project.Builder) {
		p.Workspace(ws.ID()).
			Visibility(project.VisibilityPublic).
			ProjectAlias(projectAlias)
	})
	require.NoError(t, repos.Project.Save(ctx, pj))

	starCount := int64(0)
	meta := factory.NewProjectMeta(func(m *project.MetadataBuilder) {
		m.Project(pj.ID())
		m.Workspace(ws.ID())
		m.StarCount(&starCount)
		m.StarredBy(&[]string{})
	})
	require.NoError(t, repos.ProjectMetadata.Save(ctx, meta))

	op := &usecase.Operator{
		AcOperator: &accountsWorkspace.Operator{
			User:               lo.ToPtr(us.ID()),
			WritableWorkspaces: accountsID.WorkspaceIDList{ws.ID()},
			OwningWorkspaces:   accountsID.WorkspaceIDList{ws.ID()},
		},
	}

	ctx = adapter.AttachUsecases(ctx, uc)
	ctx = adapter.AttachOperator(ctx, op)
	ctx = adapter.AttachUser(ctx, us)
	ctx = adapter.AttachCurrentHost(ctx, "https://example.com")
	ctx = adapter.AttachInternal(ctx, true)

	s := NewServer()

	t.Run("star a project", func(t *testing.T) {
		req := &pb.PatchStarCountRequest{
			WorkspaceId:  ws.ID().String(),
			ProjectAlias: projectAlias,
		}

		resp, err := s.PatchStarCount(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.NotNil(t, resp.Projectmetadata)
		assert.Equal(t, int64(1), *resp.Projectmetadata.StarCount)
	})

	t.Run("unstar a project", func(t *testing.T) {
		// Second call should unstar
		req := &pb.PatchStarCountRequest{
			WorkspaceId:  ws.ID().String(),
			ProjectAlias: projectAlias,
		}

		resp, err := s.PatchStarCount(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.NotNil(t, resp.Projectmetadata)
		assert.Equal(t, int64(0), *resp.Projectmetadata.StarCount)
	})

	t.Run("no user in context returns error", func(t *testing.T) {
		ctxNoUser := context.Background()
		ctxNoUser = adapter.AttachUsecases(ctxNoUser, uc)
		ctxNoUser = adapter.AttachOperator(ctxNoUser, op)

		req := &pb.PatchStarCountRequest{
			WorkspaceId:  ws.ID().String(),
			ProjectAlias: projectAlias,
		}

		_, err := s.PatchStarCount(ctxNoUser, req)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "user not found")
	})

	t.Run("invalid workspace ID returns error", func(t *testing.T) {
		req := &pb.PatchStarCountRequest{
			WorkspaceId:  "invalid-id",
			ProjectAlias: projectAlias,
		}

		_, err := s.PatchStarCount(ctx, req)
		assert.Error(t, err)
	})
}

func TestServer_GetProjectByWorkspaceAliasAndProjectAlias(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	repos := createRepoContainer(db)
	gateways := createGatewayContainer(t)
	uc := createUsecaseContainer(repos, gateways)

	us := factory.NewUser()
	require.NoError(t, repos.User.Save(ctx, us))

	wsAlias := "test-workspace"
	ws := factory.NewWorkspace(func(w *accountsWorkspace.Builder) {
		w.Members(map[accountsID.UserID]accountsWorkspace.Member{
			us.ID(): {
				Role:      accountsRole.RoleOwner,
				Disabled:  false,
				InvitedBy: accountsWorkspace.UserID(us.ID()),
			},
		})
		w.Alias(wsAlias)
	})
	require.NoError(t, repos.Workspace.Save(ctx, ws))

	projectAlias := "test-project"
	pj := factory.NewProject(func(p *project.Builder) {
		p.Workspace(ws.ID()).
			Visibility(project.VisibilityPublic).
			ProjectAlias(projectAlias)
	})
	require.NoError(t, repos.Project.Save(ctx, pj))

	meta := factory.NewProjectMeta(func(m *project.MetadataBuilder) {
		m.Project(pj.ID())
		m.Workspace(ws.ID())
	})
	require.NoError(t, repos.ProjectMetadata.Save(ctx, meta))

	sc := factory.NewScene(func(sb *scene.Builder) {
		sb.Project(pj.ID())
		sb.Workspace(ws.ID())
	})
	require.NoError(t, repos.Scene.Save(ctx, sc))

	pj.UpdateSceneID(sc.ID())
	require.NoError(t, repos.Project.Save(ctx, pj))

	st := storytelling.NewStory().NewID().Scene(sc.ID()).Property(id.NewPropertyID()).MustBuild()
	require.NoError(t, repos.Storytelling.Save(ctx, *st))

	op := &usecase.Operator{
		AcOperator: &accountsWorkspace.Operator{
			User:               lo.ToPtr(us.ID()),
			WritableWorkspaces: accountsID.WorkspaceIDList{ws.ID()},
			OwningWorkspaces:   accountsID.WorkspaceIDList{ws.ID()},
		},
	}

	ctx = adapter.AttachUsecases(ctx, uc)
	ctx = adapter.AttachOperator(ctx, op)
	ctx = adapter.AttachUser(ctx, us)
	ctx = adapter.AttachCurrentHost(ctx, "https://example.com")
	ctx = adapter.AttachInternal(ctx, true)

	s := NewServer()

	t.Run("get project by workspace and project alias", func(t *testing.T) {
		req := &pb.GetProjectByWorkspaceAliasAndProjectAliasRequest{
			WorkspaceAlias: wsAlias,
			ProjectAlias:   projectAlias,
		}

		resp, err := s.GetProjectByWorkspaceAliasAndProjectAlias(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.NotNil(t, resp.Project)
		assert.Equal(t, pj.ID().String(), resp.Project.Id)
	})

	t.Run("non-existent workspace alias returns error", func(t *testing.T) {
		req := &pb.GetProjectByWorkspaceAliasAndProjectAliasRequest{
			WorkspaceAlias: "non-existent",
			ProjectAlias:   projectAlias,
		}

		_, err := s.GetProjectByWorkspaceAliasAndProjectAlias(ctx, req)
		assert.Error(t, err)
	})

	t.Run("non-existent project alias returns error", func(t *testing.T) {
		req := &pb.GetProjectByWorkspaceAliasAndProjectAliasRequest{
			WorkspaceAlias: wsAlias,
			ProjectAlias:   "non-existent",
		}

		_, err := s.GetProjectByWorkspaceAliasAndProjectAlias(ctx, req)
		assert.Error(t, err)
	})

	t.Run("cannot access project from different workspace", func(t *testing.T) {
		// Create another workspace with different alias
		otherWsAlias := "other-workspace"
		otherWs := factory.NewWorkspace(func(w *accountsWorkspace.Builder) {
			w.Members(map[accountsID.UserID]accountsWorkspace.Member{
				us.ID(): {
					Role:      accountsRole.RoleOwner,
					Disabled:  false,
					InvitedBy: accountsWorkspace.UserID(us.ID()),
				},
			})
			w.Alias(otherWsAlias)
		})
		require.NoError(t, repos.Workspace.Save(ctx, otherWs))

		// Try to access the project using the other workspace's alias
		// but with the original project's alias - should fail
		req := &pb.GetProjectByWorkspaceAliasAndProjectAliasRequest{
			WorkspaceAlias: otherWsAlias,
			ProjectAlias:   projectAlias, // This project belongs to wsAlias, not otherWsAlias
		}

		_, err := s.GetProjectByWorkspaceAliasAndProjectAlias(ctx, req)
		assert.Error(t, err, "should not be able to access project from different workspace")
	})
}

func TestServer_DeleteProjectByWorkspaceAliasAndProjectAlias(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	repos := createRepoContainer(db)
	gateways := createGatewayContainer(t)
	uc := createUsecaseContainer(repos, gateways)

	us := factory.NewUser()
	require.NoError(t, repos.User.Save(ctx, us))

	wsAlias := "delete-test-workspace"
	ws := factory.NewWorkspace(func(w *accountsWorkspace.Builder) {
		w.Members(map[accountsID.UserID]accountsWorkspace.Member{
			us.ID(): {
				Role:      accountsRole.RoleOwner,
				Disabled:  false,
				InvitedBy: accountsWorkspace.UserID(us.ID()),
			},
		})
		w.Alias(wsAlias)
	})
	require.NoError(t, repos.Workspace.Save(ctx, ws))

	projectAlias := "delete-test-project"
	pj := factory.NewProject(func(p *project.Builder) {
		p.Workspace(ws.ID()).
			Visibility(project.VisibilityPublic).
			ProjectAlias(projectAlias)
	})
	require.NoError(t, repos.Project.Save(ctx, pj))

	meta := factory.NewProjectMeta(func(m *project.MetadataBuilder) {
		m.Project(pj.ID())
		m.Workspace(ws.ID())
	})
	require.NoError(t, repos.ProjectMetadata.Save(ctx, meta))

	sc := factory.NewScene(func(sb *scene.Builder) {
		sb.Project(pj.ID())
		sb.Workspace(ws.ID())
	})
	require.NoError(t, repos.Scene.Save(ctx, sc))

	pj.UpdateSceneID(sc.ID())
	require.NoError(t, repos.Project.Save(ctx, pj))

	op := &usecase.Operator{
		AcOperator: &accountsWorkspace.Operator{
			User:               lo.ToPtr(us.ID()),
			WritableWorkspaces: accountsID.WorkspaceIDList{ws.ID()},
			OwningWorkspaces:   accountsID.WorkspaceIDList{ws.ID()},
		},
	}

	ctx = adapter.AttachUsecases(ctx, uc)
	ctx = adapter.AttachOperator(ctx, op)
	ctx = adapter.AttachUser(ctx, us)
	ctx = adapter.AttachCurrentHost(ctx, "https://example.com")
	ctx = adapter.AttachInternal(ctx, true)

	s := NewServer()

	t.Run("delete project by alias", func(t *testing.T) {
		req := &pb.DeleteProjectByWorkspaceAliasAndProjectAliasRequest{
			WorkspaceAlias: wsAlias,
			ProjectAlias:   projectAlias,
		}

		resp, err := s.DeleteProjectByWorkspaceAliasAndProjectAlias(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, projectAlias, resp.ProjectAlias)
	})

	t.Run("non-existent project returns error", func(t *testing.T) {
		req := &pb.DeleteProjectByWorkspaceAliasAndProjectAliasRequest{
			WorkspaceAlias: wsAlias,
			ProjectAlias:   "non-existent",
		}

		_, err := s.DeleteProjectByWorkspaceAliasAndProjectAlias(ctx, req)
		assert.Error(t, err)
	})
}

func TestServer_GetProjectList(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	repos := createRepoContainer(db)
	gateways := createGatewayContainer(t)
	uc := createUsecaseContainer(repos, gateways)

	us := factory.NewUser()
	require.NoError(t, repos.User.Save(ctx, us))

	ws := factory.NewWorkspace(func(w *accountsWorkspace.Builder) {
		w.Members(map[accountsID.UserID]accountsWorkspace.Member{
			us.ID(): {
				Role:      accountsRole.RoleOwner,
				Disabled:  false,
				InvitedBy: accountsWorkspace.UserID(us.ID()),
			},
		})
	})
	require.NoError(t, repos.Workspace.Save(ctx, ws))

	// Create projects
	for i := 0; i < 3; i++ {
		pj := factory.NewProject(func(p *project.Builder) {
			p.Workspace(ws.ID()).
				Visibility(project.VisibilityPublic)
		})

		meta := factory.NewProjectMeta(func(m *project.MetadataBuilder) {
			m.Project(pj.ID())
			m.Workspace(ws.ID())
		})

		sc := factory.NewScene(func(sb *scene.Builder) {
			sb.Project(pj.ID())
			sb.Workspace(ws.ID())
		})
		require.NoError(t, repos.Scene.Save(ctx, sc))

		pj.UpdateSceneID(sc.ID())
		require.NoError(t, repos.Project.Save(ctx, pj))
		require.NoError(t, repos.ProjectMetadata.Save(ctx, meta))
	}

	op := &usecase.Operator{
		AcOperator: &accountsWorkspace.Operator{
			User:               lo.ToPtr(us.ID()),
			WritableWorkspaces: accountsID.WorkspaceIDList{ws.ID()},
			OwningWorkspaces:   accountsID.WorkspaceIDList{ws.ID()},
		},
	}

	ctx = adapter.AttachUsecases(ctx, uc)
	ctx = adapter.AttachOperator(ctx, op)
	ctx = adapter.AttachUser(ctx, us)
	ctx = adapter.AttachCurrentHost(ctx, "https://example.com")
	ctx = adapter.AttachInternal(ctx, true)

	s := NewServer()

	t.Run("get project list for user", func(t *testing.T) {
		req := &pb.GetProjectListRequest{
			Authenticated: true,
		}

		resp, err := s.GetProjectList(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, 3, len(resp.Projects))
	})

	t.Run("get project list by workspace", func(t *testing.T) {
		wsIDStr := ws.ID().String()
		req := &pb.GetProjectListRequest{
			WorkspaceId:   &wsIDStr,
			Authenticated: true,
		}

		resp, err := s.GetProjectList(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, 3, len(resp.Projects))
	})
}
