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
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
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

func TestProject_Create_WithPolicyChecker(t *testing.T) {
	ctx := context.Background()

	tests := []struct {
		name                 string
		setupMock            func(*MockPolicyChecker)
		expectedError        string
		expectProjectCreated bool
	}{
		{
			name: "operation allowed",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, mock.MatchedBy(func(req gateway.PolicyCheckRequest) bool {
					return true
				})).Return(
					&gateway.PolicyCheckResponse{Allowed: true},
					nil,
				).Maybe()
			},
			expectProjectCreated: true,
		},
		{
			name: "operation disabled due to over-used seat",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, mock.MatchedBy(func(req gateway.PolicyCheckRequest) bool {
					return true
				})).Return(
					&gateway.PolicyCheckResponse{Allowed: false},
					nil,
				).Once()
			},
			expectedError:        "operation is disabled by over used seat",
			expectProjectCreated: false,
		},
		{
			name: "policy check error",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, mock.MatchedBy(func(req gateway.PolicyCheckRequest) bool {
					return true
				})).Return(
					nil,
					errors.New("policy check failed"),
				).Once()
			},
			expectedError:        "policy check failed",
			expectProjectCreated: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Setup mocks
			mockPolicyChecker := new(MockPolicyChecker)
			if tt.setupMock != nil {
				tt.setupMock(mockPolicyChecker)
			}

			// Create a minimal project interactor with mock policy checker
			db := memory.New()

			// Create workspace for testing
			wsID := accountdomain.NewWorkspaceID()
			ws := workspace.New().ID(wsID).MustBuild()
			_ = db.Workspace.Save(ctx, ws)

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

			// Create project interactor
			projectUC := NewProject(repos, gateways)

			// Create operator
			operator := &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					WritableWorkspaces: workspace.IDList{wsID},
				},
			}

			// Create project input
			input := interfaces.CreateProjectParam{
				WorkspaceID: wsID,
				Visualizer:  visualizer.VisualizerCesium,
				Name:        lo.ToPtr("Test Project"),
				Description: lo.ToPtr("Test Description"),
			}

			// Call the Create method
			result, err := projectUC.Create(ctx, input, operator)

			// Assert results
			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				if tt.expectProjectCreated {
					assert.NotNil(t, result)
					assert.Equal(t, "Test Project", result.Name())
					assert.Equal(t, "Test Description", result.Description())
				}
			}

			// Verify mock expectations were met
			mockPolicyChecker.AssertExpectations(t)
		})
	}
}

func TestProject_Update_WithPolicyChecker(t *testing.T) {
	ctx := context.Background()

	tests := []struct {
		name          string
		setupMock     func(*MockPolicyChecker)
		expectedError string
	}{
		{
			name: "operation allowed",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, mock.MatchedBy(func(req gateway.PolicyCheckRequest) bool {
					return true
				})).Return(
					&gateway.PolicyCheckResponse{Allowed: true},
					nil,
				).Maybe()
			},
		},
		{
			name: "operation disabled",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, mock.MatchedBy(func(req gateway.PolicyCheckRequest) bool {
					return true
				})).Return(
					&gateway.PolicyCheckResponse{Allowed: false},
					nil,
				).Once()
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

			// Create test infrastructure
			db := memory.New()
			wsID := accountdomain.NewWorkspaceID()
			ws := workspace.New().ID(wsID).MustBuild()
			_ = db.Workspace.Save(ctx, ws)

			// Create a project to update
			prj := project.New().NewID().Workspace(wsID).Name("Original").MustBuild()
			_ = db.Project.Save(ctx, prj)

			// Create scene for the project
			scene := lo.Must(scene.New().NewID().Workspace(wsID).Project(prj.ID()).Build())
			_ = db.Scene.Save(ctx, scene)

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

			gateways := &gateway.Container{
				File:          lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
				PolicyChecker: mockPolicyChecker,
			}

			projectUC := NewProject(repos, gateways)
			operator := &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					WritableWorkspaces: workspace.IDList{wsID},
				},
			}

			input := interfaces.UpdateProjectParam{
				ID:          prj.ID(),
				Name:        lo.ToPtr("Updated Project"),
				Description: lo.ToPtr("Updated Description"),
			}

			// Set context as internal to avoid GraphQL context issues
			internalCtx := adapter.AttachInternal(ctx, true)
			result, err := projectUC.Update(internalCtx, input, operator)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, "Updated Project", result.Name())
			}

			mockPolicyChecker.AssertExpectations(t)
		})
	}
}

