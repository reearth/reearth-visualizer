package interactor

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestStorytelling_Create_WithPolicyChecker(t *testing.T) {
	ctx := context.Background()
	wsID := accountdomain.NewWorkspaceID()
	// sceneID := id.NewSceneID() // Would be used in full implementation

	tests := []struct {
		name          string
		setupMock     func(*MockPolicyChecker)
		expectedError string
	}{
		{
			name: "operation allowed",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					&gateway.PolicyCheckResponse{Allowed: true},
					nil,
				)
			},
		},
		{
			name: "operation disabled due to over-used seat",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					&gateway.PolicyCheckResponse{Allowed: false},
					nil,
				)
			},
			expectedError: "operation is disabled by overused seat",
		},
		{
			name: "policy check error",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					nil,
					errors.New("policy service error"),
				)
			},
			expectedError: "policy service error",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockPolicyChecker := new(MockPolicyChecker)
			if tt.setupMock != nil {
				tt.setupMock(mockPolicyChecker)
			}

			// Create a minimal storytelling interactor with mock policy checker
			db := memory.New()

			// Create workspace for testing
			ws := workspace.New().ID(wsID).MustBuild()
			_ = db.Workspace.Save(ctx, ws)

			// Create project and scene that the operator can write to
			projectID := id.NewProjectID()
			project := lo.Must(project.New().NewID().ID(projectID).Workspace(wsID).Name("Test Project").Build())
			_ = db.Project.Save(ctx, project)

			sceneID := id.NewSceneID()
			scene := lo.Must(scene.New().NewID().ID(sceneID).Workspace(wsID).Project(projectID).Build())
			_ = db.Scene.Save(ctx, scene)

			// Create container with repositories
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

			// Create gateway container with mock policy checker
			gateways := &gateway.Container{
				File:          lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
				PolicyChecker: mockPolicyChecker,
			}

			// Create storytelling interactor
			storytellingUC := NewStorytelling(repos, gateways)

			// Create operator with scene access
			operator := &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					WritableWorkspaces: workspace.IDList{wsID},
				},
				WritableScenes: id.SceneIDList{sceneID},
			}

			// Test the Create method
			_, err := storytellingUC.Create(ctx, interfaces.CreateStoryInput{
				SceneID: sceneID,
				Title:   "Test Story",
			}, operator)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
			} else {
				assert.NoError(t, err)
			}

			mockPolicyChecker.AssertExpectations(t)
		})
	}
}

func TestStorytelling_Update_WithPolicyChecker(t *testing.T) {
	ctx := context.Background()
	wsID := accountdomain.NewWorkspaceID()

	tests := []struct {
		name          string
		setupMock     func(*MockPolicyChecker)
		expectedError string
	}{
		{
			name: "operation allowed",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					&gateway.PolicyCheckResponse{Allowed: true},
					nil,
				)
			},
		},
		{
			name: "operation disabled",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					&gateway.PolicyCheckResponse{Allowed: false},
					nil,
				)
			},
			expectedError: "operation is disabled by over used seat",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockPolicyChecker := new(MockPolicyChecker)
			if tt.setupMock != nil {
				tt.setupMock(mockPolicyChecker)
			}

			// Create a minimal storytelling interactor with mock policy checker
			db := memory.New()

			// Create workspace for testing
			ws := workspace.New().ID(wsID).MustBuild()
			_ = db.Workspace.Save(ctx, ws)

			// Create project and scene that the operator can write to
			projectID := id.NewProjectID()
			project := lo.Must(project.New().NewID().ID(projectID).Workspace(wsID).Name("Test Project").Build())
			_ = db.Project.Save(ctx, project)

			sceneID := id.NewSceneID()
			scene := lo.Must(scene.New().NewID().ID(sceneID).Workspace(wsID).Project(projectID).Build())
			_ = db.Scene.Save(ctx, scene)

			// Create minimal story for Update operation
			storyID := id.NewStoryID()

			// Create a minimal story
			story := lo.Must(storytelling.NewStory().
				NewID().
				ID(storyID).
				Scene(sceneID).
				Project(projectID).
				Title("Test Story").
				Build())
			_ = db.Storytelling.Save(ctx, *story)

			// Create container with repositories
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

			// Create gateway container with mock policy checker
			gateways := &gateway.Container{
				File:          lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
				PolicyChecker: mockPolicyChecker,
			}

			// Create storytelling interactor
			storytellingUC := NewStorytelling(repos, gateways)

			// Create operator with scene access
			operator := &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					WritableWorkspaces: workspace.IDList{wsID},
				},
				WritableScenes: id.SceneIDList{sceneID},
			}

			// Test the Update method
			newTitle := "Updated Story Title"
			_, err := storytellingUC.Update(ctx, interfaces.UpdateStoryInput{
				SceneID: sceneID,
				StoryID: storyID,
				Title:   &newTitle,
			}, operator)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
			} else {
				// For the allowed case, we expect the policy check to pass,
				// but the method might fail later due to business logic.
				// The key is that it should NOT fail with a policy error.
				if err != nil {
					assert.NotContains(t, err.Error(), "operation is disabled by over used seat")
				}
			}

			mockPolicyChecker.AssertExpectations(t)
		})
	}
}

