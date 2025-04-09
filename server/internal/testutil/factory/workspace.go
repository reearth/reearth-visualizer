package factory

import (
	"github.com/go-faker/faker/v4"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
)

type WorkspaceOption func(*workspace.Builder)

func NewWorkspace(opts ...WorkspaceOption) *workspace.Workspace {
	p := workspace.New().
		ID(accountdomain.NewWorkspaceID()).
		Name(faker.Name())
	for _, opt := range opts {
		opt(p)
	}
	return p.MustBuild()
}