func TestProject_Delete_WithPolicyChecker(t *testing.T) {
	ctx := context.Background()

	tests := []struct {
		name          string
		setupMock     func(*MockPolicyChecker)
		expectedError string
	}{
		{
			name: "operation allowed",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, mock.MatchedBy(func(req gateway.PolicyCheckRequest) bool {
					return true
				})).Return(
					&gateway.PolicyCheckResponse{Allowed: true},
					nil,
				).Maybe()
			},
		},
		{
			name: "operation disabled",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, mock.MatchedBy(func(req gateway.PolicyCheckRequest) bool {
					return true
				})).Return(
					&gateway.PolicyCheckResponse{Allowed: false},
					nil,
				).Once()
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

			// Create test infrastructure
			db := memory.New()
			wsID := accountdomain.NewWorkspaceID()
			ws := workspace.New().ID(wsID).MustBuild()
			_ = db.Workspace.Save(ctx, ws)

			// Create a project to delete
			prj := project.New().NewID().Workspace(wsID).Name("Project to Delete").MustBuild()
			_ = db.Project.Save(ctx, prj)

			// Create scene for the project
			scene := lo.Must(scene.New().NewID().Workspace(wsID).Project(prj.ID()).Build())
			_ = db.Scene.Save(ctx, scene)

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

			gateways := &gateway.Container{
				File:          lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
				PolicyChecker: mockPolicyChecker,
			}

			projectUC := NewProject(repos, gateways)
			operator := &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					WritableWorkspaces: workspace.IDList{wsID},
				},
			}

			// Set context as internal to avoid GraphQL context issues
			internalCtx := adapter.AttachInternal(ctx, true)
			err := projectUC.Delete(internalCtx, prj.ID(), operator)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
			} else {
				assert.NoError(t, err)
				// Verify project was deleted
				_, err := db.Project.FindByID(ctx, prj.ID())
				assert.Error(t, err) // Should not find deleted project
			}

			mockPolicyChecker.AssertExpectations(t)
		})
	}
}

func TestProject_Publish_WithPolicyChecker(t *testing.T) {
	ctx := context.Background()

	tests := []struct {
		name          string
		setupMock     func(*MockPolicyChecker)
		expectedError string
	}{
		{
			name: "operation allowed",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, mock.MatchedBy(func(req gateway.PolicyCheckRequest) bool {
					return true
				})).Return(
					&gateway.PolicyCheckResponse{Allowed: true},
					nil,
				).Maybe()
			},
		},
		{
			name: "operation disabled",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, mock.MatchedBy(func(req gateway.PolicyCheckRequest) bool {
					return true
				})).Return(
					&gateway.PolicyCheckResponse{Allowed: false},
					nil,
				).Once()
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

			// Create test infrastructure
			db := memory.New()
			wsID := accountdomain.NewWorkspaceID()
			ws := workspace.New().ID(wsID).MustBuild()
			_ = db.Workspace.Save(ctx, ws)

			// Create a project to publish
			prj := project.New().NewID().Workspace(wsID).Name("Project to Publish").MustBuild()
			_ = db.Project.Save(ctx, prj)

			// Create scene for the project
			scene := lo.Must(scene.New().NewID().Workspace(wsID).Project(prj.ID()).Build())
			_ = db.Scene.Save(ctx, scene)

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

			gateways := &gateway.Container{
				File:          lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
				PolicyChecker: mockPolicyChecker,
			}

			projectUC := NewProject(repos, gateways)
			operator := &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					WritableWorkspaces: workspace.IDList{wsID},
				},
			}

			input := interfaces.PublishProjectParam{
				ID:     prj.ID(),
				Status: project.PublishmentStatusPublic,
			}

			// Set context as internal to avoid GraphQL context issues
			internalCtx := adapter.AttachInternal(ctx, true)
			result, err := projectUC.Publish(internalCtx, input, operator)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
			}

			mockPolicyChecker.AssertExpectations(t)
		})
	}
}

