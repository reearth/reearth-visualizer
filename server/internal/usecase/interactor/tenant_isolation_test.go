package interactor

import (
	"context"
	"testing"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// SEC-01 regression tests: Fetch methods on the GraphQL node/nodes path must
// not return entities from workspaces/scenes the caller cannot read.
//
// Results must be positionally aligned with input IDs (DataLoader contract):
// result[i] corresponds to input[i], with nil for unauthorized or missing entries.

func TestAsset_Fetch_IDOR(t *testing.T) {
	ctx := context.Background()
	ownWs := accountsID.NewWorkspaceID()
	otherWs := accountsID.NewWorkspaceID()

	own := asset.New().NewID().Workspace(ownWs).URL("http://example.com/own").Size(1).MustBuild()
	other := asset.New().NewID().Workspace(otherWs).URL("http://example.com/other").Size(1).MustBuild()

	r := memory.NewAsset()
	require.NoError(t, r.Save(ctx, own))
	require.NoError(t, r.Save(ctx, other))

	i := &Asset{repos: &repo.Container{Asset: r}, gateways: &gateway.Container{}}
	op := &usecase.Operator{AcOperator: &accountsWorkspace.Operator{ReadableWorkspaces: accountsID.WorkspaceIDList{ownWs}}}

	res, err := i.Fetch(ctx, []id.AssetID{own.ID(), other.ID()}, op)
	assert.NoError(t, err)
	assert.Len(t, res, 2, "result length must match input length")
	assert.NotNil(t, res[0], "own asset must be at position 0")
	assert.Equal(t, own.ID(), res[0].ID(), "own asset must be at position 0")
	assert.Nil(t, res[1], "cross-tenant asset must be nil at position 1")

	_, err = i.Fetch(ctx, []id.AssetID{own.ID()}, nil)
	assert.ErrorIs(t, err, interfaces.ErrOperationDenied)
}

func TestProject_Fetch_IDOR(t *testing.T) {
	ctx := context.Background()
	ownWs := accountsID.NewWorkspaceID()
	otherWs := accountsID.NewWorkspaceID()

	own := project.New().NewID().Workspace(ownWs).MustBuild()
	other := project.New().NewID().Workspace(otherWs).MustBuild()

	r := memory.NewProject()
	require.NoError(t, r.Save(ctx, own))
	require.NoError(t, r.Save(ctx, other))

	importStatus := project.ProjectImportStatusNone
	ownMeta := project.NewProjectMetadata().NewID().Workspace(ownWs).Project(own.ID()).ImportStatus(&importStatus).MustBuild()
	otherMeta := project.NewProjectMetadata().NewID().Workspace(otherWs).Project(other.ID()).ImportStatus(&importStatus).MustBuild()
	mr := memory.NewProjectMetadata()
	require.NoError(t, mr.Save(ctx, ownMeta))
	require.NoError(t, mr.Save(ctx, otherMeta))

	i := &Project{
		projectRepo:         r,
		projectMetadataRepo: mr,
	}
	op := &usecase.Operator{AcOperator: &accountsWorkspace.Operator{ReadableWorkspaces: accountsID.WorkspaceIDList{ownWs}}}

	res, err := i.Fetch(ctx, []id.ProjectID{own.ID(), other.ID()}, op)
	assert.NoError(t, err)
	assert.Len(t, res, 2, "result length must match input length")
	assert.NotNil(t, res[0], "own project must be at position 0")
	assert.Equal(t, own.ID(), res[0].ID(), "own project must be at position 0")
	assert.Nil(t, res[1], "cross-tenant project must be nil at position 1")

	_, err = i.Fetch(ctx, []id.ProjectID{own.ID()}, nil)
	assert.ErrorIs(t, err, interfaces.ErrOperationDenied)
}

func TestScene_Fetch_IDOR(t *testing.T) {
	ctx := context.Background()
	ownWs := accountsID.NewWorkspaceID()
	otherWs := accountsID.NewWorkspaceID()

	own := scene.New().NewID().Workspace(ownWs).Project(id.NewProjectID()).Property(id.NewPropertyID()).MustBuild()
	other := scene.New().NewID().Workspace(otherWs).Project(id.NewProjectID()).Property(id.NewPropertyID()).MustBuild()

	r := memory.NewScene()
	require.NoError(t, r.Save(ctx, own))
	require.NoError(t, r.Save(ctx, other))

	i := &Scene{sceneRepo: r}
	op := &usecase.Operator{
		AcOperator:     &accountsWorkspace.Operator{ReadableWorkspaces: accountsID.WorkspaceIDList{ownWs}},
		ReadableScenes: id.SceneIDList{own.ID()},
	}

	res, err := i.Fetch(ctx, []id.SceneID{own.ID(), other.ID()}, op)
	assert.NoError(t, err)
	assert.Len(t, res, 2, "result length must match input length")
	assert.NotNil(t, res[0], "own scene must be at position 0")
	assert.Equal(t, own.ID(), res[0].ID(), "own scene must be at position 0")
	assert.Nil(t, res[1], "cross-tenant scene must be nil at position 1")

	_, err = i.Fetch(ctx, []id.SceneID{own.ID()}, nil)
	assert.ErrorIs(t, err, interfaces.ErrOperationDenied)
}

func TestProperty_Fetch_IDOR(t *testing.T) {
	ctx := context.Background()
	ownScene := id.NewSceneID()
	otherScene := id.NewSceneID()

	schemaID, err := id.PropertySchemaIDFrom("reearth/default")
	require.NoError(t, err)

	own := property.New().NewID().Scene(ownScene).Schema(schemaID).MustBuild()
	other := property.New().NewID().Scene(otherScene).Schema(schemaID).MustBuild()

	r := memory.NewProperty()
	require.NoError(t, r.Save(ctx, own))
	require.NoError(t, r.Save(ctx, other))

	i := &Property{propertyRepo: r}
	op := &usecase.Operator{ReadableScenes: id.SceneIDList{ownScene}}

	res, err := i.Fetch(ctx, []id.PropertyID{own.ID(), other.ID()}, op)
	assert.NoError(t, err)
	assert.Len(t, res, 2, "result length must match input length")
	assert.NotNil(t, res[0], "own property must be at position 0")
	assert.Equal(t, own.ID(), res[0].ID(), "own property must be at position 0")
	assert.Nil(t, res[1], "cross-scene property must be nil at position 1")

	_, err = i.Fetch(ctx, []id.PropertyID{own.ID()}, nil)
	assert.ErrorIs(t, err, interfaces.ErrOperationDenied)
}

func TestPlugin_Fetch_IDOR(t *testing.T) {
	ctx := context.Background()
	ownScene := id.NewSceneID()
	otherScene := id.NewSceneID()

	ownPluginID := id.MustPluginID(ownScene.String() + "~my-plugin~1.0.0")
	otherPluginID := id.MustPluginID(otherScene.String() + "~my-plugin~1.0.0")
	globalPluginID := id.MustPluginID("public-plugin~1.0.0")

	own := plugin.New().ID(ownPluginID).MustBuild()
	other := plugin.New().ID(otherPluginID).MustBuild()
	global := plugin.New().ID(globalPluginID).MustBuild()

	r := memory.NewPlugin()
	require.NoError(t, r.Save(ctx, own))
	require.NoError(t, r.Save(ctx, other))
	require.NoError(t, r.Save(ctx, global))

	i := &Plugin{pluginRepo: r}
	op := &usecase.Operator{ReadableScenes: id.SceneIDList{ownScene}}

	res, err := i.Fetch(ctx, []id.PluginID{ownPluginID, otherPluginID, globalPluginID}, op)
	assert.NoError(t, err)
	assert.Len(t, res, 3, "result length must match input length")
	assert.NotNil(t, res[0], "own scene-scoped plugin must be at position 0")
	assert.Equal(t, ownPluginID, res[0].ID(), "own plugin must be at position 0")
	assert.Nil(t, res[1], "cross-scene plugin must be nil at position 1")
	assert.NotNil(t, res[2], "global plugin must be at position 2")
	assert.Equal(t, globalPluginID, res[2].ID(), "global plugin must be at position 2")

	_, err = i.Fetch(ctx, []id.PluginID{globalPluginID}, nil)
	assert.ErrorIs(t, err, interfaces.ErrOperationDenied)
}
