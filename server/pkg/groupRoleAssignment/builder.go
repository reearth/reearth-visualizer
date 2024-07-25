package groupRoleAssignment

import reearthAccountId "github.com/reearth/reearth-account/pkg/id"

type Builder struct {
	g *GroupRoleAssignment
}

func New() *Builder {
	return &Builder{g: &GroupRoleAssignment{}}
}

func (b *Builder) Build() (*GroupRoleAssignment, error) {
	if b.g.id.IsNil() {
		return nil, ErrInvalidID
	}
	return b.g, nil
}

func (b *Builder) MustBuild() *GroupRoleAssignment {
	g, err := b.Build()
	if err != nil {
		panic(err)
	}
	return g
}

func (b *Builder) ID(id ID) *Builder {
	b.g.id = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.g.id = NewID()
	return b
}

func (b *Builder) GroupID(groupID reearthAccountId.GroupID) *Builder {
	b.g.groupID = groupID
	return b
}

func (b *Builder) RoleIDs(roleIDs []reearthAccountId.RoleID) *Builder {
	b.g.roleIDs = roleIDs
	return b
}