func TestProject_UpdateVisibility_WithPolicyChecker(t *testing.T) {
	ctx := context.Background()

	tests := []struct {
		name          string
		visibility    string
		setupMock     func(*MockPolicyChecker)
		expectedError string
	}{
		{
			name:       "update to public - operation allowed",
			visibility: string(project.VisibilityPublic),
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, mock.MatchedBy(func(req gateway.PolicyCheckRequest) bool {
					return true
				})).Return(
					&gateway.PolicyCheckResponse{Allowed: true},
					nil,
				).Maybe()
			},
		},
		{
			name:       "update to private - operation allowed",
			visibility: string(project.VisibilityPrivate),
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, mock.MatchedBy(func(req gateway.PolicyCheckRequest) bool {
					return true
				})).Return(
					&gateway.PolicyCheckResponse{Allowed: true},
					nil,
				).Maybe()
			},
		},
		{
			name:       "operation disabled",
			visibility: string(project.VisibilityPublic),
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, mock.MatchedBy(func(req gateway.PolicyCheckRequest) bool {
					return true
				})).Return(
					&gateway.PolicyCheckResponse{Allowed: false},
					nil,
				).Once()
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

			// Create test infrastructure
			db := memory.New()
			wsID := accountdomain.NewWorkspaceID()
			ws := workspace.New().ID(wsID).MustBuild()
			_ = db.Workspace.Save(ctx, ws)

			// Create a project to update visibility
			prj := project.New().NewID().Workspace(wsID).Name("Project for Visibility Update").MustBuild()
			_ = db.Project.Save(ctx, prj)

			// Create scene for the project
			scene := lo.Must(scene.New().NewID().Workspace(wsID).Project(prj.ID()).Build())
			_ = db.Scene.Save(ctx, scene)

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

			gateways := &gateway.Container{
				File:          lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
				PolicyChecker: mockPolicyChecker,
			}

			projectUC := NewProject(repos, gateways)
			operator := &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					WritableWorkspaces: workspace.IDList{wsID},
					OwningWorkspaces:   workspace.IDList{wsID},
				},
			}

			// Set context as internal to avoid GraphQL context issues
			internalCtx := adapter.AttachInternal(ctx, true)
			result, err := projectUC.UpdateVisibility(internalCtx, prj.ID(), tt.visibility, operator)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, tt.visibility, result.Visibility())
			}

			mockPolicyChecker.AssertExpectations(t)
		})
	}
}

func TestProject_ExportProjectData_WithPolicyChecker(t *testing.T) {
	ctx := context.Background()

	tests := []struct {
		name          string
		setupMock     func(*MockPolicyChecker)
		expectedError string
	}{
		{
			name: "operation allowed",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, mock.MatchedBy(func(req gateway.PolicyCheckRequest) bool {
					return true
				})).Return(
					&gateway.PolicyCheckResponse{Allowed: true},
					nil,
				).Maybe()
			},
		},
		{
			name: "operation disabled",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, mock.MatchedBy(func(req gateway.PolicyCheckRequest) bool {
					return true
				})).Return(
					&gateway.PolicyCheckResponse{Allowed: false},
					nil,
				).Once()
			},
			expectedError: "operation is disabled by over used seat",
		},
		{
			name: "policy check error",
			setupMock: func(m *MockPolicyChecker) {
				m.On("CheckPolicy", mock.Anything, mock.MatchedBy(func(req gateway.PolicyCheckRequest) bool {
					return true
				})).Return(
					nil,
					errors.New("policy service unavailable"),
				).Once()
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

			// Create test infrastructure
			db := memory.New()
			wsID := accountdomain.NewWorkspaceID()
			ws := workspace.New().ID(wsID).MustBuild()
			_ = db.Workspace.Save(ctx, ws)

			// Create a project to export
			prj := project.New().NewID().Workspace(wsID).Name("Project to Export").MustBuild()
			_ = db.Project.Save(ctx, prj)

			// Create project metadata
			meta := project.NewProjectMetadata().NewID().Project(prj.ID()).Workspace(wsID).MustBuild()
			_ = db.ProjectMetadata.Save(ctx, meta)

			// Create scene for the project
			scene := lo.Must(scene.New().NewID().Workspace(wsID).Project(prj.ID()).Build())
			_ = db.Scene.Save(ctx, scene)

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

			gateways := &gateway.Container{
				File:          lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
				PolicyChecker: mockPolicyChecker,
			}

			projectUC := NewProject(repos, gateways)
			operator := &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					WritableWorkspaces: workspace.IDList{wsID},
				},
			}

			// Create a zip writer for the export
			var buf bytes.Buffer
			zipWriter := zip.NewWriter(&buf)

			// Set context as internal to avoid GraphQL context issues
			internalCtx := adapter.AttachInternal(ctx, true)
			result, err := projectUC.ExportProjectData(internalCtx, prj.ID(), zipWriter, operator)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, "Project to Export", result.Name())
			}

			// Clean up zip writer
			zipWriter.Close()

			mockPolicyChecker.AssertExpectations(t)
		})
	}
}
