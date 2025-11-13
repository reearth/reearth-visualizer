package user

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/workspace"
	"github.com/samber/lo"
)

type Builder struct {
	a *User
}

func New() *Builder {
	return &Builder{a: &User{}}
}

func (b *Builder) Build() (*User, error) {
	if b.a.id == "" {
		return nil, id.ErrInvalidID
	}
	return b.a, nil
}

func (b *Builder) MustBuild() *User {
	return lo.Must(b.Build())
}

func (b *Builder) NewID() *Builder {
	b.a.id = NewID()
	return b
}

func (b *Builder) ID(id ID) *Builder {
	b.a.id = id
	return b
}

func (b *Builder) Name(name string) *Builder {
	b.a.name = name
	return b
}

func (b *Builder) Alias(alias string) *Builder {
	b.a.alias = alias
	return b
}

func (b *Builder) Email(email string) *Builder {
	b.a.email = email
	return b
}

func (b *Builder) Metadata(metadata Metadata) *Builder {
	b.a.metadata = metadata
	return b
}

func (b *Builder) Host(host *string) *Builder {
	b.a.host = host
	return b
}

func (b *Builder) MyWorkspaceID(myWorkspaceID string) *Builder {
	b.a.myWorkspaceID = myWorkspaceID
	return b
}

func (b *Builder) Auths(auths []string) *Builder {
	b.a.auths = auths
	return b
}

func (b *Builder) Workspaces(workspaces workspace.WorkspaceList) *Builder {
	b.a.workspaces = workspaces
	return b
}

func (b *Builder) MyWorkspace(myWorkspace workspace.Workspace) *Builder {
	b.a.myWorkspace = myWorkspace
	return b
}
