package user

import (
	"github.com/reearth/reearth-backend/pkg/id"
)

// TeamBuilder _
type TeamBuilder struct {
	t        *Team
	members  map[id.UserID]Role
	personal bool
}

// NewTeam _
func NewTeam() *TeamBuilder {
	return &TeamBuilder{t: &Team{}}
}

// Build _
func (b *TeamBuilder) Build() (*Team, error) {
	if id.ID(b.t.id).IsNil() {
		return nil, id.ErrInvalidID
	}
	if b.members == nil {
		b.t.members = *NewMembers()
	} else {
		b.t.members = *NewMembersWith(b.members)
	}
	b.t.members.fixed = b.personal
	return b.t, nil
}

// MustBuild _
func (b *TeamBuilder) MustBuild() *Team {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

// ID _
func (b *TeamBuilder) ID(id id.TeamID) *TeamBuilder {
	b.t.id = id
	return b
}

// NewID _
func (b *TeamBuilder) NewID() *TeamBuilder {
	b.t.id = id.TeamID(id.New())
	return b
}

// Name _
func (b *TeamBuilder) Name(name string) *TeamBuilder {
	b.t.name = name
	return b
}

// Members _
func (b *TeamBuilder) Members(members map[id.UserID]Role) *TeamBuilder {
	b.members = members
	return b
}

// Personal _
func (b *TeamBuilder) Personal(p bool) *TeamBuilder {
	b.personal = p
	return b
}