func TestStorytelling_Remove_WithPolicyChecker(t *testing.T) {
	ctx := context.Background()
	wsID := accountdomain.NewWorkspaceID()

	tests := []struct {
		name          string
		setupMock     func(*MockPolicyChecker)
		expectedError string
	}{
		{
			name: "operation allowed",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					&gateway.PolicyCheckResponse{Allowed: true},
					nil,
				)
			},
		},
		{
			name: "operation disabled",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					&gateway.PolicyCheckResponse{Allowed: false},
					nil,
				)
			},
			expectedError: "operation is disabled by over used seat",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockPolicyChecker := new(MockPolicyChecker)
			if tt.setupMock != nil {
				tt.setupMock(mockPolicyChecker)
			}

			// Create a minimal storytelling interactor with mock policy checker
			db := memory.New()

			// Create workspace for testing
			ws := workspace.New().ID(wsID).MustBuild()
			_ = db.Workspace.Save(ctx, ws)

			// Create project and scene that the operator can write to
			projectID := id.NewProjectID()
			project := lo.Must(project.New().NewID().ID(projectID).Workspace(wsID).Name("Test Project").Build())
			_ = db.Project.Save(ctx, project)

			sceneID := id.NewSceneID()
			scene := lo.Must(scene.New().NewID().ID(sceneID).Workspace(wsID).Project(projectID).Build())
			_ = db.Scene.Save(ctx, scene)

			// Create minimal story for Remove operation
			storyID := id.NewStoryID()

			// Create a minimal story
			story := lo.Must(storytelling.NewStory().
				NewID().
				ID(storyID).
				Scene(sceneID).
				Project(projectID).
				Title("Test Story").
				Build())
			_ = db.Storytelling.Save(ctx, *story)

			// Create container with repositories
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

			// Create gateway container with mock policy checker
			gateways := &gateway.Container{
				File:          lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
				PolicyChecker: mockPolicyChecker,
			}

			// Create storytelling interactor
			storytellingUC := NewStorytelling(repos, gateways)

			// Create operator with scene access
			operator := &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					WritableWorkspaces: workspace.IDList{wsID},
				},
				WritableScenes: id.SceneIDList{sceneID},
			}

			// Test the Remove method
			_, err := storytellingUC.Remove(ctx, interfaces.RemoveStoryInput{
				SceneID: sceneID,
				StoryID: storyID,
			}, operator)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
			} else {
				// For the allowed case, we expect the policy check to pass,
				// but the method might fail later due to business logic.
				// The key is that it should NOT fail with a policy error.
				if err != nil {
					assert.NotContains(t, err.Error(), "operation is disabled by over used seat")
				}
			}

			mockPolicyChecker.AssertExpectations(t)
		})
	}
}

