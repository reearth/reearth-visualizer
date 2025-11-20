package interactor

import (
	"archive/zip"
	"bytes"
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

// MockPolicyChecker is a mock implementation of gateway.PolicyChecker
type MockPolicyChecker struct {
	mock.Mock
}

func (m *MockPolicyChecker) CheckPolicy(ctx context.Context, req gateway.PolicyCheckRequest) (*gateway.PolicyCheckResponse, error) {
	args := m.Called(ctx, req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*gateway.PolicyCheckResponse), args.Error(1)
}

// Test helper to create a project test environment
type projectTestEnv struct {
	ctx               context.Context
	wsID              accountsID.WorkspaceID
	projectUC         interfaces.Project
	operator          *usecase.Operator
	mockPolicyChecker *MockPolicyChecker
	db                *repo.Container
}

func setupProjectTestEnv(ctx context.Context, t *testing.T) *projectTestEnv {
	t.Helper()

	mockPolicyChecker := new(MockPolicyChecker)
	db := memory.New()
	wsID := accountsID.NewWorkspaceID()

	// Create workspace
	ws := workspace.New().ID(wsID).MustBuild()
	_ = db.Workspace.Save(ctx, ws)

	// Create repositories
	repos := &repo.Container{
		User:            db.User,
		Workspace:       db.Workspace,
		Project:         db.Project,
		ProjectMetadata: db.ProjectMetadata,
		Scene:           db.Scene,
		Property:        db.Property,
		PropertySchema:  db.PropertySchema,
		Asset:           db.Asset,
		Policy:          db.Policy,
		Plugin:          db.Plugin,
		NLSLayer:        db.NLSLayer,
		Style:           db.Style,
		Storytelling:    db.Storytelling,
		SceneLock:       db.SceneLock,
		Transaction:     &usecasex.NopTransaction{},
	}

	// Create gateways
	gateways := &gateway.Container{
		File:          lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
		PolicyChecker: mockPolicyChecker,
	}

	// Create project interactor
	projectUC := NewProject(repos, gateways)

	// Create operator
	operator := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			WritableWorkspaces: workspace.IDList{wsID},
			OwningWorkspaces:   workspace.IDList{wsID},
		},
	}

	return &projectTestEnv{
		ctx:               ctx,
		wsID:              wsID,
		projectUC:         projectUC,
		operator:          operator,
		mockPolicyChecker: mockPolicyChecker,
		db:                db,
	}
}

