package interactor

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestCreateInfobox(t *testing.T) {
	ctx := context.Background()

	db := memory.New()
	scene, _ := scene.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(id.NewProjectID()).Build()
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
