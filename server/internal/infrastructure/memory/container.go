package memory

import (
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/usecasex"

	accountsInfra "github.com/reearth/reearth-accounts/server/pkg/infrastructure"
)

func New() *repo.Container {
	return &repo.Container{
		Asset:           NewAsset(),
		Config:          NewConfig(),
		NLSLayer:        NewNLSLayer(),
		Style:           NewStyle(),
		Plugin:          NewPlugin(),
		Project:         NewProject(),
		ProjectMetadata: NewProjectMetadata(),
		PropertySchema:  NewPropertySchema(),
		Property:        NewProperty(),
		Scene:           NewScene(),
		SceneLock:       NewSceneLock(),
		Storytelling:    NewStorytelling(),
		Lock:            NewLock(),
		Transaction:     &usecasex.NopTransaction{},

		Workspace:   accountsInfra.NewMemoryWorkspace(),
		User:        accountsInfra.NewMemoryUser(),
		Role:        accountsInfra.NewMemoryRole(),
		Permittable: accountsInfra.NewMemoryPermittable(),
	}
}
