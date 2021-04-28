package interactor

import (
	"context"
	"testing"

	"github.com/reearth/reearth-backend/internal/infrastructure/memory"
	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/scene"
	"github.com/stretchr/testify/assert"
)

func TestCreateInfobox(t *testing.T) {
	ctx := context.Background()

	db := memory.InitRepos(&repo.Container{}, false)
	scene, _ := scene.New().NewID().Team(id.NewTeamID()).Project(id.NewProjectID()).RootLayer(id.NewLayerID()).Build()
	_ = db.Scene.Save(ctx, scene)
	il := NewLayer(db)

	l, _ := layer.NewItem().NewID().Scene(scene.ID()).Build()
	_ = db.Layer.Save(ctx, l)

	i, _ := il.CreateInfobox(ctx, l.ID(), &usecase.Operator{
		WritableTeams: []id.TeamID{scene.Team()},
	})
	assert.NotNil(t, i)
	l, _ = db.Layer.FindItemByID(ctx, l.ID(), nil)
	infobox := l.Infobox()
	assert.NotNil(t, infobox)
	property, _ := db.Property.FindByID(ctx, infobox.Property(), nil)
	assert.NotNil(t, property)
	assert.NotNil(t, property.Schema())
}
