package memory

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/builtin"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/project"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/scene"
	"github.com/reearth/reearth-backend/pkg/user"
	"github.com/reearth/reearth-backend/pkg/visualizer"
)

var (
	DummySceneID = id.MustSceneID("01d7yt9zdyb74v2bvx7r5pkp32")
	DummyUserID  = id.MustUserID("01d7yt9zdyb74v2bvx76vw0jfj")
)

func generateDummyData(ctx context.Context, c *repo.Container) {
	// team
	team, _ := user.NewTeam().NewID().Members(map[id.UserID]user.Role{
		DummyUserID: user.RoleOwner,
	}).Build()
	_ = c.Team.Save(ctx, team)
	// user
	user, _ := user.New().
		ID(DummyUserID).
		Name("dummy").
		Email("dummy@dummy.com").
		Team(team.ID()).
		Build()
	_ = c.User.Save(ctx, user)
	// project
	projectID, _ := id.NewIDWith("01d7yt9zdyb74v2bvx7hwq41v1")
	prj, _ := project.New().
		ID(id.ProjectID(projectID)).
		Team(team.ID()).
		Visualizer(visualizer.VisualizerCesium).
		Build()
	_ = c.Project.Save(ctx, prj)
	// scene's property
	sceneProperty, _ := property.New().
		NewID().
		Schema(builtin.PropertySchemaIDVisualizerCesium).
		Scene(DummySceneID).
		Build()
	_ = c.Property.Save(ctx, sceneProperty)

	// root layer
	rootLayerID, _ := id.NewIDWith("01d7yt9zdyb74v2bvx7ngfy1hc")
	rootLayer, _ := layer.NewGroup().ID(id.LayerID(rootLayerID)).Scene(DummySceneID).Build()
	_ = c.Layer.Save(ctx, rootLayer)

	widgets := scene.NewWidgetSystem([]*scene.Widget{})
	plugins := scene.NewPluginSystem([]*scene.Plugin{
		scene.NewPlugin(id.OfficialPluginID, nil),
	})

	// scene
	scene, _ := scene.New().
		ID(DummySceneID).
		Project(prj.ID()).
		Team(team.ID()).
		Property(sceneProperty.ID()).
		RootLayer(rootLayer.ID()).
		WidgetSystem(widgets).
		PluginSystem(plugins).
		Build()
	_ = c.Scene.Save(ctx, scene)
}
