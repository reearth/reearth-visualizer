package interactor

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// TestStorytelling_ImportStory_NoStory covers an export of a project that has
// no story. story is omitempty in the export format, so the key is absent and
// sceneJSON.Story is nil. ImportStory used to range over it and panic, which the
// import worker recovered into "panic during import" after the project, scene
// and layers had already been written, leaving a half-imported project.
func TestStorytelling_ImportStory_NoStory(t *testing.T) {
	ctx := context.Background()
	env := setupStorytellingTestEnv(ctx, t)
	env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
		Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
		Maybe()

	prj := project.New().NewID().Workspace(env.wsID).Name("Story-less Project").MustBuild()
	require.NoError(t, env.db.Project.Save(ctx, prj))
	sc := lo.Must(scene.New().NewID().Workspace(env.wsID).Project(prj.ID()).Build())
	require.NoError(t, env.db.Scene.Save(ctx, sc))
	env.operator.WritableScenes = []id.SceneID{sc.ID()}

	data := lo.Must(json.Marshal(map[string]any{
		"scene": map[string]any{
			"id":          sc.ID().String(),
			"nlsLayers":   []any{},
			"layerStyles": []any{},
			"widgets":     []any{},
			// no "story" key, which is what exporting a story-less project produces
		},
	}))

	result, err := env.storytellingUC.ImportStory(ctx, sc.ID(), &data)

	assert.NoError(t, err)
	assert.Empty(t, result)

	stories, err := env.db.Storytelling.FindByScene(ctx, sc.ID())
	assert.NoError(t, err)
	assert.Empty(t, lo.FromPtr(stories), "nothing should have been created")
}