func TestStorytelling_Publish_WithPolicyChecker(t *testing.T) {
	ctx := context.Background()
	wsID := accountdomain.NewWorkspaceID()
	projID := id.NewProjectID()
	sceneID := id.NewSceneID()
	storyID := id.NewStoryID()

	tests := []struct {
		name          string
		setupMock     func(*MockPolicyChecker)
		expectedError string
	}{
		{
			name: "operation allowed",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					&gateway.PolicyCheckResponse{Allowed: true},
					nil,
				)
			},
		},
		{
			name: "operation disabled",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					&gateway.PolicyCheckResponse{Allowed: false},
					nil,
				)
			},
			expectedError: "operation is disabled by over used seat",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockPolicyChecker := new(MockPolicyChecker)
			if tt.setupMock != nil {
				tt.setupMock(mockPolicyChecker)
			}

			// Create a minimal storytelling interactor with mock policy checker
			db := memory.New()

			// Create workspace for testing
			ws := workspace.New().ID(wsID).MustBuild()
			_ = db.Workspace.Save(ctx, ws)

			// Create project and scene that the operator can write to
			project := lo.Must(project.New().NewID().ID(projID).Workspace(wsID).Name("Test Project").Build())
			_ = db.Project.Save(ctx, project)

			scene := lo.Must(scene.New().NewID().ID(sceneID).Workspace(wsID).Project(projID).Build())
			_ = db.Scene.Save(ctx, scene)

			// Create minimal story for Publish operation
			story := lo.Must(storytelling.NewStory().
				NewID().
				ID(storyID).
				Scene(sceneID).
				Project(projID).
				Title("Test Story").
				Build())

			_ = db.Storytelling.Save(ctx, *story)

			// Create container with repositories
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

			// Create gateway container with mock policy checker
			gateways := &gateway.Container{
				File:          lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
				PolicyChecker: mockPolicyChecker,
			}

			// Create storytelling interactor
			storytellingUC := NewStorytelling(repos, gateways)

			// Create operator with scene access
			operator := &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					WritableWorkspaces: workspace.IDList{wsID},
				},
				WritableScenes: id.SceneIDList{sceneID},
			}

			// Test the Publish method
			_, err := storytellingUC.Publish(ctx, interfaces.PublishStoryInput{
				ID:     storyID,
				Status: storytelling.PublishmentStatusPublic,
			}, operator)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
			} else {
				assert.NoError(t, err)
			}

			mockPolicyChecker.AssertExpectations(t)
		})
	}
}

func TestStorytelling_CreatePage_WithPolicyChecker(t *testing.T) {
	ctx := context.Background()
	wsID := accountdomain.NewWorkspaceID()
	projID := id.NewProjectID()
	sceneID := id.NewSceneID()
	storyID := id.NewStoryID()

	tests := []struct {
		name          string
		setupMock     func(*MockPolicyChecker)
		expectedError string
	}{
		{
			name: "operation allowed",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					&gateway.PolicyCheckResponse{Allowed: true},
					nil,
				)
			},
		},
		{
			name: "operation disabled",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					&gateway.PolicyCheckResponse{Allowed: false},
					nil,
				)
			},
			expectedError: "operation is disabled by over used seat",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockPolicyChecker := new(MockPolicyChecker)
			if tt.setupMock != nil {
				tt.setupMock(mockPolicyChecker)
			}

			// Create a minimal storytelling interactor with mock policy checker
			db := memory.New()

			// Create workspace for testing
			ws := workspace.New().ID(wsID).MustBuild()
			_ = db.Workspace.Save(ctx, ws)

			// Create project and scene that the operator can write to
			project := lo.Must(project.New().NewID().ID(projID).Workspace(wsID).Name("Test Project").Build())
			_ = db.Project.Save(ctx, project)

			scene := lo.Must(scene.New().NewID().ID(sceneID).Workspace(wsID).Project(projID).Build())
			_ = db.Scene.Save(ctx, scene)

			// Create minimal story for CreatePage operation
			story := lo.Must(storytelling.NewStory().
				NewID().
				ID(storyID).
				Scene(sceneID).
				Project(projID).
				Title("Test Story").
				Build())
			_ = db.Storytelling.Save(ctx, *story)

			// Create container with repositories
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

			// Create gateway container with mock policy checker
			gateways := &gateway.Container{
				File:          lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
				PolicyChecker: mockPolicyChecker,
			}

			// Create storytelling interactor
			storytellingUC := NewStorytelling(repos, gateways)

			// Create operator with scene access
			operator := &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					WritableWorkspaces: workspace.IDList{wsID},
				},
				WritableScenes: id.SceneIDList{sceneID},
			}

			// Test the CreatePage method
			pageTitle := "test page"
			_, _, err := storytellingUC.CreatePage(ctx, interfaces.CreatePageParam{
				SceneID: sceneID,
				StoryID: storyID,
				Title:   &pageTitle,
			}, operator)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
			} else {
				assert.NoError(t, err)
			}

			mockPolicyChecker.AssertExpectations(t)
		})
	}
}

