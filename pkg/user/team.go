package user

import "github.com/reearth/reearth-backend/pkg/id"

type Team struct {
	id      id.TeamID
	name    string
	members Members
}

func (t *Team) ID() id.TeamID {
	return t.id
}

func (t *Team) Name() string {
	return t.name
}

func (t *Team) Members() *Members {
	return &t.members
}

func (t *Team) Rename(name string) {
	t.name = name
}

func (t *Team) IsPersonal() bool {
	return t.members.fixed
}
