package graphql

import (
	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/internal/usecase/interactor"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
)

type Container struct {
	AssetController    *AssetController
	DatasetController  *DatasetController
	LayerController    *LayerController
	PluginController   *PluginController
	ProjectController  *ProjectController
	PropertyController *PropertyController
	SceneController    *SceneController
	TeamController     *TeamController
	UserController     *UserController
}

type ContainerConfig struct {
	SignupSecret string
}

func NewContainer(r *repo.Container, g *gateway.Container, conf ContainerConfig) *Container {
	return &Container{
		AssetController: NewAssetController(
			AssetControlerConfig{
				AssetInput: func() interfaces.Asset {
					return interactor.NewAsset(r, g)
				},
			},
		),
		DatasetController: NewDatasetController(
			DatasetControllerConfig{
				DatasetInput: func() interfaces.Dataset {
					return interactor.NewDataset(r, g)
				},
			},
		),
		LayerController: NewLayerController(
			LayerControllerConfig{
				LayerInput: func() interfaces.Layer {
					return interactor.NewLayer(r)
				},
			},
		),
		PluginController: NewPluginController(
			PluginControllerConfig{
				PluginInput: func() interfaces.Plugin {
					return interactor.NewPlugin(r, g)
				},
			},
		),
		ProjectController: NewProjectController(
			ProjectControllerConfig{
				ProjectInput: func() interfaces.Project {
					return interactor.NewProject(r, g)
				},
			},
		),
		PropertyController: NewPropertyController(
			PropertyControllerConfig{
				PropertyInput: func() interfaces.Property {
					return interactor.NewProperty(r, g)
				},
			},
		),
		SceneController: NewSceneController(
			SceneControllerConfig{
				SceneInput: func() interfaces.Scene {
					return interactor.NewScene(r)
				},
			},
		),
		TeamController: NewTeamController(
			TeamControllerConfig{
				TeamInput: func() interfaces.Team {
					return interactor.NewTeam(r)
				},
			},
		),
		UserController: NewUserController(
			UserControllerConfig{
				UserInput: func() interfaces.User {
					return interactor.NewUser(r, g, conf.SignupSecret)
				},
			},
		),
	}
}