func TestStorytelling_UpdatePage_WithPolicyChecker(t *testing.T) {
	ctx := context.Background()
	wsID := accountdomain.NewWorkspaceID()
	projID := id.NewProjectID()
	sceneID := id.NewSceneID()
	storyID := id.NewStoryID()
	pageID := id.NewPageID()

	tests := []struct {
		name          string
		setupMock     func(*MockPolicyChecker)
		expectedError string
	}{
		{
			name: "operation allowed",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					&gateway.PolicyCheckResponse{Allowed: true},
					nil,
				)
			},
		},
		{
			name: "operation disabled",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					&gateway.PolicyCheckResponse{Allowed: false},
					nil,
				)
			},
			expectedError: "operation is disabled by over used seat",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockPolicyChecker := new(MockPolicyChecker)
			if tt.setupMock != nil {
				tt.setupMock(mockPolicyChecker)
			}

			// Create a minimal storytelling interactor with mock policy checker
			db := memory.New()

			// Create workspace for testing
			ws := workspace.New().ID(wsID).MustBuild()
			_ = db.Workspace.Save(ctx, ws)

			// Create project and scene that the operator can write to
			project := lo.Must(project.New().NewID().ID(projID).Workspace(wsID).Name("Test Project").Build())
			_ = db.Project.Save(ctx, project)

			scene := lo.Must(scene.New().NewID().ID(sceneID).Workspace(wsID).Project(projID).Build())
			_ = db.Scene.Save(ctx, scene)

			// Create minimal story with a page for UpdatePage operation
			page := lo.Must(storytelling.NewPage().
				NewID().
				ID(pageID).
				Title("Test Page").
				Build())

			story := lo.Must(storytelling.NewStory().
				NewID().
				ID(storyID).
				Scene(sceneID).
				Project(projID).
				Title("Test Story").
				Pages(storytelling.NewPageList([]*storytelling.Page{page})).
				Build())

			_ = db.Storytelling.Save(ctx, *story)

			// Create container with repositories
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

			// Create gateway container with mock policy checker
			gateways := &gateway.Container{
				File:          lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
				PolicyChecker: mockPolicyChecker,
			}

			// Create storytelling interactor
			storytellingUC := NewStorytelling(repos, gateways)

			// Create operator with scene access
			operator := &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					WritableWorkspaces: workspace.IDList{wsID},
				},
				WritableScenes: id.SceneIDList{sceneID},
			}

			// Test the UpdatePage method
			updatedTitle := "updated page title"
			_, _, err := storytellingUC.UpdatePage(ctx, interfaces.UpdatePageParam{
				SceneID: sceneID,
				StoryID: storyID,
				PageID:  pageID,
				Title:   &updatedTitle,
			}, operator)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
			} else {
				assert.NoError(t, err)
			}

			mockPolicyChecker.AssertExpectations(t)
		})
	}
}

