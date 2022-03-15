package interactor

import (
	"context"
	"testing"

	"github.com/reearth/reearth-backend/internal/infrastructure/memory"
	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/scene"
	"github.com/stretchr/testify/assert"
)

func TestCreateInfobox(t *testing.T) {
	ctx := context.Background()

	db := memory.InitRepos(nil)
	scene, _ := scene.New().NewID().Team(id.NewTeamID()).Project(id.NewProjectID()).RootLayer(id.NewLayerID()).Build()
	_ = db.Scene.Save(ctx, scene)
	il := NewLayer(db)

	l, _ := layer.NewItem().NewID().Scene(scene.ID()).Build()
	_ = db.Layer.Save(ctx, l)

	i, _ := il.CreateInfobox(ctx, l.ID(), &usecase.Operator{
		WritableScenes: []id.SceneID{scene.ID()},
	})
	assert.NotNil(t, i)
	l, err := db.Layer.FindItemByID(ctx, l.ID())
	assert.NoError(t, err)
	infobox := l.Infobox()
	assert.NotNil(t, infobox)
	property, _ := db.Property.FindByID(ctx, infobox.Property())
	assert.NotNil(t, property)
	assert.NotNil(t, property.Schema())
}
