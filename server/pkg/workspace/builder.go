package workspace

type TeamBuilder struct {
	t        *Workspace
	members  map[UserID]Role
	personal bool
}

func New() *TeamBuilder {
	return &TeamBuilder{t: &Workspace{}}
}

func (b *TeamBuilder) Build() (*Workspace, error) {
	if b.t.id.IsNil() {
		return nil, ErrInvalidID
	}
	if b.members == nil {
		b.t.members = NewMembers()
	} else {
		b.t.members = NewMembersWith(b.members)
	}
	b.t.members.fixed = b.personal
	return b.t, nil
}

func (b *TeamBuilder) MustBuild() *Workspace {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *TeamBuilder) ID(id ID) *TeamBuilder {
	b.t.id = id
	return b
}

func (b *TeamBuilder) NewID() *TeamBuilder {
	b.t.id = NewID()
	return b
}

func (b *TeamBuilder) Name(name string) *TeamBuilder {
	b.t.name = name
	return b
}

func (b *TeamBuilder) Members(members map[UserID]Role) *TeamBuilder {
	b.members = members
	return b
}

func (b *TeamBuilder) Personal(p bool) *TeamBuilder {
	b.personal = p
	return b
}