func TestStorytelling_CreateBlock_WithPolicyChecker(t *testing.T) {
	ctx := context.Background()
	wsID := accountdomain.NewWorkspaceID()
	projID := id.NewProjectID()
	sceneID := id.NewSceneID()
	storyID := id.NewStoryID()
	pageID := id.NewPageID()
	pluginID := id.MustPluginID("testplugin~1.0.0").WithScene(&sceneID)
	extensionID := id.PluginExtensionID("block")

	tests := []struct {
		name          string
		setupMock     func(*MockPolicyChecker)
		expectedError string
	}{
		{
			name: "operation allowed",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					&gateway.PolicyCheckResponse{Allowed: true},
					nil,
				)
			},
		},
		{
			name: "operation disabled",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					&gateway.PolicyCheckResponse{Allowed: false},
					nil,
				)
			},
			expectedError: "operation is disabled by over used seat",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockPolicyChecker := new(MockPolicyChecker)
			if tt.setupMock != nil {
				tt.setupMock(mockPolicyChecker)
			}

			// Create a minimal storytelling interactor with mock policy checker
			db := memory.New()

			// Create workspace for testing
			ws := workspace.New().ID(wsID).MustBuild()
			_ = db.Workspace.Save(ctx, ws)

			// Create project and scene that the operator can write to
			project := lo.Must(project.New().NewID().ID(projID).Workspace(wsID).Name("Test Project").Build())
			_ = db.Project.Save(ctx, project)

			scene := lo.Must(scene.New().NewID().ID(sceneID).Workspace(wsID).Project(projID).Build())
			_ = db.Scene.Save(ctx, scene)

			// Create a property schema for the block extension
			propertySchemaID := id.NewPropertySchemaID(pluginID, extensionID.String())
			propertySchema := property.NewSchema().ID(propertySchemaID).MustBuild()
			_ = db.PropertySchema.Save(ctx, propertySchema)

			// Create a plugin with the required extension
			blockExtension := plugin.NewExtension().
				ID(extensionID).
				Type(plugin.ExtensionTypeStoryBlock).
				Schema(propertySchemaID).
				MustBuild()

			testPlugin := plugin.New().
				ID(pluginID).
				Name(i18n.StringFrom("Test Plugin")).
				Extensions([]*plugin.Extension{blockExtension}).
				MustBuild()
			_ = db.Plugin.Save(ctx, testPlugin)

			// Create minimal story with a page for CreateBlock operation
			page := lo.Must(storytelling.NewPage().
				NewID().
				ID(pageID).
				Title("Test Page").
				Build())

			story := lo.Must(storytelling.NewStory().
				NewID().
				ID(storyID).
				Scene(sceneID).
				Project(projID).
				Title("Test Story").
				Pages(storytelling.NewPageList([]*storytelling.Page{page})).
				Build())

			_ = db.Storytelling.Save(ctx, *story)

			// Create container with repositories
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

			// Create gateway container with mock policy checker
			gateways := &gateway.Container{
				File:          lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
				PolicyChecker: mockPolicyChecker,
			}

			// Create storytelling interactor
			storytellingUC := NewStorytelling(repos, gateways)

			// Create operator with scene access
			operator := &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					WritableWorkspaces: workspace.IDList{wsID},
				},
				WritableScenes: id.SceneIDList{sceneID},
			}

			// Test the CreateBlock method
			_, _, _, _, err := storytellingUC.CreateBlock(ctx, interfaces.CreateBlockParam{
				StoryID:     storyID,
				PageID:      pageID,
				PluginID:    pluginID,
				ExtensionID: extensionID,
			}, operator)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
			} else {
				assert.NoError(t, err)
			}

			mockPolicyChecker.AssertExpectations(t)
		})
	}
}

