package memory

import (
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmemory"
	"github.com/reearth/reearthx/authserver"
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
		AuthRequest:     authserver.NewMemory(),
		Policy:          NewPolicy(),
		Storytelling:    NewStorytelling(),
		Lock:            NewLock(),
		Transaction:     &usecasex.NopTransaction{},

		// Deprecated: This function is deprecated and will be replaced by AccountsWorkspace in the future.
		Workspace: accountmemory.NewWorkspace(),
		// Deprecated: This function is deprecated and will be replaced by AccountsUser in the future.
		User: accountmemory.NewUser(),

		AccountsWorkspace: accountsInfra.NewMemoryWorkspace(),
		AccountsUser:      accountsInfra.NewMemoryUser(),
	}
}
