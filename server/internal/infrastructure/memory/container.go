package memory

import (
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmemory"
	"github.com/reearth/reearthx/authserver"
	"github.com/reearth/reearthx/usecasex"
)

func New() *repo.Container {
	return &repo.Container{
		Asset:          NewAsset(),
		Config:         NewConfig(),
		NLSLayer:       NewNLSLayer(),
		Style:          NewStyle(),
		Plugin:         NewPlugin(),
		Project:        NewProject(),
		PropertySchema: NewPropertySchema(),
		Property:       NewProperty(),
		Scene:          NewScene(),
		Workspace:      accountmemory.NewWorkspace(),
		User:           accountmemory.NewUser(),
		SceneLock:      NewSceneLock(),
		AuthRequest:    authserver.NewMemory(),
		Policy:         NewPolicy(),
		Storytelling:   NewStorytelling(),
		Lock:           NewLock(),
		Transaction:    &usecasex.NopTransaction{},
	}
}