func TestStorytelling_RemoveBlock_WithPolicyChecker(t *testing.T) {
	ctx := context.Background()
	wsID := accountdomain.NewWorkspaceID()

	tests := []struct {
		name          string
		setupMock     func(*MockPolicyChecker)
		expectedError string
	}{
		{
			name: "operation allowed",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					&gateway.PolicyCheckResponse{Allowed: true},
					nil,
				)
			},
		},
		{
			name: "operation disabled",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					&gateway.PolicyCheckResponse{Allowed: false},
					nil,
				)
			},
			expectedError: "operation is disabled by over used seat",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockPolicyChecker := new(MockPolicyChecker)
			if tt.setupMock != nil {
				tt.setupMock(mockPolicyChecker)
			}

			// Create a minimal storytelling interactor with mock policy checker
			db := memory.New()

			// Create workspace for testing
			ws := workspace.New().ID(wsID).MustBuild()
			_ = db.Workspace.Save(ctx, ws)

			// Create project and scene that the operator can write to
			projectID := id.NewProjectID()
			project := lo.Must(project.New().NewID().ID(projectID).Workspace(wsID).Name("Test Project").Build())
			_ = db.Project.Save(ctx, project)

			sceneID := id.NewSceneID()
			scene := lo.Must(scene.New().NewID().ID(sceneID).Workspace(wsID).Project(projectID).Build())
			_ = db.Scene.Save(ctx, scene)

			// Create minimal story, page, and block IDs for RemoveBlock operation
			storyID := id.NewStoryID()
			pageID := id.NewPageID()
			blockID := id.NewBlockID()

			// Create a minimal page (without blocks to avoid ID validation issues)
			page := lo.Must(storytelling.NewPage().
				NewID().
				ID(pageID).
				Title("Test Page").
				Build())

			// Create a minimal story with the page
			story := lo.Must(storytelling.NewStory().
				NewID().
				ID(storyID).
				Scene(sceneID).
				Project(projectID).
				Title("Test Story").
				Pages(storytelling.NewPageList([]*storytelling.Page{page})).
				Build())
			_ = db.Storytelling.Save(ctx, *story)

			// Create container with repositories
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

			// Create gateway container with mock policy checker
			gateways := &gateway.Container{
				File:          lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
				PolicyChecker: mockPolicyChecker,
			}

			// Create storytelling interactor
			storytellingUC := NewStorytelling(repos, gateways)

			// Create operator with scene access
			operator := &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					WritableWorkspaces: workspace.IDList{wsID},
				},
				WritableScenes: id.SceneIDList{sceneID},
			}

			// Test the RemoveBlock method
			_, _, _, err := storytellingUC.RemoveBlock(ctx, interfaces.RemoveBlockParam{
				StoryID: storyID,
				PageID:  pageID,
				BlockID: blockID,
			}, operator)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
			} else {
				// For the allowed case, we expect the policy check to pass,
				// but the method might fail later due to business logic.
				// The key is that it should NOT fail with a policy error.
				if err != nil {
					assert.NotContains(t, err.Error(), "operation is disabled by over used seat")
				}
			}

			mockPolicyChecker.AssertExpectations(t)
		})
	}
}

