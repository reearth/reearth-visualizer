package interactor

import (
	"context"
	"encoding/json"
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
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsUsecase "github.com/reearth/reearth-accounts/server/pkg/usecase"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
)

// Test helper to create a storytelling test environment
type storytellingTestEnv struct {
	ctx               context.Context
	wsID              accountsID.WorkspaceID
	projectID         id.ProjectID
	sceneID           id.SceneID
	storyID           id.StoryID
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
	projectID := id.NewProjectID()
	sceneID := id.NewSceneID()
	storyID := id.NewStoryID()

	// Create workspace
	ws := accountsWorkspace.New().ID(wsID).MustBuild()
	_ = db.AccountsWorkspace.Save(ctx, ws)

	// Create project
	proj := lo.Must(project.New().NewID().ID(projectID).Workspace(wsID).Name("Test Project").Build())
	_ = db.Project.Save(ctx, proj)

	// Create scene
	sc := lo.Must(scene.New().NewID().ID(sceneID).Workspace(wsID).Project(projectID).Build())
	_ = db.Scene.Save(ctx, sc)

	// Create story
	story := lo.Must(storytelling.NewStory().
		NewID().
		ID(storyID).
		Scene(sceneID).
		Project(projectID).
		Title("Test Story").
		Build())
	_ = db.Storytelling.Save(ctx, *story)

	// Create repositories
	repos := &repo.Container{

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
	storytellingUC := NewStorytelling(repos, gateways, nil)

	// Create operator
	operator := &usecase.Operator{
		AccountsOperator: &accountsUsecase.Operator{
			WritableWorkspaces: accountsWorkspace.IDList{wsID},
		},
		WritableScenes: id.SceneIDList{sceneID},
	}

	return &storytellingTestEnv{
		ctx:               ctx,
		wsID:              wsID,
		projectID:         projectID,
		sceneID:           sceneID,
		storyID:           storyID,
		storytellingUC:    storytellingUC,
		operator:          operator,
		mockPolicyChecker: mockPolicyChecker,
		db:                db,
	}
}

func TestStorytelling_PolicyChecker(t *testing.T) {
	ctx := context.Background()

	t.Run("Create", func(t *testing.T) {
		t.Run("should create story when policy allows", func(t *testing.T) {
			// Arrange
			env := setupStorytellingTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
				Maybe()

			// Act
			result, err := env.storytellingUC.Create(ctx, interfaces.CreateStoryInput{
				SceneID: env.sceneID,
				Title:   "New Story",
			}, env.operator)

			// Assert
			assert.NoError(t, err)
			assert.NotNil(t, result)
			assert.Equal(t, "New Story", result.Title())
			env.mockPolicyChecker.AssertExpectations(t)
		})

		t.Run("should return error when seats are overused", func(t *testing.T) {
			// Arrange
			env := setupStorytellingTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: false}, nil).
				Once()

			// Act
			result, err := env.storytellingUC.Create(ctx, interfaces.CreateStoryInput{
				SceneID: env.sceneID,
				Title:   "New Story",
			}, env.operator)

			// Assert
			assert.Error(t, err)
			assert.Contains(t, err.Error(), "operation is disabled by over")
			assert.Nil(t, result)
			env.mockPolicyChecker.AssertExpectations(t)
		})

		t.Run("should return error when policy check fails", func(t *testing.T) {
			// Arrange
			env := setupStorytellingTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(nil, errors.New("policy service error")).
				Once()

			// Act
			result, err := env.storytellingUC.Create(ctx, interfaces.CreateStoryInput{
				SceneID: env.sceneID,
				Title:   "New Story",
			}, env.operator)

			// Assert
			assert.Error(t, err)
			assert.Contains(t, err.Error(), "policy service error")
			assert.Nil(t, result)
			env.mockPolicyChecker.AssertExpectations(t)
		})
	})

	t.Run("Update", func(t *testing.T) {
		t.Run("should update story when policy allows", func(t *testing.T) {
			// Arrange
			env := setupStorytellingTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
				Maybe()

			// Act
			newTitle := "Updated Story"
			result, err := env.storytellingUC.Update(ctx, interfaces.UpdateStoryInput{
				SceneID: env.sceneID,
				StoryID: env.storyID,
				Title:   &newTitle,
			}, env.operator)

			// Assert
			assert.NoError(t, err)
			assert.NotNil(t, result)
			assert.Equal(t, newTitle, result.Title())
			env.mockPolicyChecker.AssertExpectations(t)
		})

		t.Run("should return error when seats are overused", func(t *testing.T) {
			// Arrange
			env := setupStorytellingTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: false}, nil).
				Once()

			// Act
			newTitle := "Updated Story"
			result, err := env.storytellingUC.Update(ctx, interfaces.UpdateStoryInput{
				SceneID: env.sceneID,
				StoryID: env.storyID,
				Title:   &newTitle,
			}, env.operator)

			// Assert
			assert.Error(t, err)
			assert.Contains(t, err.Error(), "operation is disabled by over")
			assert.Nil(t, result)
			env.mockPolicyChecker.AssertExpectations(t)
		})
	})

	t.Run("Remove", func(t *testing.T) {
		t.Run("should remove story when policy allows", func(t *testing.T) {
			// Arrange
			env := setupStorytellingTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
				Maybe()

			// Act
			result, err := env.storytellingUC.Remove(ctx, interfaces.RemoveStoryInput{
				SceneID: env.sceneID,
				StoryID: env.storyID,
			}, env.operator)

			// Assert
			assert.NoError(t, err)
			assert.NotNil(t, result)
			env.mockPolicyChecker.AssertExpectations(t)
		})

		t.Run("should return error when seats are overused", func(t *testing.T) {
			// Arrange
			env := setupStorytellingTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: false}, nil).
				Once()

			// Act
			result, err := env.storytellingUC.Remove(ctx, interfaces.RemoveStoryInput{
				SceneID: env.sceneID,
				StoryID: env.storyID,
			}, env.operator)

			// Assert
			assert.Error(t, err)
			assert.Contains(t, err.Error(), "operation is disabled by over")
			assert.Nil(t, result)
			env.mockPolicyChecker.AssertExpectations(t)
		})
	})

	t.Run("Publish", func(t *testing.T) {
		t.Run("should publish story when policy allows", func(t *testing.T) {
			// Arrange
			env := setupStorytellingTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
				Maybe()

			// Act
			result, err := env.storytellingUC.Publish(ctx, interfaces.PublishStoryInput{
				ID:     env.storyID,
				Status: storytelling.PublishmentStatusPublic,
			}, env.operator)

			// Assert
			assert.NoError(t, err)
			assert.NotNil(t, result)
			env.mockPolicyChecker.AssertExpectations(t)
		})

		t.Run("should return error when seats are overused", func(t *testing.T) {
			// Arrange
			env := setupStorytellingTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: false}, nil).
				Once()

			// Act
			result, err := env.storytellingUC.Publish(ctx, interfaces.PublishStoryInput{
				ID:     env.storyID,
				Status: storytelling.PublishmentStatusPublic,
			}, env.operator)

			// Assert
			assert.Error(t, err)
			assert.Contains(t, err.Error(), "operation is disabled by over")
			assert.Nil(t, result)
			env.mockPolicyChecker.AssertExpectations(t)
		})
	})

	t.Run("Page Operations", func(t *testing.T) {
		t.Run("CreatePage", func(t *testing.T) {
			t.Run("should create page when policy allows", func(t *testing.T) {
				// Arrange
				env := setupStorytellingTestEnv(ctx, t)
				env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
					Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
					Maybe()

				// Act
				pageTitle := "New Page"
				_, page, err := env.storytellingUC.CreatePage(ctx, interfaces.CreatePageParam{
					SceneID: env.sceneID,
					StoryID: env.storyID,
					Title:   &pageTitle,
				}, env.operator)

				// Assert
				assert.NoError(t, err)
				assert.NotNil(t, page)
				assert.Equal(t, pageTitle, page.Title())
				env.mockPolicyChecker.AssertExpectations(t)
			})

			t.Run("should return error when seats are overused", func(t *testing.T) {
				// Arrange
				env := setupStorytellingTestEnv(ctx, t)
				env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
					Return(&gateway.PolicyCheckResponse{Allowed: false}, nil).
					Once()

				// Act
				pageTitle := "New Page"
				_, page, err := env.storytellingUC.CreatePage(ctx, interfaces.CreatePageParam{
					SceneID: env.sceneID,
					StoryID: env.storyID,
					Title:   &pageTitle,
				}, env.operator)

				// Assert
				assert.Error(t, err)
				assert.Contains(t, err.Error(), "operation is disabled by over")
				assert.Nil(t, page)
				env.mockPolicyChecker.AssertExpectations(t)
			})
		})

		t.Run("UpdatePage", func(t *testing.T) {
			t.Run("should update page when policy allows", func(t *testing.T) {
				// Arrange
				env := setupStorytellingTestEnv(ctx, t)
				env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
					Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
					Maybe()

				// Create a page first
				pageID := id.NewPageID()
				page := lo.Must(storytelling.NewPage().
					NewID().
					ID(pageID).
					Title("Original Page").
					Build())

				story := lo.Must(storytelling.NewStory().
					NewID().
					ID(env.storyID).
					Scene(env.sceneID).
					Project(env.projectID).
					Title("Test Story").
					Pages(storytelling.NewPageList([]*storytelling.Page{page})).
					Build())
				_ = env.db.Storytelling.Save(ctx, *story)

				// Act
				updatedTitle := "Updated Page"
				_, updatedPage, err := env.storytellingUC.UpdatePage(ctx, interfaces.UpdatePageParam{
					SceneID: env.sceneID,
					StoryID: env.storyID,
					PageID:  pageID,
					Title:   &updatedTitle,
				}, env.operator)

				// Assert
				assert.NoError(t, err)
				assert.NotNil(t, updatedPage)
				assert.Equal(t, updatedTitle, updatedPage.Title())
				env.mockPolicyChecker.AssertExpectations(t)
			})

			t.Run("should return error when seats are overused", func(t *testing.T) {
				// Arrange
				env := setupStorytellingTestEnv(ctx, t)
				env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
					Return(&gateway.PolicyCheckResponse{Allowed: false}, nil).
					Once()

				pageID := id.NewPageID()
				page := lo.Must(storytelling.NewPage().
					NewID().
					ID(pageID).
					Title("Original Page").
					Build())

				story := lo.Must(storytelling.NewStory().
					NewID().
					ID(env.storyID).
					Scene(env.sceneID).
					Project(env.projectID).
					Title("Test Story").
					Pages(storytelling.NewPageList([]*storytelling.Page{page})).
					Build())
				_ = env.db.Storytelling.Save(ctx, *story)

				// Act
				updatedTitle := "Updated Page"
				_, updatedPage, err := env.storytellingUC.UpdatePage(ctx, interfaces.UpdatePageParam{
					SceneID: env.sceneID,
					StoryID: env.storyID,
					PageID:  pageID,
					Title:   &updatedTitle,
				}, env.operator)

				// Assert
				assert.Error(t, err)
				assert.Contains(t, err.Error(), "operation is disabled by over")
				assert.Nil(t, updatedPage)
				env.mockPolicyChecker.AssertExpectations(t)
			})
		})
	})

	t.Run("Block Operations", func(t *testing.T) {
		setupBlockEnv := func(env *storytellingTestEnv) (id.PageID, id.PluginID, id.PluginExtensionID) {
			pageID := id.NewPageID()
			pluginID := id.MustPluginID("testplugin~1.0.0").WithScene(&env.sceneID)
			extensionID := id.PluginExtensionID("block")

			// Create property schema
			propertySchemaID := id.NewPropertySchemaID(pluginID, extensionID.String())
			propertySchema := property.NewSchema().ID(propertySchemaID).MustBuild()
			_ = env.db.PropertySchema.Save(ctx, propertySchema)

			// Create plugin with block extension
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
			_ = env.db.Plugin.Save(ctx, testPlugin)

			// Create story with page
			page := lo.Must(storytelling.NewPage().
				NewID().
				ID(pageID).
				Title("Test Page").
				Build())

			story := lo.Must(storytelling.NewStory().
				NewID().
				ID(env.storyID).
				Scene(env.sceneID).
				Project(env.projectID).
				Title("Test Story").
				Pages(storytelling.NewPageList([]*storytelling.Page{page})).
				Build())
			_ = env.db.Storytelling.Save(ctx, *story)

			return pageID, pluginID, extensionID
		}

		t.Run("CreateBlock", func(t *testing.T) {
			t.Run("should create block when policy allows", func(t *testing.T) {
				// Arrange
				env := setupStorytellingTestEnv(ctx, t)
				env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
					Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
					Maybe()

				pageID, pluginID, extensionID := setupBlockEnv(env)

				// Act
				_, _, block, _, err := env.storytellingUC.CreateBlock(ctx, interfaces.CreateBlockParam{
					StoryID:     env.storyID,
					PageID:      pageID,
					PluginID:    pluginID,
					ExtensionID: extensionID,
				}, env.operator)

				// Assert
				assert.NoError(t, err)
				assert.NotNil(t, block)
				env.mockPolicyChecker.AssertExpectations(t)
			})

			t.Run("should return error when seats are overused", func(t *testing.T) {
				// Arrange
				env := setupStorytellingTestEnv(ctx, t)
				env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
					Return(&gateway.PolicyCheckResponse{Allowed: false}, nil).
					Once()

				pageID, pluginID, extensionID := setupBlockEnv(env)

				// Act
				_, _, block, _, err := env.storytellingUC.CreateBlock(ctx, interfaces.CreateBlockParam{
					StoryID:     env.storyID,
					PageID:      pageID,
					PluginID:    pluginID,
					ExtensionID: extensionID,
				}, env.operator)

				// Assert
				assert.Error(t, err)
				assert.Contains(t, err.Error(), "operation is disabled by over")
				assert.Nil(t, block)
				env.mockPolicyChecker.AssertExpectations(t)
			})
		})

		t.Run("RemoveBlock", func(t *testing.T) {
			t.Run("should remove block when policy allows", func(t *testing.T) {
				// Arrange
				env := setupStorytellingTestEnv(ctx, t)
				env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
					Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
					Maybe()

				pageID := id.NewPageID()
				blockID := id.NewBlockID()

				// Create a block to remove
				pluginID := id.MustPluginID("testplugin~1.0.0")
				extensionID := id.PluginExtensionID("block")
				propertyID := id.NewPropertyID()
				block := storytelling.NewBlock().
					ID(blockID).
					Plugin(pluginID).
					Extension(extensionID).
					Property(propertyID).
					MustBuild()

				page := lo.Must(storytelling.NewPage().
					NewID().
					ID(pageID).
					Title("Test Page").
					Blocks([]*storytelling.Block{block}).
					Build())

				story := lo.Must(storytelling.NewStory().
					NewID().
					ID(env.storyID).
					Scene(env.sceneID).
					Project(env.projectID).
					Title("Test Story").
					Pages(storytelling.NewPageList([]*storytelling.Page{page})).
					Build())
				_ = env.db.Storytelling.Save(ctx, *story)

				// Act
				_, _, removedID, err := env.storytellingUC.RemoveBlock(ctx, interfaces.RemoveBlockParam{
					StoryID: env.storyID,
					PageID:  pageID,
					BlockID: blockID,
				}, env.operator)

				// Assert
				assert.NoError(t, err)
				assert.NotNil(t, removedID)
				env.mockPolicyChecker.AssertExpectations(t)
			})

			t.Run("should return error when seats are overused", func(t *testing.T) {
				// Arrange
				env := setupStorytellingTestEnv(ctx, t)
				env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
					Return(&gateway.PolicyCheckResponse{Allowed: false}, nil).
					Once()

				pageID := id.NewPageID()
				blockID := id.NewBlockID()

				// Act
				_, _, removedID, err := env.storytellingUC.RemoveBlock(ctx, interfaces.RemoveBlockParam{
					StoryID: env.storyID,
					PageID:  pageID,
					BlockID: blockID,
				}, env.operator)

				// Assert
				assert.Error(t, err)
				assert.Contains(t, err.Error(), "operation is disabled by over")
				assert.Nil(t, removedID)
				env.mockPolicyChecker.AssertExpectations(t)
			})
		})

		t.Run("MoveBlock", func(t *testing.T) {
			t.Run("should move block when policy allows", func(t *testing.T) {
				// Arrange
				env := setupStorytellingTestEnv(ctx, t)
				env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
					Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
					Maybe()

				pageID := id.NewPageID()
				blockID := id.NewBlockID()

				// Create a block to remove
				pluginID := id.MustPluginID("testplugin~1.0.0")
				extensionID := id.PluginExtensionID("block")
				propertyID := id.NewPropertyID()
				block := storytelling.NewBlock().
					ID(blockID).
					Plugin(pluginID).
					Extension(extensionID).
					Property(propertyID).
					MustBuild()

				page := lo.Must(storytelling.NewPage().
					NewID().
					ID(pageID).
					Title("Test Page").
					Blocks([]*storytelling.Block{block}).
					Build())

				story := lo.Must(storytelling.NewStory().
					NewID().
					ID(env.storyID).
					Scene(env.sceneID).
					Project(env.projectID).
					Title("Test Story").
					Pages(storytelling.NewPageList([]*storytelling.Page{page})).
					Build())
				_ = env.db.Storytelling.Save(ctx, *story)

				// Act
				_, _, _, index, err := env.storytellingUC.MoveBlock(ctx, interfaces.MoveBlockParam{
					StoryID: env.storyID,
					PageID:  pageID,
					BlockID: blockID,
					Index:   1,
				}, env.operator)

				// Assert
				assert.NoError(t, err)
				assert.Equal(t, 1, index)
				env.mockPolicyChecker.AssertExpectations(t)
			})

			t.Run("should return error when seats are overused", func(t *testing.T) {
				// Arrange
				env := setupStorytellingTestEnv(ctx, t)
				env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
					Return(&gateway.PolicyCheckResponse{Allowed: false}, nil).
					Once()

				pageID := id.NewPageID()
				blockID := id.NewBlockID()

				// Act
				_, _, _, _, err := env.storytellingUC.MoveBlock(ctx, interfaces.MoveBlockParam{
					StoryID: env.storyID,
					PageID:  pageID,
					BlockID: blockID,
					Index:   1,
				}, env.operator)

				// Assert
				assert.Error(t, err)
				assert.Contains(t, err.Error(), "operation is disabled by over")
				env.mockPolicyChecker.AssertExpectations(t)
			})
		})
	})

	t.Run("ImportStory", func(t *testing.T) {
		t.Run("should import story when policy allows", func(t *testing.T) {
			// Arrange
			env := setupStorytellingTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
				Maybe()

			// Prepare import data
			importData := map[string]any{
				"scene": map[string]any{
					"story": map[string]any{
						"pages": []any{},
					},
				},
			}
			data, _ := json.Marshal(importData)

			// Act
			result, err := env.storytellingUC.ImportStory(ctx, env.sceneID, &data)

			// Assert
			assert.NoError(t, err)
			assert.NotNil(t, result)
			env.mockPolicyChecker.AssertExpectations(t)
		})

		t.Run("should return error when seats are overused", func(t *testing.T) {
			// Arrange
			env := setupStorytellingTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(&gateway.PolicyCheckResponse{Allowed: false}, nil).
				Once()

			// Prepare import data
			importData := map[string]any{
				"scene": map[string]any{
					"story": map[string]any{
						"pages": []any{},
					},
				},
			}
			data, _ := json.Marshal(importData)

			// Act
			result, err := env.storytellingUC.ImportStory(ctx, env.sceneID, &data)

			// Assert
			assert.Error(t, err)
			assert.Contains(t, err.Error(), "operation is disabled by over")
			assert.Nil(t, result)
			env.mockPolicyChecker.AssertExpectations(t)
		})

		t.Run("should return error when policy service fails", func(t *testing.T) {
			// Arrange
			env := setupStorytellingTestEnv(ctx, t)
			env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
				Return(nil, errors.New("policy service error")).
				Once()

			// Prepare import data
			importData := map[string]any{
				"scene": map[string]any{
					"story": map[string]any{
						"pages": []any{},
					},
				},
			}
			data, _ := json.Marshal(importData)

			// Act
			result, err := env.storytellingUC.ImportStory(ctx, env.sceneID, &data)

			// Assert
			assert.Error(t, err)
			assert.Contains(t, err.Error(), "policy service error")
			assert.Nil(t, result)
			env.mockPolicyChecker.AssertExpectations(t)
		})
	})
}
