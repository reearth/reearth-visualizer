package user

import "github.com/reearth/reearth/server/pkg/workspace"

type User struct {
	id            ID
	name          string
	alias         string
	email         string
	metadata      Metadata
	host          *string
	myWorkspaceID string
	auths         []string
	workspaces    workspace.WorkspaceList
	myWorkspace   workspace.Workspace
}

func (u *User) ID() ID {
	return u.id
}

func (u *User) Name() string {
	return u.name
}

func (u *User) Alias() string {
	return u.alias
}

func (u *User) Email() string {
	return u.email
}

func (u *User) Metadata() Metadata {
	return u.metadata
}

func (u *User) Host() *string {
	return u.host
}
func (u *User) MyWorkspaceID() string {
	return u.myWorkspaceID
}

func (u *User) Auths() []string {
	return u.auths
}

func (u *User) Workspaces() workspace.WorkspaceList {
	return u.workspaces
}

func (u *User) MyWorkspace() workspace.Workspace {
	return u.myWorkspace
}