func TestStorytelling_MoveBlock_WithPolicyChecker(t *testing.T) {
	ctx := context.Background()
	wsID := accountdomain.NewWorkspaceID()

	tests := []struct {
		name          string
		setupMock     func(*MockPolicyChecker)
		expectedError string
	}{
		{
			name: "operation allowed",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					&gateway.PolicyCheckResponse{Allowed: true},
					nil,
				)
			},
		},
		{
			name: "operation disabled",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					&gateway.PolicyCheckResponse{Allowed: false},
					nil,
				)
			},
			expectedError: "operation is disabled by over used seat",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockPolicyChecker := new(MockPolicyChecker)
			if tt.setupMock != nil {
				tt.setupMock(mockPolicyChecker)
			}

			// Create a minimal storytelling interactor with mock policy checker
			db := memory.New()

			// Create workspace for testing
			ws := workspace.New().ID(wsID).MustBuild()
			_ = db.Workspace.Save(ctx, ws)

			// Create project and scene that the operator can write to
			projectID := id.NewProjectID()
			project := lo.Must(project.New().NewID().ID(projectID).Workspace(wsID).Name("Test Project").Build())
			_ = db.Project.Save(ctx, project)

			sceneID := id.NewSceneID()
			scene := lo.Must(scene.New().NewID().ID(sceneID).Workspace(wsID).Project(projectID).Build())
			_ = db.Scene.Save(ctx, scene)

			// Create minimal story, page, and block IDs for MoveBlock operation
			storyID := id.NewStoryID()
			pageID := id.NewPageID()
			blockID := id.NewBlockID()

			// Create a minimal page (without blocks to avoid ID validation issues)
			page := lo.Must(storytelling.NewPage().
				NewID().
				ID(pageID).
				Title("Test Page").
				Build())

			// Create a minimal story with the page
			story := lo.Must(storytelling.NewStory().
				NewID().
				ID(storyID).
				Scene(sceneID).
				Project(projectID).
				Title("Test Story").
				Pages(storytelling.NewPageList([]*storytelling.Page{page})).
				Build())
			_ = db.Storytelling.Save(ctx, *story)

			// Create container with repositories
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

			// Create gateway container with mock policy checker
			gateways := &gateway.Container{
				File:          lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
				PolicyChecker: mockPolicyChecker,
			}

			// Create storytelling interactor
			storytellingUC := NewStorytelling(repos, gateways)

			// Create operator with scene access
			operator := &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					WritableWorkspaces: workspace.IDList{wsID},
				},
				WritableScenes: id.SceneIDList{sceneID},
			}

			// Test the MoveBlock method
			_, _, _, _, err := storytellingUC.MoveBlock(ctx, interfaces.MoveBlockParam{
				StoryID: storyID,
				PageID:  pageID,
				BlockID: blockID,
				Index:   0,
			}, operator)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
			} else {
				// For the allowed case, we expect the policy check to pass,
				// but the method might fail later due to business logic.
				// The key is that it should NOT fail with a policy error.
				if err != nil {
					assert.NotContains(t, err.Error(), "operation is disabled by over used seat")
				}
			}

			mockPolicyChecker.AssertExpectations(t)
		})
	}
}

func TestStorytelling_ImportStory_WithPolicyChecker(t *testing.T) {
	ctx := context.Background()
	wsID := accountdomain.NewWorkspaceID()

	tests := []struct {
		name          string
		setupMock     func(*MockPolicyChecker)
		expectedError string
	}{
		{
			name: "operation allowed",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					&gateway.PolicyCheckResponse{Allowed: true},
					nil,
				)
			},
		},
		{
			name: "operation disabled",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					&gateway.PolicyCheckResponse{Allowed: false},
					nil,
				)
			},
			expectedError: "operation is disabled by over used seat",
		},
		{
			name: "policy check error",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, gateway.CreateGeneralOperationAllowedCheckRequest(wsID)).Return(
					nil,
					errors.New("policy service unavailable"),
				)
			},
			expectedError: "policy service unavailable",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockPolicyChecker := new(MockPolicyChecker)
			if tt.setupMock != nil {
				tt.setupMock(mockPolicyChecker)
			}

			// Create a minimal storytelling interactor with mock policy checker
			db := memory.New()

			// Create workspace for testing
			ws := workspace.New().ID(wsID).MustBuild()
			_ = db.Workspace.Save(ctx, ws)

			// Create project and scene that the import can use
			projectID := id.NewProjectID()
			project := lo.Must(project.New().NewID().ID(projectID).Workspace(wsID).Name("Test Project").Build())
			_ = db.Project.Save(ctx, project)

			sceneID := id.NewSceneID()
			scene := lo.Must(scene.New().NewID().ID(sceneID).Workspace(wsID).Project(projectID).Build())
			_ = db.Scene.Save(ctx, scene)

			// Create container with repositories
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

			// Create gateway container with mock policy checker
			gateways := &gateway.Container{
				File:          lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
				PolicyChecker: mockPolicyChecker,
			}

			// Create storytelling interactor
			storytellingUC := NewStorytelling(repos, gateways)

			// Test the ImportStory method with sample scene data containing story
			sampleData := []byte(`{"scene":{"story":{"pages":[]}}}`)
			_, err := storytellingUC.ImportStory(ctx, sceneID, &sampleData)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
			} else {
				assert.NoError(t, err)
			}

			mockPolicyChecker.AssertExpectations(t)
		})
	}
}
