package interactor

import (
	"context"
	"testing"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// Test helper to create a storytelling test environment
type storytellingTestEnv struct {
	ctx               context.Context
	wsID              accountsID.WorkspaceID
	storytellingUC    interfaces.Storytelling
	operator          *usecase.Operator
	mockPolicyChecker *MockPolicyChecker
	db                *repo.Container
}

func setupStorytellingTestEnv(ctx context.Context, t *testing.T) *storytellingTestEnv {
	t.Helper()

	mockPolicyChecker := new(MockPolicyChecker)
	db := memory.New()
	wsID := accountsID.NewWorkspaceID()

	// Create workspace
	ws := accountsWorkspace.New().ID(wsID).MustBuild()
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

	// Create storytelling interactor
	storytellingUC := NewStorytelling(repos, gateways)

	// Create operator (with scene permissions that will be set per test)
	operator := &usecase.Operator{
		AcOperator: &accountsWorkspace.Operator{
			WritableWorkspaces: accountsID.WorkspaceIDList{wsID},
			OwningWorkspaces:   accountsID.WorkspaceIDList{wsID},
		},
		WritableScenes: []id.SceneID{}, // Will be set per test
	}

	return &storytellingTestEnv{
		ctx:               ctx,
		wsID:              wsID,
		storytellingUC:    storytellingUC,
		operator:          operator,
		mockPolicyChecker: mockPolicyChecker,
		db:                db,
	}
}

func TestStorytelling_Publish_PublicNoIndex(t *testing.T) {
	ctx := context.Background()

	t.Run("should set publicNoIndex to false when publishing as PUBLIC", func(t *testing.T) {
		// Arrange
		env := setupStorytellingTestEnv(ctx, t)
		env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
			Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
			Maybe()

		// Create a project and scene
		prj := project.New().NewID().Workspace(env.wsID).Name("Test Project").MustBuild()
		_ = env.db.Project.Save(ctx, prj)
		sc := lo.Must(scene.New().NewID().Workspace(env.wsID).Project(prj.ID()).Build())
		_ = env.db.Scene.Save(ctx, sc)

		// Add scene to operator's writable scenes
		env.operator.WritableScenes = []id.SceneID{sc.ID()}

		// Create a story with publicNoIndex set to true
		story := storytelling.NewStory().
			NewID().
			Scene(sc.ID()).
			Title("Test Story").
			PublicNoIndex(true).
			MustBuild()
		_ = env.db.Storytelling.Save(ctx, *story)

		// Act
		result, err := env.storytellingUC.Publish(ctx, interfaces.PublishStoryInput{
			ID:     story.Id(),
			Status: storytelling.PublishmentStatusPublic,
		}, env.operator)

		// Assert
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, storytelling.PublishmentStatusPublic, result.PublishmentStatus())
		assert.False(t, result.PublicNoIndex(), "publicNoIndex should be false for PUBLIC status")
		env.mockPolicyChecker.AssertExpectations(t)
	})

	t.Run("should set publicNoIndex to true when publishing as LIMITED", func(t *testing.T) {
		// Arrange
		env := setupStorytellingTestEnv(ctx, t)
		env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
			Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
			Maybe()

		// Create a project and scene
		prj := project.New().NewID().Workspace(env.wsID).Name("Test Project").MustBuild()
		_ = env.db.Project.Save(ctx, prj)
		sc := lo.Must(scene.New().NewID().Workspace(env.wsID).Project(prj.ID()).Build())
		_ = env.db.Scene.Save(ctx, sc)

		// Add scene to operator's writable scenes
		env.operator.WritableScenes = []id.SceneID{sc.ID()}

		// Create a story with publicNoIndex set to false
		story := storytelling.NewStory().
			NewID().
			Scene(sc.ID()).
			Title("Test Story").
			PublicNoIndex(false).
			MustBuild()
		_ = env.db.Storytelling.Save(ctx, *story)

		// Act
		result, err := env.storytellingUC.Publish(ctx, interfaces.PublishStoryInput{
			ID:     story.Id(),
			Status: storytelling.PublishmentStatusLimited,
		}, env.operator)

		// Assert
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, storytelling.PublishmentStatusLimited, result.PublishmentStatus())
		assert.True(t, result.PublicNoIndex(), "publicNoIndex should be true for LIMITED status")
		env.mockPolicyChecker.AssertExpectations(t)
	})

	t.Run("should toggle publicNoIndex when changing from PUBLIC to LIMITED", func(t *testing.T) {
		// Arrange
		env := setupStorytellingTestEnv(ctx, t)
		env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
			Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
			Maybe()

		// Create a project and scene
		prj := project.New().NewID().Workspace(env.wsID).Name("Test Project").MustBuild()
		_ = env.db.Project.Save(ctx, prj)
		sc := lo.Must(scene.New().NewID().Workspace(env.wsID).Project(prj.ID()).Build())
		_ = env.db.Scene.Save(ctx, sc)

		// Add scene to operator's writable scenes
		env.operator.WritableScenes = []id.SceneID{sc.ID()}

		// Create a story
		story := storytelling.NewStory().
			NewID().
			Scene(sc.ID()).
			Title("Test Story").
			MustBuild()
		_ = env.db.Storytelling.Save(ctx, *story)

		// First publish as PUBLIC
		result1, err := env.storytellingUC.Publish(ctx, interfaces.PublishStoryInput{
			ID:     story.Id(),
			Status: storytelling.PublishmentStatusPublic,
		}, env.operator)
		assert.NoError(t, err)
		assert.False(t, result1.PublicNoIndex())

		// Act - Re-publish as LIMITED
		result2, err := env.storytellingUC.Publish(ctx, interfaces.PublishStoryInput{
			ID:     story.Id(),
			Status: storytelling.PublishmentStatusLimited,
		}, env.operator)

		// Assert
		assert.NoError(t, err)
		assert.NotNil(t, result2)
		assert.Equal(t, storytelling.PublishmentStatusLimited, result2.PublishmentStatus())
		assert.True(t, result2.PublicNoIndex(), "publicNoIndex should be true after changing to LIMITED")
		env.mockPolicyChecker.AssertExpectations(t)
	})

	t.Run("should toggle publicNoIndex when changing from LIMITED to PUBLIC", func(t *testing.T) {
		// Arrange
		env := setupStorytellingTestEnv(ctx, t)
		env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
			Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
			Maybe()

		// Create a project and scene
		prj := project.New().NewID().Workspace(env.wsID).Name("Test Project").MustBuild()
		_ = env.db.Project.Save(ctx, prj)
		sc := lo.Must(scene.New().NewID().Workspace(env.wsID).Project(prj.ID()).Build())
		_ = env.db.Scene.Save(ctx, sc)

		// Add scene to operator's writable scenes
		env.operator.WritableScenes = []id.SceneID{sc.ID()}

		// Create a story
		story := storytelling.NewStory().
			NewID().
			Scene(sc.ID()).
			Title("Test Story").
			MustBuild()
		_ = env.db.Storytelling.Save(ctx, *story)

		// First publish as LIMITED
		result1, err := env.storytellingUC.Publish(ctx, interfaces.PublishStoryInput{
			ID:     story.Id(),
			Status: storytelling.PublishmentStatusLimited,
		}, env.operator)
		assert.NoError(t, err)
		assert.True(t, result1.PublicNoIndex())

		// Act - Re-publish as PUBLIC
		result2, err := env.storytellingUC.Publish(ctx, interfaces.PublishStoryInput{
			ID:     story.Id(),
			Status: storytelling.PublishmentStatusPublic,
		}, env.operator)

		// Assert
		assert.NoError(t, err)
		assert.NotNil(t, result2)
		assert.Equal(t, storytelling.PublishmentStatusPublic, result2.PublishmentStatus())
		assert.False(t, result2.PublicNoIndex(), "publicNoIndex should be false after changing to PUBLIC")
		env.mockPolicyChecker.AssertExpectations(t)
	})
}
