package memory

import (
	"github.com/reearth/reearth/server/internal/usecase/repo"
	accountsInfra "github.com/reearth/reearth-accounts/server/pkg/infrastructure"
	"github.com/reearth/reearthx/authserver"
	"github.com/reearth/reearthx/usecasex"
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
		Workspace:       accountsInfra.NewMemoryWorkspace(),
		User:            accountsInfra.NewMemoryUser(),
		SceneLock:       NewSceneLock(),
		AuthRequest:     authserver.NewMemory(),
		Policy:          NewPolicy(),
		Storytelling:    NewStorytelling(),
		Lock:            NewLock(),
		Transaction:     &usecasex.NopTransaction{},
	}
}