func TestProject_PolicyChecker(t *testing.T) {
	ctx := context.Background()

	t.Run("Create", func(t *testing.T) {
		t.Run("should create project when policy allows", func(t *testing.T) {
			// Arrange
			env := setupProjectTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
				Maybe()

			// Act
			input := interfaces.CreateProjectParam{
				WorkspaceID: env.wsID,
				Visualizer:  visualizer.VisualizerCesium,
				Name:        lo.ToPtr("Test Project"),
				Description: lo.ToPtr("Test Description"),
			}
			result, err := env.projectUC.Create(ctx, input, env.operator)

			// Assert
			assert.NoError(t, err)
			assert.NotNil(t, result)
			assert.Equal(t, "Test Project", result.Name())
			assert.Equal(t, "Test Description", result.Description())
			env.mockPolicyChecker.AssertExpectations(t)
		})

		t.Run("should return error when seats are overused", func(t *testing.T) {
			// Arrange
			env := setupProjectTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: false}, nil).
				Once()

			// Act
			input := interfaces.CreateProjectParam{
				WorkspaceID: env.wsID,
				Visualizer:  visualizer.VisualizerCesium,
				Name:        lo.ToPtr("Test Project"),
			}
			result, err := env.projectUC.Create(ctx, input, env.operator)

			// Assert
			assert.Error(t, err)
			assert.Contains(t, err.Error(), "operation is disabled by over")
			assert.Nil(t, result)
			env.mockPolicyChecker.AssertExpectations(t)
		})

		t.Run("should return error when policy check fails", func(t *testing.T) {
			// Arrange
			env := setupProjectTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(nil, errors.New("policy service unavailable")).
				Once()

			// Act
			input := interfaces.CreateProjectParam{
				WorkspaceID: env.wsID,
				Visualizer:  visualizer.VisualizerCesium,
				Name:        lo.ToPtr("Test Project"),
			}
			result, err := env.projectUC.Create(ctx, input, env.operator)

			// Assert
			assert.Error(t, err)
			assert.Contains(t, err.Error(), "policy service unavailable")
			assert.Nil(t, result)
			env.mockPolicyChecker.AssertExpectations(t)
		})
	})

	t.Run("Update", func(t *testing.T) {
		t.Run("should update project when policy allows", func(t *testing.T) {
			// Arrange
			env := setupProjectTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
				Maybe()

			// Create a project to update
			prj := project.New().NewID().Workspace(env.wsID).Name("Original").MustBuild()
			_ = env.db.Project.Save(ctx, prj)
			scene := lo.Must(scene.New().NewID().Workspace(env.wsID).Project(prj.ID()).Build())
			_ = env.db.Scene.Save(ctx, scene)

			// Act
			newName := "Updated Project"
			ctx := adapter.AttachInternal(ctx, true)
			result, err := env.projectUC.Update(ctx, interfaces.UpdateProjectParam{
				ID:   prj.ID(),
				Name: &newName,
			}, env.operator)

			// Assert
			assert.NoError(t, err)
			assert.NotNil(t, result)
			assert.Equal(t, newName, result.Name())
			env.mockPolicyChecker.AssertExpectations(t)
		})

		t.Run("should return error when seats are overused", func(t *testing.T) {
			// Arrange
			env := setupProjectTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: false}, nil).
				Once()

			// Create a project to update
			prj := project.New().NewID().Workspace(env.wsID).Name("Original").MustBuild()
			_ = env.db.Project.Save(ctx, prj)
			scene := lo.Must(scene.New().NewID().Workspace(env.wsID).Project(prj.ID()).Build())
			_ = env.db.Scene.Save(ctx, scene)

			// Act
			newName := "Updated Project"
			ctx := adapter.AttachInternal(ctx, true)
			result, err := env.projectUC.Update(ctx, interfaces.UpdateProjectParam{
				ID:   prj.ID(),
				Name: &newName,
			}, env.operator)

			// Assert
			assert.Error(t, err)
			assert.Contains(t, err.Error(), "operation is disabled by over")
			assert.Nil(t, result)
			env.mockPolicyChecker.AssertExpectations(t)
		})
	})

	t.Run("Delete", func(t *testing.T) {
		t.Run("should delete project when policy allows", func(t *testing.T) {
			// Arrange
			env := setupProjectTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
				Maybe()

			// Create a project to delete
			prj := project.New().NewID().Workspace(env.wsID).Name("To Delete").MustBuild()
			_ = env.db.Project.Save(ctx, prj)
			scene := lo.Must(scene.New().NewID().Workspace(env.wsID).Project(prj.ID()).Build())
			_ = env.db.Scene.Save(ctx, scene)

			// Act
			err := env.projectUC.Delete(ctx, prj.ID(), env.operator)

			// Assert
			assert.NoError(t, err)
			env.mockPolicyChecker.AssertExpectations(t)
		})

		t.Run("should return error when seats are overused", func(t *testing.T) {
			// Arrange
			env := setupProjectTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: false}, nil).
				Once()

			// Create a project to delete
			prj := project.New().NewID().Workspace(env.wsID).Name("To Delete").MustBuild()
			_ = env.db.Project.Save(ctx, prj)
			scene := lo.Must(scene.New().NewID().Workspace(env.wsID).Project(prj.ID()).Build())
			_ = env.db.Scene.Save(ctx, scene)

			// Act
			err := env.projectUC.Delete(ctx, prj.ID(), env.operator)

			// Assert
			assert.Error(t, err)
			assert.Contains(t, err.Error(), "operation is disabled by over")
			env.mockPolicyChecker.AssertExpectations(t)
		})
	})

	t.Run("Publish", func(t *testing.T) {
		t.Run("should publish project when policy allows", func(t *testing.T) {
			// Arrange
			env := setupProjectTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
				Maybe()

			// Create a project to publish
			prj := project.New().NewID().Workspace(env.wsID).Name("To Publish").MustBuild()
			_ = env.db.Project.Save(ctx, prj)
			scene := lo.Must(scene.New().NewID().Workspace(env.wsID).Project(prj.ID()).Build())
			_ = env.db.Scene.Save(ctx, scene)

			// Act
			status := project.PublishmentStatusPublic
			result, err := env.projectUC.Publish(ctx, interfaces.PublishProjectParam{
				ID:     prj.ID(),
				Status: status,
			}, env.operator)

			// Assert
			assert.NoError(t, err)
			assert.NotNil(t, result)
			env.mockPolicyChecker.AssertExpectations(t)
		})

		t.Run("should return error when seats are overused", func(t *testing.T) {
			// Arrange
			env := setupProjectTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: false}, nil).
				Once()

			// Create a project to publish
			prj := project.New().NewID().Workspace(env.wsID).Name("To Publish").MustBuild()
			_ = env.db.Project.Save(ctx, prj)
			scene := lo.Must(scene.New().NewID().Workspace(env.wsID).Project(prj.ID()).Build())
			_ = env.db.Scene.Save(ctx, scene)

			// Act
			status := project.PublishmentStatusPublic
			result, err := env.projectUC.Publish(ctx, interfaces.PublishProjectParam{
				ID:     prj.ID(),
				Status: status,
			}, env.operator)

			// Assert
			assert.Error(t, err)
			assert.Contains(t, err.Error(), "operation is disabled by over")
			assert.Nil(t, result)
			env.mockPolicyChecker.AssertExpectations(t)
		})
	})

	t.Run("UpdateVisibility", func(t *testing.T) {
		t.Run("should update visibility when policy allows", func(t *testing.T) {
			// Arrange
			env := setupProjectTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
				Maybe()

			// Create a project
			prj := project.New().NewID().Workspace(env.wsID).Name("Test").MustBuild()
			_ = env.db.Project.Save(ctx, prj)
			scene := lo.Must(scene.New().NewID().Workspace(env.wsID).Project(prj.ID()).Build())
			_ = env.db.Scene.Save(ctx, scene)

			// Act
			visibility := project.VisibilityPublic
			result, err := env.projectUC.UpdateVisibility(ctx, prj.ID(), string(visibility), env.operator)

			// Assert
			assert.NoError(t, err)
			assert.NotNil(t, result)
			assert.Equal(t, string(project.VisibilityPublic), result.Visibility())
			env.mockPolicyChecker.AssertExpectations(t)
		})

		t.Run("should return error when seats are overused", func(t *testing.T) {
			// Arrange
			env := setupProjectTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: false}, nil).
				Once()

			// Create a project
			prj := project.New().NewID().Workspace(env.wsID).Name("Test").MustBuild()
			_ = env.db.Project.Save(ctx, prj)
			scene := lo.Must(scene.New().NewID().Workspace(env.wsID).Project(prj.ID()).Build())
			_ = env.db.Scene.Save(ctx, scene)

			// Act
			visibility := project.VisibilityPublic
			result, err := env.projectUC.UpdateVisibility(ctx, prj.ID(), string(visibility), env.operator)

			// Assert
			assert.Error(t, err)
			assert.Contains(t, err.Error(), "operation is disabled by over")
			assert.Nil(t, result)
			env.mockPolicyChecker.AssertExpectations(t)
		})
	})

	t.Run("ExportProjectData", func(t *testing.T) {
		t.Run("should export data when policy allows", func(t *testing.T) {
			// Arrange
			env := setupProjectTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
				Maybe()

			// Create a project
			prj := project.New().NewID().Workspace(env.wsID).Name("Test").MustBuild()
			_ = env.db.Project.Save(ctx, prj)
			scene := lo.Must(scene.New().NewID().Workspace(env.wsID).Project(prj.ID()).Build())
			_ = env.db.Scene.Save(ctx, scene)
			// Create project metadata
			metadata, _ := project.NewProjectMetadata().NewID().Project(prj.ID()).Build()
			_ = env.db.ProjectMetadata.Save(ctx, metadata)

			// Act
			buf := new(bytes.Buffer)
			zipWriter := zip.NewWriter(buf)
			defer zipWriter.Close()
			result, err := env.projectUC.ExportProjectData(ctx, prj.ID(), zipWriter, env.operator)

			// Assert
			assert.NoError(t, err)
			assert.NotNil(t, result)
			env.mockPolicyChecker.AssertExpectations(t)
		})

		t.Run("should return error when seats are overused", func(t *testing.T) {
			// Arrange
			env := setupProjectTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: false}, nil).
				Once()

			// Create a project
			prj := project.New().NewID().Workspace(env.wsID).Name("Test").MustBuild()
			_ = env.db.Project.Save(ctx, prj)
			scene := lo.Must(scene.New().NewID().Workspace(env.wsID).Project(prj.ID()).Build())
			_ = env.db.Scene.Save(ctx, scene)
			// Create project metadata
			metadata, _ := project.NewProjectMetadata().NewID().Project(prj.ID()).Build()
			_ = env.db.ProjectMetadata.Save(ctx, metadata)

			// Act
			buf := new(bytes.Buffer)
			zipWriter := zip.NewWriter(buf)
			defer zipWriter.Close()
			result, err := env.projectUC.ExportProjectData(ctx, prj.ID(), zipWriter, env.operator)

			// Assert
			assert.Error(t, err)
			assert.Contains(t, err.Error(), "operation is disabled by over")
			assert.Nil(t, result)
			env.mockPolicyChecker.AssertExpectations(t)
		})

		t.Run("should return error when policy service fails", func(t *testing.T) {
			// Arrange
			env := setupProjectTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(nil, errors.New("policy service error")).
				Once()

			// Create a project
			prj := project.New().NewID().Workspace(env.wsID).Name("Test").MustBuild()
			_ = env.db.Project.Save(ctx, prj)
			scene := lo.Must(scene.New().NewID().Workspace(env.wsID).Project(prj.ID()).Build())
			_ = env.db.Scene.Save(ctx, scene)
			// Create project metadata
			metadata, _ := project.NewProjectMetadata().NewID().Project(prj.ID()).Build()
			_ = env.db.ProjectMetadata.Save(ctx, metadata)

			// Act
			buf := new(bytes.Buffer)
			zipWriter := zip.NewWriter(buf)
			defer zipWriter.Close()
			result, err := env.projectUC.ExportProjectData(ctx, prj.ID(), zipWriter, env.operator)

			// Assert
			assert.Error(t, err)
			assert.Contains(t, err.Error(), "policy service error")
			assert.Nil(t, result)
			env.mockPolicyChecker.AssertExpectations(t)
		})
	})
}
