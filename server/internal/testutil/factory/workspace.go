package factory

import (
	"github.com/go-faker/faker/v4"
	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
)

type WorkspaceOption func(*accountsWorkspace.Builder)

func NewWorkspace(opts ...WorkspaceOption) *accountsWorkspace.Workspace {
	p := accountsWorkspace.New().
		ID(accountsID.NewWorkspaceID()).
		Name(faker.Name())
	for _, opt := range opts {
		opt(p)
	}
	return p.MustBuild()
}
